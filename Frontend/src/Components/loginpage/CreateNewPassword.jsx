import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const otp = searchParams.get("otp");
  const uuidb64 = searchParams.get("uuidb64");
  const refresh_token = searchParams.get("refresh_token");

  const encodeUUID = (id) => {
    let base64 = btoa(id);
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    return base64;
  };

  const userId = uuidb64;
  const encodedUUID = encodeUUID(userId);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      await axios
        .post(`${BASE_URL}/users/user/password-change/`, data)
        .then((response) => {
          alert("Password changed successfully");
          navigate("/login");
        })
        .catch((error) => {
          alert("Error: " + (error.response?.data?.message || error.message));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Create New Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Choose a new password for your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Enter New Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="**************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="**************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-md shadow-md text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNewPassword;
