import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";

const PayRemainingModal = ({
  show,
  onClose,
  enrollment,
  refreshEnrollments,
}) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const remainingFee = enrollment
    ? parseFloat(enrollment.remaining_fee || 0)
    : 0;

  useEffect(() => {
    if (enrollment) {
      setAmount(remainingFee);
    }
  }, [enrollment, remainingFee]);

  if (!show || !enrollment) return null;

  const handlePay = async () => {
    const payValue = parseFloat(amount || 0);
    if (payValue <= 0 || payValue > remainingFee) {
      return showErrorToast(
        `Amount must be > 0 and ≤ ${remainingFee.toFixed(2)}`
      );
    }

    setLoading(true);
    try {
      await axiosInstance.patch(`/courses/enrollments/${enrollment.id}/`, {
        paid_amount: parseFloat(enrollment.paid_amount) + payValue,
      });
      showSuccessToast("Payment successful");
      refreshEnrollments();
      onClose();
    } catch (err) {
      console.error(err);
      showErrorToast("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rtl">
      <div className="bg-white rounded p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4 text-center">
          Pay Remaining Fee
        </h3>

        <div className="mb-3">
          <div className="mb-1">Total Remaining:</div>
          <input
            type="number"
            disabled
            value={remainingFee.toFixed(2)}
            className="border p-2 w-full bg-gray-100"
          />
        </div>

        <div className="mb-3">
          <div className="mb-1">Pay Amount:</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="px-4 py-1 bg-green text-white rounded"
          >
            {loading ? "Processing..." : "Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayRemainingModal;
