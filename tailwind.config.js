export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ksi: {
          yellow: '#FFDC00',
          black: '#1A1A1A',
        }
      }
    },
  },
  plugins: [],
}
