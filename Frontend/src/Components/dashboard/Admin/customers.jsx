import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import Pagination from "../../../Utilities/Pagination";
import { axiosInstance } from "../../../utils/api";

const StudentCards = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =========================
     Fetch Students
  ========================== */
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/courses/students/");
        setStudents(res.data || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  /* =========================
     Filtered Students by Search
  ========================== */
  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      student.name?.toLowerCase().includes(query) ||
      student.father_name?.toLowerCase().includes(query)
    );
  });

  /* =========================
     Pagination
  ========================== */
  const totalPages = Math.ceil(filteredStudents.length / postsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  /* =========================
     Render
  ========================== */
  return (
    <section className="container mx-auto py-10">
      <h1 className="text-xl font-bold text-center mb-4">Student Cards</h1>

      {/* Search Box */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search by student or father name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/2 p-1 border rounded text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-sm">Loading students...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedStudents.map((student) => {
              const latestEnrollment =
                student.enrollments
                  ?.slice()
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                  )[0] || null;

              const card = latestEnrollment?.card_info;

              return (
                <div
                  key={student.id}
                  className="relative rounded-md shadow border border-gray-300 bg-white hover:shadow-lg"
                >
                  <div className="bg-green-600 text-white px-2 py-1 font-bold text-center text-sm">
                    Student ID Card
                  </div>

                  <div className="p-2 flex flex-col items-center space-y-1 text-xs">
                    <FaUserCircle className="text-green-500 w-12 h-12" />

                    <p className="font-semibold text-sm">{student.name}</p>
                    <p className="text-gray-600">
                      Father: {student.father_name}
                    </p>

                    <p>
                      Card ID: <strong>{card?.card_id || "N/A"}</strong>
                    </p>

                    <p>
                      Fee:{" "}
                      {card ? `${Number(card.price).toLocaleString()} AF` : "-"}
                    </p>

                    <p className="text-gray-500">
                      Expiry: {card?.expiry_date || "N/A"}
                    </p>

                    <p className="text-gray-400 text-xs">
                      Month: {card?.jalali_month || "-"}
                    </p>
                  </div>

                  <div className="bg-green-100 h-1 w-full" />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default StudentCards;
