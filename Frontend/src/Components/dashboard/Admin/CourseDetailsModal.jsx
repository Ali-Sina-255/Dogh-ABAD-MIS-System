import React from "react";
import { getFullJalaliDate } from "../../../utils/jalali";

const CourseDetailsModal = ({ show, onClose, course }) => {
  if (!show || !course) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      dir="ltr"
    >
      <div className="bg-white rounded-md shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6">
        {/* Header */}
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Course Details: {course.name}
        </h3>

        {/* Course Info */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm justify-between text-gray-700">
          <div className="flex flex-col">
            <span className="font-semibold">Course Fee:</span>
            <span className="text-gray-800 font-medium">
              {Number(course.course_fee || 0).toLocaleString("en-US")} AF
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Period:</span>
            <span className="text-gray-800">{course.period || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Start Time:</span>
            <span className="text-gray-800">{course.start_time || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold gap-1">Duration:</span>
            <span className="text-gray-800">
              {course.duration_months || "-"} Month
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold gap-1">Teachers:</span>
            <span className="text-gray-800">
              {course.teachers
                ?.map((t) => `${t.first_name} ${t.last_name}`)
                .join(", ") || "-"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold">Month:</span>
            <span className="text-gray-800">{course.created_at || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Students Count:</span>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full text-center  ">
              {course.enrollments?.length || 0}
            </span>
          </div>
        </div>

        {/* Students List */}
        {course.enrollments && course.enrollments.length > 0 ? (
          <>
            <div className="flex flex-col gap-2">
              {course.enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="flex flex-wrap justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <span className="w-1/6 text-center font-medium">
                    {enr.student_info?.name || "-"}
                  </span>
                  <span className="w-1/6 text-center">
                    {enr.student_info?.father_name || "-"}
                  </span>
                  <span className="w-1/6 text-center">
                    {enr.student_info?.phone_number || "-"}
                  </span>
                  <span className="w-1/6 text-center">
                    {Number(enr.course_fee || 0).toLocaleString("en-US")} AF
                  </span>
                  <span className="w-1/6 text-center">
                    {Number(enr.paid_amount || 0).toLocaleString("en-US")} AF
                  </span>
                  <span className="w-1/6 text-center">
                    {Number(enr.remaining_fee || 0).toLocaleString("en-US")} AF
                  </span>
                </div>
              ))}
            </div>

            {/* Result Summary */}
            <div className="flex justify-end gap-6 mt-4 p-2 bg-gray-100 rounded text-gray-800 font-semibold">
              <span>
                Total Course Fee:{" "}
                {Number(
                  course.enrollments.reduce(
                    (sum, e) => sum + Number(e.course_fee || 0),
                    0,
                  ),
                ).toLocaleString("en-US")}{" "}
                AF
              </span>
              <span>
                Total Paid:{" "}
                {Number(
                  course.enrollments.reduce(
                    (sum, e) => sum + Number(e.paid_amount || 0),
                    0,
                  ),
                ).toLocaleString("en-US")}{" "}
                AF
              </span>
              <span>
                Total Remaining:{" "}
                {Number(
                  course.enrollments.reduce(
                    (sum, e) => sum + Number(e.remaining_fee || 0),
                    0,
                  ),
                ).toLocaleString("en-US")}{" "}
                AF
              </span>
            </div>
          </>
        ) : (
          <div className="p-2 text-gray-500">No students enrolled yet</div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
