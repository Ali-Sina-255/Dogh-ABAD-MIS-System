import React from "react";

function DailyExpense() {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-black mb-8">
        Daily income Tracker
      </h1>

      {/* Pharmacy Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">درامد از بخش دواخانه</h2>
        <p className="text-gray-700">
          Manage the daily expenses and records of the pharmacy department here.
        </p>
        {/* Add content or a form for pharmacy-related expenses */}
        <div className="mt-4">
          <button className="bg-gradient-to-r from-green-500 to-teal-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l">
            Add Pharmacy Expense
          </button>
        </div>
      </div>

      {/* Laboratory Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">بخش لابراتوار</h2>
        <p className="text-gray-700">
          Record and manage expenses related to laboratory services and
          supplies.
        </p>
        {/* Add content or a form for laboratory expenses */}
        <div className="mt-4">
          <button className="bg-gradient-to-r from-blue-500 to-indigo-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l">
            Add Laboratory Expense
          </button>
        </div>
      </div>

      {/* Examinations Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">بخش معاینات</h2>
        <p className="text-gray-700">
          Keep track of daily examination charges and records in this section.
        </p>
        {/* Add content or a form for examination expenses */}
        <div className="mt-4">
          <button className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l">
            Add Examination Expense
          </button>
        </div>
      </div>

      {/* Reception Section */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">بخش reception</h2>
        <p className="text-gray-700">
          Manage reception-related expenses, including administrative costs.
        </p>
        {/* Add content or a form for reception expenses */}
        <div className="mt-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l">
            Add Reception Expense
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyExpense;
