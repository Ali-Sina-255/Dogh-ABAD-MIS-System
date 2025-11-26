import React, { useState, useEffect } from "react";
import axios from "axios";

const CopyPrescription = () => {
  const [pharmaceuticals, setPharmaceuticals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/users/api/users/?role=doctor"
      );
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error loading doctors.");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/core/patients/");
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Error loading patients.");
    }
  };

  const fetchPharmaceuticals = async (url = null) => {
    setLoading(true);
    try {
      const apiUrl =
        url || `http://127.0.0.1:8000/core/pharmaceuticals/list/?page=${page}`;
      const res = await axios.get(apiUrl);

      if (res.data && res.data.results) {
        setPharmaceuticals(res.data.results);
        setTotalPages(Math.ceil(res.data.count / res.data.results.length));
        setNextUrl(res.data.next);
        setPrevUrl(res.data.previous);
      } else {
        setPharmaceuticals([]);
        setTotalPages(1);
        setNextUrl(null);
        setPrevUrl(null);
      }
    } catch {
      setError("Error loading prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchPharmaceuticals();
  }, []);

  const getDoctorNameById = (id) => {
    const d = doctors.find((doc) => doc.id === id);
    return d ? `${d.first_name} ${d.last_name}` : "N/A";
  };

  const getPatientNameById = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.name : "N/A";
  };

  const handlePrint = (item) => {
    const drugNames =
      item.drugs && item.drugs.length > 0
        ? item.drugs.map((d) => `${d.drug.name} (x${d.amount_used})`).join(", ")
        : "No drugs";

    const w = window.open("", "_blank", "width=800,height=600");
    w.document.write(`
      <html>
        <head><title>Prescription</title></head>
        <body>
          <h2>Prescription Info</h2>

          <p><strong>Doctor:</strong> ${getDoctorNameById(item.doctor_name)}</p>
          <p><strong>Patient:</strong> ${getPatientNameById(
            item.patient_name
          )}</p>

          <p><strong>Drug Name(s):</strong> ${drugNames}</p>

          <p><strong>Prescription:</strong> ${item.copy}</p>
          <p><strong>Price:</strong> ${item.price} AF</p>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading prescriptions...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="flex justify-center items-center mt-6 mb-6 w-full">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          لیست نسخه‌های کپی
        </h2>

        {pharmaceuticals.length === 0 ? (
          <p className="text-gray-700 text-center">هیچ نسخه‌ای موجود نیست.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
                  <tr>
                    <th className="px-6 py-3 text-center">Doctor</th>
                    <th className="px-6 py-3 text-center">Patient</th>
                    <th className="px-6 py-3 text-center">Drug Name</th>
                    <th className="px-6 py-3 text-center">Prescription</th>
                    <th className="px-6 py-3 text-center">Price</th>
                    <th className="px-6 py-3 text-center">Print</th>
                  </tr>
                </thead>

                <tbody>
                  {pharmaceuticals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-center">
                        {getDoctorNameById(item.doctor_name)}
                      </td>

                      <td className="px-6 py-3 text-center">
                        {getPatientNameById(item.patient_name)}
                      </td>

                      {/* FIXED: Correct drug name path */}
                      <td className="px-6 py-3 text-center">
                        {item.drugs && item.drugs.length > 0
                          ? item.drugs
                              .map(
                                (drugItem) =>
                                  `${drugItem.drug.name} (x${drugItem.amount_used})`
                              )
                              .join(", ")
                          : "No drugs"}
                      </td>

                      <td className="px-6 py-3 text-center">{item.copy}</td>

                      <td className="px-6 py-3 text-center">{item.price} AF</td>

                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handlePrint(item)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(nextUrl || prevUrl) && (
              <div className="flex justify-center gap-6 items-center mt-6">
                <button
                  type="button"
                  disabled={!prevUrl}
                  onClick={() => prevUrl && fetchPharmaceuticals(prevUrl)}
                  className={`px-4 py-2 rounded-md ${
                    !prevUrl
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>

                <span className="font-bold">
                  Page {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={!nextUrl}
                  onClick={() => nextUrl && fetchPharmaceuticals(nextUrl)}
                  className={`px-4 py-2 rounded-md ${
                    !nextUrl
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CopyPrescription;
