/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          light: '#f0d9b5',
          dark: '#b58863',
          greenLight: '#eeeed2',
          greenDark: '#769656',
          highlight: 'rgba(255, 255, 0, 0.4)',
          hint: 'rgba(52, 211, 153, 0.45)',
          danger: 'rgba(239, 68, 68, 0.45)',
        },
        coach: {
          bg: '#181e29',
          card: '#222b3c',
          cardLight: '#2b364c',
          border: '#334155',
          accent: '#10b981',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'board': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
