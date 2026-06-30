'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(priceId: string, planName: string) {
    setLoading(planName)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Get started today',
      features: ['10 messages/day', 'Cold email + LinkedIn', 'Copy in one click'],
      cta: 'Current plan',
      highlight: false,
      priceId: null
    },
    {
      name: 'Pro',
      price: '$29',
      desc: 'per month',
      features: ['Unlimited messages', 'A/B subject lines', 'Saved sequences', 'Priority support'],
      cta: 'Upgrade to Pro',
      highlight: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
    },
    {
      name: 'Teams',
      price: '$99',
      desc: 'per month',
      features: ['Everything in Pro', '5 team seats', 'Shared templates', 'API access'],
      cta: 'Upgrade to Teams',
      highlight: false,
      priceId: process.env.NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-300 transition mb-8 flex items-center gap-2">
          ← Back to dashboard
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Upgrade your plan</h1>
          <p className="text-gray-400">Unlock unlimited outreach generation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
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
                onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.name)}
                disabled={!plan.priceId || loading === plan.name}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : plan.priceId
                    ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    : 'bg-white/5 text-gray-600 cursor-default'
                }`}
              >
                {loading === plan.name ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}