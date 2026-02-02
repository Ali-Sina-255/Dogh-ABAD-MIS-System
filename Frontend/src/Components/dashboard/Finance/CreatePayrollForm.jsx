import React, { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreatePayrollForm = ({ onPayrollCreated }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // const token = localStorage.getItem("auth_token");
  // axios.defaults.headers.common["Authorization"] = `Token ${token}`;

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employee/employees/`);
      setEmployees(res.data.filter((e) => e.role_display === "Teacher"));
    } catch {
      showErrorToast("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees on search
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredEmployees([]);
      return;
    }
    const matches = employees.filter((emp) =>
      `${emp.first_name} ${emp.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredEmployees(matches);
  }, [search, employees]);

  const handleCreatePayroll = async (employeeId, employeeName) => {
    try {
      const res = await axios.post(`${BASE_URL}/payment/payrolls/`, {
        employee: employeeId,
      });
      if (res.status === 201) {
        showSuccessToast(`Payroll created for ${employeeName}!`);
        setSearch(""); // reset search
        setFilteredEmployees([]);
        if (onPayrollCreated) onPayrollCreated(); // refresh payroll table
      }
    } catch (err) {
      console.error(err.response || err);
      showErrorToast("Failed to create payroll");
    }
  };

  return (
    <div className="w-[90%] md:w-[700px] lg:w-[80%] mx-auto bg-white  p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">Create Wallet...</h3>
      <input
        type="text"
        placeholder="Search Teacher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-md w-full mb-2"
      />
      {search.trim() !== "" && filteredEmployees.length > 0 && (
        <div className="border rounded-md max-h-60 overflow-y-auto mb-4">
          {filteredEmployees.map((emp) => (
            <button
              key={emp.id}
              className="w-full text-left px-3 py-2 hover:bg-gray text-black"
              onClick={() =>
                handleCreatePayroll(
                  emp.id,
                  `${emp.first_name} ${emp.last_name}`
                )
              }
            >
              {emp.first_name} {emp.last_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatePayrollForm;
