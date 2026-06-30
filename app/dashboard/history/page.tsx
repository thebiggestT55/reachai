'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

type Generation = {
  id: string
  tool_type: string
  prospect_info: string
  result: string
  created_at: string
}

const TOOL_LABELS: Record<string, { label: string; color: string }> = {
  cold_email: { label: 'Cold Email', color: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
  linkedin_dm: { label: 'LinkedIn DM', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
  follow_up: { label: 'Follow-up', color: 'text-purple-300 bg-purple-500/10 border-purple-500/20' },
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) setGenerations(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('generations').delete().eq('id', id)
    setGenerations(prev => prev.filter(g => g.id !== id))
  }

  async function handleCopy(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)

    if (diffHrs < 1) return 'Just now'
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`
    if (diffHrs < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filtered = filter === 'all' ? generations : generations.filter(g => g.tool_type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-8">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-medium">History</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Your generations</h1>
        <p className="text-sm text-gray-400">Everything you've generated, saved automatically.</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {['all', 'cold_email', 'linkedin_dm', 'follow_up'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              filter === f
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/[0.02] border-white/8 text-gray-500 hover:text-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : TOOL_LABELS[f]?.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">No generations yet.</p>
          <button
            onClick={() => router.push('/dashboard/cold-email')}
            className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition font-medium"
          >
            Generate your first message
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(gen => {
            const tool = TOOL_LABELS[gen.tool_type] ?? TOOL_LABELS.cold_email
            const isOpen = expanded === gen.id
            return (
              <div key={gen.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : gen.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs px-2 py-1 rounded-md border shrink-0 ${tool.color}`}>{tool.label}</span>
                    <span className="text-sm text-gray-400 truncate">{gen.prospect_info}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs text-gray-600">{formatDate(gen.created_at)}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/8 pt-4">
                    <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-strong:text-white mb-4">
                      <ReactMarkdown>{gen.result}</ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopy(gen.id, gen.result)}
                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition"
                      >
                        {copied === gen.id ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(gen.id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}