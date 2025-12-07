import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiDollarSign, FiList } from "react-icons/fi";

const TestSecon = () => {
  const TEST_TYPE_URL = "http://localhost:8000/core/test-type/";
  const LAB_URL = "http://localhost:8000/core/lab/";
  const PATIENT_URL = "http://localhost:8000/core/patients/";

  const [testTypes, setTestTypes] = useState([]);
  const [labRecords, setLabRecords] = useState([]);
  const [patients, setPatients] = useState([]);

  const [activeType, setActiveType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadTestTypes = async () => {
    const res = await axios.get(TEST_TYPE_URL);
    setTestTypes(res.data);
  };

  const loadLabRecords = async () => {
    const res = await axios.get(LAB_URL);
    setLabRecords(res.data);
  };

  const loadPatients = async () => {
    const res = await axios.get(PATIENT_URL);
    setPatients(res.data);
  };

  useEffect(() => {
    loadTestTypes();
    loadLabRecords();
    loadPatients();
  }, []);

  const getPatientName = (id) => {
    const person = patients.find((p) => p.id === id);
    return person ? person.name : "Unknown";
  };

  const grandTotal = labRecords.reduce(
    (sum, lab) => sum + Number(lab.price),
    0
  );

  const openModal = (type) => {
    setActiveType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveType(null);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-teal-700 mb-10 tracking-wide">
        💰 Daily Income Tracker
      </h1>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FiList className="text-teal-600" size={24} />
          Test Types Overview
        </h2>

        {testTypes.map((type) => {
          const filtered = labRecords.filter(
            (lab) => lab.test_type === type.id
          );

          const totalPrice = filtered.reduce(
            (sum, lab) => sum + Number(lab.price),
            0
          );

          return (
            <div
              key={type.id}
              onClick={() => openModal(type)}
              className="mb-8 p-6 border border-gray-200 rounded-xl hover:shadow-lg cursor-pointer transition-all bg-gray-50"
            >
              <h3 className="text-xl font-bold text-teal-700 mb-2">
                {type.name}
              </h3>

              <div className="text-green-700 font-semibold flex items-center gap-2">
                <FiDollarSign /> Total Income: {totalPrice} AFN
              </div>
            </div>
          );
        })}

        {/* GRAND TOTAL */}
        <div className="mt-10 p-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white shadow-lg">
          <h3 className="text-2xl font-bold">Total Income of All Sections</h3>
          <p className="text-4xl font-extrabold mt-3">{grandTotal} AFN</p>
        </div>
      </div>

      {/* 🔥 MODAL SECTION */}
      {showModal && activeType && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-xl w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-teal-700">
                {activeType.name} Details
              </h2>
              <button
                onClick={closeModal}
                className="text-red-600 font-bold text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal details list */}
            <div className="space-y-4">
              {labRecords
                .filter((lab) => lab.test_type === activeType.id)
                .map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 bg-gray-50 border rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-2"
                  >
                    <div className="flex flex-col gap-1">
                      <p>
                        <strong>Patient:</strong> {getPatientName(lab.patient)}
                      </p>
                      <p>
                        <strong>Refer To:</strong> {lab.refer_to}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(lab.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-teal-700 font-bold text-lg flex items-center gap-1">
                      <FiDollarSign /> {lab.price} AFN
                    </div>
                  </div>
                ))}
            </div>

            {/* Close Button */}
            <div className="text-center mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 text-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSecon;
