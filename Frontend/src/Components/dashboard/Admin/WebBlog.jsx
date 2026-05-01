import { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import React from "react";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../messages/Toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* Modal */
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  /* ========================= Fetch ========================== */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("core/category-types/");
      setCategories(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ========================= Form ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return showWarningToast("Category name is required");
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await axiosInstance.put(
          `core/category-types/${editingCategory.id}/`,
          formData,
        );
        showSuccessToast("Category updated successfully");
      } else {
        await axiosInstance.post("core/category-types/", formData);
        showSuccessToast("Category created successfully");
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axiosInstance.delete(`core/category-types/${id}/`);
      showSuccessToast("Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to delete category");
    }
  };

  /* ========================= Pagination ========================== */
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ========================= Render ========================== */
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
        >
          + اضافه کردن
        </button>
        {/* <h2 className="text-lg font-bold">Category Manager</h2> */}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white border-b">
            <tr>
              <th className="p-2 border">نام</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              paginatedCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2 border">{cat.name}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 border rounded ${
                p === currentPage ? "bg-green text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingCategory ? "ویرایش" : "اضافه کردن  "}
            </h3>

            <input
              name="name"
              placeholder=" نام بخش"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-3 py-1 border rounded"
                disabled={submitting}
              >
                لغو
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-1 bg-blue-600 text-white rounded"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
