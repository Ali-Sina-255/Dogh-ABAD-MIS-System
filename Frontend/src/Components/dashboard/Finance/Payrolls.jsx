import React, { useEffect, useState } from "react";
import Pagination from "../../../Utilities/Pagination";
import { showSuccessToast, showErrorToast } from "../../messages/Toast";
import {
  getCurrentJalaliMonth,
  PERSIAN_MONTHS,
  getFullJalaliDate,
} from "../../../utils/jalali";
import StudentSearchBox from "../Admin/searchbox/StudentSearchBox";
import { axiosInstance } from "../../../utils/api";

const Payrolls = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());
  const [showAddPayrollModal, setShowAddPayrollModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [payModal, setPayModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [payForm, setPayForm] = useState({
    payroll: null,
    amount_paid: "",
    note: "",
    jalali_month: getCurrentJalaliMonth(),
  });
  const [selectedPayrollHistory, setSelectedPayrollHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const postsPerPage = 10;

  // ---------------- دریافت فیش حقوق ----------------
  const fetchPayrolls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/payment/payrolls/`, {
        params: { jalali_month: selectedMonth },
      });
      if (res.status === 200) setPayrolls(res.data);
    } catch {
      setError("خطا در دریافت فیش‌های حقوق.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- دریافت کارمندان ----------------
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get(`/employee/employees/`);
      setEmployees(res.data);
    } catch {
      showErrorToast("خطا در دریافت لیست کارمندان");
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, [selectedMonth]);

  // ---------------- ایجاد فیش حقوق ----------------
  const handleCreatePayroll = async () => {
    if (!selectedEmployee) {
      showErrorToast("لطفاً یک کارمند انتخاب کنید");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.post(`/payment/payrolls/`, {
        employee: selectedEmployee,
        jalali_month: selectedMonth,
      });
      if (res.status === 201) {
        showSuccessToast("فیش حقوق با موفقیت ایجاد شد!");
        setSelectedEmployee("");
        setShowAddPayrollModal(false);
        fetchPayrolls();
      }
    } catch (err) {
      showErrorToast(err.response?.data?.detail || "خطا در ایجاد فیش حقوق");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- حذف فیش حقوق ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این فیش حقوق مطمئن هستید؟")) return;
    try {
      const res = await axiosInstance.delete(`/payment/payrolls/${id}/`);
      if (res.status === 204) {
        showSuccessToast("فیش حقوق با موفقیت حذف شد!");
        setPayrolls((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      showErrorToast("خطا در حذف فیش حقوق.");
    }
  };

  // ---------------- باز کردن مودال پرداخت ----------------
  const openPayModal = (payroll) => {
    setPayForm({
      payroll: payroll.id,
      amount_paid: payroll.remaining_amount || "",
      note: "",
      jalali_month: selectedMonth,
    });
    setPayModal(true);
  };

  // ---------------- باز کردن مودال تاریخچه ----------------
  const openHistoryModal = async (payroll) => {
    try {
      const res = await axiosInstance.get(`/payment/salary-payments/`, {
        params: { payroll: payroll.id },
      });
      setSelectedPayrollHistory(res.data || []);
    } catch {
      setSelectedPayrollHistory([]);
    } finally {
      setHistoryModal(true);
    }
  };

  // ---------------- مدیریت فرم پرداخت ----------------
  const handlePayChange = (e) => {
    const { name, value } = e.target;
    setPayForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaySubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await axiosInstance.post(
        `/payment/salary-payments/`,
        payForm,
      );
      if (res.status === 201) {
        showSuccessToast("حقوق با موفقیت پرداخت شد!");
        setPayModal(false);
        fetchPayrolls();
      }
    } catch (err) {
      showErrorToast(err.response?.data?.detail || "خطا در پرداخت حقوق");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- جستجو و صفحه‌بندی ----------------
  const filteredPayrolls = payrolls.filter((p) =>
    p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredPayrolls.length / postsPerPage);
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  return (
    <div className="bg-gray-100 w-full py-10" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* فیلتر ماه + افزودن فیش حقوق */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <button
            onClick={() => setShowAddPayrollModal(true)}
            className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
          >
            + افزودن فیش حقوق
          </button>
          <div className="flex flex-wrap gap-2">
            {PERSIAN_MONTHS.map((month) => (
              <button
                key={month}
                disabled={month !== selectedMonth}
                onClick={() => setSelectedMonth(month)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedMonth === month
                    ? "bg-green text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
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
          placeholder="جستجو بر اساس نام کارمند..."
        />

        {/* خطا */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* جدول فیش حقوق */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-green text-white text-center">
              <tr>
                <th className="border px-4 py-2">کارمند</th>
                <th className="border px-4 py-2">حقوق پایه</th>
                <th className="border px-4 py-2">ماه</th>
                <th className="border px-4 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="border px-4 py-6 text-center">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : paginatedPayrolls.length > 0 ? (
                paginatedPayrolls.map((p) => (
                  <tr
                    key={p.id}
                    className="text-center border-b border-gray-200 bg-white hover:bg-gray-50 transition-all"
                  >
                    <td className="border px-4 py-2">{p.employee_name}</td>
                    <td className="border px-4 py-2">{p.base_amount}</td>
                    <td className="border px-4 py-2 font-semibold">
                      {p.created_at}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => openPayModal(p)}
                        className="px-2 py-1 rounded-md bg-green text-white hover:bg-blue-600"
                      >
                        پرداخت
                      </button>
                      <button
                        onClick={() => openHistoryModal(p)}
                        className="px-2 py-1 rounded-md bg-gray-300 text-black hover:bg-gray-400"
                      >
                        تاریخچه
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 px-2 py-1 rounded-md border border-red-500 hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="border px-4 py-2 text-center">
                    فیش حقوقی برای این ماه یافت نشد.
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

        {/* مودال افزودن فیش حقوق */}
        {showAddPayrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
              <h3 className="text-lg font-bold mb-4">
                افزودن فیش حقوق ({selectedMonth})
              </h3>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border p-2 w-full mb-2"
              >
                <option value="">انتخاب کارمند</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={
                  selectedEmployee
                    ? employees.find((e) => e.id === parseInt(selectedEmployee))
                        ?.actual_salary
                    : ""
                }
                readOnly
                placeholder="حقوق پایه (خودکار)"
                className="border p-2 w-full mb-2 bg-gray-100 cursor-not-allowed"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddPayrollModal(false)}
                  className="px-3 py-1 border rounded"
                >
                  انصراف
                </button>
                <button
                  onClick={handleCreatePayroll}
                  disabled={saving}
                  className={`px-4 py-1 rounded text-white ${
                    saving ? "bg-gray-400 cursor-not-allowed" : "bg-green"
                  }`}
                >
                  {saving ? "در حال ذخیره..." : "ثبت"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال پرداخت */}
        {payModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
              <h3 className="text-lg font-bold mb-4">
                پرداخت حقوق ({payForm.jalali_month})
              </h3>
              <input
                type="number"
                name="amount_paid"
                placeholder="مبلغ پرداختی"
                value={payForm.amount_paid}
                onChange={handlePayChange}
                className="border p-2 w-full mb-2"
              />
              <textarea
                name="note"
                placeholder="توضیحات"
                value={payForm.note}
                onChange={handlePayChange}
                rows="3"
                className="border p-2 w-full mb-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setPayModal(false)}
                  className="px-3 py-1 border rounded"
                >
                  بستن
                </button>
                <button
                  onClick={handlePaySubmit}
                  disabled={saving}
                  className={`px-4 py-1 rounded text-white ${
                    saving ? "bg-gray-400 cursor-not-allowed" : "bg-green"
                  }`}
                >
                  {saving ? "در حال ثبت..." : "پرداخت"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال تاریخچه */}
        {historyModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
            dir="ltr"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                تاریخچه پرداخت حقوق
              </h3>
              <ul className="space-y-4">
                {selectedPayrollHistory.length > 0 ? (
                  selectedPayrollHistory.map((payment) => (
                    <li
                      key={payment.id}
                      className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm"
                    >
                      <p className="text-gray-700 font-medium">
                        مبلغ:{" "}
                        <span className="text-green-600">
                          {payment.amount_paid}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        توضیحات:{" "}
                        <span className="italic">{payment.note || "-"}</span>
                      </p>
                      <p className="text-gray-600">
                        تاریخ:{" "}
                        <span className="font-medium">
                          {getFullJalaliDate(payment.paid_at)}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        ماه:{" "}
                        <span className="font-medium">
                          {payment.jalali_month}
                        </span>
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-4">
                    هنوز پرداختی صورت نگرفته است.
                  </li>
                )}
              </ul>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setHistoryModal(false)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payrolls;
