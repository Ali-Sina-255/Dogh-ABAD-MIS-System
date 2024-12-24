import React, { useState } from "react";

import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await axios
        .get(`http://localhost:8000/users/user/password-rest-email/${email}`)
        .then((response) => {
          console.log(response.data);

          setIsLoading(false);
          alert("Email sent successfully. Please check your inbox.");
        });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="flex flex-col min-h-screen py-24 bg-gray-100">
        <div className="flex items-center justify-center flex-grow">
          <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Forgot Password
              </h1>
              <p className="text-gray-600">
                Let's help you get back into your account
              </p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  name="email"
                  placeholder="johndoe@gmail.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>
                      Processing <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  ) : (
                    <span>
                      Reset Password <i className="fas fa-arrow-right"></i>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default ForgotPassword;
