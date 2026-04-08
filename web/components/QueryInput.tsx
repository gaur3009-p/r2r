'use client';

import { useState } from 'react'
import { Zap, X, ChevronRight } from 'lucide-react'

const EXAMPLE_QUERIES = [
  { label: '🇮🇳 AI Logistics India', query: 'AI-driven logistics optimization for Tier 2 cities in India with a ₹15K monthly budget' },
  { label: '📝 Contract AI SMEs', query: 'SaaS for automated contract review and legal risk analysis for Indian SMEs' },
  { label: '🎥 Video Editing SaaS', query: 'Automated video editing SaaS using multimodal AI for YouTube creators' },
  { label: '🧠 Multimodal LLM', query: 'What should I build using the latest research in Multimodal LLMs?' },
  { label: '🏥 Rural HealthTech', query: 'HealthTech platform using vernacular AI for rural patient triage in India' },
  { label: '💰 Gig Worker Fintech', query: 'Fintech SaaS for gig workers and freelancers in India — automated GST, invoicing, and tax filing' },
  { label: '🏫 EdTech Vernacular', query: 'EdTech platform delivering personalized learning in regional Indian languages using AI' },
  { label: '🚜 AgriTech AI', query: 'AI-powered crop disease detection and advisory for small Indian farmers via WhatsApp' },
]

const PROVIDERS = [
  { id: 'gemini', label: 'Gemini Flash', badge: 'Best' },
  { id: 'groq', label: 'Groq Llama', badge: 'Fast' },
  { id: 'openrouter', label: 'OpenRouter', badge: 'Free' },
  { id: 'cohere', label: 'Cohere', badge: '' },
]

interface QueryInputProps {
  onSubmit: (query: string, provider: string) => void
  isLoading: boolean
}

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState('gemini')

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return
    onSubmit(query.trim(), provider)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-5 mb-5">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
        <span className="font-syne font-700 text-xs text-accent-light uppercase tracking-widest">
          Your Startup Query
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        disabled={isLoading}
        placeholder={
          'e.g. AI-driven logistics for Tier 2 cities in India...\nor: What should I build using the latest research in Multimodal LLMs?\nor: A SaaS for automated GST filing for Indian freelancers under ₹10K budget'
        }
        rows={4}
        className="w-full bg-[#12121e] border border-white/[0.07] rounded-xl px-4 py-3.5 text-sm text-white/85 placeholder-white/20 outline-none focus:border-accent/40 transition-colors resize-none disabled:opacity-50 mb-4 leading-relaxed"
      />

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLE_QUERIES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setQuery(ex.query)}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-accent/30 rounded-full px-3 py-1.5 text-[11px] text-white/50 hover:text-accent-light transition-all disabled:opacity-40 font-mono"
          >
            {ex.label}
            <ChevronRight size={9} />
          </button>
        ))}
      </div>

      {/* Provider selector + Submit */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Provider Pills */}
        <div className="flex items-center gap-1.5 bg-[#12121e] border border-white/[0.07] rounded-xl p-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              disabled={isLoading}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                provider === p.id
                  ? 'bg-accent/20 text-accent-light border border-accent/30'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {p.label}
              {p.badge && (
                <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/20 rounded-full px-1.5 py-0.5">
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear */}
        {query && (
          <button
            onClick={() => setQuery('')}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-white/[0.08] rounded-xl text-xs text-white/35 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <X size={13} /> Clear
          </button>
        )}

        {/* Generate */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-syne font-700 text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isLoading
              ? 'rgba(108,71,255,0.3)'
              : 'linear-gradient(135deg, #6c47ff 0%, #8b5cf6 100%)',
          }}
        >
          <Zap size={15} className={isLoading ? 'animate-spin-slow' : ''} />
          {isLoading ? 'Running Pipeline...' : 'Run 9-Engine Pipeline'}
          <span className="text-[10px] text-white/50 font-mono ml-1 hidden sm:inline">⌘↵</span>
        </button>
      </div>
    </div>
  )
}
