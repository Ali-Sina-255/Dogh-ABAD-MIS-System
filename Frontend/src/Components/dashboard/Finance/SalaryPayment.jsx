import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../Utilities/Pagination";
import { showErrorToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TeacherSalarySummary = ({ teacherId }) => {
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [error, setError] = useState("");

  // ---------------- Fetch teacher salary summary ----------------
  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/payment/teacher-salary/${teacherId}/salary-summary/`
      );
      setSummary(res.data);
    } catch (err) {
      setError("Failed to fetch salary summary.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [teacherId]);

  if (!summary) return <p className="text-center py-10">Loading...</p>;

  const totalPages = Math.ceil(summary.payrolls.length / postsPerPage);

  const paginatedPayrolls = summary.payrolls.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="bg-gray-200 w-full py-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-4">Salary Summary</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Teacher total paid */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Teacher ID: {summary.teacher_id}
          </h3>
          <p className="text-green font-bold">
            Total Paid: {summary.total_paid}
          </p>
        </div>

        {/* Payrolls */}
        {paginatedPayrolls.map((payroll) => (
          <div
            key={payroll.id}
            className="bg-white p-4 rounded-lg shadow-md mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">
                Payroll ({payroll.jalali_month})
              </h4>
              <p className="font-bold">
                Base Amount: {payroll.base_amount} | Total Paid:{" "}
                {payroll.total_paid}
              </p>
            </div>

            <table className="w-full border border-gray-300 rounded-md">
              <thead>
                <tr className="bg-green text-white text-center">
                  <th className="border px-4 py-2">Paid At</th>
                  <th className="border px-4 py-2">Amount Paid</th>
                  <th className="border px-4 py-2">Note</th>
                  <th className="border px-4 py-2">Jalali Month</th>
                </tr>
              </thead>
              <tbody>
                {payroll.payrolls.length ? (
                  payroll.payrolls.map((payment) => (
                    <tr
                      key={payment.id}
                      className="text-center border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="border px-4 py-2">
                        {new Date(payment.created_at).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">
                        {payment.amount_paid}
                      </td>
                      <td className="border px-4 py-2">
                        {payment.note || "-"}
                      </td>
                      <td className="border px-4 py-2">
                        {payment.jalali_month}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 text-center">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherSalarySummary;
