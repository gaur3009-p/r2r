/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#050508',
          secondary: '#0d0d14',
          tertiary: '#12121e',
        },
        accent: {
          DEFAULT: '#6c47ff',
          light: '#a78bfa',
          blue: '#38bdf8',
          gold: '#f59e0b',
        },
        border: {
          dim: 'rgba(255,255,255,0.07)',
          DEFAULT: 'rgba(255,255,255,0.13)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
