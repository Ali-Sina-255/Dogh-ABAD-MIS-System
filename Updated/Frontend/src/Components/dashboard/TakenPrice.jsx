import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
  const [showForm, setShowForm] = useState(false); // State to control form visibility

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
        setShowForm(false); // Hide the form after submission
        Swal.fire("Success", "Taken price updated successfully.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to update taken price.", "error");
      }
    } else {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/core/taken-expenses/",
          newTakenPrice
        );
        setTakenPrices((prev) => [...prev, response.data]);
        setNewTakenPrice({ name: "", description: "", amount: "" });
        setShowForm(false); // Hide the form after submission
        Swal.fire("Success", "Taken price added successfully.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to add taken price.", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/core/taken-expenses/${id}/`);
      setTakenPrices((prev) => prev.filter((price) => price.id !== id));
      Swal.fire("Deleted", "Taken price deleted successfully.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete taken price.", "error");
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
    setShowForm(true); // Show the form when editing
  };

  if (loading) {
    return <div>Loading taken prices...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-black mb-6">
        Taken Price List
      </h1>

      {/* Button to toggle the form visibility */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l w-full mb-6"
        >
          Add New Taken Price
        </button>
      )}

      {/* Form to add/update taken price */}
      {showForm && (
        <div className="mt-8 mx-auto p-6 w-full sm:w-4/5 lg:w-full rounded-lg shadow-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-700">
            {editMode ? "Update Taken Price" : "Add New Taken Price"}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={newTakenPrice.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter taken price name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={newTakenPrice.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description of taken price"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Amount</label>
              <input
                type="number"
                name="amount"
                value={newTakenPrice.amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter taken price amount"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l focus:outline-none w-full"
            >
              {editMode ? "Update Taken Price" : "Add Taken Price"}
            </button>
          </form>
        </div>
      )}

      {/* Table to display the taken prices */}
      <div className="mt-8 overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white">
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
                    onClick={() =>
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes, delete it!",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleDelete(price.id);
                        }
                      })
                    }
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
