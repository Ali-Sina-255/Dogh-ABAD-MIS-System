import React, { useState } from "react";
import { axiosInstance } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";

const StudentCreateModal = ({ show, onClose, refresh }) => {
  const [form, setForm] = useState({
    name: "",
    father_name: "",
    phone_number: "",
  });

  if (!show) return null;

  const submit = async () => {
    try {
      await axiosInstance.post("/courses/students/", form);
      showSuccessToast("Student added successfully");
      refresh();
      onClose();
    } catch (err) {
      showErrorToast(
        err.response?.data?.phone_number ||
          err.response?.data?.detail ||
          "Failed to add student",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded w-[400px] space-y-3">
        <h2 className="font-bold text-lg">Add Student</h2>

        <input
          className="w-full p-2 border rounded"
          placeholder="Student Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Father Name"
          value={form.father_name}
          onChange={(e) => setForm({ ...form, father_name: e.target.value })}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-1 bg-green text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCreateModal;
