import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { fetchHospitalMonthlyRevenue } from "../../../../services/api";

const MonthlyRevenueChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hospitalMonthlyRevenue"],
    queryFn: fetchHospitalMonthlyRevenue,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  if (isError)
    return (
      <div className="bg-white p-5 rounded shadow text-center text-red-600">
        Failed to load monthly revenue data
      </div>
    );

  // Transform data for the chart
  const chartData = data?.revenues?.map((item) => ({
    month: item.month,
    lab: item.lab_revenue || 0,
    pharmacy: item.pharmacy_revenue || 0,
    total: item.total || 0,
  })) || [];

  // Calculate totals for summary
  const totalLab = chartData.reduce((sum, item) => sum + item.lab, 0);
  const totalPharmacy = chartData.reduce((sum, item) => sum + item.pharmacy, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend (AFN)</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Lab Revenue</p>
          <p className="text-xl font-bold text-blue-600">
            AFN {totalLab.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Pharmacy Revenue</p>
          <p className="text-xl font-bold text-orange-600">
            AFN {totalPharmacy.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">
            AFN {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton height={300} />
      ) : chartData.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No revenue data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                const formattedValue = `AFN ${value?.toLocaleString() || 0}`;
                const displayName = name === 'lab' ? 'Lab Tests' : 
                                   name === 'pharmacy' ? 'Pharmacy' : 
                                   name === 'total' ? 'Total Revenue' : name;
                return [formattedValue, displayName];
              }}
            />
            
            <Legend 
              formatter={(value) => {
                switch (value) {
                  case "lab":
                    return "Lab Tests Revenue";
                  case "pharmacy":
                    return "Pharmacy Revenue";
                  case "total":
                    return "Total Revenue";
                  default:
                    return value;
                }
              }}
              layout="horizontal"
              verticalAlign="top"
              align="center"
              wrapperStyle={{ padding: "10px 0", fontSize: "14px" }}
            />

            <Bar
              dataKey="lab"
              name="lab"
              fill="#2563eb"
              barSize={30}
            />
            <Bar
              dataKey="pharmacy"
              name="pharmacy"
              fill="#f97316"
              barSize={30}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="total"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyRevenueChart;