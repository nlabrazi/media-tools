import type { Config } from 'tailwindcss'

export default (<Config>{
  content: ['./app/**/*.{vue,js,ts}', './components/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#00d4ff',
          purple: '#b366ff',
          pink: '#ff2d95',
          green: '#00ff88',
          yellow: '#ffd700',
          orange: '#ff6b35',
        },
        dark: {
          DEFAULT: '#0a0a1a',
          card: 'rgba(15, 15, 35, 0.8)',
          surface: 'rgba(25, 25, 50, 0.6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
})
