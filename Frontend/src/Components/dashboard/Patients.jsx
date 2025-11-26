import { useState } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../Toast";

const AddPharmaceutical = () => {
  const [newStock, setNewStock] = useState({
    name: "",
    price: "",
    percentage: "",
    amount: "",
  });

  const [showForm, setShowForm] = useState(false);

  // -------------------------
  // Handle input change
  // -------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // Add Stock
  // -------------------------
  const handleAddStock = async () => {
    // Validate all fields
    if (Object.values(newStock).some((field) => field === "")) {
      showWarningToast("Please fill in all fields.");
      return;
    }

    const { total_price, ...stockData } = newStock; // Exclude total_price if present

    try {
      await axios.post("http://127.0.0.1:8000/core/stocks/", stockData);
      showSuccessToast("Stock added successfully.");

      setNewStock({
        name: "",
        price: "",
        percentage: "",
        amount: "",
        daily_used: "",
      }); // Reset form

      setShowForm(false); // Close form
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        showErrorToast(
          "Failed to add stock: " + JSON.stringify(error.response.data)
        );
      } else {
        console.error("Error message:", error.message);
        showErrorToast(
          "Failed to add stock. Please check the console for details."
        );
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Stock</h2>

      {/* Toggle button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l transition duration-150 w-full mb-6"
        >
          Add New Stock
        </button>
      )}

      {/* Stock form */}
      {showForm && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md">
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

          {/* Submit button */}
          <div className="mt-4 text-right">
            <button
              onClick={handleAddStock}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l transition duration-150"
            >
              Add Stock
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPharmaceutical;
