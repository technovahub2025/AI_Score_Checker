/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--gh-bg)',
          elevated: 'var(--gh-bg-elevated)'
        },
        surface: 'var(--gh-surface)',
        surfaceStrong: 'var(--gh-surface-strong)',
        panel: 'var(--gh-panel)',
        border: 'var(--gh-border)',
        text: {
          DEFAULT: 'var(--gh-text)',
          muted: 'var(--gh-text-muted)'
        },
        accent: {
          purple: 'var(--gh-accent-purple)',
          cyan: 'var(--gh-accent-cyan)',
          glow: 'var(--gh-glow)'
        }
      },
      boxShadow: {
        soft: '0 18px 60px rgba(0, 0, 0, 0.28)',
        glow: '0 0 0 1px rgba(138, 92, 255, 0.18), 0 18px 60px rgba(138, 92, 255, 0.12)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        orb: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(24px, -18px, 0) scale(1.08)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.45 },
          '50%': { opacity: 0.9 }
        }
      },
      animation: {
        orb: 'orb 10s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease both',
        pulseSoft: 'pulseSoft 2.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
