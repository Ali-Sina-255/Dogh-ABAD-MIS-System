import axios from "axios";
import React, { useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
function LoginPage() {
  const [decodedToken, setDecodedToken] = useState({});
  const navigate = useNavigate();

  const initialState = {
    emailValue: "",
    passwordValue: "",
    sendRequest: 0,
    token: "",
    error: null,
    currentUser: false,
  };

  function reducerFunction(draft, action) {
    switch (action.type) {
      case "catchUserEmailChange":
        draft.emailValue = action.emailChosen;
        break;
      case "catchUserPassword":
        draft.passwordValue = action.passwordChosen;
        break;
      case "catchSendRequest":
        draft.sendRequest += 1;
        break;
      case "catchToken":
        draft.token = action.tokenValue;
        break;
      case "login":
        draft.currentUser = true;
        break;
      case "setError":
        draft.error = action.errorMessage;
        break;
      default:
        return draft;
    }
  }

  const [state, dispatch] = useImmerReducer(reducerFunction, initialState);

  useEffect(() => {
    const existingToken = localStorage.getItem("auth_token");
    if (existingToken) {
      dispatch({
        type: "catchToken",
        tokenValue: existingToken,
      });
      dispatch({
        type: "login",
      });
      navigate("/dashboard"); // Redirect to dashboard if already logged in
    }
  }, [navigate]);

  const handleLoginForm = (e) => {
    e.preventDefault();
    dispatch({ type: "catchSendRequest" });
  };

  useEffect(() => {
    if (state.sendRequest > 0 && !state.token) {
      const source = axios.CancelToken.source();

      async function signIn() {
        try {
          const response = await axios.post(
            "http://localhost:8000/users/user/token/",
            {
              email: state.emailValue,
              password: state.passwordValue,
            },
            { cancelToken: source.token }
          );

          const { access, refresh } = response.data;
          if (access && refresh) {
            // Decode the access token to get user data (role, is_admin, etc.)
            const decodToken = jwt_decode(access);

            // Store user data from the decoded access token
            localStorage.setItem("username", decodToken.first_name);
            localStorage.setItem("role", decodToken.role); // assuming `role` is in the token
            localStorage.setItem("email", decodToken.email);
            localStorage.setItem("id", decodToken.user_id);
            // Store the tokens in localStorage
            localStorage.setItem("auth_token", access); // Store access token

            // Store the token in state and set the user as logged in
            // dispatch({
            //   type: "catchToken",
            //   tokenValue: access,
            // });
            // dispatch({
            //   type: "login",
            // });

            // Redirect to the dashboard after successful login
            navigate("/dashboard");
          } else {
            dispatch({
              type: "setError",
              errorMessage: "Authentication failed. Please try again.",
            });
            navigate("login");
          }
        } catch (error) {
          if (error.response) {
            dispatch({
              type: "setError",
              errorMessage: error.response.data.non_field_errors
                ? error.response.data.non_field_errors[0]
                : "An unexpected error occurred.",
            });
          } else {
            dispatch({
              type: "setError",
              errorMessage: "An error occurred while trying to login.",
            });
          }
        }
      }

      signIn();

      return () => {
        source.cancel();
      };
    }
  }, [state.sendRequest, state.emailValue, state.passwordValue, state.token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          ورود به حساب کاربری
        </h2>
        {state.error && (
          <p className="text-red-500 text-center mb-4">{state.error}</p>
        )}
        {state.currentUser && (
          <p className="text-green-500 text-center mb-4">You are logged in!</p>
        )}
        <form onSubmit={handleLoginForm} className="space-y-4">
          <div>
            <label className="block text-right text-gray-600 mb-1">
              ایمیل:
            </label>
            <input
              type="email"
              value={state.emailValue}
              onChange={(e) =>
                dispatch({
                  type: "catchUserEmailChange",
                  emailChosen: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-right text-gray-600 mb-1">
              رمز عبور:
            </label>
            <input
              type="password"
              value={state.passwordValue}
              onChange={(e) =>
                dispatch({
                  type: "catchUserPassword",
                  passwordChosen: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            ورود
          </button>
          <div>
            <Link to="/forgot-password/">Forgot your password ?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
