'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      setProfile(profileData)
      setLoading(false)
    })
  }, [])

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Could not open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const planLabels: Record<string, string> = { free: 'Free', pro: 'Pro', teams: 'Teams' }

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-medium">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
      </div>

      {/* Account info */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-medium text-gray-300 mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm text-white">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Plan & billing */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-medium text-gray-300 mb-4">Plan & billing</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{planLabels[profile?.plan ?? 'free']} plan</span>
              {profile?.plan !== 'free' && (
                <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">Active</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.plan === 'free' ? '10 messages per day' : 'Unlimited messages'}
            </p>
          </div>
          {profile?.plan === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition font-medium"
            >
              Upgrade
            </button>
          ) : (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition"
            >
              {portalLoading ? 'Loading...' : 'Manage billing'}
            </button>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-red-300 mb-2">Danger zone</h2>
        <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
        <button className="text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg transition">
          Delete account
        </button>
      </div>
    </div>
  )
}