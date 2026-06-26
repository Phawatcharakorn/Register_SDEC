import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ku: {
          green:       '#1565C0',
          'green-600': '#1976D2',
          'green-50':  '#E3F2FD',
          'green-100': '#BBDEFB',
          gold:        '#FFD600',
          'gold-50':   '#FFFDE7',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans-thai)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}

export default config
