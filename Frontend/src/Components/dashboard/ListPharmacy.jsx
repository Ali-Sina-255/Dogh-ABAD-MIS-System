import React, { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast, showWarningToast } from "../Toast";

const ListPatients = () => {
  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [updatedPatient, setUpdatedPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: "",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showErrorToast("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/patients/"
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        showErrorToast("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("This patient will be deleted permanently. Proceed?"))
      return;

    try {
      await axios.delete(`http://127.0.0.1:8000/core/patients/${id}/`);
      setPatients((prev) => prev.filter((patient) => patient.id !== id));
      showSuccessToast("The patient has been deleted.");
    } catch (error) {
      console.error("Error deleting patient:", error);
      showErrorToast("Failed to delete the patient. Please try again.");
    }
  };

  const handleUpdatePatient = async () => {
    if (Object.values(updatedPatient).some((field) => field === "")) {
      showWarningToast("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/core/patients/${selectedPatient.id}/update/`,
        updatedPatient
      );

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === response.data.id ? response.data : patient
        )
      );
      showSuccessToast("Patient updated successfully.");
      setSelectedPatient(null);
      setUpdatedPatient({ name: "", age: "", patient_type: "", category: "" });
    } catch (error) {
      console.error("Error updating patient:", error);
      showErrorToast("Failed to update the patient.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-1 text-xl font-semibold">
        Loading patients...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center flex-1 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full overflow-auto mt-6">
      <h3 className="text-xl font-bold mb-2">All Patients</h3>

      {/* Table */}
      <div className="overflow-x-auto w-full max-w-4xl">
        <table className="min-w-full table-auto border-collapse mx-auto">
          <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            <tr>
              {["ID", "Name", "Age", "Patient Type", "Category", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-2 border-b text-left text-sm font-semibold"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{patient.id}</td>
                <td className="px-4 py-2 border-b">{patient.name}</td>
                <td className="px-4 py-2 border-b">{patient.age}</td>
                <td className="px-4 py-2 border-b">{patient.patient_type}</td>
                <td className="px-4 py-2 border-b">
                  {getCategoryName(patient.category)}
                </td>
                <td className="px-4 py-2 border-b text-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setUpdatedPatient({
                        name: patient.name,
                        age: patient.age,
                        patient_type: patient.patient_type,
                        category: patient.category,
                      });
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {selectedPatient && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Patient</h2>

          {["name", "age", "patient_type", "category"].map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 capitalize">
                {field.replace("_", " ")}
              </label>
              {field === "category" ? (
                <select
                  name="category"
                  value={updatedPatient.category}
                  onChange={(e) =>
                    setUpdatedPatient({
                      ...updatedPatient,
                      category: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field === "age" ? "number" : "text"}
                  name={field}
                  value={updatedPatient[field]}
                  onChange={(e) =>
                    setUpdatedPatient({
                      ...updatedPatient,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter patient's ${field.replace("_", " ")}`}
                />
              )}
            </div>
          ))}

          <div className="flex space-x-4">
            <button
              onClick={handleUpdatePatient}
              className="flex-1 bg-blue-500 hover:bg-teal-400 text-white py-3 rounded-md"
            >
              Update
            </button>
            <button
              onClick={() => setSelectedPatient(null)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;
