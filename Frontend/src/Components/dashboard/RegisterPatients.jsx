import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../Toast";

const RegisterPatients = () => {
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        showErrorToast("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    setNewPatient((prev) => ({
      ...prev,
      category: e.target.value ? parseInt(e.target.value, 10) : null,
    }));
  };

  const handleRegister = async () => {
    const { name, age, patient_type, category } = newPatient;
    if (!name || !age || !patient_type || category === null) {
      showWarningToast("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/core/patients/", newPatient);
      showSuccessToast("Patient registered successfully.");
      setNewPatient({ name: "", age: "", patient_type: "", category: null });
      setShowForm(false);
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to register patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
        Register Patient
      </h2>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-md hover:bg-gradient-to-l"
        >
          Add New Patient
        </button>
      )}

      {showForm && (
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={newPatient.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="age"
            value={newPatient.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="patient_type"
            value={newPatient.patient_type}
            onChange={handleChange}
            placeholder="Patient Type"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="category"
            value={newPatient.category || ""}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-semibold transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-400 to-green-600 hover:bg-gradient-to-l"
            }`}
          >
            {loading ? "Registering..." : "Register Patient"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPatients;
