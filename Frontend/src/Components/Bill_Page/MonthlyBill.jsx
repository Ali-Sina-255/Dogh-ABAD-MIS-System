import React, { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../../utils/api";
import { getCurrentJalaliMonth } from "../../utils/jalali";

const MonthlyBill = ({ enrollmentId, onClose, autoPrint = false }) => {
  const [enrollment, setEnrollment] = useState(null);
  const receiptRef = useRef(null);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!enrollmentId) return;

    axiosInstance
      .get(`/courses/enrollments/${enrollmentId}/`)
      .then((res) => setEnrollment(res.data))
      .catch(() => {
        alert("خطا در دریافت معلومات رسید");
      });
  }, [enrollmentId]);

  // ================= PRINT FUNCTION =================
  const executePrint = () => {
    const printContentEl = receiptRef.current;
    if (!printContentEl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Receipt</title></head>
        <body>${printContentEl.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();

    const styleEl = printWindow.document.createElement("style");
    styleEl.innerHTML = `
      @page { size: 80mm auto; margin: 0; }
      body {
        width: 72mm;
        margin: 0 auto;
        padding: 5mm;
        font-family: Tahoma, Arial, sans-serif;
        font-size: 9pt;
        line-height: 1.2;
        color: #000;
      }
      .print-area { width: 100%; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .header h1 { font-size: 16pt; margin: 0; }
      .header img { width: 30px; height: auto; }
      .title { text-align: center; font-weight: bold; margin: 8px 0; border-bottom: 1px dashed #000; padding-bottom: 2px; }
      .row { display: flex; justify-content: space-between; margin: 6px 0; }
      .row p { margin: 0; font-size: 9pt; }
      .row-label { width: 50%; }
      .row-stamp { margin-top: 60px; }
      .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
      .footer { text-align: left; font-size: 8pt; margin-top: 8px; border-top: 1.5px dashed #000; padding-top: 4px; }
    `;
    printWindow.document.head.appendChild(styleEl);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      if (autoPrint && onClose) onClose();
    }, 300);
  };

  // ================= AUTO PRINT =================
  useEffect(() => {
    if (enrollment && autoPrint) {
      executePrint();
    }
  }, [enrollment, autoPrint]);

  if (!enrollment) return <div className="p-10 text-center">Loading…</div>;

  const jalaliDate = enrollment.start_month
    ? (() => {
        const [year, month, day] = enrollment.start_month.split("-");
        return `${day} ${enrollment.jalali_month || getCurrentJalaliMonth()} ${year}`;
      })()
    : getCurrentJalaliMonth();

  return (
    <div className="p-5">
      {/* ================= HIDDEN PRINT CONTENT ================= */}
      <div ref={receiptRef} style={{ display: "none" }}>
        <div className="print-area">
          {/* HEADER */}
          <div className="header">
            <h1>Hadaf</h1>
            <img src="/logo.jpg" alt="HPELA Logo" />
            <div className="title">REGISTRATION BILL</div>
          </div>

          {/* DATE, NO, CARD ID */}
          <div className="row">
            <p>Date: {jalaliDate}</p>
            <p>No: {enrollment.id}</p>
            <p>ID: #{enrollment.card_info?.card_id || "-"}</p>
          </div>

          <div className="divider"></div>

          {/* NAME / FATHER NAME */}
          <div className="row">
            <p className="row-label">Name: {enrollment.student_info?.name}</p>
            <p className="row-label">
              F/Name: {enrollment.student_info?.father_name}
            </p>
          </div>

          {/* INSTRUCTOR */}
          <div className="row">
            <p>
              Instructor:{" "}
              {enrollment.teachers?.length
                ? enrollment.teachers
                    .map((t) => (typeof t === "string" ? t : t.name))
                    .join(", ")
                : "-"}
            </p>
          </div>

          {/* CLASS / DISCOUNT */}
          <div className="row">
            <p>
              Class: {enrollment.class_name} -{" "}
              {enrollment.class_time?.slice(0, 5)}
            </p>
          </div>
          {enrollment.student_info?.is_discount && (
            <div className="row">
              <p>
                Discount:{" "}
                {enrollment.student_info?.is_discount
                  ? enrollment.student_info.discount_percent + "%"
                  : "-"}
              </p>
            </div>
          )}

          {/* FEE / REMAINING */}
          <div className="row">
            <p>Fee: AF {enrollment.paid_amount}</p>
            <p>Re-amount: AF {enrollment.remaining_fee}</p>
          </div>

          {/* STAMP */}
          <div className="row row-stamp">
            <p>Stamp: _____________________________</p>
          </div>

          <div className="divider"></div>

          {/* FOOTER */}
          <div className="footer">
            <p>The amount received is not refundable</p>
            <p>Phone: 0766021422 - 0772387935 - 0700234856</p>
          </div>
        </div>
      </div>

      {/* OPTIONAL ACTION BUTTONS */}
      {!autoPrint && (
        <div className="flex gap-3 mt-3">
          <button
            onClick={executePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            چاپ رسید
          </button>

          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            بستن
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyBill;
