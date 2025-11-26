import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../Toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState({ name: "" });
  const [newCategory, setNewCategory] = useState({ name: "" });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        setCategories(response.data);
      } catch (error) {
        setError("Failed to load categories.");
        showErrorToast("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Create category
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      showWarningToast("Please provide a name for the category.");
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/category-types/",
        newCategory
      );
      setCategories((prev) => [...prev, response.data]);
      showSuccessToast("Category created successfully.");
      setNewCategory({ name: "" });
    } catch (error) {
      showErrorToast("Failed to create category.");
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/core/category-types/${id}/`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      showSuccessToast("Category deleted successfully.");
    } catch (error) {
      showErrorToast("Failed to delete category.");
    }
  };

  // Update category
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCategory = async () => {
    if (!updatedCategory.name.trim()) {
      showWarningToast("Please fill in the category name.");
      return;
    }
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/core/category-types/${selectedCategory.id}/`,
        updatedCategory
      );
      setCategories((prev) =>
        prev.map((cat) => (cat.id === response.data.id ? response.data : cat))
      );
      showSuccessToast("Category updated successfully.");
      setSelectedCategory(null);
      setUpdatedCategory({ name: "" });
    } catch (error) {
      showErrorToast("Failed to update category.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center flex-1 text-xl font-semibold">
        Loading categories...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center flex-1 text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="flex flex-col items-center space-y-6 w-full overflow-auto">
      <h3 className="text-xl font-bold mb-2">All Categories</h3>

      {/* Table */}
      <div className="overflow-x-auto w-full max-w-3xl">
        <table className="min-w-full table-auto border-collapse mx-auto">
          <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            <tr>
              <th className="px-4 py-2 border-b text-right">Name</th>
              <th className="px-4 py-2 border-b text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{category.name}</td>
                <td className="px-4 py-2 border-b text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setUpdatedCategory({ name: category.name });
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Form */}
      <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-2">Add New Category</h2>
        <input
          type="text"
          name="name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
          placeholder="Enter category name"
        />
        <button
          onClick={handleCreateCategory}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
        >
          Add Category
        </button>
      </div>

      {/* Update Form */}
      {selectedCategory && (
        <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Edit Category</h2>
          <input
            type="text"
            name="name"
            value={updatedCategory.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
            placeholder="Enter category name"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateCategory}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
            >
              Update
            </button>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
