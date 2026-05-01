import React from "react";
import {
  FaUsers,
  FaPills,
  FaFlask,
  FaMoneyBillWave,
  FaSyncAlt,
  FaUserMd,
  FaProcedures,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { PiChartLineUp } from "react-icons/pi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import MonthlyRevenueChart from "../reports/MonthlyRevenueChart";
import FinanceSummaryChart from "../reports/FinanceSummaryChart";

import {
  fetchHospitalDashboardSummary,
  fetchRecentPatients,
  fetchRecentLabTests,
  fetchRecentPharmaceuticals,
  fetchHospitalMonthlyRevenue,
} from "../../../../services/api";

// ---------------- Main Dashboard ----------------
const HospitalDashboardContent = ({ setActiveComponent }) => {
  const queryClient = useQueryClient();

  // Dashboard summary - auto refetch every 10 seconds
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorObj,
    isFetching: summaryFetching,
  } = useQuery({
    queryKey: ["hospitalDashboardSummary"],
    queryFn: fetchHospitalDashboardSummary,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  // Recent patients - auto refetch every 10 seconds
  const {
    data: recentPatients = [],
    isLoading: patientsLoading,
    isError: patientsError,
    error: patientsErrorObj,
    isFetching: patientsFetching,
  } = useQuery({
    queryKey: ["recentPatients"],
    queryFn: fetchRecentPatients,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchInterval: 10000,
  });

  // Recent lab tests
  const {
    data: recentLabTests = [],
    isLoading: labTestsLoading,
  } = useQuery({
    queryKey: ["recentLabTests"],
    queryFn: fetchRecentLabTests,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchInterval: 10000,
  });

  // Recent pharmaceuticals
  const {
    data: recentPharmaceuticals = [],
    isLoading: pharmaceuticalsLoading,
  } = useQuery({
    queryKey: ["recentPharmaceuticals"],
    queryFn: fetchRecentPharmaceuticals,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchInterval: 10000,
  });

  const isLoading = summaryLoading || patientsLoading || labTestsLoading || pharmaceuticalsLoading;
  const isFetching = summaryFetching || patientsFetching;
  const hasError = summaryError || patientsError;

  // Manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["hospitalDashboardSummary"] });
    queryClient.invalidateQueries({ queryKey: ["recentPatients"] });
    queryClient.invalidateQueries({ queryKey: ["recentLabTests"] });
    queryClient.invalidateQueries({ queryKey: ["recentPharmaceuticals"] });
  };

  if (hasError) {
    console.error("Dashboard Error:", summaryErrorObj || patientsErrorObj);
    return (
      <div className="p-6 min-h-screen flex items-start justify-center">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Dashboard Error
          </h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow"
        >
          <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
          <span>{isFetching ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          title="Total Patients"
          value={summary?.total_patients}
          icon={<FaUsers />}
          loading={isLoading}
          bg="bg-blue-100"
        />
        <StatCard
          title="Today's Patients"
          value={summary?.today_patients}
          icon={<FaProcedures />}
          loading={isLoading}
          bg="bg-green-100"
        />
        <StatCard
          title="Lab Tests"
          value={summary?.total_lab_tests}
          icon={<FaFlask />}
          loading={isLoading}
          bg="bg-purple-100"
        />
        <StatCard
          title="Prescriptions"
          value={summary?.total_prescriptions}
          icon={<FaPills />}
          loading={isLoading}
          bg="bg-orange-100"
        />
        <StatCard
          title="Total Revenue"
          value={`AFN ${summary?.total_revenue}`}
          icon={<FaMoneyBillWave />}
          loading={isLoading}
          bg="bg-emerald-100"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Lab Revenue"
          value={`AFN ${summary?.lab_revenue}`}
          icon={<FaFlask />}
          loading={isLoading}
          bg="bg-indigo-100"
        />
        <StatCard
          title="Pharmacy Revenue"
          value={`AFN ${summary?.pharmacy_revenue}`}
          icon={<FaPills />}
          loading={isLoading}
          bg="bg-pink-100"
        />
        <StatCard
          title="Consultation Fee"
          value={`AFN ${summary?.consultation_revenue}`}
          icon={<FaUserMd />}
          loading={isLoading}
          bg="bg-yellow-100"
        />
        <StatCard
          title="Outstanding Balance"
          value={`AFN ${summary?.outstanding_balance}`}
          icon={<FaFileInvoiceDollar />}
          loading={isLoading}
          bg="bg-red-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart fetchMonthlyRevenue={fetchHospitalMonthlyRevenue} />
        <FinanceSummaryChart />
      </div>

      {/* Recent Patients Table - Showing only 5 items */}
      <RecentPatientsTable
        data={recentPatients.slice(0, 10)}  // Only show first 5
        allData={recentPatients}  // Pass full data for "View All"
        loading={patientsLoading}
        setActiveComponent={setActiveComponent}
      />

      {/* Recent Lab Tests & Pharmaceuticals - Each showing only 5 items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentLabTestsTable
          data={recentLabTests.slice(0, 10)}  // Only show first 5
          allData={recentLabTests}  // Pass full data for "View All"
          loading={labTestsLoading}
          setActiveComponent={setActiveComponent}
        />
        <RecentPharmaceuticalsTable
          data={recentPharmaceuticals.slice(0, 10)}  // Only show first 5
          allData={recentPharmaceuticals}  // Pass full data for "View All"
          loading={pharmaceuticalsLoading}
          setActiveComponent={setActiveComponent}
        />
      </div>
    </div>
  );
};

// ---------------- Stat Card Component ----------------
const StatCard = ({ title, value, icon, loading, bg }) => (
  <div className="bg-white p-4 rounded shadow flex items-center gap-4">
    <div className={`${bg} p-3 rounded text-xl`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <Skeleton width={80} />
      ) : (
        <h2 className="text-xl font-bold">{value?.toLocaleString() || 0}</h2>
      )}
    </div>
  </div>
);

// ---------------- Recent Patients Table ----------------
const RecentPatientsTable = ({ data, loading, setActiveComponent, allData }) => {
  const totalCount = allData?.length || 0;
  
  return (
    <div className="bg-white p-5 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Patients</h2>
          <p className="text-sm text-gray-500">Showing {data.length} of {totalCount} patients</p>
        </div>
        <button
          onClick={() => setActiveComponent("patients")}
          className="text-blue-600 text-sm hover:text-blue-800"
        >
          View All ({totalCount})
        </button>
      </div>

      {loading ? (
        <Skeleton count={5} height={50} />
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No patients found</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 text-right">Patient Name</th>
              <th className="p-2 text-right">Age</th>
              <th className="p-2 text-right">Category</th>
              <th className="p-2 text-right">Patient Type</th>
              <th className="p-2 text-right">Fee</th>
              <th className="p-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((patient) => (
              <tr key={patient.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{patient.name}</td>
                <td className="p-2">{patient.age || "-"}</td>
                <td className="p-2">{patient.category?.name || "-"}</td>
                <td className="p-2">{patient.patient_type}</td>
                <td className="p-2 text-green-600 font-semibold">
                  AFN {patient.fee?.toLocaleString() || 0}
                </td>
                <td className="p-2 text-gray-500">{patient.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ---------------- Recent Lab Tests Table ----------------
const RecentLabTestsTable = ({ data, loading, setActiveComponent, allData }) => {
  const totalCount = allData?.length || 0;
  
  return (
    <div className="bg-white p-5 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Lab Tests</h2>
          <p className="text-sm text-gray-500">Showing {data.length} of {totalCount} tests</p>
        </div>
        <button
          onClick={() => setActiveComponent("lab-tests")}
          className="text-blue-600 text-sm hover:text-blue-800"
        >
          View All ({totalCount})
        </button>
      </div>

      {loading ? (
        <Skeleton count={5} height={50} />
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No lab tests found</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 text-right">Patient</th>
              <th className="p-2 text-right">Test Type</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Referred By</th>
              <th className="p-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((test) => (
              <tr key={test.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{test.patient?.name || "-"}</td>
                <td className="p-2">{test.test_type?.name || "-"}</td>
                <td className="p-2 text-green-600 font-semibold">
                  AFN {test.price?.toLocaleString()}
                </td>
                <td className="p-2">{test.refer_to || "-"}</td>
                <td className="p-2 text-gray-500">{test.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ---------------- Recent Pharmaceuticals Table ----------------
const RecentPharmaceuticalsTable = ({ data, loading, setActiveComponent, allData }) => {
  const totalCount = allData?.length || 0;
  
  return (
    <div className="bg-white p-5 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Prescriptions</h2>
          <p className="text-sm text-gray-500">Showing {data.length} of {totalCount} prescriptions</p>
        </div>
        <button
          onClick={() => setActiveComponent("pharmaceuticals")}
          className="text-blue-600 text-sm hover:text-blue-800"
        >
          View All ({totalCount})
        </button>
      </div>

      {loading ? (
        <Skeleton count={5} height={80} />
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No prescriptions found</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 text-right">Patient</th>
              <th className="p-2 text-right">Doctor</th>
              <th className="p-2 text-right">Medications</th>
              <th className="p-2 text-right">Total Price</th>
              <th className="p-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((prescription) => (
              <tr key={prescription.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">
                  {prescription.patient_name?.name || "-"}
                </td>
                <td className="p-2">
                  {prescription.doctor_name?.name || "-"}
                </td>
                <td className="p-2">
                  <div className="space-y-1">
                    {prescription.drugs?.slice(0, 2).map((drug, idx) => (
                      <div key={idx} className="text-xs">
                        {drug.name} x {drug.amount_used}
                      </div>
                    ))}
                    {prescription.drugs?.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{prescription.drugs.length - 2} more
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 text-green-600 font-semibold">
                  AFN {prescription.price?.toLocaleString() || 0}
                </td>
                <td className="p-2 text-gray-500">{prescription.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HospitalDashboardContent;