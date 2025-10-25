// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '768px',
        'mobile': '480px',
      },
      colors: {
        'primary': '#06438a',
        'accent': '#4EBABC',
        'bg-alt': '#F9F9F9',
      },
    },
  },
  plugins: [],
}