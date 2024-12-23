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

  const [showForm, setShowForm] = useState(false); // State to control form visibility

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

    const { total_price, ...stockData } = newStock; // Remove total_price if exists

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/stocks/",
        stockData
      );
      Swal.fire("Success", "Stock added successfully.", "success");
      setNewStock({
        name: "",
        price: "",
        percentage: "",
        amount: "",
        daily_used: "",
      }); // Reset the form
      setShowForm(false); // Close the form after successful submission
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
    <div className="container mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Stock</h2>

      {/* Toggle button to show form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l transition duration-150 w-full mb-6"
        >
          Add New Stock
        </button>
      )}

      {/* Form for adding stock, visible only when showForm is true */}
      {showForm && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l focus:outline-none">
              <tr>
                <th className="px-4 py-2 border-b text-right">Field</th>
                <th className="px-4 py-2 border-b text-right">Input</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(newStock).map((key) => (
                <tr key={key}>
                  <td className="px-4 py-2 border-b font-medium capitalize">
                    {key.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2 border-b">
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
                      className="border border-gray-300 p-2 rounded w-full"
                      placeholder={`Enter ${key.replace("_", " ")}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit button to add stock */}
      {showForm && (
        <div className="mt-4 text-right">
          <button
            onClick={handleAddStock}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l transition duration-150"
          >
            Add Stock
          </button>
        </div>
      )}
    </div>
  );
};

export default AddPharmaceutical;
