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
        },
        // Modern Crypto Trading Template Palette (from reference image)
        dark: {
          canvas:     '#15171C',
          card:       '#1E222B',
          cardHover:  '#242934',
          subtle:     '#181B22',
          input:      '#14171E',
          border:     'rgba(255, 255, 255, 0.07)',
          borderHover:'rgba(255, 255, 255, 0.14)',
          text:       '#FFFFFF',
          muted:      '#8F9CAE',
          dim:        '#5E6A7D',
        },
        brand: {
          pink:       '#FF6CAB',
          purple:     '#7366FF',
          blue:       '#4E80EE',
        },
        ryo: {
          accent:     '#4ce07a',
          dim:        '#2e8a50',
          dark:       '#050806',
          raised:     '#0a100c',
          edge:       'rgba(76, 224, 122, 0.12)',
          edgeHover:  'rgba(76, 224, 122, 0.28)',
          glow:       'rgba(76, 224, 122, 0.35)',
        },
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(135deg, #4ce07a 0%, #2ecc71 45%, #1db954 100%)',
        'sunset-subtle':   'linear-gradient(135deg, rgba(76, 224, 122, 0.15) 0%, rgba(46, 138, 80, 0.15) 100%)',
        'sunset-card':     'linear-gradient(135deg, #4ce07a 0%, #2ecc71 50%, #15803d 100%)',
        'ryo-gradient':    'linear-gradient(135deg, #4ce07a 0%, #2ecc71 45%, #1db954 100%)',
        'ryo-card':        'linear-gradient(135deg, #4ce07a 0%, #2ecc71 50%, #15803d 100%)',
        'card-gradient':   'linear-gradient(180deg, #1E222B 0%, #1A1D25 100%)',
      },
      fontFamily: {
        sans:  ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'sunset':       '0 10px 25px -5px rgba(76, 224, 122, 0.40), 0 8px 10px -6px rgba(46, 138, 80, 0.30)',
        'sunset-sm':    '0 4px 14px 0 rgba(76, 224, 122, 0.30)',
        'ryo':          '0 10px 25px -5px rgba(76, 224, 122, 0.40), 0 8px 10px -6px rgba(46, 138, 80, 0.30)',
        'ryo-sm':       '0 4px 14px 0 rgba(76, 224, 122, 0.30)',
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
