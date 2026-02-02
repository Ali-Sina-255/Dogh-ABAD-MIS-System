import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import { getCurrentJalaliMonth, PERSIAN_MONTHS } from "../../../utils/jalali";
import NewEnrollmentManagement from "../../courses/enrollments/NewEnrollmentManagement";

import PayRemainingModal from "./PayRemainingModal";
import StudentDetailsModal from "./StudentDetailsModal";
// import { useNavigate } from "react-router-dom";
import Bill from "../../Bill_Page/Bill";
const EnrollStudentManagement = () => {
  // const navigate = useNavigate();
  const [printEnrollmentId, setPrintEnrollmentId] = useState(null);

  const [enrollments, setEnrollments] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [payModal, setPayModal] = useState({ show: false, enrollment: null });

  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());
  const [studentSearch, setStudentSearch] = useState("");

  /* =========================
     Fetch Enrollments
  ========================== */
  const fetchEnrollments = async (month = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/courses/enrollments/", {
        params: month ? { jalali_month: month } : {},
      });
      setEnrollments(res.data || []);
      setCurrentPage(1); // Reset page to 1 on new fetch
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Fetch Classes & Books
  ========================== */
  useEffect(() => {
    const fetchClassesAndBooks = async () => {
      try {
        const [classesRes, booksRes] = await Promise.all([
          axiosInstance.get("/courses/student-classes/"),
          axiosInstance.get("/courses/books/"),
        ]);
        setClassesList(classesRes.data || []);
        setBooksList(booksRes.data || []);
      } catch {
        showErrorToast("Failed to fetch classes or books");
      }
    };
    fetchClassesAndBooks();
  }, []);

  /* =========================
     Fetch Enrollments on Month Change
  ========================== */
  useEffect(() => {
    fetchEnrollments(selectedMonth);
  }, [selectedMonth]);

  const openEnrollModal = (enrollment = null) => {
    if (enrollment && enrollment.jalali_month !== selectedMonth) {
      return showErrorToast(
        "You can only edit enrollments for the current month",
      );
    }
    setSelectedEnrollment(enrollment);
    setShowEnrollModal(true);
  };

  const deleteEnrollment = async (id) => {
    if (!window.confirm("Delete this enrollment?")) return;
    try {
      await axiosInstance.delete(`/courses/enrollments/${id}/`);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
      showSuccessToast("Enrollment deleted");
    } catch {
      showErrorToast("Failed to delete enrollment");
    }
  };

  const formatCurrency = (v) => Number(v || 0).toFixed(2);

  /* =========================
     Search filter
  ========================== */
  const filteredEnrollments = enrollments.filter((e) => {
    const search = studentSearch.trim().toLowerCase();
    if (!search) return true;

    const parts = search
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    return parts.every((part) => {
      return (
        e.student_info?.name?.toLowerCase().includes(part) ||
        String(e.student_info?.id || "").includes(part) ||
        e.jalali_month?.toLowerCase().includes(part) ||
        e.card_info?.card_id?.toLowerCase().includes(part)
      );
    });
  });

  /* =========================
     Sort newest first & Pagination
  ========================== */
  const sortedEnrollments = [...filteredEnrollments].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const totalPages = Math.ceil(sortedEnrollments.length / itemsPerPage);
  const paginatedEnrollments = sortedEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 space-y-4 rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => openEnrollModal()}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + Register Student
        </button>

        <div className="flex flex-wrap gap-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full border ${
                selectedMonth === month ? "bg-green text-white" : "bg-white"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by student name or ID..."
        value={studentSearch}
        onChange={(e) => {
          setStudentSearch(e.target.value);
          setCurrentPage(1); // Reset to page 1 on search
        }}
        className="w-full p-2 border rounded"
      />

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white text-center">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Books</th>
              <th className="p-2 border">Paid</th>
              <th className="p-2 border">Remaining</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEnrollments.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No enrollments
                </td>
              </tr>
            ) : (
              paginatedEnrollments.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2 border">{e.id}</td>
                  <td
                    className="p-2 border font-bold cursor-pointer"
                    onClick={() => {
                      if (!e.student_info) return;
                      const studentData = {
                        ...e.student_info,
                        pk: e.student_info.id,
                        created_at: e.student_info.created_at || e.created_at,
                      };
                      const enrollmentData = {
                        id: e.id,
                        total_fee: e.total_fee || e.class_fee || 0,
                        paid_amount: e.paid_amount || 0,
                        remaining_fee: e.remaining_fee || 0,
                        jalali_month: e.jalali_month || "",
                        payment_history: e.payment_history || [],
                        course_fee: e.course_fee || e.total_fee || 0,
                        card_info: e.card_info || null,
                      };
                      setSelectedStudent(studentData);
                      setSelectedEnrollment(enrollmentData);
                      setShowStudentModal(true);
                    }}
                  >
                    {e.student_info?.name}
                  </td>
                  <td className="p-2 border">{e.class_name}</td>
                  <td className="p-2 border">{e.book_display || "-"}</td>
                  <td className="p-2 border">
                    {formatCurrency(e.paid_amount)}
                  </td>
                  <td
                    className={`p-2 border font-bold ${
                      e.remaining_fee > 0 ? "text-red-600" : ""
                    }`}
                  >
                    {formatCurrency(e.remaining_fee)}
                  </td>
                  <td className="p-2 border">{formatCurrency(e.total_fee)}</td>
                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => openEnrollModal(e)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setPrintEnrollmentId(e.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Print
                    </button>

                    <button
                      onClick={() => deleteEnrollment(e.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {printEnrollmentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center pt-10 z-50 print:hidden">
            <div className="bg-white p-4 w-[900px] rounded">
              <Bill
                enrollmentId={printEnrollmentId}
                onClose={() => setPrintEnrollmentId(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? "bg-green text-white" : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <NewEnrollmentManagement
        show={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        enrollment={selectedEnrollment}
        refreshEnrollments={() => fetchEnrollments(selectedMonth)}
        classesList={classesList}
        booksList={booksList}
      />

      <StudentDetailsModal
        show={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        student={selectedStudent}
        enrollment={selectedEnrollment}
        onPayRemaining={(enrollment) => {
          setShowStudentModal(false);
          setPayModal({ show: true, enrollment });
        }}
      />

      <PayRemainingModal
        show={payModal.show}
        enrollment={payModal.enrollment}
        onClose={() => setPayModal({ show: false, enrollment: null })}
        refreshEnrollments={() => fetchEnrollments(selectedMonth)}
      />
    </div>
  );
};

export default EnrollStudentManagement;
