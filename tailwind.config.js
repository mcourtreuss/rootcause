/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#2D5F2D', light: '#3A7A3A' },
        sage: { DEFAULT: '#7A9A6B', light: '#96B488', dark: '#5E7D50' },
        mint: { DEFAULT: '#C8E6C1', light: '#E0F2DB' },
        cream: '#FAF7F2',
        parchment: '#F5F0E8',
        bark: { DEFAULT: '#5C4A3A', light: '#7A6654' },
        soil: '#8B7355',
        clay: { DEFAULT: '#C4B49A', light: '#D9CDBA', dark: '#A89878' },
        terracotta: { DEFAULT: '#C17C4E', light: '#D4956A', dark: '#A66838' },
        bloom: '#E8A0BF',
        sunlight: { DEFAULT: '#F4D47C', light: '#F9E6AD' },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 2px 8px rgba(92, 74, 58, 0.06)',
        'warm-md': '0 4px 16px rgba(92, 74, 58, 0.1)',
        'warm-lg': '0 8px 24px rgba(92, 74, 58, 0.12)',
      },
    },
  },
  plugins: [],
}
