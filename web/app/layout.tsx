import type { Metadata } from 'next'
import { Inter, Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FOUNDryAI — Startup Blueprint Generator',
  description: '9-Engine AI pipeline that turns any idea into a validated, build-ready startup blueprint. 100% free APIs.',
  keywords: ['startup', 'AI', 'blueprint', 'saas', 'founder', 'pitch deck'],
  openGraph: {
    title: 'FOUNDryAI',
    description: 'Turn any idea into a validated startup blueprint in seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-white antialiased">
        {children}
      </body>
    </html>
  )
}
