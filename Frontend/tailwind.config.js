/** @type {import('tailwindcss').Config} */

import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
        green: "#00513a",
        orange: "#FFDB00",
        update: "#ED8D1D",
      },
      fontFamily: {
        vazirmatn: ["Vazirmatn", "Arial", "sans-serif"],
        Ray: ["Ray"],
        Ray_black: ["Ray_black"],
        Ray_text: ["Ray_text"],
        italianno: ["Italianno", "cursive"],
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
