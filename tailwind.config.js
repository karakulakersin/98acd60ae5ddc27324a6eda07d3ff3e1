/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'water-gradient': 'linear-gradient(180deg, rgba(96, 193, 233, 0.3), rgba(33, 150, 196, 0.4))',
      },
    },
  },
  plugins: [],
}

