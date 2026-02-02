import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../messages/Toast";
import { PERSIAN_MONTHS, getCurrentJalaliMonth } from "../../../utils/jalali";

const PatientManager = () => {
  /* ========================= State ========================== */
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* Add/Edit Patient Modal */
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: null,
  });

  const [categories, setCategories] = useState([]);

  /* ========================= Fetch ========================== */
  const fetchPatients = async (month) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/core/patients/", {
        params: { jalali_month: month },
      });
      let data = res.data || [];
      data = data.filter((p) => !p.jalali_month || p.jalali_month === month);
      setPatients(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("خطا در دریافت بیماران");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/core/category-types/");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showErrorToast("خطا در دریافت دسته‌بندی‌ها");
    }
  };

  useEffect(() => {
    fetchPatients(selectedMonth);
    fetchCategories();
  }, [selectedMonth]);

  /* ========================= Pagination ========================== */
  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ========================= Handlers ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setNewPatient((prev) => ({
      ...prev,
      category: e.target.value ? parseInt(e.target.value, 10) : null,
    }));
  };

  const handleSavePatient = async () => {
    const { name, age, patient_type, category } = newPatient;
    if (!name || !age || !patient_type || category === null) {
      showWarningToast("لطفاً تمام فیلدها را تکمیل کنید");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/core/patients/${editingId}/`, newPatient);
        showSuccessToast("اطلاعات بیمار با موفقیت ویرایش شد");
      } else {
        await axiosInstance.post("/core/patients/", newPatient);
        showSuccessToast("بیمار با موفقیت اضافه شد");
      }

      closeModal();
      fetchPatients(selectedMonth);
    } catch (err) {
      console.error(err);
      showErrorToast("خطا در ذخیره اطلاعات بیمار");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setNewPatient({
      name: patient.name,
      age: patient.age,
      patient_type: patient.patient_type,
      category: patient.category || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این بیمار مطمئن هستید؟")) return;
    try {
      await axiosInstance.delete(`/core/patients/${id}/`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      showSuccessToast("بیمار با موفقیت حذف شد");
    } catch (err) {
      console.error(err);
      showErrorToast("خطا در حذف بیمار");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewPatient({ name: "", age: "", patient_type: "", category: null });
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "—";

  /* ========================= Render ========================== */
  return (
    <div className="p-6 space-y-4">
      {/* Month Filter + Add Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + افزودن بیمار
        </button>

        <div className="flex flex-wrap gap-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                selectedMonth === month
                  ? "bg-green text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">نام</th>
              <th className="p-2 border">سن</th>
              <th className="p-2 border">نوع بیماری</th>
              <th className="p-2 border">دسته‌بندی</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  بیماری یافت نشد
                </td>
              </tr>
            ) : (
              paginatedPatients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2 border font-bold">{p.name}</td>
                  <td className="p-2 border">{p.age}</td>
                  <td className="p-2 border">{p.patient_type}</td>
                  <td className="p-2 border">{getCategoryName(p.category)}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      className="px-2 py-1 bg-green text-white rounded"
                      onClick={() => handleEdit(p)}
                    >
                      ویرایش
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(p.id)}
                    >
                      حذف
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
            قبلی
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
            بعدی
          </button>
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "ویرایش بیمار" : "افزودن بیمار جدید"}
            </h3>

            <input
              type="text"
              name="name"
              placeholder="نام بیمار"
              className="border p-2 w-full mb-2"
              value={newPatient.name}
              onChange={handleChange}
              disabled={saving}
            />
            <input
              type="number"
              name="age"
              placeholder="سن"
              className="border p-2 w-full mb-2"
              value={newPatient.age}
              onChange={handleChange}
              disabled={saving}
            />
            <input
              type="text"
              name="patient_type"
              placeholder="نوع بیمار"
              className="border p-2 w-full mb-2"
              value={newPatient.patient_type}
              onChange={handleChange}
              disabled={saving}
            />

            <select
              name="category"
              value={newPatient.category || ""}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded mb-2"
              disabled={saving}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-1 bg-gray-300 rounded"
                disabled={saving}
              >
                انصراف
              </button>
              <button
                onClick={handleSavePatient}
                className="px-4 py-1 bg-green text-white rounded"
                disabled={saving}
              >
                {saving ? "در حال ذخیره..." : editingId ? "بروزرسانی" : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
