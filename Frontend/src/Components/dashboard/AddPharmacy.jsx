import React, { useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../Toast";
const AddPharmaceutical = () => {
  const [newStock, setNewStock] = useState({
    name: "",
    price: "",
    percentage: "",
    amount: "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleAddStock = async () => {
    // Validate all fields
    if (Object.values(newStock).some((field) => field === "")) {
      showWarningToast("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/core/stocks/", newStock);
      showSuccessToast("Stock added successfully.");

      // Reset form
      setNewStock({
        name: "",
        price: "",
        percentage: "",
        amount: "",
      });
    } catch (error) {
      if (error.response) {
        showErrorToast(
          "Failed to add stock: " + JSON.stringify(error.response.data)
        );
      } else {
        showErrorToast("Failed to add stock. Check console for details.");
      }
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
        Add New Pharmaceutical Stock
      </h2>

      <div className="space-y-4">
        {Object.keys(newStock).map((key) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="block text-sm font-medium text-gray-700 capitalize"
            >
              {key.replace("_", " ")}
            </label>
            <input
              type={
                ["price", "amount", "percentage"].includes(key)
                  ? "number"
                  : "text"
              }
              name={key}
              id={key}
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
