/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          50: '#f0fdfa',   // soft light teal background
          100: '#ccfbf1',  // light teal
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',  // teal main
          600: '#0d9488',
          700: '#0f766e',  // primary teal brand color
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        accent: {
          50: '#f0f9ff',   // soft blue background
          100: '#e0f2fe',
          500: '#0ea5e9',  // sky blue accent
          600: '#0284c7',
          700: '#0369a1',
        },
        pediatric: {
          mint: '#e2f0d9',
          lavender: '#f2e7fc',
          peach: '#fcecd6',
          rose: '#fce4e4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        card: '0 2px 12px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
