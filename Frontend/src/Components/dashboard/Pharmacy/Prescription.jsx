import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../../utils/api";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../messages/Toast";
import { PERSIAN_MONTHS, getCurrentJalaliMonth } from "../../../utils/jalali";

const DailyCopyPrescription = () => {
  /* ===================== STATE ===================== */
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientDropdownVisible, setPatientDropdownVisible] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newPrescription, setNewPrescription] = useState({
    doctor_name: "",
    patient_name: "",
    selectedDrugs: [],
    copy: "",
  });

  const [patientSearch, setPatientSearch] = useState("");
  const [drugSearch, setDrugSearch] = useState("");

  // New patient state - matching the Patient model fields
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: "",
  });
  const [addingPatient, setAddingPatient] = useState(false);
  const [categories, setCategories] = useState([]);

  /* ===================== FETCH ===================== */
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/employee/employees/", {
        params: { role: 1 },
      });
      setDoctors(res.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      showErrorToast("بارگذاری پزشکان موفق نبود");
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/core/patients/");
      setPatients(res.data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showErrorToast("بارگذاری بیماران موفق نبود");
    }
  }, []);

  const fetchDrugs = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/core/stocks/");
      setAllDrugs(res.data || []);
    } catch (error) {
      console.error("Error fetching drugs:", error);
      showErrorToast("بارگذاری داروها موفق نبود");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      // FIXED: Changed from "/core/categories/" to "/core/category-types/"
      const res = await axiosInstance.get("/core/category-types/");
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchPrescriptions = useCallback(async (month) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/core/pharmaceuticals/", {
        params: { jalali_month: month },
      });
      setPrescriptions(res.data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      showErrorToast("بارگذاری نسخه‌ها موفق نبود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchDrugs();
    fetchCategories();
    fetchPrescriptions(selectedMonth);
  }, [selectedMonth, fetchDoctors, fetchPatients, fetchDrugs, fetchCategories, fetchPrescriptions]);

  /* ===================== HELPERS ===================== */
  const getDoctorName = (id) => {
    if (!id) return "—";
    const d = doctors.find((doc) => doc.id === parseInt(id));
    return d ? `${d.first_name} ${d.last_name}` : "—";
  };

  const getPatientName = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.name : "—";
  };

  const calculateTotalPrice = () =>
    newPrescription.selectedDrugs.reduce(
      (sum, d) => sum + Number(d.amount) * Number(d.total_price),
      0,
    );

  /* ===================== PATIENT HANDLERS ===================== */
  const handleAddNewPatient = async () => {
    if (!newPatient.name.trim()) {
      showWarningToast("لطفاً نام بیمار را وارد کنید");
      return;
    }

    setAddingPatient(true);
    try {
      const payload = {
        name: newPatient.name,
        age: newPatient.age ? parseInt(newPatient.age) : null,
        patient_type: newPatient.patient_type || "",
      };
      
      if (newPatient.category && newPatient.category !== "") {
        payload.category = parseInt(newPatient.category);
      }
      
      console.log("Sending patient payload:", payload);
      
      const response = await axiosInstance.post("/core/patients/", payload);
      showSuccessToast("بیمار با موفقیت اضافه شد");
      
      await fetchPatients();
      
      setNewPrescription((prev) => ({
        ...prev,
        patient_name: response.data.id,
      }));
      setPatientSearch(newPatient.name);
      setShowNewPatientModal(false);
      setPatientDropdownVisible(false);
      
      setNewPatient({
        name: "",
        age: "",
        patient_type: "",
        category: "",
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.category?.[0] || 
                          error.response?.data?.message || 
                          "افزودن بیمار موفق نبود";
      showErrorToast(errorMessage);
    } finally {
      setAddingPatient(false);
    }
  };

  /* ===================== DRUG HANDLERS ===================== */
  const handleAddDrug = (drug) => {
    setNewPrescription((prev) => {
      if (prev.selectedDrugs.some((d) => d.drugId === drug.id)) return prev;
      return {
        ...prev,
        selectedDrugs: [
          ...prev.selectedDrugs,
          {
            drugId: drug.id,
            name: drug.name,
            amount: 1,
            stock: drug.amount,
            total_price: drug.total_price,
          },
        ],
      };
    });
    setDrugSearch("");
  };

  const handleDrugAmountChange = (drugId, value) => {
    setNewPrescription((prev) => ({
      ...prev,
      selectedDrugs: prev.selectedDrugs.map((d) =>
        d.drugId === drugId
          ? { ...d, amount: Math.min(Math.max(+value, 1), d.stock) }
          : d,
      ),
    }));
  };

  const handleRemoveDrug = (drugId) => {
    setNewPrescription((prev) => ({
      ...prev,
      selectedDrugs: prev.selectedDrugs.filter((d) => d.drugId !== drugId),
    }));
  };

  /* ===================== SAVE ===================== */
  const handleSavePrescription = async () => {
    if (
      !newPrescription.patient_name ||
      !newPrescription.copy ||
      newPrescription.selectedDrugs.length === 0
    ) {
      showWarningToast("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setSaving(true);

    const payload = {
      patient_name: parseInt(newPrescription.patient_name),
      copy: newPrescription.copy,
      price: calculateTotalPrice(),
      drugs: newPrescription.selectedDrugs.map((d) => ({
        drug_id: d.drugId,
        amount_used: d.amount,
      })),
    };

    if (newPrescription.doctor_name && newPrescription.doctor_name !== "") {
      payload.doctor_name = parseInt(newPrescription.doctor_name);
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/core/pharmaceuticals/${editingId}/`, payload);
        showSuccessToast("نسخه با موفقیت ویرایش شد");
      } else {
        await axiosInstance.post("/core/pharmaceuticals/", payload);
        showSuccessToast("نسخه با موفقیت ثبت شد");
      }
      fetchPrescriptions(selectedMonth);
      closeModal();
    } catch (err) {
      console.error("Save error:", err.response?.data);
      showErrorToast("ثبت نسخه موفق نبود");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prescription) => {
    setEditingId(prescription.id);
    setNewPrescription({
      doctor_name: prescription.doctor_name || "",
      patient_name: prescription.patient_name,
      selectedDrugs: prescription.drugs.map((d) => ({
        drugId: d.drug?.id,
        name: d.drug?.name,
        amount: d.amount_used,
        stock: d.drug?.amount,
        total_price: d.drug?.total_price,
      })),
      copy: prescription.copy,
    });
    setPatientSearch(getPatientName(prescription.patient_name));
    setPatientDropdownVisible(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این نسخه مطمئن هستید؟")) return;
    try {
      await axiosInstance.delete(`/core/pharmaceuticals/${id}/`);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      showSuccessToast("نسخه با موفقیت حذف شد");
    } catch (error) {
      console.error("Delete error:", error);
      showErrorToast("حذف نسخه موفق نبود");
    }
  };

  /* ===================== FILTERS ===================== */
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()),
  );

  const filteredDrugs = allDrugs.filter(
    (d) =>
      d.name.toLowerCase().includes(drugSearch.toLowerCase()) &&
      !newPrescription.selectedDrugs.some((sd) => sd.drugId === d.id),
  );

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewPrescription({
      doctor_name: "",
      patient_name: "",
      selectedDrugs: [],
      copy: "",
    });
    setPatientSearch("");
    setDrugSearch("");
    setPatientDropdownVisible(false);
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + ثبت نسخه
        </button>
        <div className="flex flex-wrap gap-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full border ${
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
        <table className="w-full border text-sm">
          <thead className="bg-green text-white">
            <tr className="text-center">
              <th className="p-2 border">پزشک</th>
              <th className="p-2 border">بیمار</th>
              <th className="p-2 border">داروها</th>
              <th className="p-2 border">قیمت</th>
              <th className="p-2 border">ویزیت بعدی</th>
              <th className="p-2 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : prescriptions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  داده‌ای موجود نیست
                </td>
              </tr>
            ) : (
              prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 text-center">
                  <td className="border p-2">{getDoctorName(p.doctor_name)}</td>
                  <td className="border p-2">
                    {getPatientName(p.patient_name)}
                  </td>
                  <td className="border p-2 text-sm">
                    {p.drugs?.length
                      ? p.drugs
                          .map(
                            (d) =>
                              `${d.drug?.name || "دارو"} (${d.amount_used})`,
                          )
                          .join(", ")
                      : "—"}
                  </td>
                  <td className="border p-2">{p.price}</td>
                  <td className="border p-2">{p.copy}</td>
                  <td className="border p-2 flex justify-center gap-2">
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">
              {editingId ? "ویرایش نسخه" : "ثبت نسخه جدید"}
            </h3>

            {/* Doctor */}
            <select
              className="w-full border p-2 rounded mb-2"
              value={newPrescription.doctor_name}
              onChange={(e) =>
                setNewPrescription((p) => ({
                  ...p,
                  doctor_name: e.target.value,
                }))
              }
            >
              <option value="">انتخاب داکتر (اختیاری)</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.first_name} {d.last_name} — {d.role_display}
                </option>
              ))}
            </select>

            {/* Patient */}
            <input
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setPatientDropdownVisible(true);
              }}
              placeholder="جستجوی بیمار..."
              className="w-full border p-2 rounded mb-2"
              onFocus={() => setPatientDropdownVisible(true)}
            />

            {/* Patient Dropdown */}
            {patientDropdownVisible && patientSearch.trim() !== "" && (
              <div className="border max-h-40 overflow-y-auto mb-2">
                {filteredPatients.length > 0 ? (
                  <>
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setNewPrescription((prev) => ({
                            ...prev,
                            patient_name: p.id,
                          }));
                          setPatientSearch(p.name);
                          setPatientDropdownVisible(false);
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                    <div
                      className="p-2 hover:bg-green-50 cursor-pointer border-t text-green-600"
                      onClick={() => {
                        setPatientDropdownVisible(false);
                        setShowNewPatientModal(true);
                      }}
                    >
                      + افزودن بیمار جدید
                    </div>
                  </>
                ) : (
                  <div
                    className="p-2 hover:bg-green-50 cursor-pointer text-green-600"
                    onClick={() => {
                      setPatientDropdownVisible(false);
                      setShowNewPatientModal(true);
                    }}
                  >
                    + بیمار جدید یافت نشد، کلیک برای افزودن
                  </div>
                )}
              </div>
            )}

            {/* Drugs */}
            <input
              value={drugSearch}
              onChange={(e) => setDrugSearch(e.target.value)}
              placeholder="جستجوی دارو..."
              className="w-full border p-2 rounded mb-2"
            />

            {drugSearch.trim() !== "" &&
              filteredDrugs.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between p-2 hover:bg-gray-100 mb-1"
                >
                  <span>{d.name}</span>
                  <button
                    onClick={() => handleAddDrug(d)}
                    className="bg-green text-white px-2 rounded"
                  >
                    اضافه کردن
                  </button>
                </div>
              ))}

            {newPrescription.selectedDrugs.map((d) => (
              <div key={d.drugId} className="mb-2">
                <div className="flex justify-between">
                  <span>{d.name}</span>
                  <button
                    onClick={() => handleRemoveDrug(d.drugId)}
                    className="text-red-600 text-sm"
                  >
                    حذف
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={d.stock}
                  value={d.amount}
                  onChange={(e) =>
                    handleDrugAmountChange(d.drugId, e.target.value)
                  }
                  className="w-full border p-1 rounded"
                />
              </div>
            ))}

            <div className="font-bold text-right mb-2">
              مجموع: {calculateTotalPrice()} افغانی
            </div>

            <textarea
              className="w-full border p-2 rounded mb-2"
              placeholder="ویزیت بعدی..."
              value={newPrescription.copy}
              onChange={(e) =>
                setNewPrescription((p) => ({ ...p, copy: e.target.value }))
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1 bg-gray-300 rounded"
              >
                انصراف
              </button>
              <button
                onClick={handleSavePrescription}
                disabled={saving}
                className="px-4 py-1 bg-green text-white rounded"
              >
                {editingId ? "بروزرسانی" : "ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-4">افزودن بیمار جدید</h3>
            
            <input
              type="text"
              placeholder="نام بیمار *"
              className="w-full border p-2 rounded mb-2"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            />
            
            <input
              type="number"
              placeholder="سن"
              className="w-full border p-2 rounded mb-2"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
            />
            
            <input
              type="text"
              placeholder="نوع بیمار"
              className="w-full border p-2 rounded mb-2"
              value={newPatient.patient_type}
              onChange={(e) => setNewPatient({ ...newPatient, patient_type: e.target.value })}
            />
            
            <select
              className="w-full border p-2 rounded mb-2"
              value={newPatient.category}
              onChange={(e) => setNewPatient({ ...newPatient, category: e.target.value })}
            >
              <option value="">دسته بندی (اختیاری)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowNewPatientModal(false);
                  setPatientDropdownVisible(true);
                }}
                className="px-4 py-1 bg-gray-300 rounded"
              >
                انصراف
              </button>
              <button
                onClick={handleAddNewPatient}
                disabled={addingPatient}
                className="px-4 py-1 bg-green text-white rounded"
              >
                {addingPatient ? "در حال افزودن..." : "افزودن بیمار"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCopyPrescription;