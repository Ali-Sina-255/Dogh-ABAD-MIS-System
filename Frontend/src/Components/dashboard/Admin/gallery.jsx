import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { IoTrashSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import Pagination from "../../../Utilities/Pagination";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Gallery = () => {
  const fileInputRef = useRef(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    category: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find((cat) => cat.id === formData.category) || null
  );


  const handleSelect = (category) => {
    if (category.id === "add") {
      setFormData({ ...formData, category: "add" });
      // onAddCategory(); // Call the function to add a new category
    } else {
      setSelectedCategory(category);
      handleChange({ target: { name: "category", value: category.id } });
    }
    setIsDropdownOpen(false);
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) {
      Swal.fire("خطا", "لطفاً نام دسته‌بندی جدید را وارد کنید.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/common/gallery-categories/`,
        { name: newCategory }
      );

      setCategories((prevCategories) => [...prevCategories, response.data]);
      Swal.fire("موفقیت", "دسته‌بندی جدید با موفقیت اضافه شد.", "success");
      setFormData({ ...formData, category: response.data.id });
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire("خطا", "افزودن دسته‌بندی با مشکل مواجه شد.", "error");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/common/gallery-categories/`
        );

        setCategories(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(
          "Failed to load categories. Please refresh the page or try again later."
        );
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/common/galleries/`);
        setBlogs(response.data);
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
  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file)); // Generate preview
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.category === "add") {
      // ... existing category creation code ...
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      if (editingBlog) {
        // Update existing blog
        const response = await axios.put(
          `${BASE_URL}/common/galleries/${editingBlog}/`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setBlogs((prev) =>
          prev.map((blog) => (blog.id === editingBlog ? response.data : blog))
        );
        Swal.fire("موفقیت!", "پست بلاگ به‌روزرسانی شد.", "success");
      } else {
        // Create new blog
        console.log(payload);
        const response = await axios.post(
          `${BASE_URL}/common/galleries/`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setBlogs((prev) => [...prev, response.data]);
        Swal.fire("موفقیت!", "پست بلاگ اضافه شد.", "success");
      }

      setFormData({ image: null, category: "" });
      setEditingBlog(null);
      setPreview(null);
      setSelectedCategory(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      // ... error handling ...
    } finally {
      setIsSubmitting(false);
    }
  };
  const cancelEdit = () => {
    setEditingBlog(null);
    setFormData({ image: null, category: "" });
    setSelectedCategory(null);
  };

  // Handle delete blog post
  const handleDelete = async (blogId) => {
    Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات غیر قابل بازگشت است.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن!",
      cancelButtonText: "لغو",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${BASE_URL}/common/galleries/${blogId}/`
          );
          if (response.status === 204) {
            setBlogs((prevBlogs) =>
              prevBlogs.filter((blog) => blog.id !== blogId)
            );
            Swal.fire(
              "حذف شد!",
              "مطلب مورد نظر با موفقیت حذف گردید.",
              "success"
            );
          }
          setFormData({});
        } catch (error) {
          console.error("Error deleting blog post:", error);
          Swal.fire(
            "خطا!",
            "حذف مطلب با مشکل مواجه شد. لطفاً بعداً دوباره تلاش کنید.",
            "error"
          );
        }
      }
    });
  };

  // Modify handleEdit function
  const handleEdit = (blog) => {
    setEditingBlog(blog.id);
    setFormData({
      category: blog.category,
      image: blog.image,
    });
    const selectedCat = categories.find((cat) => cat.id === blog.category);
    setSelectedCategory(selectedCat || null);
    setPreview(blog.image);

    // Set the preview image
    const imagePreview = document.getElementById("imagePreview");
    if (imagePreview) {
      imagePreview.src = blog.image; // Assuming blog.image contains the image URL
      imagePreview.style.display = "block"; // Ensure the preview is visible
    }
  };

  const deleteCategory = async (categoryId) => {
    Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${BASE_URL}/common/gallery-categories/${categoryId}/`
          );
          setCategories((prevCategories) =>
            prevCategories.filter((category) => category.id !== categoryId)
          );
          Swal.fire("موفق!", "دسته‌بندی با موفقیت حذف شد.", "success");
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire("خطا!", "حذف دسته‌بندی با مشکل مواجه شد.", "error");
        }
      }
    });
  };
 //  pagination section
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(blogs.length / postsPerPage);
  const paginatedOrders = [...blogs] // Create a copy to avoid mutation
    .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  return (
    <div className="py-10 bg-gray-200 w-full">
      <div className="max-w-3xl mx-auto p-2 shadow-lg bg-white rounded-md">
        <h2 className="md:text-xl text-base text-center font-bold mb-4">
          افزودن تصویر جدید
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className=" border-t m-1  p-2 flex flex-col justify-center items-center space-y-4"
        >
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            name="image"
            onChange={handleChange}
            className="border p-2 w-full"
          />
          {preview && (
            <div className="preview-container">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-48 h-48"
              />
            </div>
          )}
          {/* Category selection */}
          <label htmlFor="category" className="block font-semibold">
            دسته‌بندی
          </label>
          <div className="relative w-[300px] md:w-[400px]">
            {/* Dropdown Button */}
            <div
              className="border p-2 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedCategory ? selectedCategory.name : "انتخاب دسته‌بندی"}
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="p-2 flex  items-center justify-between"
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => handleSelect(category)}
                    >
                      {category.name}
                    </span>
                    <button
                      className="bg-red-500 text-white px-2 rounded"
                      onClick={() => deleteCategory(category.id)}
                    >
                      حذف
                    </button>
                  </li>
                ))}
                <li
                  className="p-2 hover:bg-gray-100 cursor-pointer text-blue-500"
                  onClick={() =>
                    handleSelect({
                      id: "add",
                      category_name: "+ افزودن دسته‌بندی جدید",
                    })
                  }
                >
                  + افزودن دسته‌بندی جدید
                </li>
              </ul>
            )}
          </div>

          {/* New category input */}
          {formData.category === "add" && (
            <div className="space-y-2 w-full flex items-center gap-x-5">
              <input
                id="newCategory"
                type="text"
                placeholder="نام دسته‌بندی جدید"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border p-2 w-full rounded"
              />
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => addNewCategory()}
                  className="secondry-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "در حال ارسال..."
                    : editingBlog
                    ? "بروزرسانی"
                    : "افزودن"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, category: "" }))
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className={` ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "secondry-btn"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "در حال ارسال..."
              : editingBlog
              ? "بروزرسانی تصویر"
              : "افزودن تصویر"}
          </button>
        </form>
      </div>
      {/* Displaying blogs */}
      <div className="p-5 mt-3">
        <p className="text-xl font-Ray_black font-bold text-center">
          تصاویر موجود
        </p>
      </div>
      <center>
        <div className="w-[400px] md:w-[700px] lg:w-[80%] mx-auto  lg:overflow-hidden">
          <table className="w-full  rounded-lg border border-gray-300 overflow-x-scroll shadow-md">
            <thead>
              <tr className="bg-green text-gray-100 text-center">
                <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                  دسته‌بندی
                </th>
                <th className="border border-gray-300 px-6 py-2.5text-sm font-semibold">
                  تصویر
                </th>
                <th className="border border-gray-300 px-6 py-2.5 text-sm font-semibold">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
               paginatedOrders.map((blog) => (
                  <tr
                    key={blog.id}
                    className="text-center border-b border-gray-200 bg-white hover:bg-gray-200 transition-all"
                  >
                    <td className="border px-4 py-2">
                      {categories.length > 0 && blog.category
                        ? categories.find(
                            (category) => category.id === blog.category
                          )?.name || "نامشخص"
                        : "نامشخص"}
                    </td>
                    <td className="border px-4 py-2">
                      {blog.image ? (
                        <img
                          src={blog.image} // Adjust path as necessary
                          alt={blog.title}
                          width={100}
                          className="w-14 h-10 object-cover rounded-lg border  border-gray-300 shadow-sm"
                        />
                      ) : (
                        "بدون تصویر"
                      )}
                    </td>

                    <td className=" px-6 py-2 flex justify-center gap-x-5">
                      <button
                        onClick={() => handleEdit(blog)}
                        className=" text-green px-1 py-1 rounded-md transition-all"
                      >
                        <FaRegEdit size={24} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className=" text-red-500 px-1 py-1 rounded-md transition-all disabled:opacity-50"
                      >
                        <IoTrashSharp size={24} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border px-4 py-2 text-center">
                    هیچ وبلاگی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </center>
    </div>
  );
};

export default Gallery;
