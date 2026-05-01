/* ==================== TestTypeManager.jsx ==================== */
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import { getCurrentJalaliMonth, PERSIAN_MONTHS } from "../../../utils/jalali";
import React from "react";
const TestTypeManager = () => {
  const [types, setTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "details"
  const [selectedType, setSelectedType] = useState(null);
  const [typeName, setTypeName] = useState("");
  const [records, setRecords] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  /* ================= دریافت انواع آزمایش و بیماران ================= */
  const fetchTypes = async (month = "") => {
    setLoading(true);
    try {
      const [resTypes, resPatients] = await Promise.all([
        axiosInstance.get("/core/test-type/", {
          params: month ? { jalali_month: month } : {},
        }),
        axiosInstance.get("/core/patients/"),
      ]);
      setTypes(resTypes.data || []);
      setPatients(resPatients.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("دریافت انواع آزمایش یا بیماران موفق نبود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes(selectedMonth);
  }, [selectedMonth]);

  /* ================= توابع مودال ================= */
  const openAddModal = () => {
    setSelectedType(null);
    setTypeName("");
    setModalType("add");
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setSelectedType(type);
    setTypeName(type.name);
    setModalType("edit");
    setShowModal(true);
  };

  const openDetailsModal = async (type) => {
    setSelectedType(type);
    setModalType("details");
    setShowModal(true);

    try {
      const res = await axiosInstance.get("/core/lab/", {
        params: { test_type: type.id, jalali_month: selectedMonth },
      });

      const labRecords = res.data.map((r) => {
        const patient = patients.find((p) => p.id === r.patient);
        const testType = types.find((t) => t.id === r.test_type);
        return {
          ...r,
          patient_name: patient?.name || r.patient,
          test_name: testType?.name || r.test_type,
        };
      });

      setRecords(labRecords);
      const total = labRecords.reduce(
        (sum, r) => sum + parseFloat(r.price || 0),
        0,
      );
      setTotalIncome(total);
    } catch (err) {
      console.error(err);
      showErrorToast("دریافت سوابق آزمایش برای این نوع موفق نبود");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
    setRecords([]);
    setTotalIncome(0);
    setTypeName("");
    setSelectedType(null);
  };

  /* ================= ذخیره ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!typeName) return showErrorToast("نام الزامی است");

    setSaving(true);
    try {
      if (modalType === "edit" && selectedType?.id) {
        await axiosInstance.put(`/core/test-type/${selectedType.id}/`, {
          name: typeName,
        });
        showSuccessToast("با موفقیت ویرایش شد");
      } else if (modalType === "add") {
        await axiosInstance.post("/core/test-type/", { name: typeName });
        showSuccessToast("با موفقیت اضافه شد");
      }

      await fetchTypes(selectedMonth);
      closeModal();
    } catch (err) {
      console.error(err);
      showErrorToast("ذخیره موفق نبود");
    } finally {
      setSaving(false);
    }
  };

  /* ================= حذف ================= */
  const deleteType = async (id) => {
    if (!window.confirm("آیا از حذف این نوع آزمایش مطمئن هستید؟")) return;
    try {
      await axiosInstance.delete(`/core/test-type/${id}/`);
      setTypes((prev) => prev.filter((t) => t.id !== id));
      showSuccessToast("با موفقیت حذف شد");
      closeModal();
    } catch (err) {
      console.error(err);
      showErrorToast("حذف موفق نبود");
    }
  };

  const totalPages = Math.ceil(types.length / itemsPerPage);
  const paginatedTypes = types.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 space-y-4">
      {/* هدر + فیلتر ماه */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={openAddModal}
          className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
        >
          + اضافه کردن نوع آزمایش
        </button>

        <div className="flex flex-wrap gap-2 mb-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedMonth === month
                  ? "bg-green text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold">انواع آزمایش</h2>
      </div>

      {/* جدول */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border text-center">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">شناسه</th>
              <th className="p-2 border">نام</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : paginatedTypes.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500">
                  هیچ نوع آزمایشی وجود ندارد
                </td>
              </tr>
            ) : (
              paginatedTypes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{t.id}</td>
                  <td
                    className="p-2 border font-semibold cursor-pointer text-blue-600 hover:underline"
                    onClick={() => openDetailsModal(t)}
                  >
                    {t.name}
                  </td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteType(t.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
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

      {/* پاجینیشن */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            قبلی
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? "bg-green text-white" : ""
              }`}
            >
              {page}
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

      {/* مودال اضافه/ویرایش */}
      {showModal && (modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">
              {modalType === "edit"
                ? "ویرایش نوع آزمایش"
                : "اضافه کردن نوع آزمایش"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="نام"
                className="w-full border rounded px-2 py-1"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
                >
                  {saving
                    ? "در حال ذخیره..."
                    : modalType === "edit"
                      ? "بروزرسانی"
                      : "اضافه کردن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال جزئیات */}
      {showModal && modalType === "details" && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-11/12 max-w-4xl max-h-[70vh] overflow-y-auto overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">
              سوابق {selectedType?.name} (تشخیص)
            </h3>
            <div className="mb-2 font-semibold">
              مجموع درآمد: {totalIncome.toFixed(2)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border text-center">
                <thead className="bg-green text-white">
                  <tr>
                    <th className="p-2 border">بیمار</th>
                    <th className="p-2 border">تشخیص (آزمایش/بخش)</th>
                    <th className="p-2 border">قیمت</th>
                    <th className="p-2 border">ارجاع</th>
                    <th className="p-2 border">تاریخ ایجاد</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-2 text-gray-500">
                        هیچ سوابقی موجود نیست
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{r.patient_name}</td>
                        <td className="p-2 border">{r.test_name}</td>
                        <td className="p-2 border">{r.price}</td>
                        <td className="p-2 border">{r.refer_to}</td>
                        <td className="p-2 border">{r.created_at || r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTypeManager;
