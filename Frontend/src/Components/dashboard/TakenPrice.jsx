import React, { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../Toast";

const TakenPrice = () => {
  const [takenPrices, setTakenPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTakenPrice, setNewTakenPrice] = useState({
    name: "",
    description: "",
    amount: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTakenPrices = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/taken-expenses/"
        );
        setTakenPrices(response.data);
      } catch (error) {
        console.error("Error fetching taken prices:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTakenPrices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTakenPrice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (editMode && currentEdit) {
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/core/taken-expenses/${currentEdit.id}/`,
          newTakenPrice
        );
        setTakenPrices((prev) =>
          prev.map((price) =>
            price.id === currentEdit.id ? response.data : price
          )
        );
        setEditMode(false);
        setCurrentEdit(null);
        setNewTakenPrice({ name: "", description: "", amount: "" });
        setShowForm(false);
        showSuccessToast("Taken price updated successfully!");
      } catch (error) {
        showErrorToast("Failed to update taken price.");
      }
    } else {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/core/taken-expenses/",
          newTakenPrice
        );
        setTakenPrices((prev) => [...prev, response.data]);
        setNewTakenPrice({ name: "", description: "", amount: "" });
        setShowForm(false);
        showSuccessToast("Taken price added successfully!");
      } catch (error) {
        showErrorToast("Failed to add taken price.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/core/taken-expenses/${id}/`);
      setTakenPrices((prev) => prev.filter((price) => price.id !== id));
      showSuccessToast("Taken price deleted successfully!");
    } catch (error) {
      showErrorToast("Failed to delete taken price.");
    }
  };

  const handleEdit = (price) => {
    setEditMode(true);
    setCurrentEdit(price);
    setNewTakenPrice({
      name: price.name,
      description: price.description,
      amount: price.amount,
    });
    setShowForm(true);
  };

  if (loading) return <div>Loading taken prices...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-black mb-6">
        Taken Price List
      </h1>

      {/* Button to toggle form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full mb-6"
        >
          Add New Taken Price
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editMode ? "Update Taken Price" : "Add New Taken Price"}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newTakenPrice.name}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                placeholder="Enter taken price name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newTakenPrice.description}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                placeholder="Enter description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={newTakenPrice.amount}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                placeholder="Enter amount"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {editMode ? "Update Taken Price" : "Add Taken Price"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="mt-8 overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Description</th>
              <th className="px-4 py-2 border-b">Amount</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {takenPrices.map((price) => (
              <tr key={price.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{price.name}</td>
                <td className="px-4 py-2 border-b">{price.description}</td>
                <td className="px-4 py-2 border-b">{price.amount}</td>
                <td className="px-4 py-2 border-b">
                  {new Date(price.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b space-x-2">
                  <button
                    onClick={() => handleEdit(price)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-md hover:bg-gradient-to-l mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure? You won't be able to revert this!"
                        )
                      ) {
                        handleDelete(price.id);
                      }
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-1 rounded-md hover:bg-gradient-to-l"
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

export default TakenPrice;
