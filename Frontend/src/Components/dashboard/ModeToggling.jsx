import { useState, useEffect } from "react";
import { MdCheck, MdClose } from "react-icons/md";
import CryptoJS from "crypto-js";
const RoleToggle = () => {
  const secretKey = "TET4-1"; // Use a strong secret key
  const decryptData = (hashedData) => {
    if (!hashedData) {
      console.error("No data to decrypt");
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(hashedData, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  const [role, setRole] = useState(decryptData(localStorage.getItem("role")));
  const [status, setStatus] = useState("Free");

  const toggleStatus = () => {
    setStatus((prevStatus) => (prevStatus === "Free" ? "Busy" : "Free"));
  };

  if (role != "1") {
    return null; // Hide if role is not 1
  }

  return (
    <div
      onClick={toggleStatus}
      className={`relative block w-[70px] h-[30px] cursor-pointer rounded-full border shadow-sm transition-all duration-300 
        ${status === "Free" ? "bg-green" : "bg-red-500"}`}
    >
      {/* Toggle Circle */}
      <div
        className={`absolute w-[25px] h-[25px] rounded-full top-[2px] transition-all duration-300 shadow-md 
          ${
            status === "Free"
              ? "left-[3px] bg-white"
              : "left-[65px] translate-x-[-100%] bg-gray-200"
          }`}
      ></div>

      {/* Free Icon */}
      <MdCheck
        className={`absolute left-[8px] w-4 h-4 top-1.5 transition-all ${
          status === "Free" ? "opacity-100 text-white" : "opacity-50"
        }`}
      />

      {/* Busy Icon */}
      <MdClose
        className={`absolute right-[8px] w-4 h-4 top-1.5 transition-all ${
          status === "Busy" ? "opacity-100 text-white" : "opacity-50"
        }`}
      />
    </div>
  );
};

export default RoleToggle;
