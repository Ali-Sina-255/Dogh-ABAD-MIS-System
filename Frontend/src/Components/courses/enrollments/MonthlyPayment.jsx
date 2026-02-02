import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/api";
import { showErrorToast, showSuccessToast } from "../../messages/Toast";
import { PERSIAN_MONTHS } from "../../../utils/jalali";

const NextMonthPayment = ({ enrollment, onClose, refresh }) => {
  // -------------------
  // States
  // -------------------
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [classesList, setClassesList] = useState([]);
  const [booksList, setBooksList] = useState([]);

  // -------------------
  // Initialize data from previous enrollment
  // -------------------
  useEffect(() => {
    if (!enrollment) return;

    // Set class info
    setSelectedClass({
      id: enrollment.student_class,
      name: enrollment.class_name,
      teachers: Array.isArray(enrollment.teachers) ? enrollment.teachers : [],
    });

    // Set selected books
    setSelectedBooks(
      Array.isArray(enrollment.books_info) ? enrollment.books_info : []
    );

    // Apply discount if exists
    const discountPercent = enrollment.student_info?.is_discount
      ? enrollment.student_info.discount_percent
      : 0;

    const discountedAmount = enrollment.course_fee
      ? Number(enrollment.course_fee) * (1 - discountPercent / 100)
      : 0;

    setPaidAmount(discountedAmount);

    setSelectedMonth(""); // reset for new month
  }, [enrollment]);

  // -------------------
  // Fetch classes and books
  // -------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, booksRes] = await Promise.all([
          axiosInstance.get("/courses/student-classes/"),
          axiosInstance.get("/courses/books/"),
        ]);
        setClassesList(Array.isArray(classesRes.data) ? classesRes.data : []);
        setBooksList(Array.isArray(booksRes.data) ? booksRes.data : []);
      } catch (err) {
        showErrorToast("Failed to fetch classes or books");
      }
    };
    fetchData();
  }, []);

  // -------------------
  // Book live search
  // -------------------
  useEffect(() => {
    if (!bookSearch.trim()) {
      setFilteredBooks([]);
      return;
    }

    const searchLower = bookSearch.toLowerCase();
    const filtered = (booksList || []).filter(
      (b) =>
        b.name?.toLowerCase().includes(searchLower) ||
        b.book_type_label?.toLowerCase().includes(searchLower)
    );
    setFilteredBooks(filtered);
  }, [bookSearch, booksList]);

  // -------------------
  // Save next month payment
  // -------------------
  const handleSubmit = async () => {
    if (!selectedMonth) return showErrorToast("Please select month");
    if (!selectedClass) return showErrorToast("Please select class");

    setLoading(true);
    try {
      // Calculate discount again just in case
      const discountPercent = enrollment.student_info?.is_discount
        ? enrollment.student_info.discount_percent
        : 0;

      const finalPaidAmount = Number(paidAmount) * (1 - discountPercent / 100);

      const payload = {
        student: enrollment.student, // student ID
        student_class: selectedClass.id,
        books: selectedBooks.map((b) => b.id),
        card: enrollment.card, // keep same card
        start_month: selectedMonth,
        paid_amount: finalPaidAmount,
        status: "active",
      };

      await axiosInstance.post("/courses/enrollments/", payload);

      showSuccessToast(
        `Payment recorded for ${enrollment.student_info.name} in month ${selectedMonth}`
      );
      onClose();
      refresh();
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.detail || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  if (!enrollment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">
          Next Month Payment — {enrollment.student_info?.name || ""}
        </h3>

        {/* Month select */}
        <select
          className="border p-2 w-full mb-2"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- Select Month --</option>
          {Array.isArray(PERSIAN_MONTHS) &&
            PERSIAN_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>

        {/* Class select */}
        <select
          className="border p-2 w-full mb-2"
          value={selectedClass?.id || ""}
          onChange={(e) =>
            setSelectedClass(
              (classesList || []).find((c) => c.id === Number(e.target.value))
            )
          }
        >
          <option value="">-- Select Class --</option>
          {(classesList || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.period}
            </option>
          ))}
        </select>

        {/* Paid Amount */}
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="Paid Amount"
        />

        {/* Book live search */}
        <div className="mb-2 relative">
          <input
            className="border p-2 w-full"
            placeholder="Search books..."
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
          />

          {bookSearch.trim() &&
            Array.isArray(filteredBooks) &&
            filteredBooks.length > 0 && (
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

          {/* Selected Books */}
          {Array.isArray(selectedBooks) && selectedBooks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedBooks.map((b) => (
                <span
                  key={b.id}
                  className="px-3 py-1 bg-green text-white rounded flex items-center gap-2"
                >
                  {b.name} ({b.book_type_label || ""})
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBooks(
                        selectedBooks.filter((sb) => sb.id !== b.id)
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

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="border px-3 py-1 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedMonth || !selectedClass}
            className="bg-green text-white px-4 py-1 rounded hover:opacity-90"
          >
            {loading ? "Saving..." : "Save Next Month"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextMonthPayment;
