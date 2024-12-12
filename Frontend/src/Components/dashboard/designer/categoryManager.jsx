import React, { useState, useEffect } from "react";
import axios from "axios";

const Category = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingCategory, setEditingCategory] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/group/categories/"
      );
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        const response = await axios.put(
          `http://localhost:8000/group/categories/${editingCategory.id}/`,
          { name: categoryName }
        );

        if (response.status === 200) {
          setResponseMessage("کتگوری با موفقیت ویرایش شد!");
          setEditingCategory(null);
        } else {
          setErrorMessage("ویرایش کتگوری ناموفق بود.");
        }
      } else {
        const response = await axios.post(
          "http://localhost:8000/group/categories/",
          {
            name: categoryName,
          }
        );

        if (response.status === 201) {
          setResponseMessage("کتگوری با موفقیت اضافه شد!");
        } else {
          setErrorMessage("اضافه کردن کتگوری ناموفق بود.");
        }
      }

      setCategoryName("");
      fetchCategories();
    } catch (error) {
      setErrorMessage("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      console.error("Error:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/group/categories/${id}/`
      );
      if (response.status === 204) {
        setResponseMessage("کتگوری با موفقیت حذف شد!");
        fetchCategories();
      } else {
        setErrorMessage("حذف کتگوری ناموفق بود.");
      }
    } catch (error) {
      setErrorMessage("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      console.error("Error:", error);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingCategory(category);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      setFilteredCategories(
        categories.filter((category) =>
          category.name.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  };

  // Handle sort
  const handleSort = () => {
    const sortedCategories = [...filteredCategories].sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setFilteredCategories(sortedCategories);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-4 shadow-lg border-spacing-y-2">
      <h2 className="text-xl font-bold mb-4">مدیریت کتگوری‌ها</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-2 shadow space-y-4">
        <div>
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-700"
          >
            {editingCategory ? "ویرایش کتگوری" : "نام کتگوری"}
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="نام کتگوری را وارد کنید"
            required
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            editingCategory
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {editingCategory ? "ویرایش" : "اضافه کردن"}
        </button>
        {editingCategory && (
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setCategoryName("");
            }}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            انصراف
          </button>
        )}
      </form>
      {responseMessage && (
        <p className="mt-4 text-green-600">{responseMessage}</p>
      )}
      {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}

      {/* Category List */}
      <div className="mt-2 bg-gray-200 shadow p-2 flex items-center justify-between mb-6">
  <h3 className="text-lg font-bold text-gray-800">لیست کتگوری‌ها</h3>
  {/* Search and Sort */}
  <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-md">
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearch}
      className="m-2 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      placeholder="جستجوی کتگوری"
    />
    <button
      onClick={handleSort}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
    >
      مرتب‌سازی {sortOrder === "asc" ? "⬇️" : "⬆️"}
    </button>
  </div>
</div>

      <ul className="mt-4 space-y-2">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <li
              key={category.id}
              className="p-4 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{category.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="m-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="m-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  حذف
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-600">هیچ کتگوری موجود نیست.</p>
        )}
      </ul>
    </div>
  );
};

export default Category;
