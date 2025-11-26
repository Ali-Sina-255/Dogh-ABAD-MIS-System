import { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../Toast";

function DailyCopyPrescription() {
  const [newPrescription, setNewPrescription] = useState({
    doctor_name: "",
    patient_name: "",
    selectedDrugs: [],
    copy: "",
  });

  const [drugSearch, setDrugSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [allDrugs, setAllDrugs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load token from storage
  const token = localStorage.getItem("auth_token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchDrugs();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/users/api/users/?role=doctor",
        axiosConfig
      );
      setDoctors(res.data);
    } catch {
      showErrorToast("Failed to load doctors.");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/core/patients/",
        axiosConfig
      );
      setPatients(res.data);
    } catch {
      showErrorToast("Failed to load patients.");
    }
  };

  const fetchDrugs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/core/stocks/",
        axiosConfig
      );
      setAllDrugs(res.data);
    } catch {
      showErrorToast("Failed to load drugs.");
    }
  };

  const filteredDrugs = allDrugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(drugSearch.toLowerCase()) &&
      !newPrescription.selectedDrugs.some((d) => d.drugId === drug.id)
  );

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleAddDrug = (drug) => {
    setNewPrescription((prev) => ({
      ...prev,
      selectedDrugs: [
        ...prev.selectedDrugs,
        {
          drugId: drug.id,
          name: drug.name,
          amount: 1,
          stock: drug.amount,
          total_price: drug.total_price, // needed for auto price calc
        },
      ],
    }));
    setDrugSearch("");
  };

  const handleDrugAmountChange = (drugId, value) => {
    setNewPrescription((prev) => ({
      ...prev,
      selectedDrugs: prev.selectedDrugs.map((d) =>
        d.drugId === drugId
          ? { ...d, amount: Math.min(Math.max(Number(value), 1), d.stock) }
          : d
      ),
    }));
  };

  const handleRemoveDrug = (drugId) => {
    setNewPrescription((prev) => ({
      ...prev,
      selectedDrugs: prev.selectedDrugs.filter((d) => d.drugId !== drugId),
    }));
  };

  // ✅ AUTO PRICE CALCULATION
  const calculateTotalPrice = () => {
    return newPrescription.selectedDrugs.reduce(
      (sum, d) => sum + d.amount * d.total_price,
      0
    );
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();

    if (
      !newPrescription.doctor_name ||
      !newPrescription.patient_name ||
      newPrescription.selectedDrugs.length === 0 ||
      !newPrescription.copy
    ) {
      showWarningToast("Please fill all fields.");
      return;
    }

    const autoPrice = calculateTotalPrice();

    const payload = {
      doctor_name: newPrescription.doctor_name,
      patient_name: newPrescription.patient_name,
      copy: newPrescription.copy,
      price: autoPrice, // ✔ AUTO CALCULATED PRICE
      drugs: newPrescription.selectedDrugs.map((d) => ({
        drug_id: d.drugId,
        amount_used: d.amount,
      })),
    };

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8000/core/pharmaceuticals/",
        payload,
        axiosConfig
      );

      showSuccessToast("Prescription added successfully!");

      // Update stock locally
      setAllDrugs((prev) =>
        prev.map((drug) => {
          const used = payload.drugs.find((d) => d.drug_id === drug.id);
          if (used) return { ...drug, amount: drug.amount - used.amount_used };
          return drug;
        })
      );

      setNewPrescription({
        doctor_name: "",
        patient_name: "",
        selectedDrugs: [],
        copy: "",
      });
      setPatientSearch("");
      setDrugSearch("");
    } catch (err) {
      showErrorToast("Error adding prescription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-6 mb-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📋 Add New Prescription
      </h2>

      <form onSubmit={handleAddPrescription} className="space-y-6">
        {/* Doctor */}
        <div>
          <label className="text-lg font-semibold">Doctor</label>
          <select
            value={newPrescription.doctor_name}
            onChange={(e) =>
              setNewPrescription((prev) => ({
                ...prev,
                doctor_name: e.target.value, // store doctor ID here
              }))
            }
            className="w-full border p-3 rounded text-lg"
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.first_name} {d.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Patient Search */}
        <div>
          <label className="text-lg font-semibold">Search Patient</label>
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full border p-3 rounded text-lg"
          />
          {patientSearch && (
            <div className="border rounded bg-white shadow max-h-40 overflow-y-auto">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setNewPrescription((prev) => ({
                      ...prev,
                      patient_name: p.id,
                    }));
                    setPatientSearch(p.name);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drug Search */}
        <div>
          <label className="text-lg font-semibold">Search Drugs</label>
          <input
            type="text"
            value={drugSearch}
            onChange={(e) => setDrugSearch(e.target.value)}
            className="w-full border p-3 rounded text-lg"
            placeholder="Search drugs..."
          />

          {drugSearch && (
            <div className="border rounded bg-white shadow max-h-40 overflow-y-auto">
              {filteredDrugs.map((drug) => (
                <div
                  key={drug.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100"
                >
                  <span>
                    {drug.name} (Stock: {drug.amount})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddDrug(drug)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Drugs */}
        {newPrescription.selectedDrugs.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Selected Drugs</h3>

            {newPrescription.selectedDrugs.map((d) => (
              <div key={d.drugId} className="mb-3">
                <label className="font-semibold">{d.name}</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="number"
                    min="1"
                    max={d.stock}
                    value={d.amount}
                    onChange={(e) =>
                      handleDrugAmountChange(d.drugId, e.target.value)
                    }
                    className="w-24 border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDrug(d.drugId)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Remove
                  </button>

                  <span className="text-gray-500">
                    Stock: {d.stock} | Price: {d.total_price} × {d.amount}
                  </span>
                </div>
              </div>
            ))}

            {/* AUTO PRICE DISPLAY */}
            <div className="text-right text-xl font-bold mt-4">
              Total Price: {calculateTotalPrice()} AFN
            </div>
          </div>
        )}

        {/* Next Visit */}
        <div>
          <label className="text-lg font-semibold">Next Visit</label>
          <input
            type="text"
            value={newPrescription.copy}
            onChange={(e) =>
              setNewPrescription((prev) => ({ ...prev, copy: e.target.value }))
            }
            className="w-full border p-3 rounded text-lg"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded text-lg font-bold"
        >
          {loading ? "Saving..." : "Add Prescription"}
        </button>
      </form>
    </div>
  );
}

export default DailyCopyPrescription;
