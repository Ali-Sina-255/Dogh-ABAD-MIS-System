import { useState } from "react";

import Backdrop from "./Backdrop";

const ParentComponent = () => {
  const [showBackdrop, setShowBackdrop] = useState(false);

  // Toggle the backdrop when the button is clicked
  const toggleBackdrop = () => setShowBackdrop(!showBackdrop);

  return (
    <div className="relative">
      {/* Button to open/close backdrop */}
      <button
        onClick={toggleBackdrop}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Toggle Backdrop
      </button>

      {/* Backdrop */}
      {showBackdrop && <Backdrop onClick={toggleBackdrop} />}

      {/* Example component displayed with backdrop */}
      {showBackdrop && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md z-20 shadow-lg">
          <h2 className="text-lg font-bold mb-4">Hello</h2>
          <button
            onClick={toggleBackdrop}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
