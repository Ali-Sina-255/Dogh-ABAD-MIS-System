// src/redux/darkModeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const applyDarkMode = (isDarkMode) => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const initialDarkMode = localStorage.getItem("darkMode") === "true" || false;
applyDarkMode(initialDarkMode); // Apply dark mode on initial load

const darkModeSlice = createSlice({
  name: "darkMode",
  initialState: {
    darkMode: initialDarkMode,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", state.darkMode);
      applyDarkMode(state.darkMode); // Apply dark mode on toggle
    },
  },
});

export const { toggleDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
