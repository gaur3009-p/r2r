'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download, FileText } from 'lucide-react'

interface BlueprintOutputProps {
  markdown: string
  isStreaming: boolean
  query: string
}

export default function BlueprintOutput({ markdown, isStreaming, query }: BlueprintOutputProps) {
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [markdown, isStreaming])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    const filename = `foundry-ai-blueprint-${slug}.md`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!markdown) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#0a0a10]">
        <div className="flex items-center gap-2.5">
          <FileText size={14} className="text-accent-light" />
          <span className="font-syne font-700 text-sm text-white">
            {isStreaming ? 'Generating Blueprint' : '✓ Blueprint Ready'}
          </span>
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent rounded-sm animate-blink ml-1" />
          )}
        </div>
        {!isStreaming && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] rounded-lg text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all font-mono"
            >
              <Download size={12} /> .md
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] rounded-lg text-xs text-white/40 hover:text-accent-light hover:border-accent/30 transition-all font-mono"
            >
              {copied ? <><Check size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        )}
      </div>

      {/* Markdown body */}
      <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">
        <div className="md-output">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const inline = !match
                if (inline) {
                  return <code className={className} {...props}>{children}</code>
                }
                return (
                  <div className="relative group">
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <CopyCodeButton code={String(children)} />
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        background: '#0a0a12',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '1.2rem',
                        fontSize: '0.8rem',
                        lineHeight: '1.6',
                        margin: '1rem 0',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                )
              },
              table({ children }: any) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                )
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-[10px] text-white/60 hover:text-white transition-all font-mono"
    >
      {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
    </button>
  )
}
