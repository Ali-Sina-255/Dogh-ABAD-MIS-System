import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../Toast";

const StaffManagement = () => {
  const [staffData, setStaffData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: 1, // Default to Doctor
    phone_number: "",
    position: "",
    salary: "",
  });
  const [editing, setEditing] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load JWT token from localStorage
  const token = localStorage.getItem("auth_token");

  // Axios config with JWT Authorization
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Fetch staff and positions
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const staffResponse = await axios.get(
        "http://127.0.0.1:8000/core/staff/",
        axiosConfig
      );
      setStaffData(staffResponse.data);

      const positionResponse = await axios.get(
        "http://127.0.0.1:8000/core/category-types/",
        axiosConfig
      );
      setPositionData(positionResponse.data);
    } catch (err) {
      if (err.response?.status === 401) {
        showErrorToast("Unauthorized. Please login again.");
      } else {
        showErrorToast("Failed to fetch staff or positions.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add or update staff
  const handleAddOrUpdateStaff = async (e) => {
    e.preventDefault();

    // Prepare payload with correct types
    const payload = {
      ...newStaff,
      role: parseInt(newStaff.role, 10),
      position: parseInt(newStaff.position, 10),
      salary: parseFloat(newStaff.salary),
    };

    try {
      let response;
      if (editing) {
        response = await axios.put(
          `http://127.0.0.1:8000/core/staff/${editingStaffId}/`,
          payload,
          axiosConfig
        );
        showSuccessToast("Staff updated successfully!");
      } else {
        response = await axios.post(
          "http://127.0.0.1:8000/core/staff/",
          payload,
          axiosConfig
        );
        showSuccessToast("New staff added successfully!");
      }

      setStaffData((prev) =>
        editing
          ? prev.map((s) => (s.id === editingStaffId ? response.data : s))
          : [...prev, response.data]
      );

      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.position?.[0] ||
        "Failed to add/update staff.";
      showErrorToast(message);
    }
  };

  // Fill form for editing
  const handleEdit = (staffId) => {
    const staff = staffData.find((s) => s.id === staffId);
    setNewStaff({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      role: staff.role,
      phone_number: staff.phone_number || "",
      position: staff.position || "",
      salary: staff.salary || "",
    });
    setEditing(true);
    setEditingStaffId(staffId);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setNewStaff({
      first_name: "",
      last_name: "",
      email: "",
      role: 1,
      phone_number: "",
      position: "",
      salary: "",
    });
    setEditing(false);
    setEditingStaffId(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading staff...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Management</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          {editing ? "Edit Staff" : "Add New Staff"}
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleAddOrUpdateStaff}
          className="mb-6 grid gap-3 md:grid-cols-2"
        >
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={newStaff.first_name}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={newStaff.last_name}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newStaff.email}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={newStaff.phone_number}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
          />
          <select
            name="role"
            value={newStaff.role}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
          >
            <option value={1}>Doctor</option>
            <option value={2}>Reception</option>
            <option value={0}>Other</option>
          </select>
          <select
            name="position"
            value={newStaff.position}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select Position</option>
            {positionData.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={newStaff.salary}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded flex-1"
            >
              {editing ? "Update Staff" : "Add Staff"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Staff Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Position</th>
            <th className="border p-2">Salary</th>
          </tr>
        </thead>
        <tbody>
          {staffData.map((s) => (
            <tr key={s.id} className="hover:bg-gray-100">
              <td className="border p-2">{s.first_name + " " + s.last_name}</td>
              <td className="border p-2">{s.email}</td>
              <td className="border p-2">
                {s.role === 1 ? "Doctor" : s.role === 2 ? "Reception" : "Other"}
              </td>
              <td className="border p-2">{s.phone_number}</td>
              <td className="border p-2">{s.position_name}</td>
              <td className="border p-2">{s.salary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffManagement;
