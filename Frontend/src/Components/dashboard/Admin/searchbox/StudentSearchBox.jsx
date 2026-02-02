// StudentSearchBox.jsx
import React from "react";

const StudentSearchBox = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="mb-2">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green"
      />
    </div>
  );
};

export default StudentSearchBox;
