import React, { useState } from "react";

function SalaryManagement() {
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    position: "",
    mainSalary: "",
    overtime: "",
    advancePayment: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-black mb-8">
        مدیریت معاشات داکتر
      </h1>

      {/* Doctor Details Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">جزئیات داکتر</h2>
        <p className="text-gray-700">
          وارد کردن جزئیات داکتر و مشخصات مربوط به حقوق و مزایای او.
        </p>

        {/* Input fields for doctor details */}
        <div className="mt-4">
          <label className="block mb-2 text-gray-700">نام داکتر</label>
          <input
            type="text"
            name="name"
            value={doctorDetails.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4"
            placeholder="نام داکتر را وارد کنید"
          />

          <label className="block mb-2 text-gray-700">سمت داکتر</label>
          <input
            type="text"
            name="position"
            value={doctorDetails.position}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4"
            placeholder="سمت داکتر را وارد کنید"
          />
        </div>
      </div>

      {/* Salary Details Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">جزئیات حقوق</h2>
        <p className="text-gray-700">
          وارد کردن جزئیات مربوط به معاشات اصلی، اضافه کاری و پیش پرداخت داکتر.
        </p>

        {/* Salary input fields */}
        <div className="mt-4">
          <label className="block mb-2 text-gray-700">معاشات اصلی</label>
          <input
            type="number"
            name="mainSalary"
            value={doctorDetails.mainSalary}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4"
            placeholder="مقدار معاشات اصلی را وارد کنید"
          />

          <label className="block mb-2 text-gray-700">اضافی کاری</label>
          <input
            type="number"
            name="overtime"
            value={doctorDetails.overtime}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4"
            placeholder="مقدار اضافی کاری را وارد کنید"
          />

          <label className="block mb-2 text-gray-700">پیش پرداخت</label>
          <input
            type="number"
            name="advancePayment"
            value={doctorDetails.advancePayment}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4"
            placeholder="مقدار پیش پرداخت را وارد کنید"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-green-500 to-teal-400 text-white px-6 py-3 rounded-md hover:bg-gradient-to-l">
          ثبت اطلاعات
        </button>
      </div>
    </div>
  );
}

export default SalaryManagement;
