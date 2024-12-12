import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const WebBlog = () => {
  const fileInputRef = useRef(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    category: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/reception/blog/categories/"
        );
        if (response.status === 200 && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error("Invalid response structure for categories:", response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(
          "Failed to load categories. Please refresh the page or try again later."
        );
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/reception/blog/blog-posts/"
        );
        if (response.status === 200 && Array.isArray(response.data)) {
          setBlogs(response.data);
        } else {
          console.error("Invalid response structure for blog posts:", response);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setError(
          "Failed to load blog posts. Please refresh the page or try again later."
        );
      }
    };

    fetchCategories();
    fetchBlogs();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
    if (name === "category" && value !== "add") {
      setError(""); // Clear error when a valid category is selected
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Handle category creation if "add" is selected
    if (formData.category === "add") {
      if (!newCategory) {
        setError("Please provide a name for the new category.");
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/reception/blog/categories/",
          { category_name: newCategory }
        );
        if (response.status === 201) {
          setCategories((prevCategories) => [...prevCategories, response.data]);
          formData.category = response.data.id;
          setNewCategory("");
          setError("");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        setError("Failed to add new category. Please try again later.");
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare FormData for blog post submission
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/reception/blog/blog-posts/",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setBlogs((prevBlogs) => [...prevBlogs, response.data]);
        setFormData({ title: "", description: "", image: null, category: "" });
        setError("");
        Swal.fire("Success!", "Blog post added successfully.", "success");
      }
    } catch (error) {
      console.error("Error creating blog post:", error.response?.data);
      setError("Failed to submit blog post. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete blog post
  const handleDelete = async (blogId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://127.0.0.1:8000/reception/blog/blog-posts/${blogId}/`
          );
          if (response.status === 204) {
            setBlogs((prevBlogs) =>
              prevBlogs.filter((blog) => blog.id !== blogId)
            );
            Swal.fire("Deleted!", "Blog post has been deleted.", "success");
          }
        } catch (error) {
          console.error("Error deleting blog post:", error);
          Swal.fire(
            "Error!",
            "Failed to delete blog post. Please try again later.",
            "error"
          );
        }
      }
    });
  };

  // Handle update blog post (edit form)
  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      description: blog.description,
      category: blog.category,
      image: null, // Set to null to keep existing image unchanged
    });
  };

  // Function to handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory) {
      setError("Please provide a name for the new category.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/reception/blog/categories/",
        { category_name: newCategory }
      );

      if (response.status === 201) {
        setCategories((prevCategories) => [...prevCategories, response.data]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          category: response.data.id, // Set the new category as the selected one
        }));
        setNewCategory(""); // Clear the new category input field
        setError(""); // Clear any previous error
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add new category. Please try again later.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">مدیریت وبلاگ</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <label htmlFor="title" className="block font-semibold">
          عنوان
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Description input */}
        <label htmlFor="description" className="block font-semibold">
          توضیحات
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        ></textarea>

        {/* Image input */}
        <label htmlFor="image" className="block font-semibold">
          تصویر
        </label>
        <input
          ref={fileInputRef}
          id="image"
          type="file"
          name="image"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Category selection */}
        <label htmlFor="category" className="block font-semibold">
          دسته‌بندی
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="" disabled>
            انتخاب دسته‌بندی
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
          <option value="add">+ افزودن دسته‌بندی جدید</option>
        </select>

        {/* New category input */}
        {formData.category === "add" && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="نام دسته‌بندی جدید"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 w-full"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              افزودن
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, category: "" }))}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              انصراف
            </button>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "در حال ارسال..." : "افزودن"}
        </button>
      </form>

      {/* Displaying blogs */}
      <h3 className="text-lg font-bold mt-6">وبلاگ‌های موجود</h3>
      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">عنوان</th>
            <th className="border px-4 py-2">دسته‌بندی</th>
            <th className="border px-4 py-2">تصویر</th>
            <th className="border px-4 py-2">توضیحات</th>
            <th className="border px-4 py-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.id}>
              <td className="border px-4 py-2">{blog.title}</td>
              <td className="border px-4 py-2">
                {categories.length > 0 && blog.category
                  ? categories.find((category) => category.id === blog.category)
                      ?.category_name || "نامشخص"
                  : "نامشخص"}
              </td>
              <td className="border px-4 py-2">
                {blog.image ? (
                  <img
                    src={blog.image} // Adjust path as necessary
                    alt={blog.title}
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  "بدون تصویر"
                )}
              </td>
              <td className="border px-4 py-2">{blog.description}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(blog)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded mb-2"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WebBlog;