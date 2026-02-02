import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { FiMail } from "react-icons/fi";
import { FaLock, FaUser } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // If token exists, redirect
    const token = localStorage.getItem("auth_token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/users/user/token/`, {
        email,
        password,
      });

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        setError("Login failed: invalid credentials.");
        return;
      }

      // Decode JWT to get user info
      const decoded = jwt_decode(access);

      // --- Store JWT and user info plainly ---
      localStorage.setItem("auth_token", access);
      localStorage.setItem("username", decoded.first_name);
      localStorage.setItem("role", decoded.role);
      localStorage.setItem("email", decoded.email);
      localStorage.setItem("phone_number", decoded.phone_number);
      localStorage.setItem("id", decoded.user_id);
      localStorage.setItem("login_timestamp", new Date().getTime());

      // Redirect to dashboard immediately
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          "Login failed: server error."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden p-6">
        <div className="relative h-32 bg-green flex items-center justify-center rounded-t-lg">
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-full shadow-lg border-4 border-white">
            <FaUser className="text-green" size={50} />
          </div>
        </div>

        <div className="px-4 py-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Login to your account
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                  className="w-full px-4 py-3 text-lg pl-12 border border-gray-300 rounded-lg focus:outline-none "
                  required
                />
                <FiMail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none "
                  required
                />
                <FaLock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center text-sm mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-green hover:bg-green/80 text-white font-semibold rounded-lg transition-all"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-green-500 hover:text-blue-800 transition-all"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
