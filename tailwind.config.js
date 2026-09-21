/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ts: {
          // ethonline-main Deep Obsidian & Navy Backgrounds
          bg:          '#0C0E17',
          bg2:         '#10131F',
          bg3:         '#141724',
          panel:       '#161926',
          panel2:      '#1C2030',
          panel3:      '#23283C',
          card:        '#161926',
          cardHover:   '#1F2333',
          // ethonline-main Signature Accents
          cream:       '#FBEDE0',
          creamMuted:  'rgba(251, 237, 224, 0.70)',
          creamSubtle: 'rgba(251, 237, 224, 0.40)',
          green:       '#38F997',
          greenDim:    'rgba(56, 249, 151, 0.12)',
          greenGlow:   'rgba(56, 249, 151, 0.28)',
          cyan:        '#00D2FF',
          cyanMuted:   '#38BDF8',
          blue:        '#3B82F6',
          purple:      '#A855F7',
          // Subtle Champagne / Slate Borders
          border:      'rgba(251, 237, 224, 0.10)',
          borderMid:   'rgba(251, 237, 224, 0.18)',
          borderBright:'rgba(251, 237, 224, 0.30)',
          // Status Signals
          buy:         '#34D399',
          buyBg:       'rgba(52, 211, 153, 0.12)',
          sell:        '#F87171',
          sellBg:      'rgba(248, 113, 113, 0.12)',
          hold:        '#FBBF24',
          holdBg:      'rgba(251, 191, 36, 0.12)',
          red:         '#EF4444',
          redBg:       'rgba(239, 68, 68, 0.12)',
          amber:       '#F59E0B',
          amberBg:     'rgba(245, 158, 11, 0.12)',
          // High-contrast Typography
          text:        '#FBEDE0',
          textMuted:   'rgba(251, 237, 224, 0.65)',
          textSubtle:  'rgba(251, 237, 224, 0.40)',
        }
      },
      fontFamily: {
        sans:  ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cream':   '0 0 28px -6px rgba(251, 237, 224, 0.25)',
        'glow-cream-sm':'0 0 16px -4px rgba(251, 237, 224, 0.18)',
        'glow-green':   '0 0 28px -6px rgba(56, 249, 151, 0.35)',
        'glow-green-sm':'0 0 16px -4px rgba(56, 249, 151, 0.25)',
        'glow-cyan':    '0 0 25px -5px rgba(0, 210, 255, 0.35)',
        'glow-red':     '0 0 25px -5px rgba(239, 68, 68, 0.35)',
        'panel':        '0 8px 32px -4px rgba(0, 0, 0, 0.60)',
        'card':         '0 4px 20px -2px rgba(0, 0, 0, 0.50)',
      },
      animation: {
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan':           'scan 2s ease-in-out infinite',
        'fade-up':        'fadeUp .4s ease forwards',
        'dot-pulse':      'dotPulse 1.8s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.2' },
          '50%':       { transform: 'translateY(100%)', opacity: '0.8' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        dotPulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(56,249,151,.6)' },
          '50%':      { opacity: '0.7', boxShadow: '0 0 0 5px rgba(56,249,151,0)' },
        },
      },
    },
  },
  plugins: [],
}
