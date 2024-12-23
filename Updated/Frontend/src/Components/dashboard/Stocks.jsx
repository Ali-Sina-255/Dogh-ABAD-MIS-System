import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Utility function to handle form input changes
const handleFormInputChange = (e, setState, state, editingStock) => {
  const { name, value } = e.target;
  if (editingStock) {
    setState((prev) => ({ ...prev, [name]: value }));
  } else {
    setState((prev) => ({ ...prev, [name]: value }));
  }
};

// Form Component
const StockForm = ({ stockData, onInputChange, onSubmit, buttonText }) => (
  <div className="mb-4">
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(stockData).map((key) => (
        <div key={key} className="flex flex-col">
          <label className="mb-1 capitalize">{key.replace("_", " ")}</label>
          <input
            type={
              key.includes("price") ||
              key.includes("amount") ||
              key.includes("daily")
                ? "number"
                : "text"
            }
            name={key}
            value={stockData[key]}
            onChange={onInputChange}
            className="border border-gray-300 p-2 rounded"
            placeholder={`Enter ${key.replace("_", " ")}`}
          />
        </div>
      ))}
    </div>
    <button
      onClick={onSubmit}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-150 mt-2"
    >
      {buttonText}
    </button>
  </div>
);

// Table Component for displaying stock records
const StockTable = ({ stocks, onEdit, onDelete }) => (
  <div className="mt-6">
    <h3 className="text-xl font-bold mb-2">All Stocks</h3>
    <table className="w-full border-collapse">
      <thead>
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
            <th key={header} className="px-4 py-2 border-b text-right">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock) => (
          <tr key={stock.id}>
            <td className="px-4 py-2 border-b">{stock.name}</td>
            <td className="px-4 py-2 border-b">{stock.price}</td>
            <td className="px-4 py-2 border-b">{stock.percentage}</td>
            <td className="px-4 py-2 border-b">{stock.amount}</td>
            <td className="px-4 py-2 border-b">{stock.total_price}</td>
            <td className="px-4 py-2 border-b">{stock.daily_used}</td>
            <td className="px-4 py-2 border-b">
              <button
                onClick={() => onEdit(stock)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-150 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(stock.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-150"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStock, setNewStock] = useState({
    name: "",
    price: "",
    percentage: "",
    amount: "",
    daily_used: "",
  });
  const [editingStock, setEditingStock] = useState(null);

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

  const handleInputChange = (e) => {
    handleFormInputChange(
      e,
      editingStock ? setEditingStock : setNewStock,
      editingStock,
      editingStock
    );
  };

  const handleAddStock = async () => {
    if (Object.values(newStock).some((field) => field === "")) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    const { total_price, ...stockData } = newStock;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/stocks/",
        stockData
      );
      setStocks((prev) => [...prev, response.data]);
      Swal.fire("Success", "Stock added successfully.", "success");
      setNewStock({
        name: "",
        price: "",
        percentage: "",
        total_price: "",
        amount: "",
        daily_used: "",
      });
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

  const handleEditStock = (stock) => {
    setEditingStock({ ...stock });
  };

  const handleUpdateStock = async () => {
    if (!editingStock || !editingStock.id) {
      Swal.fire(
        "Error",
        "No stock selected or invalid stock data for update.",
        "error"
      );
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/core/stocks/${editingStock.id}/`,
        editingStock
      );
      setStocks((prev) =>
        prev.map((s) => (s.id === editingStock.id ? response.data : s))
      );
      setEditingStock(null);
      Swal.fire("Success", "Stock updated successfully.", "success");
    } catch (error) {
      console.error("Error updating stock:", error);
      Swal.fire("Error", "Failed to update stock. Please try again.", "error");
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/core/stocks/${id}/`);
      setStocks((prev) => prev.filter((stock) => stock.id !== id));
      Swal.fire("Success", "Stock deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting stock:", error);
      Swal.fire("Error", "Failed to delete stock. Please try again.", "error");
    }
  };

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
    <div className="container mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Stocks Management</h2>

      <StockForm
        stockData={newStock}
        onInputChange={handleInputChange}
        onSubmit={handleAddStock}
        buttonText="Add Stock"
      />

      {editingStock && (
        <div className="mt-6 p-4 border-t border-gray-200">
          <h3 className="text-xl font-bold mb-2">Edit Stock</h3>
          <StockForm
            stockData={editingStock}
            onInputChange={handleInputChange}
            onSubmit={handleUpdateStock}
            buttonText="Update Stock"
          />
        </div>
      )}

      <StockTable
        stocks={stocks}
        onEdit={handleEditStock}
        onDelete={handleDeleteStock}
      />
    </div>
  );
};

export default Stocks;
