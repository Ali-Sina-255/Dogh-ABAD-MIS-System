import React, { createContext, useState, useEffect } from "react";

// Create context for Dark Mode
export const DarkModeContext = createContext();
export const OrderContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkmode, setDarkmode] = useState(() => {
    const savedMode = localStorage.getItem("darkmode");
    return savedMode === "false";
  });

  const [incommingData, setIncommingData] = useState([]);

  useEffect(() => {
    if (darkmode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkmode]);

  const toggleDarkMode = () => {
    setDarkmode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkmode", newMode);
      return newMode;
    });
  };

  const searchOrderBySecretKey = async (inputValue) => {
    // Your API call logic goes here
  };

  return (
    <DarkModeContext.Provider value={{ darkmode, toggleDarkMode }}>
      <OrderContext.Provider
        value={{ incommingData, setIncommingData, searchOrderBySecretKey }}
      >
        {children}
      </OrderContext.Provider>
    </DarkModeContext.Provider>
  );
};
