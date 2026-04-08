'use client';

import { useState, useEffect } from 'react'
import { Key, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    model: 'gemini-1.5-flash',
    badge: 'RECOMMENDED',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    free: '15 req/min · 1M tokens/day',
    url: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIza...',
    envKey: 'GEMINI_API_KEY',
    quality: '⭐⭐⭐⭐⭐',
  },
  {
    id: 'groq',
    name: 'Groq',
    model: 'llama-3.3-70b-versatile',
    badge: 'FASTEST',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    free: '30 req/min · 14,400 req/day',
    url: 'https://console.groq.com',
    placeholder: 'gsk_...',
    envKey: 'GROQ_API_KEY',
    quality: '⭐⭐⭐⭐',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    model: 'mistral-7b-instruct:free',
    badge: 'FREE TIER',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    free: 'Limited free · No CC needed',
    url: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-...',
    envKey: 'OPENROUTER_API_KEY',
    quality: '⭐⭐⭐',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    model: 'command-r',
    badge: 'FALLBACK',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    free: '20 req/min · No CC needed',
    url: 'https://dashboard.cohere.com/api-keys',
    placeholder: '...',
    envKey: 'COHERE_API_KEY',
    quality: '⭐⭐⭐',
  },
]

interface ApiKeySetupProps {
  onKeySaved: (provider: string, key: string) => void
  savedKeys: Record<string, string>
}

export default function ApiKeySetup({ onKeySaved, savedKeys }: ApiKeySetupProps) {
  const [expanded, setExpanded] = useState(true)
  const [keys, setKeys] = useState<Record<string, string>>(savedKeys)
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const configuredCount = Object.values(keys).filter(Boolean).length

  useEffect(() => {
    if (configuredCount > 0) setExpanded(false)
  }, [])

  const handleSave = (providerId: string, value: string) => {
    const updated = { ...keys, [providerId]: value }
    setKeys(updated)
    if (value) {
      localStorage.setItem(`foundry_key_${providerId}`, value)
      onKeySaved(providerId, value)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden mb-5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Key size={15} className="text-accent-light" />
          </div>
          <div className="text-left">
            <div className="font-syne font-700 text-sm text-white flex items-center gap-2">
              Free API Keys
              {configuredCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                  <CheckCircle size={10} />
                  {configuredCount} configured
                </span>
              )}
            </div>
            <div className="text-xs text-white/40 font-mono mt-0.5">
              No paid API required · 100% free tier
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
      </button>

      {/* Provider Cards */}
      {expanded && (
        <div className="px-5 pb-5 grid gap-3 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const hasKey = Boolean(keys[p.id])
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-4 transition-all ${
                  hasKey
                    ? 'border-green-500/25 bg-green-500/5'
                    : 'border-white/[0.07] bg-[#12121e]'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-syne font-700 text-sm text-white">{p.name}</span>
                      <span className={`text-[10px] font-mono border rounded-full px-2 py-0.5 ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">{p.model}</div>
                  </div>
                  {hasKey
                    ? <CheckCircle size={16} className="text-green-400 shrink-0" />
                    : <a href={p.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1 text-[11px] text-accent-light hover:text-white transition-colors">
                        Get free key <ExternalLink size={10} />
                      </a>
                  }
                </div>

                <div className="text-[11px] text-white/35 mb-2.5">
                  {p.quality} · {p.free}
                </div>

                <div className="relative">
                  <input
                    type={visible[p.id] ? 'text' : 'password'}
                    value={keys[p.id] || ''}
                    onChange={(e) => handleSave(p.id, e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full bg-[#0a0a12] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-white/80 placeholder-white/20 outline-none focus:border-accent/50 transition-colors pr-16"
                  />
                  <button
                    onClick={() => setVisible(v => ({ ...v, [p.id]: !v[p.id] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 hover:text-white/60 transition-colors font-mono"
                  >
                    {visible[p.id] ? 'hide' : 'show'}
                  </button>
                </div>
              </div>
            )
          })}

          <div className="sm:col-span-2 text-[11px] text-white/30 font-mono bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3">
            🔒 Keys are stored in your browser's localStorage only. Never sent to our servers.
            To use via the backend API instead, add keys to your <code className="text-accent-light">.env</code> file.
          </div>
        </div>
      )}
    </div>
  )
}
