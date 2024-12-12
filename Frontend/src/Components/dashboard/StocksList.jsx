import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStock, setEditingStock] = useState(null); // Track the stock being edited
  const [updatedStock, setUpdatedStock] = useState({
    name: "",
    price: "",
    percentage: "",
    amount: "",
    daily_used: "",
  });

  // Fetch stock data from the API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/core/stocks/");
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        setError("Failed to load stocks.");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Handle input change for the update form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStock((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (Object.values(updatedStock).some((field) => field === "")) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/core/stocks/${editingStock.id}/`,
        updatedStock
      );
      setStocks((prev) =>
        prev.map((stock) =>
          stock.id === editingStock.id ? response.data : stock
        )
      );
      setEditingStock(null);
      setUpdatedStock({
        name: "",
        price: "",
        percentage: "",
        amount: "",
        daily_used: "",
      });
      Swal.fire("Success", "Stock updated successfully.", "success");
    } catch (error) {
      console.error("Error updating stock:", error);
      Swal.fire("Error", "Failed to update stock. Please try again.", "error");
    }
  };

  // Handle stock deletion
  const handleDeleteStock = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This stock will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`http://127.0.0.1:8000/core/stocks/${id}/`);
        setStocks((prev) => prev.filter((stock) => stock.id !== id));
        Swal.fire("Deleted!", "The stock has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting stock:", error);
        Swal.fire(
          "Error",
          "Failed to delete stock. Please try again.",
          "error"
        );
      }
    }
  };

  // Loading and error handling states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading stocks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">
        Stocks Management
      </h2>

      {/* Update Form for Selected Stock */}
      {editingStock && (
        <div className="mb-6 p-6 bg-blue-50 shadow rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">
            Edit Stock
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {Object.keys(updatedStock).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">
                  {key.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                </label>
                <input
                  type={
                    key === "price" || key === "amount" || key === "daily_used"
                      ? "number"
                      : "text"
                  }
                  name={key}
                  value={updatedStock[key]}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  placeholder={`Enter ${key.replace("_", " ")}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleUpdateStock}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-150 mt-4"
          >
            Update Stock
          </button>
        </div>
      )}

      {/* Stocks Table */}
      <div className="mt-6 p-6 bg-blue-50 shadow rounded-lg">
        <h3 className="text-2xl font-semibold mb-4 text-blue-700">
          تمام دوا های موجود{" "}
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              {[
                "Name",
                "Price",
                "Percentage",
                "Amount",
                "Total Price",
                "Daily Used",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left border-b font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{stock.name}</td>
                <td className="px-4 py-2 border-b">{stock.price}</td>
                <td className="px-4 py-2 border-b">{stock.percentage}</td>
                <td className="px-4 py-2 border-b">{stock.amount}</td>
                <td className="px-4 py-2 border-b">{stock.total_price}</td>
                <td className="px-4 py-2 border-b">{stock.daily_used}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => {
                      setEditingStock(stock);
                      setUpdatedStock({
                        name: stock.name,
                        price: stock.price,
                        percentage: stock.percentage,
                        amount: stock.amount,
                        daily_used: stock.daily_used,
                      });
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-150 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStock(stock.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-150"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stocks;
