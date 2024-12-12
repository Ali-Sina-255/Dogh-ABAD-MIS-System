import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Doctors() {
  const [doctors, setDoctors] = useState([]); // Store fetched data
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  // Fetch doctors data when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/users/api/users/"
        );
        setDoctors(response.data); // Store the data in state
      } catch (error) {
        console.error("Error fetching doctors data:", error);
        setError("Failed to load doctors.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchDoctors();
  }, []); // Empty dependency array to only run this effect on mount

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading doctors...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Doctors List</h2>

      {/* Doctors Table */}
      <div className="mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">First Name</th>
              <th className="px-4 py-2 border-b text-left">Last Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Role</th>{" "}
              {/* Display role name */}
              <th className="px-4 py-2 border-b text-left">Role Display</th>
              <th className="px-4 py-2 border-b text-left">Phone Number</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-4 py-2 border-b">{doctor.first_name}</td>
                <td className="px-4 py-2 border-b">{doctor.last_name}</td>
                <td className="px-4 py-2 border-b">{doctor.email}</td>
                <td className="px-4 py-2 border-b">
                  {doctor.role_display || "N/A"}
                </td>{" "}
                {/* Display role_display */}
                <td className="px-4 py-2 border-b">{doctor.role_display}</td>
                <td className="px-4 py-2 border-b">
                  {doctor.phone_number || "N/A"}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {/* Action buttons (you can add more actions like view/edit/delete) */}
                  <button
                    onClick={() =>
                      Swal.fire(
                        "Info",
                        "View functionality is not implemented yet.",
                        "info"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-150 mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      Swal.fire(
                        "Info",
                        "Edit functionality is not implemented yet.",
                        "info"
                      )
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-150 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      Swal.fire(
                        "Info",
                        "Delete functionality is not implemented yet.",
                        "info"
                      )
                    }
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-150"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Doctors;
