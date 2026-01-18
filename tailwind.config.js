/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Theme Palette
        luxury: {
          dark: '#0a0a0a', // Deep black for background
          gold: '#d4af37', // Classic gold
          accent: '#1e3a8a', // Deep royal blue/teal
          text: '#e5e5e5', // Soft white
          muted: '#525252',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'], // Luxury vibe
      }
    },
  },
  plugins: [],
}
