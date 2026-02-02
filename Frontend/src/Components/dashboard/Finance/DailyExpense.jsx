import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../Utilities/Pagination";
import { showSuccessToast, showErrorToast } from "../../messages/Toast";
import { getCurrentJalaliMonth, PERSIAN_MONTHS } from "../../../utils/jalali";
import StudentSearchBox from "../Admin/searchbox/StudentSearchBox";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const persianToEnglish = (str) => {
  const map = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  return str.replace(/[۰-۹]/g, (w) => map[w]);
};

const DailyExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  });
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const postsPerPage = 10;

  const token = localStorage.getItem("auth_token");
  axios.defaults.headers.common["Authorization"] = `Token ${token}`;

  // ---------------- دریافت هزینه‌ها ----------------
  const fetchExpenses = async (month = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/payment/expenses/`, {
        params: { jalali_month: month },
      });
      if (res.status === 200) setExpenses(res.data);
    } catch {
      setError("خطا در دریافت هزینه‌های روزانه.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedMonth);
  }, [selectedMonth]);

  // ---------------- مدیریت فرم ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      showErrorToast("لطفاً نام و مبلغ هزینه را وارد کنید.");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post(`${BASE_URL}/payment/expenses/`, {
        ...formData,
        jalali_month: selectedMonth,
      });

      if (res.status === 201) {
        showSuccessToast("هزینه با موفقیت ثبت شد!");
        fetchExpenses(selectedMonth);
        setShowModal(false);
        setFormData({ name: "", amount: "", description: "" });
      }
    } catch (error) {
      showErrorToast(error.response?.data?.detail || "خطا در ثبت هزینه.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این هزینه مطمئن هستید؟")) return;

    try {
      const res = await axios.delete(`${BASE_URL}/payment/expenses/${id}/`);
      if (res.status === 204) {
        showSuccessToast("هزینه با موفقیت حذف شد!");
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      showErrorToast("خطا در حذف هزینه.");
    }
  };

  // ---------------- جستجو و صفحه‌بندی ----------------
  const filteredExpenses = expenses.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredExpenses.length / postsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  return (
    <div className="bg-gray-100 w-full py-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* فیلتر ماه + افزودن */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
          >
            + ثبت هزینه
          </button>
          <div className="flex flex-wrap gap-2">
            {PERSIAN_MONTHS.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedMonth === month
                    ? "bg-green text-white"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* جستجو */}
        <StudentSearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="جستجو بر اساس نام هزینه..."
        />

        {/* نمایش خطا */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* جدول */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-green text-white text-center">
              <tr>
                <th className="border px-4 py-2">نام هزینه</th>
                <th className="border px-4 py-2">مبلغ</th>
                <th className="border px-4 py-2">توضیحات</th>
                <th className="border px-4 py-2">ماه</th>
                <th className="border px-4 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="border px-4 py-2 text-center">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="text-center border-b border-gray-200 bg-white hover:bg-gray-50 transition-all"
                  >
                    <td className="border px-4 py-2">{expense.name}</td>
                    <td className="border px-4 py-2">{expense.amount}</td>
                    <td className="border px-4 py-2">
                      {expense.description || "-"}
                    </td>
                    <td className="border px-4 py-2 font-semibold">
                      {expense.created_at}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 px-2 py-1 rounded-md border border-red-500 hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border px-4 py-2 text-center">
                    هزینه‌ای یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* مودال ثبت هزینه */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                ثبت هزینه ({selectedMonth})
              </h3>

              <input
                placeholder="نام هزینه"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 w-full mb-2"
              />
              <input
                type="text"
                placeholder="مبلغ"
                name="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: persianToEnglish(e.target.value).replace(
                      /[^0-9]/g,
                      "",
                    ),
                  }))
                }
                className="border p-2 w-full mb-2"
              />

              <textarea
                placeholder="توضیحات"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border p-2 w-full mb-2"
                rows="3"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: "", amount: "", description: "" });
                  }}
                  disabled={saving}
                  className="px-3 py-1 border rounded"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-1 bg-green text-white rounded"
                >
                  {saving ? "در حال ثبت..." : "ثبت"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyExpense;
