'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const THREAD = [
  { type: 'sent', label: 'Cold email', time: 'Mon 9:14 AM', text: 'Saw your post about scaling the SDR team from 3 to 10 — that\'s a fun problem to have. Worth a 15-min call this week?' },
  { type: 'waiting', label: 'No reply', time: 'Thu', text: null },
  { type: 'sent', label: 'Follow-up', time: 'Thu 11:02 AM', text: 'Ramp time usually becomes the hidden bottleneck around rep 6 or 7. Happy to share what\'s worked for similar teams — no pitch, just a quick chat.' },
  { type: 'reply', label: 'Reply', time: 'Thu 2:30 PM', text: 'Ha, you read my mind. Free Thursday at 3?' },
]

const PROOF_ROW = [
  { stat: '12.4%', label: 'avg reply rate' },
  { stat: '10s', label: 'to generate a sequence' },
  { stat: '3,200+', label: 'sequences sent this week' },
  { stat: '8x', label: 'faster than writing manually' },
]

export default function LandingPage() {
  const router = useRouter()
  const [visibleBubbles, setVisibleBubbles] = useState(0)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleBubbles === 0) {
          THREAD.forEach((_, i) => {
            setTimeout(() => setVisibleBubbles(i + 1), i * 650)
          })
        }
      },
      { threshold: 0.4 }
    )
    if (threadRef.current) observer.observe(threadRef.current)
    return () => observer.disconnect()
  }, [visibleBubbles])

  return (
    <div className="min-h-screen bg-[#08090C] text-[#E8EAED] overflow-x-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#08090C]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#3B6FE0] rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 10L7 4L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-[15px]">ReachAI</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            <a href="#how" className="text-[13px] text-[#7C8591] hover:text-[#E8EAED] transition">How it works</a>
            <a href="#pricing" className="text-[13px] text-[#7C8591] hover:text-[#E8EAED] transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-[13px] text-[#7C8591] hover:text-[#E8EAED] transition">Sign in</button>
            <button onClick={() => router.push('/login')} className="text-[13px] bg-[#3B6FE0] hover:bg-[#4A7BE8] px-3.5 py-[7px] rounded-md transition font-medium">
              Start free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 text-[12px] text-[#7C8591] mb-7 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC8F]"></span>
            3,200+ SDRs and founders sending outreach right now
          </div>
          <h1 className="text-[44px] md:text-[64px] font-semibold tracking-[-0.03em] leading-[1.04] mb-6">
            Outreach that ends<br />in a reply, not silence
          </h1>
          <p className="text-[17px] text-[#7C8591] max-w-lg mx-auto mb-9 leading-relaxed">
            Paste a prospect's info. Get a cold email, LinkedIn message, and follow-up sequence written to sound like you — not a template.
          </p>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            <button
              onClick={() => router.push('/login')}
              className="bg-[#3B6FE0] hover:bg-[#4A7BE8] text-white font-medium px-7 py-3 rounded-lg transition text-[14px]"
            >
              Try it free — no card needed
            </button>
            <a href="#demo" className="text-[14px] text-[#7C8591] hover:text-[#E8EAED] transition">
              See a real thread ↓
            </a>
          </div>
        </div>
      </section>

      {/* Proof row */}
      <div className="border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PROOF_ROW.map((p, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-[22px] font-semibold tracking-tight font-mono">{p.stat}</div>
              <div className="text-[12px] text-[#7C8591] mt-0.5">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature: live thread demo */}
      <section id="demo" className="py-28 px-6" ref={threadRef}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] text-[#3B6FE0] uppercase tracking-widest mb-3 font-mono">A real sequence</p>
            <h2 className="text-[28px] font-semibold tracking-tight">From first send to "free Thursday at 3?"</h2>
          </div>

          <div className="space-y-3">
            {THREAD.map((bubble, i) => {
              const isVisible = i < visibleBubbles
              if (bubble.type === 'waiting') {
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-2'}`}
                  >
                    <div className="flex-1 h-px bg-white/[0.08]"></div>
                    <span className="text-[11px] text-[#7C8591] font-mono">{bubble.time} — {bubble.label}</span>
                    <div className="flex-1 h-px bg-white/[0.08]"></div>
                  </div>
                )
              }
              const isReply = bubble.type === 'reply'
              return (
                <div
                  key={i}
                  className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${isReply ? 'flex justify-end' : ''}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${isReply ? 'bg-[#2ECC8F]/10 border border-[#2ECC8F]/25' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] uppercase tracking-wider font-mono ${isReply ? 'text-[#2ECC8F]' : 'text-[#7C8591]'}`}>{bubble.label}</span>
                      <span className="text-[10px] text-[#7C8591]/60 font-mono">{bubble.time}</span>
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-[#E8EAED]/90">{bubble.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-[12px] text-[#3B6FE0] uppercase tracking-widest mb-3 font-mono">How it works</p>
            <h2 className="text-[28px] font-semibold tracking-tight">Three steps, under a minute</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
            {[
              { title: 'Paste your prospect', desc: 'A LinkedIn URL, a company site, or a few lines describing who they are.' },
              { title: 'AI writes the sequence', desc: 'A cold email, LinkedIn connect, and follow-up — personalized to their actual context.' },
              { title: 'Copy and send', desc: 'One click to copy. Paste into your inbox or LinkedIn. Done.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#0B0D12] p-7">
                <h3 className="text-[15px] font-medium mb-2">{step.title}</h3>
                <p className="text-[13.5px] text-[#7C8591] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-[12px] text-[#3B6FE0] uppercase tracking-widest mb-3 font-mono">Results</p>
            <h2 className="text-[28px] font-semibold tracking-tight">What changed for them</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { quote: 'Booked 3 meetings in my first week. The personalization is what makes the difference.', name: 'James R.', role: 'AE, Series B SaaS' },
              { quote: 'Replaced my entire outreach stack. Reply rate went from 2% to 11% in two weeks.', name: 'Maria L.', role: 'Founder' },
              { quote: 'My SDRs open it every morning before their first call. It\'s just part of the routine now.', name: 'Derek K.', role: 'VP Sales' },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-6">
                <p className="text-[13.5px] text-[#E8EAED]/85 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="text-[12.5px] font-medium">{t.name}</div>
                <div className="text-[12px] text-[#7C8591]">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-[12px] text-[#3B6FE0] uppercase tracking-widest mb-3 font-mono">Pricing</p>
            <h2 className="text-[28px] font-semibold tracking-tight">Start free, upgrade when it's working</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', features: ['10 messages/day', 'Cold email + LinkedIn', 'Copy in one click'], cta: 'Start free', highlight: false },
              { name: 'Pro', price: '$29', sub: '/mo', features: ['Unlimited messages', 'A/B subject lines', 'Saved sequences', 'Priority support'], cta: 'Get Pro', highlight: true },
              { name: 'Teams', price: '$99', sub: '/mo', features: ['Everything in Pro', '5 team seats', 'Shared templates', 'API access'], cta: 'Get Teams', highlight: false }
            ].map((plan, i) => (
              <div key={i} className={`rounded-xl p-6 flex flex-col ${plan.highlight ? 'bg-[#3B6FE0] border border-[#4A7BE8]' : 'bg-white/[0.025] border border-white/[0.07]'}`}>
                <p className={`text-[12px] font-medium uppercase tracking-widest mb-3 font-mono ${plan.highlight ? 'text-white/70' : 'text-[#7C8591]'}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-[32px] font-semibold tracking-tight">{plan.price}</span>
                  {plan.sub && <span className={`text-[13px] mb-1 ${plan.highlight ? 'text-white/70' : 'text-[#7C8591]'}`}>{plan.sub}</span>}
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px]">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke={plan.highlight ? 'white' : '#3B6FE0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={plan.highlight ? 'text-white/90' : 'text-[#E8EAED]/80'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition ${plan.highlight ? 'bg-white text-[#3B6FE0] hover:bg-white/90' : 'bg-white/[0.05] hover:bg-white/[0.09] text-[#E8EAED] border border-white/[0.08]'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[34px] font-semibold tracking-tight mb-4 leading-tight">
            Your next reply is one message away
          </h2>
          <p className="text-[#7C8591] text-[15px] mb-8">Free to start. No card. First sequence in under a minute.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#3B6FE0] hover:bg-[#4A7BE8] text-white font-medium px-8 py-3.5 rounded-lg transition text-[14px]"
          >
            Start for free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#3B6FE0] rounded-md flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2 10L7 4L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[13px] font-medium text-[#7C8591]">ReachAI</span>
          </div>
          <p className="text-[11px] text-[#7C8591]/60 font-mono">© 2026 ReachAI</p>
        </div>
      </footer>

    </div>
  )
}