'use client'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FollowUpPage() {
  const [prospectInfo, setProspectInfo] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleGenerate() {
    if (!prospectInfo.trim()) return
    setLoading(true)
    setError('')
    setResult('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectInfo, toolType: 'follow_up' })
      })

      const data = await res.json()

      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 429) {
        setError('You\'ve hit your daily limit. Upgrade to Pro for unlimited messages.')
        return
      }
      if (data.result) setResult(data.result)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-medium">Follow-ups</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Write a follow-up sequence</h1>
        <p className="text-sm text-gray-400">Describe the prospect and your original outreach — get day 3 and day 7 follow-ups that don't repeat yourself.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-3">Prospect + context</label>
        <textarea
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none transition"
          rows={5}
          placeholder="Describe the prospect and what your original email said, e.g. 'Sarah Chen, VP Sales — I emailed her about reducing SDR ramp time, no reply yet'"
          value={prospectInfo}
          onChange={e => setProspectInfo(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prospectInfo.trim()}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white font-medium py-3 rounded-xl transition text-sm"
        >
          {loading ? 'Writing follow-ups...' : 'Generate follow-up sequence →'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => router.push('/pricing')} className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition ml-4 whitespace-nowrap">
            Upgrade →
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300">Your follow-ups</h2>
            <div className="flex items-center gap-3">
              <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={() => { setResult(''); setProspectInfo('') }} className="text-xs text-gray-500 hover:text-gray-400 transition">
                Start over
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-strong:text-white">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}