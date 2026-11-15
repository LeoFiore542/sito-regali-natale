/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: {
            light: '#f87171',
            DEFAULT: '#dc2626',
            dark: '#991b1b',
            deep: '#7f1d1d',
          },
          green: {
            light: '#4ade80',
            DEFAULT: '#16a34a',
            dark: '#166534',
            pine: '#14532d',
          },
          gold: {
            light: '#fde047',
            DEFAULT: '#eab308',
            dark: '#ca8a04',
            metallic: '#d4af37'
          },
          snow: '#f8fafc',
          cream: '#fffdfa'
        }
      },
      fontFamily: {
        festive: ['"Mountains of Christmas"', 'cursive', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
