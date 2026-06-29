'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_OUTPUT = `Subject: scaling sdrs without the chaos

Hi Sarah,

Saw your post about taking your SDR team from 3 to 10 — that's a fun problem to have, and a painful one to manage.

Most teams at that stage hit the same wall: ramp time starts eating quota alive.

We help revenue teams cut SDR ramp by 30-40% without adding headcount to enablement.

Worth a 15-minute call this week?

— Alex`

const TICKER_ITEMS = [
  { stat: '12.4%', label: 'average reply rate' },
  { quote: '"Booked 3 meetings in the first week"', name: '— James, AE @ Series B SaaS' },
  { stat: '10s', label: 'to generate full outreach sequence' },
  { quote: '"Replaced my entire outreach stack"', name: '— Maria, Founder' },
  { stat: '8x', label: 'faster than writing manually' },
  { quote: '"My SDRs use it every single morning"', name: '— Derek, VP Sales' },
  { stat: '3,200+', label: 'sequences generated this week' },
  { quote: '"Finally, cold email that doesn\'t sound like a bot"', name: '— Priya, BDR' },
]

export default function LandingPage() {
  const router = useRouter()
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const demoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          setIsTyping(true)
          let i = 0
          const interval = setInterval(() => {
            setTypedText(DEMO_OUTPUT.slice(0, i))
            i += 2
            if (i > DEMO_OUTPUT.length) {
              clearInterval(interval)
              setIsTyping(false)
            }
          }, 18)
        }
      },
      { threshold: 0.3 }
    )
    if (demoRef.current) observer.observe(demoRef.current)
    return () => observer.disconnect()
  }, [hasStarted])

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">

      {/* Ticker keyframes */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker 35s linear infinite;
          display: flex;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 10L7 4L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight">ReachAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-gray-400 hover:text-white transition">How it works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm text-gray-400 hover:text-white transition">Sign in</button>
            <button onClick={() => router.push('/login')} className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition font-medium">
              Start free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-xs text-blue-300 font-medium">Used by 3,200+ SDRs and founders</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            Cold outreach that<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              actually gets replies
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Paste a LinkedIn URL or describe your prospect. Get a personalized cold email, LinkedIn message, and follow-up in 10 seconds.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded-xl transition text-sm"
            >
              Try it free — no card needed
            </button>
            <a href="#demo" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-2">
              See it in action
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3L13 8L8 13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { n: '12%', l: 'avg reply rate' },
              { n: '10s', l: 'to generate' },
              { n: '8x', l: 'faster than manual' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-semibold text-white">{s.n}</div>
                <div className="text-xs text-gray-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="border-y border-white/5 py-4 overflow-hidden">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2 mx-8 shrink-0">
              {'stat' in item ? (
                <>
                  <span className="text-blue-400 font-semibold text-sm">{item.stat}</span>
                  <span className="text-gray-500 text-sm">{item.label}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-400 text-sm italic">{item.quote}</span>
                  <span className="text-gray-600 text-xs">{item.name}</span>
                </>
              )}
              <div className="w-1 h-1 rounded-full bg-white/10 ml-8"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo */}
      <section id="demo" className="py-24 px-6" ref={demoRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Live demo</p>
            <h2 className="text-3xl font-semibold">Watch it write in real time</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Prospect info</p>
              <div className="bg-black/40 border border-white/8 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                Sarah Chen, VP of Sales at a Series A SaaS in San Francisco. Just posted about scaling her SDR team from 3 to 10. Sells revenue intelligence software to mid-market B2B.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs text-gray-500">ReachAI is generating...</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Generated outreach</p>
              <div className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap min-h-[180px]">
                {typedText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle"></span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-semibold">Three steps to your next meeting</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Paste your prospect', desc: 'Drop in a LinkedIn URL, company website, or just describe who they are and what they do.', icon: '🔗' },
              { n: '02', title: 'AI writes the sequence', desc: 'ReachAI reads their context and writes a cold email, LinkedIn connect, and follow-up — all personalized.', icon: '✍️' },
              { n: '03', title: 'Copy and send', desc: 'Copy the messages in one click and paste straight into your email or LinkedIn. Done in under 30 seconds.', icon: '🚀' },
            ].map((step, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition">
                <div className="absolute top-4 right-4 text-5xl font-bold text-white/[0.04] group-hover:text-white/[0.07] transition select-none">{step.n}</div>
                <div className="text-2xl mb-4">{step.icon}</div>
                <h3 className="font-medium text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Results</p>
            <h2 className="text-3xl font-semibold">What people are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { quote: 'Booked 3 meetings in my first week. The personalization is insane for how fast it works.', name: 'James R.', role: 'AE, Series B SaaS', stat: '3 meetings / week 1' },
              { quote: 'I replaced my entire outreach stack with this. My reply rate went from 2% to 11% in two weeks.', name: 'Maria L.', role: 'Founder', stat: '2% → 11% reply rate' },
              { quote: 'My SDRs use it every morning before their first call. It\'s become part of the daily workflow.', name: 'Derek K.', role: 'VP Sales', stat: '10-person team' },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col justify-between">
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="text-xs font-medium text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                  <div className="mt-3 inline-block text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">{t.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-semibold">Start free, upgrade when ready</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'Free', price: '$0', desc: 'Get started today',
                features: ['10 messages/day', 'Cold email + LinkedIn', 'Copy in one click'],
                cta: 'Start free', highlight: false
              },
              {
                name: 'Pro', price: '$29', desc: 'per month',
                features: ['Unlimited messages', 'A/B subject lines', 'Saved sequences', 'Priority support'],
                cta: 'Get Pro', highlight: true
              },
              {
                name: 'Teams', price: '$99', desc: 'per month',
                features: ['Everything in Pro', '5 team seats', 'Shared templates', 'API access'],
                cta: 'Get Teams', highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 flex flex-col ${plan.highlight ? 'bg-blue-600 border border-blue-500' : 'bg-white/[0.03] border border-white/8'}`}>
                <div className="mb-6">
                  <p className={`text-xs font-medium uppercase tracking-widest mb-3 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{plan.desc}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke={plan.highlight ? 'white' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={plan.highlight ? 'text-blue-100' : 'text-gray-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${plan.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Your next customer is<br />one email away.
          </h2>
          <p className="text-gray-400 mb-8">Try it free. No credit card. First message in under a minute.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-10 py-4 rounded-xl transition text-sm"
          >
            Start for free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2 10L7 4L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-400">ReachAI</span>
          </div>
          <p className="text-xs text-gray-600">© 2026 ReachAI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}