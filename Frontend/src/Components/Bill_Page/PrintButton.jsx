import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const PrintButton = () => {
  const { id } = useParams();
  const printedRef = useRef(false);
  useEffect(() => {
    if (!id) return;

    if (!printedRef.current) {
      printedRef.current = true;
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Enrollment Bill #{id}</h2>

      <Bill ref={componentRef} enrollment={enrollment} />
    </div>
  );
};

export default PrintButton;
