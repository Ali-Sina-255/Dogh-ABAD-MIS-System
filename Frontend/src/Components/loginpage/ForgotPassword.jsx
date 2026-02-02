import axios from "axios";
import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${BASE_URL}/users/user/password-rest-email/${email}`
      );
      console.log(response.data);
      setIsLoading(false);
      alert("Email sent successfully. Please check your inbox.");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-600">
            Let's help you get back into your account
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="johndoe@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Processing{" "}
                  <span className="spinner-border spinner-border-sm"></span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;
