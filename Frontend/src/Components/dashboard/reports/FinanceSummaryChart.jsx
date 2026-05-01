import React from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { fetchHospitalFullReport } from "../../../../services/api";

// Colors for pie chart
const COLORS = ['#16a34a', '#dc2626', '#3b82f6', '#f59e0b', '#8b5cf6'];

const FinanceSummaryChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hospitalFullReport"],
    queryFn: fetchHospitalFullReport,
    staleTime: 0,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  if (isError) {
    return (
      <div className="bg-white p-5 rounded shadow text-center text-red-600">
        Failed to load hospital financial summary
      </div>
    );
  }

  // Prepare data for main chart
  const chartData = data
    ? [
        {
          name: "Financial Summary",
          LabRevenue: data.total_lab_revenue || 0,
          PharmacyRevenue: data.total_pharmacy_revenue || 0,
          ConsultationRevenue: data.total_consultation_revenue || 0,
          TotalRevenue: data.total_revenue || 0,
          OutstandingBalance: data.outstanding_balance || 0,
          Expenses: data.total_expenses || 0,
          NetProfit: data.net_profit || 0,
        },
      ]
    : [];

  // Prepare data for revenue breakdown pie chart
  const revenueBreakdown = data ? [
    { name: "Lab Tests", value: data.total_lab_revenue || 0 },
    { name: "Pharmacy", value: data.total_pharmacy_revenue || 0 },
    { name: "Consultation", value: data.total_consultation_revenue || 0 },
  ] : [];

  // Tooltip formatter
  const tooltipFormatter = (value) => `AFN ${value?.toLocaleString() || 0}`;

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Hospital Financial Summary</h2>

      {isLoading ? (
        <Skeleton height={400} />
      ) : (
        <div className="space-y-6">
          {/* Main Financial Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="center"
                wrapperStyle={{ padding: "10px 0", fontSize: "14px" }}
                formatter={(value) => {
                  switch (value) {
                    case "LabRevenue":
                      return "Lab Revenue";
                    case "PharmacyRevenue":
                      return "Pharmacy Revenue";
                    case "ConsultationRevenue":
                      return "Consultation Revenue";
                    case "TotalRevenue":
                      return "Total Revenue";
                    case "OutstandingBalance":
                      return "Outstanding Balance";
                    case "Expenses":
                      return "Expenses";
                    case "NetProfit":
                      return "Net Profit";
                    default:
                      return value;
                  }
                }}
              />

              {/* Revenue Bars */}
              <Bar dataKey="LabRevenue" fill="#16a34a" name="Lab Revenue" />
              <Bar dataKey="PharmacyRevenue" fill="#3b82f6" name="Pharmacy Revenue" />
              <Bar dataKey="ConsultationRevenue" fill="#f59e0b" name="Consultation Revenue" />
              
              {/* Total Revenue Line */}
              <Line
                type="monotone"
                dataKey="TotalRevenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Total Revenue"
              />
              
              {/* Outstanding Balance Area */}
              <Area
                type="monotone"
                dataKey="OutstandingBalance"
                fill="#facc15"
                stroke="#ca8a04"
                name="Outstanding Balance"
              />
              
              {/* Net Profit Line */}
              <Line
                type="monotone"
                dataKey="NetProfit"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Net Profit"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Revenue Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Revenue Distribution Pie Chart */}
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-3">Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Key Metrics Summary Cards */}
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-3">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="text-xl font-bold text-green-600">
                    AFN {data?.total_revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Total Expenses:</span>
                  <span className="text-xl font-bold text-red-600">
                    AFN {data?.total_expenses?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className="text-xl font-bold text-teal-600">
                    AFN {data?.net_profit?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-gray-600">Outstanding Balance:</span>
                  <span className="text-xl font-bold text-yellow-600">
                    AFN {data?.outstanding_balance?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend (Optional - if data is available) */}
          {data?.monthly_trend && data.monthly_trend.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-3">Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#16a34a" name="Monthly Revenue" />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    name="Trend"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceSummaryChart;