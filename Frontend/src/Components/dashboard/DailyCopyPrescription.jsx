import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function DailyCopyPrescription() {
  // State to store the form data for new prescription
  const [newPrescription, setNewPrescription] = useState({
    doctor_name: "",
    patient_name: "",
    copy: "",
    price: "",
  });

  // State for storing list of doctors and patients
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/users/api/users/?role=doctor"
        );
        setDoctors(response.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors.");
      }
    };

    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/core/patients/"
        );
        setPatients(response.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients.");
      }
    };

    fetchDoctors();
    fetchPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPrescription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();

    if (
      !newPrescription.doctor_name ||
      !newPrescription.patient_name ||
      !newPrescription.copy ||
      !newPrescription.price
    ) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    setLoading(true);

    try {
      const prescriptionData = {
        doctor_name: newPrescription.doctor_name,
        patient_name: newPrescription.patient_name,
        copy: newPrescription.copy,
        price: newPrescription.price,
      };

      const response = await axios.post(
        "http://localhost:8000/core/pharmaceuticals/",
        prescriptionData
      );

      Swal.fire("Success", "Prescription added successfully!", "success");

      setNewPrescription({
        doctor_name: "",
        patient_name: "",
        copy: "",
        price: "",
      });
    } catch (err) {
      console.error("Error adding prescription:", err);
      if (err.response) {
        console.error("Backend Error:", err.response.data);
        setError(err.response.data);
        Swal.fire(
          "Error",
          `Failed to add prescription: ${JSON.stringify(err.response.data)}`,
          "error"
        );
      } else {
        setError("An error occurred. Please try again.");
        Swal.fire("Error", "An error occurred. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-blue-600">
          Adding prescription...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Add New Prescription
      </h2>
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700"></h3>
        <form onSubmit={handleAddPrescription} className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Doctor
            </label>
            <select
              name="doctor_name"
              value={newPrescription.doctor_name}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Patient
            </label>
            <select
              name="patient_name"
              value={newPrescription.patient_name}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Copy
            </label>
            <input
              type="text"
              name="copy"
              value={newPrescription.copy}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter prescription copy"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={newPrescription.price}
              onChange={handleInputChange}
              className="block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Adding..." : "Add Prescription"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DailyCopyPrescription;
