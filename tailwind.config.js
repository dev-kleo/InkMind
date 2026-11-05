/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}', './*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8f3',
          100: '#d5efe3',
          200: '#aee0c9',
          300: '#7bc9a8',
          400: '#4aad86',
          500: '#2f916c',
          600: '#227455',
          700: '#1c5d46',
          800: '#184b39',
          900: '#143e30',
          950: '#0a231b',
        },
        surface: {
          DEFAULT: 'var(--kos-surface)',
          muted: 'var(--kos-surface-muted)',
          elevated: 'var(--kos-surface-elevated)',
        },
        ink: {
          DEFAULT: 'var(--kos-ink)',
          muted: 'var(--kos-ink-muted)',
          subtle: 'var(--kos-ink-subtle)',
        },
        line: 'var(--kos-line)',
        accent: 'var(--kos-accent)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        float: '0 8px 30px rgba(15, 23, 42, 0.12)',
        panel: '0 1px 0 rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 180ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
