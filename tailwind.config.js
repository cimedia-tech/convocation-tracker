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
          gold: '#C9A84C',
          darkgold: '#8B6914',
          navy: '#1a2744',
          darknavy: '#0f1a30',
          cream: '#FDF8F0',
          lightgold: '#F5E6C0',
        }
      }
    },
  },
  plugins: [],
}

