/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        // Premium dark colors
        dark: {
          bg: '#0b0f19',
          card: '#151c2c',
          border: '#1f293d',
          hover: '#243049'
        },
        // EV dashboard custom statuses
        ev: {
          healthy: '#10b981', // green
          warning: '#f59e0b', // amber/yellow
          critical: '#ef4444', // red
          info: '#3b82f6', // blue
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
