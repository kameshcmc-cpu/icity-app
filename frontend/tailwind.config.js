/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e7ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e3564',
          900: '#0f2540',
        },
      },
    },
  },
  plugins: [],
};
