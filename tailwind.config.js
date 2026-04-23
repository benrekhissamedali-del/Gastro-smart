/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0a0a0a',
          card: '#111111',
          elevated: '#181818',
          input: '#161616',
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          fire: '#f97316',
          green: '#4ade80',
        },
        border: {
          DEFAULT: '#1e1e1e',
          strong: '#2e2e2e',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
