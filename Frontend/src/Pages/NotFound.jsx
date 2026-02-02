import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // Redirect to home page after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // Redirects to home page
    }, 5000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-white to-gray-200 text-slate-900 px-6">
      {/* تصویر */}
      <img
        src="notfound.png" // جایگزین با تصویر دلخواه شما
        alt="404 Not Found"
        className="w-64 md:w-96 mb-6 animate-pulse"
      />

      {/* متن */}
      <h1 className="text-6xl font-extrabold mb-4">۴۰۴</h1>
      <p className="text-2xl font-semibold mb-4">
        اوه! صفحه مورد نظر یافت نشد.
      </p>
      <p className="text-lg mb-4 text-slate-900">
        متأسفیم، اما صفحه‌ای که به دنبال آن هستید وجود ندارد.
      </p>

      {/* پیام هدایت */}
      <p className="text-sm text-slate-900 mb-6">
        در حال هدایت به صفحه اصلی در ۵ ثانیه...
      </p>

      {/* دکمه بازگشت به خانه */}
      <button
        onClick={() => navigate("/")}
        className="bg-green text-white px-6 py-3 rounded-lg text-lg transition duration-300 shadow-md"
      >
        بازگشت به صفحه اصلی
      </button>
    </div>
  );
};

export default NotFound;
