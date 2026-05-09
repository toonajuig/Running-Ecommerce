/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#6B7780',
          card:    '#1F262A',
          deep:    '#13181B',
        },
        ink: {
          DEFAULT: '#F4F4F5',
          muted:   '#A1A8AB',
          faint:   '#6E7679',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
