import React from "react";
import {
  FaUsers,
  FaBookOpen,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaSyncAlt,
} from "react-icons/fa";
import { PiChartLineUp } from "react-icons/pi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import MonthlyRevenueChart from "../reports/MonthlyRevenueChart";
import FinanceSummaryChart from "../reports/FinanceSummaryChart";

import {
  fetchDashboardSummary,
  fetchRecentEnrollments,
  fetchMonthlyRevenue,
} from "../../../../services/api";

// ---------------- Main Dashboard ----------------
const MonthlyDashboardContent = ({ setActiveComponent }) => {
  const queryClient = useQueryClient();

  // Dashboard summary - auto refetch every 10 seconds
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorObj,
    isFetching: summaryFetching,
  } = useQuery({
    queryKey: ["courseDashboardSummary"],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // auto-update every 10s
  });

  // Recent enrollments - auto refetch every 10 seconds
  const {
    data: recentEnrollments = [],
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    error: enrollmentsErrorObj,
    isFetching: enrollmentsFetching,
  } = useQuery({
    queryKey: ["recentEnrollments"],
    queryFn: fetchRecentEnrollments,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchInterval: 10000, // auto-update every 10s
  });

  const isLoading = summaryLoading || enrollmentsLoading;
  const isFetching = summaryFetching || enrollmentsFetching;
  const hasError = summaryError || enrollmentsError;

  // Manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["courseDashboardSummary"] });
    queryClient.invalidateQueries({ queryKey: ["recentEnrollments"] });
  };

  if (hasError) {
    console.error("Dashboard Error:", summaryErrorObj || enrollmentsErrorObj);
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow"
        >
          <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
          <span>{isFetching ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
        <StatCard
          title="Students"
          value={summary?.students}
          icon={<FaUsers />}
          loading={isLoading}
          bg="bg-blue-100"
        />
        <StatCard
          title="Active Classes"
          value={summary?.classes}
          icon={<FaBookOpen />}
          loading={isLoading}
          bg="bg-green-100"
        />
        <StatCard
          title="Teachers"
          value={summary?.teachers}
          icon={<FaChalkboardTeacher />}
          loading={isLoading}
          bg="bg-orange-100"
        />
        <StatCard
          title="Total Revenue"
          value={`AF ${summary?.yearly_revenue}`}
          icon={<FaMoneyBillWave />}
          loading={isLoading}
          bg="bg-emerald-100"
        />
        <StatCard
          title="Yearly Remaining"
          value={`AF ${summary?.yearly_remaining}`}
          icon={<PiChartLineUp />}
          loading={isLoading}
          bg="bg-purple-100"
        />
        <StatCard
          title="Yearly Revenue"
          value={`AF ${summary?.yearly_revenue}`}
          icon={<PiChartLineUp />}
          loading={isLoading}
          bg="bg-purple-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MonthlyRevenueChart fetchMonthlyRevenue={fetchMonthlyRevenue} />
        <FinanceSummaryChart />
      </div>

      {/* Recent Enrollments */}
      <RecentEnrollmentsTable
        data={recentEnrollments}
        loading={enrollmentsLoading}
        setActiveComponent={setActiveComponent}
      />
    </div>
  );
};

// ---------------- Sub-components ----------------
const StatCard = ({ title, value, icon, loading, bg }) => (
  <div className="bg-white p-4 rounded shadow flex items-center gap-4">
    <div className={`${bg} p-3 rounded text-xl`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <Skeleton width={80} />
      ) : (
        <h2 className="text-xl font-bold">{value}</h2>
      )}
    </div>
  </div>
);

const RecentEnrollmentsTable = ({ data, loading, setActiveComponent }) => (
  <div className="bg-white p-5 rounded shadow">
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Recent Enrollments</h2>
      <button
        onClick={() => setActiveComponent("enrollments")}
        className="text-blue-600 text-sm"
      >
        View All
      </button>
    </div>

    {loading ? (
      <Skeleton count={5} height={50} />
    ) : (
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-2">Student</th>
            <th className="p-2">Class</th>
            <th className="p-2">Teacher</th>
            <th className="p-2">Paid</th>
            <th className="p-2">Remaining</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-medium">{e.student_info?.name}</td>
              <td className="p-2">{e.class_name}</td>
              <td className="p-2">
                {Array.isArray(e.teachers) ? e.teachers.join(", ") : e.teachers}
              </td>
              <td className="p-2">AF {e.paid_amount}</td>
              <td className="p-2">AF {e.remaining_fee}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    e.remaining_fee === 0
                      ? "bg-green-100 text-green-800"
                      : e.paid_amount > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {e.remaining_fee === 0
                    ? "PAID"
                    : e.paid_amount > 0
                      ? "PARTIAL"
                      : "UNPAID"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default MonthlyDashboardContent;
