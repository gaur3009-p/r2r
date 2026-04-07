'use client'

import { CheckCircle, Circle, Loader } from 'lucide-react'

const ENGINES = [
  { id: '01', name: 'Research Intake',        emoji: '🔬' },
  { id: '02', name: 'Understanding',           emoji: '🧩' },
  { id: '03', name: 'Multi-Agent Reasoning',  emoji: '🤖' },
  { id: '04', name: 'Business Mapping',        emoji: '💼' },
  { id: '05', name: 'Execution',               emoji: '⚙️' },
  { id: '06', name: 'Code Base',               emoji: '💻' },
  { id: '07', name: 'Opportunity Scoring',     emoji: '📊' },
  { id: '08', name: 'Trend Radar',             emoji: '📡' },
  { id: '09', name: 'Pitch Deck',              emoji: '🎯' },
]

export type EngineState = 'pending' | 'active' | 'done'

interface PipelineStatusProps {
  engineStates: EngineState[]
  provider?: string
}

export default function PipelineStatus({ engineStates, provider }: PipelineStatusProps) {
  const doneCount = engineStates.filter(s => s === 'done').length
  const progress = Math.round((doneCount / ENGINES.length) * 100)
  const isComplete = doneCount === ENGINES.length

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-5 mb-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-0.5">
            Pipeline Status
          </div>
          <div className="font-syne font-700 text-sm text-white">
            {isComplete ? '✓ Blueprint Complete' : `Running Engine ${doneCount + 1} of ${ENGINES.length}...`}
          </div>
        </div>
        <div className="text-right">
          {provider && (
            <div className="font-mono text-[10px] text-accent-light bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1 mb-1">
              via {provider}
            </div>
          )}
          <div className="font-mono text-[11px] text-white/40">{progress}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/[0.06] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #6c47ff, #a78bfa, #38bdf8)',
          }}
        />
      </div>

      {/* Engine Grid */}
      <div className="grid grid-cols-3 gap-2">
        {ENGINES.map((engine, i) => {
          const state = engineStates[i] ?? 'pending'
          return (
            <div
              key={engine.id}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs transition-all duration-300 ${
                state === 'done'
                  ? 'border-green-500/25 bg-green-500/[0.06] text-green-400'
                  : state === 'active'
                  ? 'border-accent/40 bg-accent/[0.08] text-accent-light'
                  : 'border-white/[0.05] bg-white/[0.02] text-white/25'
              }`}
            >
              <span className="shrink-0">
                {state === 'done' ? (
                  <CheckCircle size={12} className="text-green-400" />
                ) : state === 'active' ? (
                  <Loader size={12} className="animate-spin-slow text-accent-light" />
                ) : (
                  <Circle size={12} />
                )}
              </span>
              <span className="font-mono text-[10px] font-500 truncate">
                {engine.id} {engine.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ENGINES }
