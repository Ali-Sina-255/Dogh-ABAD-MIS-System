import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AddPharmaceutical = () => {
  const [newStock, setNewStock] = useState({
    name: "",
    price: "",
    percentage: "",
    amount: "",
    daily_used: "",
  });

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding the new stock
  const handleAddStock = async () => {
    if (Object.values(newStock).some((field) => field === "")) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/stocks/",
        newStock
      );
      Swal.fire("Success", "Stock added successfully.", "success");
      setNewStock({
        name: "",
        price: "",
        percentage: "",
        amount: "",
        daily_used: "",
      }); // Reset the form
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        Swal.fire(
          "Error",
          "Failed to add stock: " + error.response.data,
          "error"
        );
      } else {
        console.error("Error message:", error.message);
        Swal.fire(
          "Error",
          "Failed to add stock. Please check the console for details.",
          "error"
        );
      }
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
        Add New Pharmaceutical Stock
      </h2>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {Object.keys(newStock).map((key) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {key.replace("_", " ")}
            </label>
            <input
              type={
                key.includes("price") ||
                key.includes("amount") ||
                key.includes("daily")
                  ? "number"
                  : "text"
              }
              name={key}
              value={newStock[key]}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder={`Enter ${key.replace("_", " ")}`}
              required
            />
          </div>
        ))}
        <button
          onClick={handleAddStock}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium text-sm px-4 py-2 rounded-lg shadow hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add Stock
        </button>
      </div>  
    </div>
  );
};

export default AddPharmaceutical;
