/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'navy': {
          50: '#E6EBF4',
          100: '#B3C2DC',
          200: '#8099C4',
          300: '#4D70AC',
          400: '#26519A',
          500: '#0A1D4D',
          600: '#091A45',
          700: '#07153A',
          800: '#061130',
          900: '#040D25',
        },
      },
    },
  },
  plugins: [],
};
