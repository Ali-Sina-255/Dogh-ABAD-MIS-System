import React, { useState, useEffect } from "react";

// DailyPharmacyExpense Component
const DailyPharmacyExpense = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: "",
    amount: "",
    date: "",
  });
  const [editItem, setEditItem] = useState(null);

  // Fetch data from the daily-expenses-pharmacy API endpoint
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/core/daily-expenses-pharmacy/"
        );
        if (response.ok) {
          const data = await response.json();
          setExpenseData(data);
        } else {
          console.error("Error fetching expense data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Handle adding a new item
  const handleAddItem = async () => {
    const response = await fetch(
      "http://localhost:8000/core/daily-expenses-pharmacy/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      }
    );

    if (response.ok) {
      const newData = await response.json();
      setExpenseData((prevData) => [...prevData, newData]);
      setNewItem({
        name: "",
        amount: "",
        date: "",
      });
    } else {
      console.error("Error adding item:", response.status);
    }
  };

  // Handle updating an existing item
  const handleUpdateItem = async () => {
    const response = await fetch(
      `http://localhost:8000/core/daily-expenses-pharmacy/${editItem.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editItem),
      }
    );

    if (response.ok) {
      const updatedData = await response.json();
      setExpenseData((prevData) =>
        prevData.map((item) =>
          item.id === updatedData.id ? updatedData : item
        )
      );
      setEditItem(null);
    } else {
      console.error("Error updating item:", response.status);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id) => {
    const response = await fetch(
      `http://localhost:8000/core/daily-expenses-pharmacy/${id}/`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      setExpenseData((prevData) => prevData.filter((item) => item.id !== id));
    } else {
      console.error("Error deleting item:", response.status);
    }
  };

  // Handle input field changes (for both adding and editing)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editItem) {
      setEditItem({ ...editItem, [name]: value });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-blue-600">
          Daily Pharmacy Expense
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage the daily expenses for pharmacy purchases.
        </p>
      </div>

      {/* Expense Table */}
      <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            <tr>
              <th className="px-6 py-3 text-right">Date</th>
              <th className="px-6 py-3 text-right">Drug Name </th>
              <th className="px-6 py-3 text-right">Drug Quantity</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenseData.map((expense) => (
              <tr key={expense.id} className="border-b hover:bg-gray-100">
                <td className="px-6 py-3">{expense.date.split("T")[0]}</td>
                <td className="px-6 py-3">{expense.name}</td>
                <td className="px-6 py-3">{expense.amount}</td>
                <td className="px-6 py-3 text-center">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l"
                    onClick={() => setEditItem(expense)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l ml-2"
                    onClick={() => handleDeleteItem(expense.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Form */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {editItem ? "Edit Item" : "Add New Item"}
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label>Drug Name</label>
            <input
              type="text"
              name="name"
              value={editItem ? editItem.name : newItem.name}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label>Drug Amount</label>
            <input
              type="number"
              name="amount"
              value={editItem ? editItem.amount : newItem.amount}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={editItem ? editItem.date : newItem.date}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
          <div className="mt-4 text-center">
            <button
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l w-full"
              onClick={editItem ? handleUpdateItem : handleAddItem}
            >
              {editItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPharmacyExpense;
