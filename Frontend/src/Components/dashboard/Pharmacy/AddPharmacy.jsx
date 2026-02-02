import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../messages/Toast";
import { PERSIAN_MONTHS, getCurrentJalaliMonth } from "../../../utils/jalali";

const PharmaceuticalManager = () => {
  /* ========================= State ========================== */
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* Add/Edit Stock Modal */
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newStock, setNewStock] = useState({
    id: null,
    name: "",
    price: "",
    percentage: "",
    amount: "",
  });

  /* ========================= دریافت داده‌ها ========================== */
  const fetchStocks = async (month) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/core/stocks/", {
        params: { jalali_month: month },
      });
      let data = res.data || [];
      data = data.filter((s) => !s.jalali_month || s.jalali_month === month);
      setStocks(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("بارگذاری موجودی داروها موفق نبود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks(selectedMonth);
  }, [selectedMonth]);

  /* ========================= Pagination ========================== */
  const totalPages = Math.ceil(stocks.length / itemsPerPage);
  const paginatedStocks = stocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ========================= Handlers ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStock = async () => {
    if (
      !newStock.name ||
      newStock.price === "" ||
      newStock.percentage === "" ||
      newStock.amount === ""
    ) {
      showWarningToast("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setSaving(true);
    try {
      if (newStock.id) {
        // ویرایش موجودی
        await axiosInstance.put(`/core/stocks/${newStock.id}/`, newStock);
        showSuccessToast("موجودی با موفقیت بروزرسانی شد");
      } else {
        // اضافه کردن موجودی جدید
        await axiosInstance.post("/core/stocks/", newStock);
        showSuccessToast("موجودی با موفقیت ثبت شد");
      }
      setNewStock({
        id: null,
        name: "",
        price: "",
        percentage: "",
        amount: "",
      });
      setShowModal(false);
      fetchStocks(selectedMonth);
    } catch (err) {
      console.error(err);
      showErrorToast("ثبت موجودی موفق نبود");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStock = (stock) => {
    setNewStock(stock);
    setShowModal(true);
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("آیا از حذف این موجودی مطمئن هستید؟")) return;

    try {
      await axiosInstance.delete(`/core/stocks/${id}/`);
      showSuccessToast("موجودی با موفقیت حذف شد");
      fetchStocks(selectedMonth);
    } catch (err) {
      console.error(err);
      showErrorToast("حذف موجودی موفق نبود");
    }
  };

  /* ========================= Render ========================== */
  return (
    <div className="p-6 space-y-4">
      {/* فیلتر ماه + دکمه اضافه کردن */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + ثبت موجودی دارو
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

      {/* جدول موجودی */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border text-center">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">نام دارو</th>
              <th className="p-2 border">قیمت</th>
              <th className="p-2 border">درصد</th>
              <th className="p-2 border">قیمت کل</th>
              <th className="p-2 border">مقدار</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  موجودی‌ای یافت نشد
                </td>
              </tr>
            ) : (
              paginatedStocks.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2 border font-bold">{s.name}</td>
                  <td className="p-2 border">{s.price}</td>
                  <td className="p-2 border">{s.percentage}</td>
                  <td className="p-2 border">{s.total_price}</td>
                  <td className="p-2 border">{s.amount}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => handleEditStock(s)}
                      className="px-2 py-1 bg-green text-white rounded text-xs"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteStock(s.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
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

      {/* مودال ثبت/ویرایش موجودی */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {newStock.id ? "ویرایش موجودی دارو" : "ثبت موجودی جدید دارو"}
            </h3>

            <input
              type="text"
              name="name"
              placeholder="نام دارو"
              className="border p-2 w-full mb-2"
              value={newStock.name}
              onChange={handleChange}
              disabled={saving}
            />
            <input
              type="number"
              name="price"
              placeholder="قیمت"
              className="border p-2 w-full mb-2"
              value={newStock.price}
              onChange={handleChange}
              disabled={saving}
            />
            <input
              type="number"
              name="percentage"
              placeholder="درصد"
              className="border p-2 w-full mb-2"
              value={newStock.percentage}
              onChange={handleChange}
              disabled={saving}
            />
            <input
              type="number"
              name="amount"
              placeholder="مقدار"
              className="border p-2 w-full mb-2"
              value={newStock.amount}
              onChange={handleChange}
              disabled={saving}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 bg-gray-300 rounded"
                disabled={saving}
              >
                انصراف
              </button>
              <button
                onClick={handleSaveStock}
                className="px-4 py-1 bg-green text-white rounded"
                disabled={saving}
              >
                {saving ? "در حال ذخیره..." : "ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaceuticalManager;
