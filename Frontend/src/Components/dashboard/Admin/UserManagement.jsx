import React, { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    passwordConfirm: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Define roles array
  const roles = [
    { id: 1, name: "Designer" },
    { id: 2, name: "Reception" },
    { id: 0, name: "Admin" },
  ];

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

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

    fetch("http://localhost:8000/users/api/users/", {
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

  // Toggle the user form visibility
  const toggleFormVisibility = (user = null) => {
    setIsFormVisible((prevVisibility) => !prevVisibility);

    if (user) {
      // If user is passed, set user data in newUser state
      setNewUser({
        id: user.id,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        role: user.role || "",
        password: "",
        passwordConfirm: "",
      });
    } else {
      // If no user is passed, reset form for new user
      setNewUser({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "",
        password: "",
        passwordConfirm: "",
      });
    }
    setError("");
  };

  // Handle user form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newUser.password !== newUser.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const method = newUser.id ? "PUT" : "POST";
    const url = newUser.id
      ? `http://localhost:8000/users/update/${newUser.id}/`
      : "http://localhost:8000/users/create/";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email,
          phone_number: newUser.phoneNumber,
          role: newUser.role,
          password: newUser.password,
          password_confirm: newUser.passwordConfirm,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error response:", data);
        throw new Error(data.detail || "Error creating/updating user");
      }

      const data = await response.json();
      console.log("User successfully created/updated", data);

      // Fetch updated list of users
      fetchUsers();
      setIsFormVisible(false);

      // Show success alert with smaller modal
      Swal.fire({
        title: "Success!",
        text: `User ${newUser.id ? "updated" : "created"} successfully.`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "w-96", // Adjust the modal width to your desired size
        },
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);

      // Show error alert with smaller modal
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "w-96", // Adjust the modal width to your desired size
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    // Use SweetAlert2 to confirm user deletion
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "w-96", // Adjust modal width if needed
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        fetch(`http://localhost:8000/users/delete/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })
          .then((response) => {
            if (response.ok) {
              setUsers(users.filter((user) => user.id !== id));
              Swal.fire({
                title: "Deleted!",
                text: "User has been deleted successfully.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                  popup: "w-96", // Adjust modal width if needed
                },
              });
            } else {
              throw new Error("Error deleting user");
            }
          })
          .catch((err) => {
            Swal.fire({
              title: "Error!",
              text: err.message,
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                popup: "w-96", // Adjust modal width if needed
              },
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  // Helper function to get the role name from the ID
  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id === parseInt(roleId));
    return role ? role.name : "Unknown";
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
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-lg mx-auto"
        >
          <h2 className="text-2xl font-semibold text-center mb-4">
            {newUser.id ? "Edit User" : "Add New User"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
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
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Last Name */}
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
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Email */}
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
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Role */}
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
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
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
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Confirm Password */}
            <div className="sm:col-span-2">
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={newUser.passwordConfirm}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="px-4 py-2 bg-gray-300 text-black rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Saving..." : newUser.id ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      )}

      {/* Users List */}
      <div className="my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Users List</h2>

        {loading ? (
          <div className="text-center text-lg text-gray-600 font-bold">
            Loading...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg font-bold">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    First Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    Last Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    Phone
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    Role
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <td className="py-3 px-4 border-b font-bold">
                      {user.first_name}
                    </td>
                    <td className="py-3 px-4 border-b font-bold">
                      {user.last_name}
                    </td>
                    <td className="py-3 px-4 border-b font-bold">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 border-b font-bold">
                      {user.phone_number}
                    </td>
                    <td className="py-3 px-4 border-b font-bold">
                      {getRoleName(user.role)}
                    </td>
                    <td className="py-3 px-4 border-b space-x-2">
                      <button
                        onClick={() => toggleFormVisibility(user)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200 ease-in-out font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 ease-in-out font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
