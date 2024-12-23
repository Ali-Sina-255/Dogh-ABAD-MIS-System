/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        nastaliq: ['Jameel Noori Nastaleeq', 'serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      container: {
        padding: {
          DEFAULT: "0.5rem",
          sm: "0.5rem",
          lg: "1rem",
          xl: "2rem",
          "2xl": "3rem",
        },
      },
    },
  },
  plugins: [],
};
