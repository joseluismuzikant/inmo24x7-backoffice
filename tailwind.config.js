/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1E3A8A',
        'brand-blue-light': '#3B82F6',
        'brand-blue-dark': '#1E40AF',
        'brand-green': '#10B981',
        'brand-green-light': '#34D399',
        'brand-green-dark': '#059669',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
