import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";

const DEFAULT_COUNTRY_CODE = "+93";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    father_name: "",
    phone_number: DEFAULT_COUNTRY_CODE,
  });

  const [saving, setSaving] = useState(false);

  /* ================= FETCH ALL STUDENTS ================= */
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/courses/students/");
      setStudents(res.data || []);
    } catch {
      showErrorToast("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= SEARCH STUDENTS ================= */
  const fetchSearchResults = async (query) => {
    if (!query.trim()) return setSearchResults([]);
    try {
      const res = await axiosInstance.get("/courses/students/search/", {
        params: { q: query },
      });
      setSearchResults(res.data || []);
    } catch {
      showErrorToast("Failed to search students");
    }
  };

  useEffect(() => {
    if (!search.trim()) return setSearchResults([]);
    const delay = setTimeout(() => fetchSearchResults(search), 300);
    return () => clearTimeout(delay);
  }, [search]);

  /* ================= PAGINATION ================= */
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.father_name?.toLowerCase().includes(q) ||
        s.phone_number?.includes(q),
    );
  }, [students, search]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, students]);

  /* ================= MODAL ================= */
  const openAddStudent = () => {
    setEditingStudent(null);
    setForm({
      name: "",
      father_name: "",
      phone_number: DEFAULT_COUNTRY_CODE,
    });
    setShowModal(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name || "",
      father_name: student.father_name || "",
      phone_number: student.phone_number?.trim() || DEFAULT_COUNTRY_CODE,
    });
    setShowModal(true);
  };

  /* ================= SAVE ================= */
  const saveStudent = async () => {
    if (
      !form.name.trim() ||
      !form.father_name.trim() ||
      form.phone_number === DEFAULT_COUNTRY_CODE
    ) {
      return showErrorToast("All fields are required");
    }

    setSaving(true);
    try {
      if (editingStudent) {
        await axiosInstance.put(
          `/courses/students/${editingStudent.id}/`,
          form,
        );
        showSuccessToast("Student updated");
      } else {
        await axiosInstance.post("/courses/students/", form);
        showSuccessToast("Student created");
      }

      setShowModal(false);
      fetchStudents();
    } catch {
      showErrorToast("Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await axiosInstance.delete(`/courses/students/${id}/`);
      showSuccessToast("Student deleted");
      fetchStudents();
    } catch {
      showErrorToast("Failed to delete student");
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={openAddStudent}
          className="px-4 py-1 bg-green text-white rounded"
        >
          + Add Student
        </button>
      </div>

      {/* FULL WIDTH SEARCH BOX */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students by name, father name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        {searchResults.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-40 overflow-y-auto z-50">
            {searchResults.map((s) => (
              <li
                key={s.id}
                className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                onClick={() => {
                  openEditStudent(s);
                  setSearch("");
                  setSearchResults([]);
                }}
              >
                <span>{s.name}</span>
                <span className="text-gray-500 text-xs">{s.father_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green text-white text-center">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Father Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Discount</th>
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
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              paginatedStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 text-center">
                  <td
                    className="p-2 border font-bold cursor-pointer"
                    onClick={() => openEditStudent(s)}
                  >
                    {s.name}
                  </td>
                  <td className="p-2 border">{s.father_name}</td>
                  <td className="p-2 border">{s.phone_number}</td>
                  <td className="p-2 border">
                    {s.is_discount ? "✅ Yes" : "❌ No"}
                  </td>
                  <td className="p-2 border text-xs">{s.created_at}</td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      onClick={() => openEditStudent(s)}
                      className="px-2 py-1 bg-green text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStudent(s.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
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

      {/* PAGINATION */}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">
              {editingStudent ? "Edit Student" : "Add Student"}
            </h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 w-full mb-2"
              disabled={saving}
            />
            <input
              placeholder="Father Name"
              value={form.father_name}
              onChange={(e) =>
                setForm({ ...form, father_name: e.target.value })
              }
              className="border p-2 w-full mb-2"
              disabled={saving}
            />
            <input
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={(e) => {
                let v = e.target.value;
                if (!v.startsWith(DEFAULT_COUNTRY_CODE))
                  v = DEFAULT_COUNTRY_CODE;
                setForm({ ...form, phone_number: v });
              }}
              className="border p-2 w-full mb-4"
              disabled={saving}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 bg-gray-300 rounded"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={saveStudent}
                className="px-4 py-1 bg-green text-white rounded"
                disabled={saving}
              >
                {saving
                  ? editingStudent
                    ? "Updating..."
                    : "Saving..."
                  : editingStudent
                    ? "Update"
                    : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
