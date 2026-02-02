/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";
import moment from "moment-jalaali";

import MonthlyBill from "../../Bill_Page/MonthlyBill";

moment.loadPersian({ dialect: "persian-modern" });

export const PERSIAN_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

const normalizeMonth = (val) =>
  String(val || "")
    .trim()
    .replace(/\s+/g, "")
    .replace("ي", "ی")
    .replace("ك", "ک");

const MonthlyEnrollManagement = ({
  show,
  onClose,
  enrollment,
  refreshEnrollments,
  classesList = [],
  booksList = [],
}) => {
  // ===================== STATES =====================
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    PERSIAN_MONTHS[moment().jMonth()],
  );
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(0);

  const [bookSearch, setBookSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [isDiscount, setIsDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [printEnrollmentId, setPrintEnrollmentId] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // ===================== RESET MODAL =====================
  useEffect(() => {
    if (!show) return;

    setStartDate(moment().format("YYYY-MM-DD"));
    setSelectedBooks([]);
    setBookSearch("");
    setFilteredBooks([]);
    setPaidAmount("");
    setIsDiscount(false);
    setDiscountPercent("");

    if (enrollment?.student_info) {
      const s = enrollment.student_info;
      setStudentName(s.name || "");
      setFatherName(s.father_name || "");
      setParentPhone(s.phone_number || "");
      setIsDiscount(!!s.is_discount);
      setDiscountPercent(s.discount_percent || "");
      setSelectedStudentId(s.id);
      setRemainingBalance(Number(s.remaining_balance || 0));
    } else {
      setRemainingBalance(0);
      setStudentName("");
      setFatherName("");
      setParentPhone("");
      setSelectedStudentId(null);
    }
  }, [show, enrollment]);

  // ===================== FILTER CLASSES BY MONTH =====================
  useEffect(() => {
    const filtered = classesList.filter(
      (c) =>
        normalizeMonth(c.jalali_month) === normalizeMonth(selectedMonth) &&
        c.is_active,
    );

    setFilteredClasses(filtered);

    if (filtered.length > 0) {
      const exists = filtered.some((c) => c.id === selectedClassId);
      if (!exists) {
        setSelectedClassId(filtered[0].id);
      }
    } else {
      setSelectedClassId(null);
    }
  }, [selectedMonth, classesList]);

  // ===================== UPDATE SELECTED CLASS =====================
  useEffect(() => {
    const cls = filteredClasses.find((c) => c.id === selectedClassId);
    setSelectedClass(cls || null);
    setSelectedBooks([]);
    setBookSearch("");
  }, [selectedClassId, filteredClasses]);

  // ===================== BOOK SEARCH =====================
  useEffect(() => {
    if (!bookSearch.trim()) {
      setFilteredBooks([]);
      return;
    }
    const searchLower = bookSearch.toLowerCase();
    setFilteredBooks(
      booksList.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          b.book_type_label?.toLowerCase().includes(searchLower),
      ),
    );
  }, [bookSearch, booksList]);

  // ===================== FEE CALCULATION =====================
  const classFee = selectedClass ? Number(selectedClass.course_fee || 0) : 0;
  const booksFee = selectedBooks.reduce(
    (sum, b) => sum + Number(b.price || 0),
    0,
  );
  const discountAmount =
    isDiscount && discountPercent
      ? classFee * (Number(discountPercent) / 100)
      : 0;
  const subtotal = classFee + booksFee;
  const finalTotal = subtotal - discountAmount;

  // ===================== HANDLE SUBMIT =====================
  const handleSubmit = async () => {
    if (loading) return;
    if (!studentName) return showErrorToast("Student name required");
    if (!selectedClassId) return showErrorToast("Please select a class");

    if (remainingBalance > 0) {
      return alert(
        `This student has a remaining balance of ${remainingBalance} AF. Cannot enroll in a new class.`,
      );
    }

    if (Number(paidAmount || 0) > finalTotal) {
      return showErrorToast("Paid amount cannot exceed total payable");
    }

    setLoading(true);
    try {
      const payload = {
        student: selectedStudentId,
        student_class: selectedClassId,
        start_month: startDate,
        book_ids: selectedBooks.map((b) => b.id),
        paid_amount: Number(paidAmount || 0),
        is_discount: isDiscount,
        discount_percent: isDiscount ? Number(discountPercent || 0) : 0,
      };

      const res = await axiosInstance.post("/courses/re-enrollments/", payload);
      const enrollmentId = res.data?.id;
      if (!enrollmentId) return showErrorToast("Enrollment failed");

      showSuccessToast("Enrollment successful");
      refreshEnrollments();

      // Show Bill modal
      setPrintEnrollmentId(enrollmentId);
      setShowPrintModal(true);
    } catch (err) {
      console.error(err.response?.data);
      showErrorToast(err.response?.data?.detail || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* ENROLLMENT MODAL */}
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold mb-4">New Monthly Enrollment</h3>

          {/* Student Info */}
          <div className="flex gap-2 mb-2">
            <input className="border p-2 w-1/2" value={studentName} readOnly />
            <input className="border p-2 w-1/2" value={fatherName} readOnly />
          </div>
          <input
            className="border p-2 w-full mb-2"
            value={parentPhone}
            readOnly
          />

          {/* Month */}
          <select
            className="border p-2 w-full mb-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {PERSIAN_MONTHS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {/* Class */}
          <select
            className="border p-2 w-full mb-2"
            value={selectedClassId || ""}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
          >
            <option value="">Select Class</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.period} - {c.start_time}
              </option>
            ))}
          </select>

          {/* Book Search */}
          {booksList.length > 0 && (
            <div className="mb-2 relative">
              <input
                className="border p-2 w-full"
                placeholder="Search books..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
              />
              {bookSearch.trim() && filteredBooks.length > 0 && (
                <ul className="absolute top-full left-0 z-50 bg-white border w-full max-h-40 overflow-y-auto shadow-md rounded mt-1">
                  {filteredBooks.map((b) => (
                    <li
                      key={b.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (!selectedBooks.find((sb) => sb.id === b.id)) {
                          setSelectedBooks([...selectedBooks, b]);
                        }
                        setBookSearch("");
                        setFilteredBooks([]);
                      }}
                    >
                      {b.name} — {b.book_type_label} - {b.price} AF
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Discount + Paid */}
          <div className="flex gap-2 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDiscount}
                onChange={(e) => {
                  setIsDiscount(e.target.checked);
                  if (!e.target.checked) setDiscountPercent("");
                }}
              />
              Discount
            </label>
            <input
              type="number"
              className="border p-2 w-1/2"
              placeholder="Discount %"
              value={discountPercent}
              disabled={!isDiscount}
              min={0}
              max={100}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
            <input
              type="number"
              className="border p-2 w-1/2"
              placeholder="Paid"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>

          {/* Fee summary */}
          {selectedClass && (
            <div className="text-sm border-t pt-2">
              <div>Class fee: {classFee} AF</div>
              <div>Books fee: {booksFee} AF</div>
              <div>Subtotal: {subtotal} AF</div>
              {isDiscount && (
                <div className="text-red-600">
                  Discount: −{discountAmount.toFixed(2)} AF
                </div>
              )}
              <div className="font-bold">
                Total Payable: {finalTotal.toFixed(2)} AF
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="border px-3 py-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green text-white px-4 py-1"
            >
              {loading ? "Saving..." : "Enroll"}
            </button>
          </div>
        </div>
      </div>

      {/* MonthlyBill MODAL */}
      {showPrintModal && printEnrollmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-96 max-h-[90vh] overflow-auto">
            <MonthlyBill
              enrollmentId={printEnrollmentId}
              onClose={() => setShowPrintModal(false)}
              autoPrint={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MonthlyEnrollManagement;
