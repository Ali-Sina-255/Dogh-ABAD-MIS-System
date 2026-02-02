import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";

/* ================= CONSTANTS ================= */

const jalaliMonths = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

/* ================= COMPONENT ================= */

const EnrollmentPaymentManager = () => {
  const currentYear = new Date().getFullYear();

  /* ===== FILTERS ===== */
  const [year, setYear] = useState(currentYear);
  const [jalaliMonth, setJalaliMonth] = useState("جدی");

  /* ===== DASHBOARD ===== */
  const [dashboard, setDashboard] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== PAYMENT ===== */
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  /* ===== ENROLLMENT ===== */
  const [activeClassId, setActiveClassId] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [courseFee, setCourseFee] = useState("");
  const [studentExists, setStudentExists] = useState(false);

  /* ================= FETCH DASHBOARD ================= */

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/courses/monthly-dashboard/?year=${year}&jalali_month=${encodeURIComponent(
          jalaliMonth
        )}`
      );
      setDashboard(data);
    } catch {
      showErrorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [year, jalaliMonth]);

  /* ================= CHECK STUDENT ================= */

  useEffect(() => {
    if (!studentId || !activeClassId) {
      setStudentExists(false);
      return;
    }

    const checkStudent = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/courses/check-student/?student_id=${studentId}&class_id=${activeClassId}`
        );
        setStudentExists(data.exists);
        if (data.exists) {
          setStudentName(data.name);
          setFatherName(data.father_name);
        }
      } catch {
        setStudentExists(false);
      }
    };

    checkStudent();
  }, [studentId, activeClassId]);

  /* ================= PAYMENT ================= */

  const handlePaySubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/courses/enrollment-payments/", {
        enrollment: selectedEnrollment.id,
        amount: Number(amount),
        note,
        jalali_month: jalaliMonth,
      });

      showSuccessToast("Payment saved");
      fetchDashboard();
      setSelectedEnrollment(null);
      setAmount("");
      setNote("");
    } catch (error) {
      showErrorToast(
        error.response?.data?.detail ||
          error.response?.data?.amount ||
          "Payment failed"
      );
    }
  };

  /* ================= ENROLL ================= */

  const handleEnroll = async () => {
    if (!studentId || !studentName || !fatherName || !courseFee) {
      return showErrorToast("Please fill all fields");
    }

    try {
      await axiosInstance.post("/courses/enrollments/", {
        student: studentId,
        name: studentName,
        father_name: fatherName,
        student_class: activeClassId,
        course_fee: Number(courseFee),
        jalali_month: jalaliMonth,
      });

      showSuccessToast("Student enrolled successfully");
      fetchDashboard();
      resetEnrollState();
    } catch (error) {
      const message = error.response?.data
        ? Object.values(error.response.data).flat().join(" | ")
        : "Enrollment failed";
      showErrorToast(message);
    }
  };

  const resetEnrollState = () => {
    setActiveClassId(null);
    setStudentId("");
    setStudentName("");
    setFatherName("");
    setCourseFee("");
    setStudentExists(false);
  };

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  /* ================= GROUP BY CLASS ================= */

  const classes = dashboard.reduce((acc, item) => {
    acc[item.class_name] = acc[item.class_name] || [];
    acc[item.class_name].push(item);
    return acc;
  }, {});

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monthly Class Dashboard</h1>
        <div className="flex gap-3">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="border rounded p-2"
          />
          <select
            value={jalaliMonth}
            onChange={(e) => setJalaliMonth(e.target.value)}
            className="border rounded p-2"
          >
            {jalaliMonths.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CLASSES */}
      {Object.entries(classes).map(([className, students]) => (
        <div key={className} className="bg-white rounded shadow p-4">
          <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold">{className}</h2>
            <button
              type="button"
              onClick={() =>
                setActiveClassId(
                  students[0].student_class || students[0].student_class_id
                )
              }
              className="bg-green text-white px-4 py-1 rounded"
            >
              + Enroll Student
            </button>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Father</th>
                <th className="p-2">Fee</th>
                <th className="p-2">Paid</th>
                <th className="p-2">Remaining</th>
                <th className="p-2">Month</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.father_name}</td>
                  <td className="p-2">{s.course_fee}</td>
                  <td className="p-2">{s.paid_amount}</td>
                  <td className="p-2">{s.remaining_fee}</td>
                  <td className="p-2">{s.jalali_month}</td>
                  <td className="p-2">
                    {s.remaining_fee > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEnrollment(s);
                          setAmount(s.remaining_fee);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* PAYMENT MODAL */}
      {selectedEnrollment && (
        <form
          onSubmit={handlePaySubmit}
          className="fixed bottom-4 right-4 bg-white p-4 shadow rounded w-80"
        >
          <h3 className="font-bold mb-2">Add Payment</h3>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="border p-2 w-full mb-2"
          />
          <button className="bg-green text-white w-full py-1 rounded">
            Save Payment
          </button>
        </form>
      )}

      {/* ENROLL MODAL */}
      {activeClassId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold mb-2">Enroll Student</h3>

            <input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Father Name"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Course Fee"
              value={courseFee}
              onChange={(e) => setCourseFee(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <div className="flex justify-between">
              <button type="button" onClick={resetEnrollState}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnroll}
                className="bg-green text-white px-4 py-1 rounded"
              >
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentPaymentManager;
