// tailwind.config.js
// Portfolio — Design System tokens
// Usage: import into your Vite/CRA project

/** @type {import('tailwindcss').Config} */
export default {
  // ── Dark mode via class ──────────────────────────────────────────
  darkMode: 'class',

  // ── Scan all JSX/TSX for class names ────────────────────────────
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {

      // ── Screen breakpoints (Mobile-First) ───────────────────────
      // xs added so xs:inline works (used in Header.jsx)
      screens: {
        xs:  '480px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },

      // ── Container utility ────────────────────────────────────────
      // Use: <div className="container"> — auto-centered with gutters
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm:  '1.5rem',
          lg:  '2rem',
        },
        screens: {
          '2xl': '1400px',
        },
      },

      // ── Custom Colors ────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // primary indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#f8faff',
          dark:    '#0d1117',
        },
      },

      // ── Fluid Typography scale ───────────────────────────────────
      fontSize: {
        // hero: clamp(2rem, 5vw, 3.75rem)  — use with arbitrary value
        // E.g.: className="text-[clamp(2rem,5vw,3.75rem)]"
        '2xs': ['0.625rem', { lineHeight: '1rem' }],       // 10px
        'xs':  ['0.75rem',  { lineHeight: '1.125rem' }],   // 12px  (Tailwind default)
      },

      // ── Font families ────────────────────────────────────────────
      fontFamily: {
        sans: [
          'Inter var', 'Inter', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', 'Segoe UI', 'sans-serif',
        ],
        mono: [
          'JetBrains Mono', 'Fira Code', 'Cascadia Code',
          'ui-monospace', 'monospace',
        ],
      },

      // ── Glassmorphism helpers ────────────────────────────────────
      backdropBlur: {
        xs:  '2px',
        '4xl': '72px',
      },

      // ── Box shadows (glass cards) ────────────────────────────────
      boxShadow: {
        'glass':     '0 8px 32px 0 rgba(99, 102, 241, 0.10)',
        'glass-lg':  '0 20px 60px -10px rgba(99, 102, 241, 0.18)',
        'glass-dark':'0 8px 32px 0 rgba(0, 0, 0, 0.40)',
        'card':      '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(99,102,241,0.07)',
        'card-hover':'0 4px 20px rgba(99,102,241,0.15)',
      },

      // ── Border radius ────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── Animations ───────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'     },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':    'fade-in 0.3s ease both',
        'slide-right':'slide-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in':   'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer:      'shimmer 2s linear infinite',
      },

      // ── Spacing extras ───────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
      },

      // ── Aspect ratios ────────────────────────────────────────────
      aspectRatio: {
        'video':  '16 / 9',
        'square': '1 / 1',
        'a4':     '1 / 1.414',
        'card':   '4 / 3',
      },

      // ── Z-index scale ────────────────────────────────────────────
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '200': '200',
      },

      // ── Transition timing ────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'back':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  plugins: [
    // Uncomment these if you install the packages:
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/line-clamp'), // built-in since Tailwind v3.3
  ],
};
