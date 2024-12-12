import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CopyPrescription = () => {
  const [pharmaceuticals, setPharmaceuticals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/users/api/users/?role=doctor"
        );
        if (Array.isArray(response.data)) {
          setDoctors(response.data);
        } else {
          console.warn("Expected an array, but got:", response.data);
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError("خطا در بارگیری اطلاعات پزشکان.");
      }
    };

    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/patients/"
        );
        if (Array.isArray(response.data)) {
          setPatients(response.data);
        } else {
          console.warn("Expected an array, but got:", response.data);
          setPatients([]);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("خطا در بارگیری اطلاعات بیماران.");
      }
    };

    const fetchPharmaceuticals = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/pharmaceuticals/"
        );
        if (Array.isArray(response.data)) {
          setPharmaceuticals(response.data);
        } else {
          console.warn("Expected an array, but got:", response.data);
          setPharmaceuticals([]);
        }
      } catch (error) {
        console.error("Error fetching pharmaceuticals:", error);
        setError("خطا در بارگیری اطلاعات داروها.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    fetchPatients();
    fetchPharmaceuticals();
  }, []);

  const handlePrint = (item) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>جزئیات صورتحساب بیمارستان</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              background-color: #f4f4f9;
              color: #333;
            }
            .bill-container {
              border: 1px solid #ddd;
              border-radius: 10px;
              padding: 20px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              background-color: #fff;
              max-width: 600px;
              margin: auto;
            }
            .bill-header {
              text-align: center;
              border-bottom: 2px solid #ddd;
              margin-bottom: 20px;
            }
            .bill-header h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .bill-header p {
              font-size: 14px;
              color: #777;
            }
            .bill-details {
              margin-bottom: 20px;
            }
            .bill-details p {
              margin: 5px 0;
              line-height: 1.6;
            }
            .bill-details strong {
              color: #0056b3;
            }
            .bill-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            .bill-footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="bill-header">
              <h1>جزئیات صورتحساب بیمارستان</h1>
              <p><strong>از خدمات شما متشکریم</strong></p>
            </div>
            <div class="bill-details">
              <p><strong>پزشک:</strong> ${item.doctor_name || "N/A"}</p>
              <p><strong>بیمار:</strong> ${getPatientNameById(
                item.patient_name
              )}</p>
              <p><strong>نسخه:</strong> ${item.copy}</p>
              <p><strong>قیمت:</strong> $${parseFloat(item.price).toFixed(
                2
              )}</p>
              <p><strong>تاریخ ایجاد:</strong> ${new Date(
                item.created_at
              ).toLocaleString()}</p>
            </div>
            <div class="bill-footer">
              <p>امیدواریم به زودی حالتان بهتر شود!</p>
              <p><em>برای سوالات، با تیم پشتیبانی ما تماس بگیرید</em></p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Helper functions to get doctor's and patient's full names
  const getDoctorNameById = (id) => {
    const doctor = doctors.find((doc) => doc.id === id);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : "N/A";
  };

  const getPatientNameById = (id) => {
    const patient = patients.find((pat) => pat.id === id);
    return patient ? patient.name : "N/A";
  };

  // Loading and error handling UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading pharmaceuticals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">لیست نسخه‌های کپی</h2>
      {pharmaceuticals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-teal-400 text-white text-left">
              <tr className="text-left">
                {["Doctor", "Patient", "Prescription", "Price", "Print"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b text-left text-sm font-semibold"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pharmaceuticals.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-6 py-4 border-b text-sm">
                    {getDoctorNameById(item.doctor_name)}
                  </td>
                  <td className="px-6 py-4 border-b text-sm">
                    {getPatientNameById(item.patient_name)}
                  </td>
                  <td className="px-6 py-4 border-b text-sm">{item.copy}</td>
                  <td className="px-6 py-4 border-b text-sm">
                    {item.price !== null && item.price !== undefined
                      ? parseFloat(item.price).toFixed(2)
                      : "0.00"}{" "}
                    AF
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-center">
                    <button
                      onClick={() => handlePrint(item)}
                      className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-md hover:bg-gradient-to-l"
                    >
                      Print Prescription
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 mt-4">هیچ دارویی موجود نیست</p>
      )}
    </div>
  );
};

export default CopyPrescription;
