import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track the category being edited
  const [updatedCategory, setUpdatedCategory] = useState({
    name: "",
  }); // Track the updated category
  const [newCategory, setNewCategory] = useState({
    name: "",
  }); // Track the new category for creation

  // Fetch categories data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      Swal.fire(
        "Warning",
        "Please provide a name for the category.",
        "warning"
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/category-types/",
        newCategory
      );
      const createdCategory = response.data;
      setCategories((prev) => [...prev, createdCategory]); // Add the new category to the list
      Swal.fire("Success", "Category created successfully.", "success");
      setNewCategory({ name: "" }); // Reset the input field
    } catch (error) {
      console.error("Error creating category:", error);
      Swal.fire(
        "Error",
        "Failed to create category. Please try again.",
        "error"
      );
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/core/category-types/${id}/`
        );

        if (response.status === 200 || response.status === 204) {
          setCategories((prev) =>
            prev.filter((category) => category.id !== id)
          );
          Swal.fire("Deleted!", "The category has been deleted.", "success");
        } else {
          throw new Error("Unexpected response status.");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        const errorMessage = error.response
          ? error.response.data
          : "Failed to delete category. Please try again.";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  // Handle category update form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submitting the updated category details
  const handleUpdateCategory = async () => {
    if (!updatedCategory.name.trim()) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/core/category-types/${selectedCategory.id}/`,
        updatedCategory
      );
      const updated = response.data;
      setCategories((prev) =>
        prev.map((category) =>
          category.id === updated.id ? updated : category
        )
      );
      Swal.fire("Success", "Category updated successfully.", "success");
      setSelectedCategory(null); // Close the edit form after updating
      setUpdatedCategory({
        name: "",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire(
        "Error",
        "Failed to update category. Please try again.",
        "error"
      );
    }
  };

  // Loading and error handling states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading categories...</div>
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
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-2">All Categories</h3>

      {/* Table for displaying categories */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l focus:outline-none">
            <tr>
              {["Name", "Actions"].map((header) => (
                <th
                  style={{ textAlign: "right" }}
                  key={header}
                  className="px-4 py-2 border-b text-sm font-semibold text-right"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{category.name}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setUpdatedCategory({
                        name: category.name,
                      });
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l mr-6"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l text-left"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create new category form */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-full mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Category</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            name="name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
          />
        </div>
        <div className="flex space-x-6">
          <button
            onClick={handleCreateCategory}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-md hover:bg-gradient-to-l"
          >
            Create Category
          </button>
        </div>
      </div>

      {/* Update form for selected category */}
      {selectedCategory && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Category</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={updatedCategory.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>
          <div className="flex space-x-6 text-right">
            <button
              onClick={handleUpdateCategory}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-md hover:bg-gradient-to-l"
            >
              Update Category
            </button>
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full bg-gray-300 justify-end text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400"
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
