/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          gold: '#C9A84C',       // Accent
          darkgold: '#8B6914',
          navy: '#1a2744',       // Legacy
          background: '#0a0f1a', // Deep Atmospheric Slate / Black
          surface: '#111827',    // Slightly lighter for input fields or structural columns
          border: 'rgba(255, 255, 255, 0.1)', // Sharp raw borders
          textMain: '#ffffff',
          textMuted: '#9ca3af',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        technical: ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

