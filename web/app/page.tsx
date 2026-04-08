'use client';

import { useState, useEffect, useCallback } from 'react'
import { Github, Sparkles, Info } from 'lucide-react'
import ApiKeySetup from '@/components/ApiKeySetup'
import QueryInput from '@/components/QueryInput'
import PipelineStatus, { EngineState, ENGINES } from '@/components/PipelineStatus'
import BlueprintOutput from '@/components/BlueprintOutput'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Free API providers that can be called directly from browser
const BROWSER_PROVIDERS: Record<string, { url: string; buildPayload: (sys: string, user: string) => object; extractChunk: (line: string) => string }> = {
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent',
    buildPayload: (sys, user) => ({
      system_instruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
    extractChunk: (line) => {
      try {
        const texts: string[] = []
        const re = /"text":\s*"((?:[^"\\]|\\.)*)"/g
        let m
        while ((m = re.exec(line)) !== null) {
          texts.push(m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\'))
        }
        return texts.join('')
      } catch { return '' }
    },
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    buildPayload: (sys, user) => ({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
    extractChunk: (line) => {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') return ''
      try {
        const d = JSON.parse(line.slice(6))
        return d.choices?.[0]?.delta?.content || ''
      } catch { return '' }
    },
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    buildPayload: (sys, user) => ({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      max_tokens: 4096,
      stream: true,
    }),
    extractChunk: (line) => {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') return ''
      try {
        const d = JSON.parse(line.slice(6))
        return d.choices?.[0]?.delta?.content || ''
      } catch { return '' }
    },
  },
  cohere: {
    url: 'https://api.cohere.com/v1/chat',
    buildPayload: (sys, user) => ({
      model: 'command-r',
      message: user,
      preamble: sys,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
    extractChunk: (line) => {
      try {
        const d = JSON.parse(line)
        return d.event_type === 'text-generation' ? (d.text || '') : ''
      } catch { return '' }
    },
  },
}

const ENGINE_SIGNALS = [
  'THE OPPORTUNITY', 'TECHNICAL ARCHITECTURE', 'FOUNDATIONAL REPOSITORY',
  'BUSINESS', 'MULTI-AGENT REASONING', 'TREND RADAR', 'PITCH DECK', 'FOUNDER',
]

function detectEngineProgress(text: string): number {
  let progress = 0
  ENGINE_SIGNALS.forEach((sig, i) => {
    if (text.toUpperCase().includes(sig)) progress = i + 1
  })
  return Math.min(progress, ENGINES.length - 1)
}

function buildSystemPrompt(): string {
  return `You are FOUNDryAI — a world-class Startup Architect, Technical Lead, and Venture Strategist.

Process every query through a 9-Engine Pipeline and output validated, build-ready startup blueprints.
Be specific, technical, and opinionated. Never give vague advice.

Use EXACTLY this Markdown structure:

# 💡 01. THE OPPORTUNITY
## Idea Name
[Catchy 1-3 word product name]
## The Insight ("Why Now")
[Non-obvious timing signal — what changed in 12-18 months?]
## Target Market & ICP
[Specific persona: job title, company size, pain frequency, current alternative]
## TAM / SAM / SOM
[Back-of-envelope sizing]

---

# 🏗 02. TECHNICAL ARCHITECTURE
## System Flow
[Numbered steps: data flow from input to output]
## Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | ... | ... |
| Backend | ... | ... |
| AI/ML | ... | ... |
| Database | ... | ... |
| Infra | ... | ... |
## Critical APIs & Integrations
[Each API: name, purpose, free tier limits]

---

# 💻 03. FOUNDATIONAL REPOSITORY
## Directory Structure
\`\`\`
/project-name
 ├── /src
 │    ├── /api
 │    ├── /core
 │    │    └── engine.py
 │    ├── /web
 │    │    ├── /app
 │    │    └── /components
 │    └── /agents
 ├── /data
 │    └── schema.sql
 ├── .env.example
 ├── docker-compose.yml
 └── README.md
\`\`\`
## Core Logic (engine.py)
\`\`\`python
# 30-40 lines of REAL functional boilerplate for THIS specific idea
# Real imports, class, key methods with actual logic
\`\`\`
## Key Frontend Component (page.tsx)
\`\`\`typescript
// 20-25 lines — primary UI component in Next.js 14 + Tailwind
\`\`\`

---

# 💰 04. BUSINESS & VIABILITY
## Pricing Model
| Tier | USD | INR | Features |
|------|-----|-----|---------|
| Free | $0 | ₹0 | [limits] |
| Pro | $X/mo | ₹Y/mo | [features] |
| Team | $Z/mo | ₹W/mo | [features] |
## Revenue Projections (Conservative)
- Month 3: X users → $Z MRR
- Month 6: X users → $Z MRR
- Month 12: X users → $Z ARR
## 7-Day Sprint Milestones
**Day 1:** [Deliverable]
**Day 2:** [Deliverable]
**Day 3:** [Deliverable]
**Day 4:** [Deliverable]
**Day 5:** [Deliverable]
**Day 6:** [Deliverable]
**Day 7:** [Launch + first user target]
## Viability Score
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Market Size | X/10 | [why] |
| Problem Urgency | X/10 | [why] |
| Build Difficulty | X/10 | [lower=easier] |
| Technical Moat | X/10 | [why hard to copy] |
| **Overall** | **X/10** | [summary] |

---

# 🧠 05. MULTI-AGENT REASONING
## The Analyst
[Market/tech shift with data points]
## The Trend Oracle
[Growing or dying? Specific indicators]
## The Contrarian
[3 specific failure reasons. Address the AI Wrapper Trap directly.]

---

# 📡 06. TREND RADAR
## Micro-Trend Alpha (6-month horizon)
**Signal:** [trend] **Impact:** [effect] **Pivot:** [strategy]
## Micro-Trend Beta (12-month horizon)
**Signal:** [trend] **Impact:** [effect] **Pivot:** [strategy]

---

# 📊 07. INVESTOR PITCH DECK
**Slide 1 — Vision:** [Audacious one-liner]
**Slide 2 — Problem:** [3 evidence-based pain points with numbers]
**Slide 3 — Solution:** [10x better value prop]
**Slide 4 — Tech Moat:** [What takes 6+ months to replicate]
**Slide 5 — Business Model:** [Revenue streams + growth levers]
**Slide 6 — Execution:** [MVP → PMF → Scale milestones]
**Slide 7 — The Ask:** [Seed amount + use of funds + 18-month runway]

---

# 🚀 08. FOUNDER'S 24-HOUR ACTION PLAN
**Hour 0-4:** [Validation action — free, no code]
**Hour 4-8:** [Landing page or prototype step]
**Hour 8-16:** [First customer outreach — exact where and how]
**Hour 16-24:** [Measure, iterate, go/no-go criteria]

**The Single Most Important Question to Answer Today:**
[One specific, falsifiable hypothesis]

---
*Generated by FOUNDryAI · 9-Engine Pipeline*`
}

function buildUserPrompt(query: string): string {
  return `Process this startup query through all 9 engines:

"${query}"

Be SPECIFIC and TECHNICAL — real technologies, real APIs, real pricing in USD and INR.
The code must be FUNCTIONAL starter code, not pseudocode.
For Indian market queries: include UPI/RazorPay, DPDP Act context, Tier 2/3 considerations.
The contrarian section must genuinely challenge the idea.

Generate the complete blueprint now.`
}

export default function Home() {
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({})
  const [markdown, setMarkdown] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [engineStates, setEngineStates] = useState<EngineState[]>(ENGINES.map(() => 'pending'))
  const [activeProvider, setActiveProvider] = useState<string>('')
  const [currentQuery, setCurrentQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Load saved keys from localStorage
  useEffect(() => {
    const keys: Record<string, string> = {}
    ;['gemini', 'groq', 'openrouter', 'cohere'].forEach(p => {
      const k = localStorage.getItem(`foundry_key_${p}`)
      if (k) keys[p] = k
    })
    setSavedKeys(keys)
  }, [])

  const updateEngineState = useCallback((text: string) => {
    const progress = detectEngineProgress(text)
    setEngineStates(prev => prev.map((s, i) => {
      if (i < progress) return 'done'
      if (i === progress) return 'active'
      return 'pending'
    }))
  }, [])

  const handleSubmit = async (query: string, provider: string) => {
    setMarkdown('')
    setError(null)
    setCurrentQuery(query)
    setActiveProvider(provider)
    setIsStreaming(true)
    setEngineStates(ENGINES.map(() => 'pending'))

    const apiKey = savedKeys[provider]

    // ── Try backend API first ────────────────────────────────────
    const useBackend = !apiKey

    if (useBackend) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, provider, stream: true }),
        })
        if (res.ok) {
          let fullText = ''
          const reader = res.body!.getReader()
          const dec = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const lines = dec.decode(value).split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              try {
                const evt = JSON.parse(line.slice(6))
                if (evt.type === 'text') {
                  fullText += evt.chunk
                  setMarkdown(fullText)
                  updateEngineState(fullText)
                } else if (evt.type === 'engine_update') {
                  // handled by updateEngineState
                } else if (evt.type === 'done') {
                  setEngineStates(ENGINES.map(() => 'done'))
                } else if (evt.type === 'error') {
                  throw new Error(evt.message)
                }
              } catch {}
            }
          }
          setIsStreaming(false)
          return
        }
      } catch (e) {
        // fall through to browser-direct mode
      }
    }

    // ── Browser-direct API call ──────────────────────────────────
    if (!apiKey) {
      setError(`No API key for "${provider}". Please add a key above — it's free!`)
      setIsStreaming(false)
      return
    }

    const providerConfig = BROWSER_PROVIDERS[provider]
    if (!providerConfig) {
      setError(`Provider "${provider}" not supported.`)
      setIsStreaming(false)
      return
    }

    const sys = buildSystemPrompt()
    const usr = buildUserPrompt(query)

    // Build URL (Gemini needs key in query string)
    let url = providerConfig.url
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (provider === 'gemini') {
      url = `${url}?key=${apiKey}&alt=sse`
    } else if (provider === 'groq') {
      headers['Authorization'] = `Bearer ${apiKey}`
    } else if (provider === 'openrouter') {
      headers['Authorization'] = `Bearer ${apiKey}`
      headers['HTTP-Referer'] = 'https://foundry-ai.app'
      headers['X-Title'] = 'FOUNDryAI'
    } else if (provider === 'cohere') {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(providerConfig.buildPayload(sys, usr)),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(
          errData?.error?.message || errData?.message ||
          `${provider} returned ${res.status}. Check your API key.`
        )
      }

      let fullText = ''
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += dec.decode(value)
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const chunk = providerConfig.extractChunk(line)
          if (chunk) {
            fullText += chunk
            setMarkdown(fullText)
            updateEngineState(fullText)
          }
        }
      }

      // Flush buffer
      if (buffer) {
        const chunk = providerConfig.extractChunk(buffer)
        if (chunk) {
          const ft = markdown + chunk
          setMarkdown(ft)
          updateEngineState(ft)
        }
      }

      setEngineStates(ENGINES.map(() => 'done'))
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
      {/* Header */}
      <header className="text-center mb-8 animate-slide-up">
        <div
          className="inline-flex items-center gap-2 text-[11px] font-mono text-white/40 border border-white/[0.07] bg-white/[0.02] rounded-full px-3 py-1.5 mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
          9-Engine Pipeline · Powered by Free AI APIs
        </div>

        <h1 className="font-syne font-800 text-5xl sm:text-6xl tracking-tight mb-3">
          <span className="gradient-text">FOUND</span>
          <span className="text-white">ry</span>
          <span style={{ color: '#38bdf8' }}>AI</span>
        </h1>

        <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
          Turn any startup idea into a validated, build-ready blueprint.
          Architecture · Code · Business Model · Pitch Deck — in seconds.
        </p>

        <div className="flex items-center justify-center gap-3 mt-5">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
            <Sparkles size={10} /> 100% Free APIs
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
            No Credit Card
          </span>
          <a
            href="https://github.com/yourusername/foundry-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5 hover:text-white/70 transition-colors"
          >
            <Github size={11} /> GitHub
          </a>
        </div>
      </header>

      {/* API Key Setup */}
      <ApiKeySetup
        savedKeys={savedKeys}
        onKeySaved={(provider, key) => setSavedKeys(prev => ({ ...prev, [provider]: key }))}
      />

      {/* Query Input */}
      <QueryInput onSubmit={handleSubmit} isLoading={isStreaming} />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-5 py-4 mb-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 text-lg">⚠</span>
            <div>
              <div className="text-red-400 font-mono text-sm mb-1">Error</div>
              <div className="text-red-300/70 text-xs leading-relaxed">{error}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Gemini (free)', 'Groq (free)'].map(p => (
                  <a key={p} href={p.includes('Gemini')
                      ? 'https://aistudio.google.com/app/apikey'
                      : 'https://console.groq.com'}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-mono text-accent-light border border-accent/20 rounded-full px-2.5 py-1 hover:bg-accent/10 transition-colors">
                    Get {p} key →
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      {(isStreaming || engineStates.some(s => s !== 'pending')) && (
        <PipelineStatus engineStates={engineStates} provider={activeProvider} />
      )}

      {/* Blueprint Output */}
      {markdown && (
        <BlueprintOutput
          markdown={markdown}
          isStreaming={isStreaming}
          query={currentQuery}
        />
      )}

      {/* Footer */}
      <footer className="text-center mt-12 text-[11px] font-mono text-white/20">
        FOUNDryAI · Open Source · MIT License · Made for founders
      </footer>
    </main>
  )
}
