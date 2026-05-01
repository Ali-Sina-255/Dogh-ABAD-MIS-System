import { useEffect, useState, useRef } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import { getCurrentJalaliMonth, PERSIAN_MONTHS } from "../../../utils/jalali";
import React from "react";
const LabManager = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [types, setTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [labForm, setLabForm] = useState({
    patient: "",
    patientName: "",
    test_type: "",
    price: "",
    refer_to: "",
  });

  const [patientDropdownVisible, setPatientDropdownVisible] = useState(false);
  const patientInputRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  /* ================= دریافت داده‌ها ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, p, t] = await Promise.all([
        axiosInstance.get("/core/lab/", {
          params: { jalali_month: selectedMonth },
        }),
        axiosInstance.get("/core/patients/"),
        axiosInstance.get("/core/test-type/"),
      ]);
      setRecords(r.data || []);
      setPatients(p.data || []);
      setTypes(t.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("دریافت سوابق آزمایش موفق نبود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= مودال ================= */
  const openModal = (record = null) => {
    if (record) {
      const patientName =
        patients.find((p) => p.id === record.patient)?.name || "";
      setLabForm({
        id: record.id,
        patient: record.patient,
        patientName,
        test_type: record.test_type,
        price: record.price,
        refer_to: record.refer_to,
      });
    } else {
      setLabForm({
        patient: "",
        patientName: "",
        test_type: "",
        price: "",
        refer_to: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
    setLabForm({
      patient: "",
      patientName: "",
      test_type: "",
      price: "",
      refer_to: "",
    });
    setPatientDropdownVisible(false);
  };

  /* ================= ذخیره ================= */
  const saveLabRecord = async () => {
    if (!labForm.patient || !labForm.test_type || !labForm.price)
      return showErrorToast("تمام فیلدهای ضروری را پر کنید");

    setSaving(true);
    try {
      if (labForm.id) {
        await axiosInstance.put(`/core/lab/${labForm.id}/`, labForm);
        showSuccessToast("سوابق آزمایش بروزرسانی شد");
      } else {
        await axiosInstance.post("/core/lab/", labForm);
        showSuccessToast("سوابق آزمایش ثبت شد");
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error(err);
      showErrorToast("ثبت سوابق آزمایش موفق نبود");
    } finally {
      setSaving(false);
    }
  };

  /* ================= پاجینیشن ================= */
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getPatientName = (id) => patients.find((p) => p.id === id)?.name || id;
  const getTypeName = (id) => types.find((t) => t.id === id)?.name || id;

  /* ================= کلیک خارج از دکمه ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        patientInputRef.current &&
        !patientInputRef.current.contains(e.target)
      ) {
        setPatientDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* هدر + فیلتر ماه */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={() => openModal()}
          className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
        >
          + ثبت آزمایش جدید
        </button>

        <div className="flex flex-wrap gap-2 mb-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full text-sm border ${
                month === selectedMonth
                  ? "bg-green text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* جدول */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border text-center">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">بیمار</th>
              <th className="p-2 border">تشخیص</th>
              <th className="p-2 border">قیمت</th>
              <th className="p-2 border">ارجاع</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  هیچ سوابقی موجود نیست
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{getPatientName(r.patient)}</td>
                  <td className="p-2 border">{getTypeName(r.test_type)}</td>
                  <td className="p-2 border">{r.price}</td>
                  <td className="p-2 border">{r.refer_to}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => openModal(r)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          !window.confirm("آیا از حذف این سابقه مطمئن هستید؟")
                        )
                          return;
                        try {
                          await axiosInstance.delete(`/core/lab/${r.id}/`);
                          setRecords((prev) =>
                            prev.filter((rec) => rec.id !== r.id),
                          );
                          showSuccessToast("با موفقیت حذف شد");
                        } catch (err) {
                          console.error(err);
                          showErrorToast("حذف سوابق موفق نبود");
                        }
                      }}
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

      {/* ==================== مودال ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {labForm.id ? "ویرایش سابقه آزمایش" : "ثبت سابقه آزمایش"}
            </h3>

            <div className="space-y-3">
              {/* ===== جستجوی زنده بیمار ===== */}
              <div className="relative" ref={patientInputRef}>
                <input
                  type="text"
                  placeholder="جستجوی بیمار"
                  value={labForm.patientName || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLabForm((prev) => ({
                      ...prev,
                      patientName: value,
                      patient: "",
                    }));
                    setPatientDropdownVisible(true);
                  }}
                  onFocus={() => setPatientDropdownVisible(true)}
                  className="border p-2 rounded w-full"
                />

                {patientDropdownVisible && labForm.patientName && (
                  <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto mt-1 rounded shadow">
                    {patients
                      .filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(labForm.patientName.toLowerCase()),
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setLabForm((prev) => ({
                              ...prev,
                              patient: p.id,
                              patientName: p.name,
                            }));
                            setPatientDropdownVisible(false);
                          }}
                        >
                          {p.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* ===== نوع آزمایش ===== */}
              <select
                name="test_type"
                value={labForm.test_type}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">نوع آزمایش</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="price"
                value={labForm.price}
                onChange={handleChange}
                placeholder="قیمت"
                className="border p-2 rounded w-full"
              />

              <input
                type="text"
                name="refer_to"
                value={labForm.refer_to}
                onChange={handleChange}
                placeholder="ارجاع به"
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                انصراف
              </button>
              <button
                onClick={saveLabRecord}
                className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
              >
                {saving ? "در حال ذخیره..." : labForm.id ? "بروزرسانی" : "ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabManager;
