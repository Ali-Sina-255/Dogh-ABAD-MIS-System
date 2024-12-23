import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const StaffManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [positionData, setPositionData] = useState([]); // New state for positions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStaff, setNewStaff] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: 1, // Default to Doctor
    phone_number: "",
    position: "", // Position is initially empty, not hardcoded
    salary: "",
  });
  const [editing, setEditing] = useState(false); // To track if we are editing a staff member
  const [editingStaffId, setEditingStaffId] = useState(null); // Track the staff ID we are editing
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  // Fetch staff data and position names
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffResponse = await axios.get(
          "http://127.0.0.1:8000/core/staff/"
        );
        setStaffData(staffResponse.data);

        // Fetch available positions
        const positionResponse = await axios.get(
          "http://127.0.0.1:8000/core/category-types/"
        ); // Your API endpoint for positions
        console.log(positionResponse);
        setPositionData(positionResponse.data); // Set positions in state
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  // Handle input changes for adding/editing a staff member
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for adding or updating staff
  const handleAddOrUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        // Update the staff member via PUT request
        response = await axios.put(
          `http://127.0.0.1:8000/core/staff/${editingStaffId}/`, // Use the editing staff ID
          newStaff
        );
        Swal.fire("Updated", "Staff member updated successfully!", "success");
      } else {
        // Add new staff member via POST request
        response = await axios.post(
          "http://127.0.0.1:8000/core/staff/",
          newStaff
        );
        Swal.fire("Added", "New staff added successfully!", "success");
      }

      // Update the staff data in the state
      setStaffData((prev) => {
        if (editing) {
          return prev.map((staff) =>
            staff.id === editingStaffId ? response.data : staff
          );
        } else {
          return [...prev, response.data];
        }
      });

      // Reset the form
      setNewStaff({
        first_name: "",
        last_name: "",
        email: "",
        role: 1,
        phone_number: "",
        position: "",
        salary: "",
      });
      setEditing(false); // Reset the editing state
      setEditingStaffId(null); // Reset the editing staff ID
      setShowForm(false); // Hide the form after submission
    } catch (error) {
      Swal.fire("Error", "Failed to add/update staff", "error");
    }
  };

  // Handle the Edit button click
  const handleEdit = (staffId) => {
    // Find the staff to be edited
    const staffToEdit = staffData.find((staff) => staff.id === staffId);

    // Pre-fill the form with the staff data
    setNewStaff({
      first_name: staffToEdit.first_name,
      last_name: staffToEdit.last_name,
      email: staffToEdit.email,
      role: staffToEdit.role,
      phone_number: staffToEdit.phone_number,
      position: staffToEdit.position.id, // Assuming position is an object, get the ID
      salary: staffToEdit.salary,
    });
    setEditing(true); // Set the editing flag to true
    setEditingStaffId(staffId); // Store the staff ID for PUT request
    setShowForm(true); // Show the form for editing
  };

  // Handle the Delete button click
  const handleDelete = async (staffId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/core/staff/${staffId}/`);
          setStaffData((prev) => prev.filter((staff) => staff.id !== staffId));
          Swal.fire(
            "Deleted!",
            "The staff member has been deleted.",
            "success"
          );
        } catch (error) {
          Swal.fire("Error", "Failed to delete staff member", "error");
        }
      }
    });
  };

  if (loading) {
    return <div>Loading staff data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-black mb-6">
        Staff Management
      </h1>

      {/* Button to toggle the form visibility */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l w-full mb-6"
        >
          Add New Staff
        </button>
      )}

      {/* Add/Edit Staff Form */}
      {showForm && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editing ? "Edit Staff" : "Add New Staff"}
          </h2>
          <form onSubmit={handleAddOrUpdateStaff} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={newStaff.first_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={newStaff.last_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={newStaff.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={newStaff.phone_number}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Role</label>
              <select
                name="role"
                value={newStaff.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value={1}>Doctor</option>
                <option value={2}>Reception</option>
                <option value={0}>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Position</label>
              <select
                name="position"
                value={newStaff.position}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              >
                {positionData.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Salary</label>
              <input
                type="number"
                name="salary"
                value={newStaff.salary}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-6 py-2 rounded-md hover:bg-gradient-to-l w-full"
            >
              {editing ? "Update Staff" : "Add Staff"}
            </button>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Role</th>
              <th className="px-4 py-2 border-b text-left">Phone Number</th>
              <th className="px-4 py-2 border-b text-left">Position</th>
              <th className="px-4 py-2 border-b text-left">Salary</th>
              <th className="px-4 py-2 border-b text-left">Start Date</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffData.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  {staff.first_name} {staff.last_name}
                </td>
                <td className="px-4 py-2 border-b">{staff.email}</td>
                <td className="px-4 py-2 border-b">
                  {staff.role === 1
                    ? "Doctor"
                    : staff.role === 2
                    ? "Reception"
                    : "Other"}
                </td>
                <td className="px-4 py-2 border-b">{staff.phone_number}</td>
                <td className="px-4 py-2 border-b">
                  {/* Directly use the position_name */}
                  {staff.position_name}
                </td>
                <td className="px-4 py-2 border-b">${staff.salary}</td>
                <td className="px-4 py-2 border-b">
                  {new Date(staff.stared_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b space-x-2">
                  <button
                    onClick={() => handleEdit(staff.id)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-md hover:bg-gradient-to-l"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-1 rounded-md hover:bg-gradient-to-l"
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
};

export default StaffManagement;
