import { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast, showWarningToast } from "../Toast";

const Pharmaceutical = () => {
  const [pharmaceuticals, setPharmaceuticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPharmaceuticals = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/core/pharmaceuticals/"
        );
        if (Array.isArray(response.data)) {
          setPharmaceuticals(response.data);
        } else {
          showWarningToast("Unexpected response format from server.");
          setPharmaceuticals([]);
        }
      } catch (err) {
        console.error("Error fetching pharmaceuticals:", err);
        setError("Failed to load pharmaceuticals.");
        showErrorToast("Failed to load pharmaceuticals.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmaceuticals();
  }, []);

  const handlePrint = (item) => {
    if (!item) {
      showWarningToast("No data available to print.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Hospital Bill</title>
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
              <h1>Hospital Bill Details</h1>
              <p><strong>Thank you for your service</strong></p>
            </div>
            <div class="bill-details">
              <p><strong>Doctor:</strong> ${item.doctor_name || "N/A"}</p>
              <p><strong>Patient:</strong> ${item.patient_name || "N/A"}</p>
              <p><strong>Copy:</strong> ${item.copy}</p>
              <p><strong>Price:</strong> $${parseFloat(item.price).toFixed(
                2
              )}</p>
              <p><strong>Created At:</strong> ${new Date(
                item.created_at
              ).toLocaleString()}</p>
            </div>
            <div class="bill-footer">
              <p>We hope you feel better soon!</p>
              <p><em>For inquiries, contact our support team</em></p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showSuccessToast("Bill printed successfully.");
  };

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
      <h2 className="text-2xl font-bold mb-4">Pharmaceutical List</h2>
      {pharmaceuticals.length > 0 ? (
        <table className="min-w-full border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-6 py-3 text-left text-sm font-semibold border-b border-gray-200">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold border-b border-gray-200">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold border-b border-gray-200">
                Copy
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold border-b border-gray-200">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold border-b border-gray-200">
                Bill
              </th>
            </tr>
          </thead>
          <tbody>
            {pharmaceuticals.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-100 transition duration-200"
              >
                <td className="px-6 py-4 border-b border-gray-200 text-sm">
                  {item.doctor_name || "N/A"}
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-sm">
                  {item.patient_name || "N/A"}
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-sm">
                  {item.copy}
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-sm">
                  ${item.price ? parseFloat(item.price).toFixed(2) : "0.00"}
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-sm">
                  <button
                    onClick={() => handlePrint(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Print Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-700 mt-4">No pharmaceuticals available</p>
      )}
    </div>
  );
};

export default Pharmaceutical;
