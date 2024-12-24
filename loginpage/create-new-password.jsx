import React, { useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const otp = searchParams.get("otp");
  const uuidb64 = searchParams.get("uuidb64");
  const refresh_token = searchParams.get("refresh_token");

  // Function to properly encode UUID to Base64 and ensure it's padded correctly
  const encodeUUID = (id) => {
    let base64 = btoa(id); // Base64 encode the string (ID)
    // Ensure the base64 string is padded properly
    while (base64.length % 4 !== 0) {
      base64 += "="; // Padding the base64 string
    }
    return base64;
  };

  const userId = "2"; // Example user ID
  const encodedUUID = encodeUUID(userId); // Base64 encode it

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if passwords match
    if (confirmPassword !== password) {
      alert("Passwords do not match");
    } else {
      setIsLoading(true);

      const data = {
        password,
        otp,
        uuidb64: encodedUUID,
        refresh_token,
      };

      // Make the API call to change the password
      axios
        .post("http://localhost:8000/users/user/password-change/", data)
        .then((response) => {
          console.log(response.data);
          alert("Password changed successfully");
          navigate("/login");
        })
        .catch((error) => {
          console.error("Error changing password:", error);
          alert("Error: " + (error.response?.data?.message || error.message));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <section className="flex flex-col min-h-screen pt-24 bg-gray-100">
        <div className="flex items-center justify-center flex-grow py-8">
          <div className="w-full max-w-lg bg-white p-8 shadow-lg rounded-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Create New Password</h1>
              <span className="text-gray-600">
                Choose a new password for your account
              </span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="**************"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="text-sm text-red-600 mt-1 hidden"
                  id="password-error"
                >
                  Please enter a valid password.
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="**************"
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div
                  className="text-sm text-red-600 mt-1 hidden"
                  id="confirm-password-error"
                >
                  Please confirm the password correctly.
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default CreateNewPassword;
