import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, teamId } = await req.json()

  if (!email || !teamId) {
    return NextResponse.json({ error: 'Missing email or team' }, { status: 400 })
  }

  // Check seat limit
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)

  if (count && count >= 5) {
    return NextResponse.json({ error: 'Team is full (5 seat limit)' }, { status: 400 })
  }

  // Find the user by email — they must already have a ReachAI account
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!existingUser) {
    return NextResponse.json({
      error: 'That person needs to sign up for ReachAI first, then you can add them'
    }, { status: 400 })
  }

  // Add to team
  const { error: insertError } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: existingUser.id, role: 'member' })

  if (insertError) {
    return NextResponse.json({ error: 'Could not add member. They may already be on a team.' }, { status: 400 })
  }

  // Link their user row to this team
  await supabase.from('users').update({ team_id: teamId }).eq('id', existingUser.id)

  return NextResponse.json({ success: true })
}