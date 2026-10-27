/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        diorama: {
          surface: '#FFFDF9',
          subtle: '#F4F1EA',
          chip: '#EDE9FE',
          ink: '#1D2440',
          secondary: '#525B7A',
          muted: '#6E7794',
          primary: '#5A4FE8',
          primaryHover: '#483EC7',
          coral: '#FF7E6B',
          gold: '#F59E0B',
          mint: '#7CC98B',
          grass: '#95D5A6',
          path: '#E8DFCA',
          plaza: '#DDD3BC',
          wall: '#F7EFE2',
          skyRoof: '#BFE0FF',
          lilacRoof: '#C9BFFF',
          butterRoof: '#FFE59A',
          peachRoof: '#FFC9B0',
          mintRoof: '#B7E8D2',
        }
      },
      boxShadow: {
        pill: '0 8px 24px -4px rgba(29, 36, 64, 0.12), 0 2px 6px -1px rgba(29, 36, 64, 0.06)',
        sheet: '0 -12px 36px -6px rgba(29, 36, 64, 0.16)',
        cta: '0 6px 18px -2px rgba(90, 79, 232, 0.36)',
      }
    },
  },
  plugins: [],
};
