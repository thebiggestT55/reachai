import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: Infinity,
  teams: Infinity
}

const FORMAT_RULES = `

Formatting rules: Use simple markdown only — **bold** for labels, plain paragraphs for message bodies. Never use headers (#), horizontal rules (---), or bullet-point explanations of why the copy works. Do not add commentary, analysis, or a "why this works" section. Just return the messages themselves, clearly labeled.`

const SYSTEM_PROMPTS: Record<string, string> = {
  cold_email: `You are an expert cold outreach specialist. Write a single personalized cold email (subject line + body, under 100 words) based on the prospect info given. Rules: first line references something specific about them, never start with "I", no buzzwords like synergy/leverage/streamline, one clear CTA, subject line is 3-6 words lowercase.${FORMAT_RULES}`,
  linkedin_dm: `You are an expert at LinkedIn outreach. Write a LinkedIn connection request message (under 300 characters) AND a follow-up message for after they accept, based on the prospect info given. Rules: reference something specific about them, conversational tone, one clear ask.${FORMAT_RULES}`,
  follow_up: `You are an expert at sales follow-ups. Write 2 follow-up messages for a prospect who hasn't replied to a previous cold email — one for day 3, one for day 7. Rules: don't repeat the original pitch, add new value or a different angle each time, keep each under 60 words, one CTA.${FORMAT_RULES}`
}

export async function POST(req: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('plan, messages_today, usage_reset_at')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  let messagesToday = profile?.messages_today ?? 0

  if (profile?.usage_reset_at !== today) {
    messagesToday = 0
    await supabase.from('users')
      .update({ messages_today: 0, usage_reset_at: today })
      .eq('id', user.id)
  }

  const limit = PLAN_LIMITS[profile?.plan ?? 'free']
  if (messagesToday >= limit) {
    return NextResponse.json({ error: 'Daily limit reached', upgradeUrl: '/pricing' }, { status: 429 })
  }

  const { prospectInfo, toolType } = await req.json()
  const systemPrompt = SYSTEM_PROMPTS[toolType] ?? SYSTEM_PROMPTS.cold_email

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: prospectInfo }]
  })

  const resultText = message.content[0].type === 'text' ? message.content[0].text : ''

  await supabase.from('users')
    .update({ messages_today: messagesToday + 1 })
    .eq('id', user.id)

  // Save to history
  await supabase.from('generations').insert({
    user_id: user.id,
    tool_type: toolType ?? 'cold_email',
    prospect_info: prospectInfo,
    result: resultText
  })

  return NextResponse.json({
    result: resultText,
    messagesRemaining: limit === Infinity ? null : limit - messagesToday - 1
  })
}