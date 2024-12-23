import React, { useEffect, useState } from "react";
import axios from "axios";

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState([]);

  useEffect(() => {
    // Fetch data from the API (assuming an endpoint exists)
    axios
      .get("/api/staff/")
      .then((response) => {
        setStaffMembers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching staff data:", error);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Staff Members</h2>
      {staffMembers.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">Name</th>
              <th className="border border-gray-400 p-2">Position</th>
              <th className="border border-gray-400 p-2">Salary</th>
              <th className="border border-gray-400 p-2">Days Present</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff.id}>
                <td className="border border-gray-400 p-2">{staff.name}</td>
                <td className="border border-gray-400 p-2">{staff.position}</td>
                <td className="border border-gray-400 p-2">
                  ${staff.salary.toFixed(2)}
                </td>
                <td className="border border-gray-400 p-2">
                  {staff.present_day}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No staff members found.</p>
      )}
    </div>
  );
};

export default Staff;
