'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

type Member = {
  id: string
  user_id: string
  role: string
  joined_at: string
  email: string
}

export default function TeamPage() {
  const [profile, setProfile] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [teamName, setTeamName] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadTeam()
  }, [])

  async function loadTeam() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    // Only fetch team data if they're on the Teams plan
    if (profileData?.plan === 'teams') {
      let { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      // Auto-create a team if they upgraded but don't have one yet
      if (!teamData) {
        const { data: newTeam } = await supabase
          .from('teams')
          .insert({ name: 'My Team', owner_id: user.id })
          .select()
          .single()
        teamData = newTeam

        if (newTeam) {
          await supabase.from('team_members').insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'owner'
          })
        }
      }

      setTeam(teamData)
      setTeamName(teamData?.name ?? '')

      if (teamData) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('id, user_id, role, joined_at, users(email)')
          .eq('team_id', teamData.id)

        if (memberData) {
          setMembers(memberData.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role,
            joined_at: m.joined_at,
            email: m.users?.email ?? 'Unknown'
          })))
        }
      }
    }

    setLoading(false)
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !team) return
    setInviting(true)
    setError('')

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, teamId: team.id })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Could not send invite')
        return
      }

      setInviteEmail('')
      loadTeam()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    await supabase.from('team_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // PAYWALL — block anyone not on the Teams plan
  if (profile?.plan !== 'teams') {
    return (
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">Team management is a Teams feature</h1>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Invite teammates, share templates, and manage seats together. Upgrade to Teams to unlock this.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition text-sm"
          >
            Upgrade to Teams — $99/mo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-medium">Team</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">{team?.name ?? 'My Team'}</h1>
        <p className="text-sm text-gray-400">{members.length} of 5 seats used</p>
      </div>

      {/* Invite */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Invite a teammate</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="teammate@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition"
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim() || members.length >= 5}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap"
          >
            {inviting ? 'Sending...' : 'Invite'}
          </button>
        </div>
        {members.length >= 5 && (
          <p className="text-xs text-amber-400 mt-2">You've used all 5 seats on the Teams plan.</p>
        )}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Members list */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">Members</h2>
        <div className="space-y-3">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-300">
                  {member.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{member.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
              {member.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-xs text-gray-500 hover:text-red-400 transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}