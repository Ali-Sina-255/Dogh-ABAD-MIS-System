import React, { useEffect, useRef } from "react";

const PrintBill = ({ children, onClose }) => {
  const printRef = useRef(false);

  useEffect(() => {
    if (printRef.current) return;
    printRef.current = true;

    // Allow DOM to render first
    setTimeout(() => {
      window.print();
      if (onClose) onClose(); // Close modal after print
    }, 100);
  }, [onClose]);

  return <>{children}</>;
};

export default PrintBill;
