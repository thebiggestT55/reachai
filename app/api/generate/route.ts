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
    return NextResponse.json({
      error: 'Daily limit reached',
      upgradeUrl: '/pricing'
    }, { status: 429 })
  }

  const { prospectInfo } = await req.json()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are an expert cold outreach specialist with 10+ years of experience writing emails and LinkedIn messages that get replies. You write in a direct, human, and conversational tone — never corporate or salesy.

When given prospect information, generate exactly three things:
1. A cold email (subject line + body, under 100 words)
2. A LinkedIn connection message (under 300 characters)
3. A LinkedIn follow-up message for if they connected but didn't reply

Rules:
- First line must reference something specific about THEM
- Never start with "I" or "My name is"
- No buzzwords: synergy, leverage, streamline, game-changer
- One clear CTA per message, never two asks
- Subject lines: 3-6 words, lowercase, curiosity-driven

After generating, ask: "Want me to A/B test the subject line or adjust the tone?"`,
    messages: [{ role: 'user', content: prospectInfo }]
  })

  await supabase.from('users')
    .update({ messages_today: messagesToday + 1 })
    .eq('id', user.id)

  return NextResponse.json({
    result: message.content[0].type === 'text' ? message.content[0].text : '',
    messagesRemaining: limit === Infinity ? null : limit - messagesToday - 1
  })
}