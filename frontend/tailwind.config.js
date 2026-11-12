/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'text-main': 'var(--text)',
        'text-dim': 'var(--text-dim)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        'accent-2': 'var(--accent-2)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'sans-serif'],
        display: ['"Sora Variable"', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'monospace'],
      },
      borderRadius: {
        'glass': '14px',
      },
      backdropBlur: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
};
