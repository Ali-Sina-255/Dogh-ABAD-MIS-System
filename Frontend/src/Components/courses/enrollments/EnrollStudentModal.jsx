import React, { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";

const EnrollStudentModal = ({
  show,
  onClose,
  studentClass,
  refreshClasses,
}) => {
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch eligible students when modal opens or selectedClass changes
  useEffect(() => {
    if (!show || !studentClass) return;

    const fetchEligibleStudents = async () => {
      try {
        const res = await axiosInstance.get(
          `/courses/student-classes/${studentClass.id}/eligible-students/`
        );
        setEligibleStudents(res.data || []);
      } catch (err) {
        console.error(err);
        showErrorToast("Failed to fetch eligible students");
      }
    };

    fetchEligibleStudents();
  }, [show, studentClass]);

  const handleSubmit = async () => {
    if (!selectedStudentId) return showErrorToast("Please select a student");

    setLoading(true);
    try {
      await axiosInstance.post(
        `/courses/student-classes/${studentClass.id}/enroll/`,
        { student_id: selectedStudentId }
      );
      showSuccessToast("Student enrolled successfully");
      refreshClasses();
      onClose();
    } catch (err) {
      showErrorToast(err.response?.data?.detail || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-96">
        <h3 className="text-lg font-bold mb-4">
          Enroll Student for Next Month
        </h3>

        <select
          className="border p-2 w-full"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {eligibleStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.father_name}
            </option>
          ))}
        </select>

        {eligibleStudents.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No eligible students available
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            {loading ? "Processing..." : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudentModal;
