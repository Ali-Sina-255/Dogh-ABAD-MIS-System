import CryptoJS from "crypto-js";
import AdminMainPage from "./dashboardChart/AdminMainPage";


const AdminDashboard = () => {
  const secretKey = "TET4-1";
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
  const role = decryptData(localStorage.getItem("role"));
  return (
    <div className="p-6 bg-gray-100 h-screen">
      {role == "0" && <AdminMainPage />}
    </div>
  );
};

export default AdminDashboard;
