import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    id: null,
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
  });
  const [roleChoices, setRoleChoices] = useState([]); // Initialize roleChoices as an empty array
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles as well
  }, []);

  // Fetch users from the backend
  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Authentication required. Please log in.");
      navigate("/login");
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/users/api/users/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          setError("Authentication expired. Please log in again.");
          navigate("/login");
          setLoading(false);
          return;
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
        setError("");
      })
      .catch((error) => {
        setError("Error fetching users.");
        setLoading(false);
      });
  };

  // Fetch roles from the backend
  const fetchRoles = () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Authentication required. Please log in.");
      navigate("/login");
      return;
    }

    fetch(`${BASE_URL}/users/api/roles/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log data to inspect its structure

        // Ensure roleChoices is an array before using it
        if (Array.isArray(data)) {
          setRoleChoices(data); // If it's already an array, use it
        } else if (data && Array.isArray(data.roles)) {
          setRoleChoices(data.roles); // If roles are inside an object, use data.roles
        } else {
          setRoleChoices([]); // Default to an empty array if no valid data
          setError("Invalid response format for roles.");
        }
      })
      .catch((error) => {
        setError("Error fetching roles.");
      });
  };

  // Toggle the form visibility and reset user data
  const toggleFormVisibility = (user = null) => {
    setIsFormVisible((prevVisibility) => !prevVisibility);
    setNewUser(
      user || {
        id: null,
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "",
      }
    );
    setError("");
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNewUser((prevUser) => ({ ...prevUser, [name]: checked }));
    } else {
      setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  // Handle the form submission to create or edit a user
  const handleAddUser = (e) => {
    e.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (
      !newUser.username ||
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.role
    ) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const formData = {
      username: newUser.username,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      email: newUser.email,
      password: newUser.password,
      phone: newUser.phone,
      role: newUser.role, // Selected role
    };

    const method = newUser.id ? "PUT" : "POST";
    const url = newUser.id
      ? `${BASE_URL}/users/api/users/${newUser.id}/`
      : `${BASE_URL}/users/create/`;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.id) {
          setError("");
          fetchUsers(); // Refresh the user list
          toggleFormVisibility(); // Hide form after submission
          setNewUser({
            id: null,
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            role: "",
          });
        } else {
          setError("Error creating user.");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message || "Error processing request.");
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={toggleFormVisibility}
          className="flex items-center bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          <FaUserPlus className="mr-2" />
          {newUser.id ? "Edit User" : "Add New User"}
        </button>
      </div>
      {/* Conditionally Render the Form */}
      {isFormVisible && (
        <form
          onSubmit={handleAddUser}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <h2 className="text-2xl font-semibold text-center mb-4">
            {newUser.id ? "Edit User" : "Add New User"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select a role</option>
                {Array.isArray(roleChoices) &&
                  roleChoices.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={newUser.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                <p>{error}</p>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 text-white p-3 rounded-md shadow-md hover:bg-blue-600"
              >
                {newUser.id ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </form>
      )}
      // {/* User List Table */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="min-w-full table-auto mt-4">
            <thead>
              <tr>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">First Name</th>
                <th className="px-4 py-2">Last Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.first_name}</td>
                  <td className="px-4 py-2">{user.last_name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleFormVisibility(user)}
                      className="bg-yellow-500 text-white p-2 rounded-md"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      ;
    </div>
  );
};

export default UserManagement;
