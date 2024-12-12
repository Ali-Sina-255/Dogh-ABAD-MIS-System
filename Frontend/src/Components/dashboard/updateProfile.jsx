import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProfile = ({ setUserData }) => {
  const [userData, setLocalUserData] = useState(null); // Store user data locally
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true); // Manage modal visibility
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("http://localhost:8000/users/profiles/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLocalUserData(data);
          setEmail(data.user_email);
          setAddress(data.address);
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        setError("An error occurred while fetching user data.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]); // Handle file selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error state before submitting

    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("address", address);
    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://127.0.0.1:8000/users/profiles/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Error updating profile");
        return; // Exit the function if an error occurred
      }

      const updatedData = await response.json();
      setLocalUserData(updatedData); // Update the local profile data

      // Here is where you call setUserData, ensure it's passed correctly as a function
      if (typeof setUserData === "function") {
        setUserData(updatedData); // Update the parent component's state (Dashboard)
      } else {
        console.error("setUserData is not a function");
      }

      // Update localStorage to persist the updated data
      localStorage.setItem("user_data", JSON.stringify(updatedData));

      // Clear the error and update state after a successful submission
      setError(""); // Clear any previous errors
      closeModal(true); // Close the modal after a successful update
      navigate("/dashboard"); // Navigate to dashboard after update
    } catch (err) {
      setError("An error occurred while updating your profile.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal by updating the state
  };

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (!isModalOpen) {
    return null; // Don't render anything if the modal is closed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 space-y-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Update Profile
        </h2>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block font-medium text-gray-700"
            >
              Address:
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="profilePic"
              className="block font-medium text-gray-700"
            >
              Profile Picture:
            </label>
            <input
              type="file"
              id="profilePic"
              onChange={handleProfilePicChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={closeModal}
            className="mt-4 w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
