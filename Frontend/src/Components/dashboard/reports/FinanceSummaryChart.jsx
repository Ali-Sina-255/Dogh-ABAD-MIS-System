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
} from "recharts";

import { fetchFullReport } from "../../../../services/api";

const FinanceSummaryChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["fullReport"],
    queryFn: fetchFullReport,
    staleTime: 0, // always fresh
    refetchInterval: 10000, // auto refetch every 10 seconds
    refetchOnWindowFocus: true,
  });

  if (isError) {
    return (
      <div className="bg-white p-5 rounded shadow text-center text-red-600">
        Failed to load financial summary
      </div>
    );
  }

  const chartData = data
    ? [
        {
          name: "Financials",
          TotalIncome: data.total_income,
          Remaining: data.total_student_remaining,
          StaffSalary: data.total_staff_salary,
          Expenses: data.total_expense,
          CertificateIncome: data.total_certificate_income,
          FineIncome: data.total_fine_income,
          NetProfit: data.net_profit,
        },
      ]
    : [];

  // Tooltip formatter
  const tooltipFormatter = (value) => `AF ${value}`;

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>

      {isLoading ? (
        <Skeleton height={400} />
      ) : (
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
                  case "TotalIncome":
                    return "Total Income";

                  case "StaffSalary":
                    return "Staff Salary";
                  case "Expenses":
                    return "Expenses";
                  case "Remaining":
                    return "Remaining";
                  case "NetProfit":
                    return "Net Profit";
                  default:
                    return value;
                }
              }}
            />

            {/* Bars */}
            <Bar dataKey="TotalIncome" fill="#16a34a" />

            <Bar dataKey="StaffSalary" fill="#dc2626" />
            <Bar dataKey="Expenses" fill="#22d3ee" />

            {/* Area for Remaining */}
            <Area
              type="monotone"
              dataKey="Remaining"
              fill="#facc15"
              stroke="#facc15"
            />

            {/* Line for Net Profit */}
            <Line
              type="monotone"
              dataKey="NetProfit"
              stroke="#14b8a6"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FinanceSummaryChart;
