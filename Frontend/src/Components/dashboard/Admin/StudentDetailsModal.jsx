import React from "react";
import { getFullJalaliDate } from "../../../utils/jalali";

const StudentDetailsModal = ({
  show,
  onClose,
  student,
  enrollment,
  onPayRemaining,
}) => {
  if (!show || !student || !enrollment) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      dir="ltr"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
        {/* Header */}
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Student Details
        </h3>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-700">
          <div className="font-semibold">Student ID</div>
          <div className="text-gray-800">{student.pk}</div>

          <div className="font-semibold">Card ID</div>
          <div className="text-gray-800 font-medium">
            #{enrollment.card_info?.card_id || "-"}
          </div>

          <div className="font-semibold">Name</div>
          <div className="text-gray-800">{student.name}</div>

          <div className="font-semibold">Father Name</div>
          <div className="text-gray-800">{student.father_name}</div>

          <div className="font-semibold">Phone</div>
          <div className="text-gray-800">{student.phone_number}</div>

          <div className="font-semibold">Discount</div>
          <div
            className={`font-medium ${student.is_discount ? "text-green-600" : "text-gray-500"}`}
          >
            {student.is_discount ? `${student.discount_percent}%` : "No"}
          </div>

          <div className="font-semibold">Course Fee</div>
          <div className="text-gray-800 font-medium">
            {Number(
              enrollment.course_fee || enrollment.total_fee || 0,
            ).toLocaleString("en-US")}{" "}
            AF
          </div>

          <div className="font-semibold">Total Paid</div>
          <div className="text-blue-600 font-semibold">
            {Number(enrollment.paid_amount || 0).toLocaleString("en-US")} AF
          </div>

          <div className="font-semibold">Remaining</div>
          <div className="text-red-600 font-bold">
            {Number(enrollment.remaining_fee || 0).toLocaleString("en-US")} AF
          </div>

          <div className="font-semibold">Created At</div>
          <div className="text-gray-800">{student.created_at}</div>

          <div className="font-semibold">Jalali Month</div>
          <div className="text-gray-800 font-medium">
            {enrollment.jalali_month}
          </div>
        </div>

        {/* Payment History */}
        {enrollment.payment_history?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800">
              Payment History
            </h4>

            <div className="space-y-2">
              {enrollment.payment_history.map((payment, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 border rounded-xl bg-gray-50 shadow-sm hover:bg-gray-100 transition"
                >
                  <div className="font-medium text-gray-800">
                    {payment.name}
                  </div>
                  <div className="text-blue-600 font-semibold text-right">
                    {Number(payment.amount || 0).toLocaleString("en-US")} AF
                  </div>
                  <div className="text-gray-600 font-medium">
                    {payment.jalali_month}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Close
          </button>

          {Number(enrollment.remaining_fee) > 0 && (
            <button
              onClick={() => onPayRemaining(enrollment)}
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            >
              Pay Remaining
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
