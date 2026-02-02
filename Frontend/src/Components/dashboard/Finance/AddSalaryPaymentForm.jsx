import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../messages/Toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddSalaryPaymentForm = ({ onPaymentAdded }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("auth_token");
  axios.defaults.headers.common["Authorization"] = `Token ${token}`;

  // ---------------- Fetch Payrolls ----------------
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/payment/payrolls/`);
        setPayrolls(res.data);
      } catch (err) {
        console.error(err);
        showErrorToast("Failed to fetch payrolls.");
      }
    };
    fetchPayrolls();
  }, []);

  // ---------------- Handle Form Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayroll || !amountPaid) {
      return showErrorToast("Please select payroll and enter amount.");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/payment/salary-payments/`, {
        payroll: selectedPayroll,
        amount_paid: parseFloat(amountPaid),
        note,
      });
      showSuccessToast("Payment added successfully!");
      setSelectedPayroll("");
      setAmountPaid("");
      setNote("");
      onPaymentAdded(res.data); // update parent
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to add payment.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-md p-4 mb-6">
      <h3 className="font-bold mb-4 text-lg">Add Salary Payment</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          value={selectedPayroll}
          onChange={(e) => setSelectedPayroll(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Payroll</option>
          {payrolls.map((p) => (
            <option key={p.id} value={p.id}>
              {p.employee_name} — {p.month}/{p.year} — Remaining:{" "}
              {p.remaining_amount}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount Paid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Payment"}
        </button>
      </form>
    </div>
  );
};

export default AddSalaryPaymentForm;
