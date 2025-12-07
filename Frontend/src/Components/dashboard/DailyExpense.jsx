import React, { useEffect, useState } from "react";
import axios from "axios";

function DailyExpense() {
  const TEST_TYPE_URL = "http://localhost:8000/core/test-type/";
  const LAB_URL = "http://localhost:8000/core/lab/";

  // Test type states
  const [testTypes, setTestTypes] = useState([]);
  const [testName, setTestName] = useState([]);

  // Patient search states
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Lab form states
  const [testTypeId, setTestTypeId] = useState("");
  const [price, setPrice] = useState("");
  const [referTo, setReferTo] = useState("");
  const [testRecords, setTestRecords] = useState([]);

  // Load test types + lab records
  useEffect(() => {
    loadTestTypes();
    loadLabRecords();
  }, []);

  const loadTestTypes = async () => {
    const res = await axios.get(TEST_TYPE_URL);
    setTestTypes(res.data);
  };

  const loadLabRecords = async () => {
    const res = await axios.get(LAB_URL);
    setTestRecords(res.data);
  };

  // Patient Search
  const searchPatients = async (query) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/core/patients/?search=${query}`
      );
      setPatientResults(res.data);
    } catch (error) {
      console.error("Patient search failed:", error);
    }
  };

  useEffect(() => {
    if (patientQuery.length > 1) {
      searchPatients(patientQuery);
    } else {
      setPatientResults([]);
    }
  }, [patientQuery]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientQuery(patient.name);
    setPatientResults([]);
  };

  // Submit test type
  const handleTestTypeSubmit = async (e) => {
    e.preventDefault();
    await axios.post(TEST_TYPE_URL, { name: testName });
    setTestName("");
    loadTestTypes();
  };

  // Submit lab record (with selected patient)
  const handleTestRecordSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      patient: selectedPatient.id,
      test_type: Number(testTypeId),
      price,
      refer_to: referTo,
    };

    await axios.post(LAB_URL, payload);

    setPatientQuery("");
    setSelectedPatient(null);
    setTestTypeId("");
    setPrice("");
    setReferTo("");
    loadLabRecords();
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Daily Income Tracker
      </h1>

      {/* Add Test Type */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Test Type</h2>

        <form onSubmit={handleTestTypeSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Test Name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <button className="bg-green-500 text-white py-2 px-4 rounded">
            Save Test Type
          </button>
        </form>
      </div>

      {/* Add Lab Test Record */}
      <div className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Add Lab Test Record</h2>

        <form onSubmit={handleTestRecordSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Patient By Name"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setSelectedPatient(null);
              }}
              className="w-full border px-4 py-2 rounded"
              required
            />

            {patientResults.length > 0 && (
              <ul className="absolute w-full bg-white border shadow rounded mt-1 z-10">
                {patientResults.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={testTypeId}
            onChange={(e) => setTestTypeId(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          >
            <option value="">Select Test Type</option>
            {testTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Refer To"
            value={referTo}
            onChange={(e) => setReferTo(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          <button className="bg-blue-500 text-white py-2 px-4 rounded">
            Save Lab Record
          </button>
        </form>
      </div>
    </div>
  );
}

export default DailyExpense;
