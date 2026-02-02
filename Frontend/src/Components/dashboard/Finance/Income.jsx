import  { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import {
  getCurrentJalaliMonth,
  PERSIAN_MONTHS,
  
} from "../../../utils/jalali";

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Keep small for testing, can change

  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [price, setPrice] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentJalaliMonth());

  /* =========================
     Fetch Certificates
  ========================== */
  const fetchCertificates = async (month = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/courses/certificates/", {
        params: month ? { jalali_month: month } : {},
      });
      setCertificates(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Live Search Students
  ========================== */
  const fetchStudents = async (query) => {
    if (!query.trim()) {
      setStudentOptions([]);
      return;
    }
    try {
      const res = await axiosInstance.get("/courses/enrollments/", {
        params: { search: query },
      });
      setStudentOptions(res.data || []);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchCertificates(selectedMonth);
  }, [selectedMonth]);

  /* =========================
     Modal Handlers
  ========================== */
  const openModal = (certificate = null) => {
    setSelectedCertificate(certificate);

    if (certificate) {
      setSelectedStudent({
        id: certificate.student,
        name: certificate.student_name,
      });
      setPrice(certificate.price);
    } else {
      setSelectedStudent(null);
      setPrice("");
    }

    setSearchTerm("");
    setStudentOptions([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
  };

  /* =========================
     Add / Edit Certificate
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) return showErrorToast("Please select a student");
    if (!price) return showErrorToast("Please enter a price");

    setSaving(true);
    try {
      if (selectedCertificate) {
        await axiosInstance.put(
          `/courses/certificates/${selectedCertificate.id}/`,
          {
            student: selectedStudent.id,
            price,
          },
        );
        showSuccessToast("Certificate updated");
      } else {
        await axiosInstance.post(`/courses/certificates/`, {
          student: selectedStudent.id,
          price,
        });
        showSuccessToast("Certificate added");
      }
      fetchCertificates(selectedMonth);
      closeModal();
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Delete Certificate
  ========================== */
  const deleteCertificate = async (id) => {
    if (!window.confirm("Delete this certificate?")) return;
    try {
      await axiosInstance.delete(`/courses/certificates/${id}/`);
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      showSuccessToast("Certificate deleted");
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to delete certificate");
    }
  };

  /* =========================
     Pagination
  ========================== */
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const paginatedCertificates = certificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatCurrency = (v) => Number(v || 0).toFixed(2);

  /* =========================
     Render
  ========================== */
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <button
          onClick={() => openModal()}
          className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
        >
          + Add Certificate
        </button>
        <div className="flex flex-wrap gap-2 mb-2">
          {PERSIAN_MONTHS.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedMonth === month
                  ? "bg-green text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
        <h2 className="text-lg font-bold">Certificates</h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border text-center">
          <thead className="bg-green text-white">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Jalali Month</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedCertificates.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No certificates yet
                </td>
              </tr>
            ) : (
              paginatedCertificates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{c.id}</td>
                  <td className="p-2 border font-semibold">{c.student_name}</td>
                  <td className="p-2 border">{formatCurrency(c.price)}</td>
                  <td className="p-2 border">{c.jalali_month}</td>
                  <td className="p-2 border font-semibold">{c.created_at}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => openModal(c)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCertificate(c.id)}
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

      {/* =========================
          Add/Edit Certificate Modal
      ========================== */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
          dir="ltr"
        >
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">
              {selectedCertificate ? "Edit Certificate" : "Add Certificate"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Selected Student */}
              {selectedStudent && (
                <div className="flex items-center justify-between bg-green-100 text-green-800 px-2 py-1 rounded">
                  <span>{selectedStudent.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Search Student (hidden once selected) */}
              {!selectedStudent && (
                <div>
                  <label className="block mb-1 font-medium">Student</label>
                  <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      fetchStudents(e.target.value);
                    }}
                    className="w-full border rounded px-2 py-1"
                  />

                  {searchTerm && studentOptions.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border mt-1 rounded">
                      {studentOptions.map((s) => (
                        <div
                          key={s.id}
                          className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedStudent({
                              id: s.id,
                              name: s.student_name || s.student_info?.name,
                            });
                            setSearchTerm("");
                            setStudentOptions([]);
                          }}
                        >
                          {s.student_name || s.student_info?.name} (ID:{" "}
                          {s.student})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div>
                <label className="block mb-1 font-medium">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1 bg-green text-white rounded hover:opacity-90"
                >
                  {saving
                    ? "Saving..."
                    : selectedCertificate
                      ? "Update"
                      : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
