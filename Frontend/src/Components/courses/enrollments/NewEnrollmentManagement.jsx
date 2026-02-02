import React, { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { axiosInstance } from "../../../utils/api";

const NewEnrollmentManagement = ({
  show,
  onClose,
  enrollment = null,
  refreshEnrollments,
  classesList = [],
  booksList = [],
}) => {
  /* =========================
     Current Jalali Month
  ========================== */
  const currentMonth = new Date().toLocaleString("fa-AF-u-ca-persian", {
    month: "long",
  });

  const currentMonthClasses = classesList.filter(
    (c) => c.jalali_month === currentMonth,
  );

  /* =========================
     State
  ========================== */
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [paidAmount, setPaidAmount] = useState("");

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentFatherName, setNewStudentFatherName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [isDiscount, setIsDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");

  const [bookSearch, setBookSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     Initialize modal
  ========================== */
  useEffect(() => {
    if (!show) return;

    if (enrollment) {
      setSelectedClass(
        classesList.find((c) => c.id === enrollment.student_class) || null,
      );
      setSelectedBooks(enrollment.books_list || []);
      setPaidAmount(enrollment.paid_amount || "");

      setNewStudentName(enrollment.student_info?.name || "");
      setNewStudentFatherName(enrollment.student_info?.father_name || "");
      setParentPhone(enrollment.student_info?.phone_number || "");

      setIsDiscount(enrollment.student_info?.is_discount || false);
      setDiscountPercent(
        enrollment.student_info?.discount_percent?.toString() || "",
      );
    } else {
      setSelectedClass(null);
      setSelectedBooks([]);
      setPaidAmount("");
      setNewStudentName("");
      setNewStudentFatherName("");
      setParentPhone("");
      setIsDiscount(false);
      setDiscountPercent("");
    }
  }, [show, enrollment, classesList]);

  /* =========================
     Book live search filter
  ========================== */
  useEffect(() => {
    if (!selectedClass || !bookSearch.trim()) {
      setFilteredBooks([]);
      return;
    }

    const searchLower = bookSearch.toLowerCase();
    setFilteredBooks(
      booksList.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          b.book_type_label.toLowerCase().includes(searchLower),
      ),
    );
  }, [bookSearch, booksList, selectedClass]);

  /* =========================
     Fee calculations
  ========================== */
  const classFee = Number(selectedClass?.course_fee || 0);

  // ✅ card price (only first enrollment)
  const CARD_PRICE = 50;
  const cardFee = enrollment?.card ? 0 : CARD_PRICE;

  const booksFee = selectedBooks.reduce(
    (sum, b) => sum + Number(b.price || 0),
    0,
  );

  const discountAmount = isDiscount
    ? classFee * (Number(discountPercent || 0) / 100)
    : 0;

  const subtotal = classFee + cardFee + booksFee;
  const finalTotal = subtotal - discountAmount;

  /* =========================
     Submit enrollment
  ========================== */
  const handleSubmit = async () => {
    if (!newStudentName || !newStudentFatherName)
      return showErrorToast("Student name and father name required");

    if (!parentPhone) return showErrorToast("Parent phone required");
    if (!selectedClass) return showErrorToast("Please select a class");

    setLoading(true);

    try {
      let studentId;

      if (!enrollment) {
        const res = await axiosInstance.post("/courses/students/", {
          name: newStudentName,
          father_name: newStudentFatherName,
          phone_number: parentPhone,
          is_discount: isDiscount,
          discount_percent: isDiscount ? Number(discountPercent) : 0,
        });
        studentId = res.data.id;
      } else {
        studentId = enrollment.student;
        await axiosInstance.put(`/courses/students/${studentId}/`, {
          name: newStudentName,
          father_name: newStudentFatherName,
          phone_number: parentPhone,
          is_discount: isDiscount,
          discount_percent: isDiscount ? Number(discountPercent) : 0,
        });
      }

      const enrollmentPayload = {
        student: studentId,
        student_class: selectedClass.id,
        books: selectedBooks.map((b) => b.id) || [],
        paid_amount: Number(paidAmount || 0),
      };

      if (!enrollment) {
        await axiosInstance.post("/courses/enrollments/", enrollmentPayload);
        showSuccessToast("Enrollment created successfully");
      } else {
        await axiosInstance.put(
          `/courses/enrollments/${enrollment.id}/`,
          enrollmentPayload,
        );
        showSuccessToast("Enrollment updated successfully");
      }

      refreshEnrollments();
      onClose();
    } catch (err) {
      if (err.response && err.response.data) {
        const errors = err.response.data;

        // Flatten DRF validation errors
        const messages = [];

        Object.values(errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === "string") {
            messages.push(value);
          }
        });

        showErrorToast(messages.join(" | "));
      } else {
        showErrorToast("Failed to save enrollment");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  /* =========================
     UI
  ========================== */
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      dir="ltr"
    >
      <div className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold mb-4">
          {enrollment ? "Edit Enrollment" : "New Enrollment"}
        </h3>

        {/* Name + Father Name */}
        <div className="flex gap-2 mb-2">
          <input
            className="border p-2 w-1/2"
            placeholder="Student Name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
          />
          <input
            className="border p-2 w-1/2"
            placeholder="Father Name"
            value={newStudentFatherName}
            onChange={(e) => setNewStudentFatherName(e.target.value)}
          />
        </div>

        {/* Parent Phone */}
        <input
          className="border p-2 w-full mb-2"
          placeholder="+93xxxxxxxxx"
          value={parentPhone}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith("+93")) {
              val = "+93" + val.replace(/^\+?0*/, "");
            }
            setParentPhone(val);
          }}
        />

        {/* Class select */}
        {/* Class select */}
        <select
          className="border p-2 w-full mb-2"
          value={selectedClass?.id || ""}
          onChange={(e) =>
            setSelectedClass(
              currentMonthClasses.find((c) => c.id === Number(e.target.value)),
            )
          }
        >
          <option value="">-- Select Class --</option>

          {currentMonthClasses
            .filter((c) => c.is_active === true) 
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.period} - {c.start_time}
              </option>
            ))}
        </select>

        {/* Discount + Paid Amount */}
        <div className="flex gap-2 mb-2 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDiscount}
              onChange={(e) => {
                setIsDiscount(e.target.checked);
                if (!e.target.checked) setDiscountPercent("");
              }}
            />
            Has Discount
          </label>
          <input
            type="number"
            className="border p-2 w-1/2"
            placeholder="Discount %"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            disabled={!isDiscount}
          />
          <input
            type="number"
            className="border p-2 w-1/2"
            placeholder="Paid Amount"
            value={paidAmount}
            onChange={(e) =>
              setPaidAmount(e.target.value ? Number(e.target.value) : "")
            }
          />
        </div>

        {/* Book live search */}
        {selectedClass && (
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
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!selectedBooks.find((sb) => sb.id === b.id)) {
                        setSelectedBooks([...selectedBooks, b]);
                      }
                      setBookSearch("");
                      setFilteredBooks([]);
                    }}
                  >
                    {b.name} — {b.price}$
                  </li>
                ))}
              </ul>
            )}
            {selectedBooks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedBooks.map((b) => (
                  <span
                    key={b.id}
                    className="px-3 py-1 bg-green text-white rounded flex items-center gap-2"
                  >
                    {b.name} ({b.book_type_label})
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBooks(
                          selectedBooks.filter((sb) => sb.id !== b.id),
                        )
                      }
                      className="font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fee summary */}
        {selectedClass && (
          <div className="mt-3 text-sm border-t pt-2">
            <div>Class fee: {classFee} AF</div>
            {cardFee > 0 && <div>Card fee: {cardFee} AF</div>}
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEnrollmentManagement;
