import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ListPatients = () => {
  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]); // To store category data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null); // To track the patient being edited
  const [updatedPatient, setUpdatedPatient] = useState({
    name: "",
    age: "",
    patient_type: "",
    category: "", // category ID, not name
  }); // To track the updated patient data

  // Fetch categories data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch patients data from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/patients/"
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Function to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category"; // Fallback if category not found
  };

  // Handle the delete functionality
  const handleDeletePatient = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This patient will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/core/patients/${id}/`
        );
        if (response.status === 200 || response.status === 204) {
          // Successfully deleted, update the UI
          setPatients((prev) => prev.filter((patient) => patient.id !== id));
          Swal.fire("Deleted!", "The patient has been deleted.", "success");
        } else {
          throw new Error("Unexpected response status.");
        }
      } catch (error) {
        console.error("Error deleting patient:", error);
        Swal.fire(
          "Error",
          "Failed to delete the patient. Please try again.",
          "error"
        );
      }
    }
  };

  // Handle the update functionality
  const handleUpdatePatient = async () => {
    // Check if all fields are filled
    if (Object.values(updatedPatient).some((field) => field === "")) {
      Swal.fire("Warning", "Please fill in all fields.", "warning");
      return;
    }

    try {
      console.log("Sending update request for patient:", updatedPatient);

      // Ensure you're sending a JSON request with the correct Content-Type
      const response = await axios.put(
        `http://127.0.0.1:8000/core/patients/${selectedPatient.id}/update/`,
        updatedPatient,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (response.status === 200) {
        const updated = response.data;
        console.log("Patient updated successfully:", updated);

        // Update the state with the updated patient
        setPatients((prev) =>
          prev.map((patient) => (patient.id === updated.id ? updated : patient))
        );

        Swal.fire("Success", "Patient updated successfully.", "success");

        // Reset the state
        setSelectedPatient(null);
        setUpdatedPatient({
          name: "",
          age: "",
          patient_type: "",
          category: "",
        });
      } else {
        throw new Error("Unexpected response status.");
      }
    } catch (error) {
      console.error("Error updating patient:", error);

      // Show more detailed error message
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred.";
      Swal.fire(
        "Error",
        `Failed to update the patient: ${errorMessage}`,
        "error"
      );
    }
  };

  // Loading and error handling states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading patients...</div>
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
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-2">All Patients</h3>

      {/* Table for displaying patients */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l focus:outline-none">
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
                  {getCategoryName(patient.category)} {/* Show category name */}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setUpdatedPatient({
                        name: patient.name,
                        age: patient.age,
                        patient_type: patient.patient_type,
                        category: patient.category, // Store category ID
                      });
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update form for selected patient */}
      {selectedPatient && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-4/5 mx-auto">
          <h2 className="text-2xl font-bold mb-4">Edit Patient</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={updatedPatient.name}
              onChange={(e) =>
                setUpdatedPatient({
                  ...updatedPatient,
                  name: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient's name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={updatedPatient.age}
              onChange={(e) =>
                setUpdatedPatient({
                  ...updatedPatient,
                  age: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient's age"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Patient Type
            </label>
            <input
              type="text"
              name="patient_type"
              value={updatedPatient.patient_type}
              onChange={(e) =>
                setUpdatedPatient({
                  ...updatedPatient,
                  patient_type: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient's type"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Category
            </label>
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
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={handleUpdatePatient}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-md hover:bg-gradient-to-l"
            >
              Update
            </button>
            <button
              onClick={() => setSelectedPatient(null)}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
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
