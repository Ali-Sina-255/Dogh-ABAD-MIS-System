import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const RegisterPatients = () => {
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn("Expected an array, but got:", response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setNewPatient((prev) => ({
      ...prev,
      category: value ? parseInt(value, 10) : null,
    }));
  };

  const handleRegister = async () => {
    if (
      !newPatient.name ||
      !newPatient.age ||
      !newPatient.patient_type ||
      newPatient.category === null
    ) {
      Swal.fire(
        "Warning",
        "Please fill in all fields, including selecting a category.",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/core/patients/",
        newPatient
      );
      Swal.fire("Success", "Patient registered successfully.", "success");
      setNewPatient({ name: "", age: "", patient_type: "", category: null });
      setShowForm(false); // Close form after registration
    } catch (error) {
      console.error("Error registering patient:", error);
      setError("Failed to register patient. Please try again.");
      Swal.fire("Error", "Failed to register patient.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
        Register Patient
      </h2>

      {/* Button to toggle form visibility */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white text-left px-6 py-2 rounded-md hover:bg-gradient-to-l w-full mb-6"
        >
          Add New Patient
        </button>
      )}

      {/* Display error message if any */}
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      {/* Form to register a new patient */}
      {showForm && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={newPatient.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient's name"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={newPatient.age}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient's age"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Patient Type</label>
            <input
              type="text"
              name="patient_type"
              value={newPatient.patient_type}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient type"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Category</label>
            <select
              name="category"
              value={newPatient.category || ""}
              onChange={handleCategoryChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRegister}
            className={`w-full py-2 rounded-md text-white font-semibold hover:bg-gradient-to-l transition duration-150 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-400 to-green-600"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Patient"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPatients;
