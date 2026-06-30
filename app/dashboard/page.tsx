'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [prospectInfo, setProspectInfo] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(10)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
        setPageLoading(false)
      }
    })
  }, [])

  async function handleGenerate() {
    if (!prospectInfo.trim()) return
    setLoading(true)
    setError('')
    setResult('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectInfo })
      })

      const data = await res.json()

      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 429) {
        setError('You\'ve hit your daily limit. Upgrade to Pro for unlimited messages.')
        return
      }
      if (data.result) {
        setResult(data.result)
        if (data.messagesRemaining !== null) setMessagesRemaining(data.messagesRemaining)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const examples = [
    'Sarah Chen, VP Sales at a Series A SaaS in SF, posted about scaling SDR team from 3 to 10',
    'James O\'Brien, founder of a 15-person logistics startup, just closed seed round',
    'Maria Lopez, Head of Marketing at mid-market fintech, hiring for demand gen roles'
  ]

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 10L7 4L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight">ReachAI</span>
          </div>
          <div className="flex items-center gap-4">
            {messagesRemaining !== null && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-xs text-gray-400">{messagesRemaining} messages left today</span>
              </div>
            )}
            <button
              onClick={() => router.push('/pricing')}
              className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition font-medium"
            >
              Upgrade to Pro
            </button>
            <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-gray-300 transition">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Write cold outreach that gets replies.
          </h1>
          <p className="text-gray-400">
            Paste a prospect's LinkedIn URL, company URL, or just describe who they are.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Prospect info
          </label>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none transition"
            rows={4}
            placeholder="Paste a LinkedIn URL, company URL, or describe your prospect..."
            value={prospectInfo}
            onChange={e => setProspectInfo(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setProspectInfo(ex)}
                className="text-xs text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg px-3 py-1.5 transition text-left"
              >
                {ex.length > 50 ? ex.slice(0, 50) + '...' : ex}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !prospectInfo.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white font-medium py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Writing your outreach...
              </>
            ) : 'Generate outreach →'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => router.push('/pricing')}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition ml-4 whitespace-nowrap"
            >
              Upgrade →
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-300">Your outreach</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? '✓ Copied' : 'Copy all'}
                </button>
                <button
                  onClick={() => { setResult(''); setProspectInfo('') }}
                  className="text-xs text-gray-500 hover:text-gray-400 transition"
                >
                  Start over
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}