import React from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { fetchFullReport } from "../../../../services/api";
const COLORS = ["#16a34a", "#facc15", "#dc2626", "#22d3ee"]; // income, remaining, staff, expenses

const FinanceSummaryChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["fullReport"],
    queryFn: fetchFullReport,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
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
        { name: "Total Income", value: data.total_student_income },
        { name: "Remaining", value: data.total_student_remaining },
        { name: "Staff Salary", value: data.total_staff_salary },
        { name: "Expenses", value: data.total_expense },
      ]
    : [];

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>

      {isLoading ? (
        <Skeleton height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}

      {!isLoading && (
        <div className="flex justify-center gap-6 mt-4 text-sm">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>
                {item.name}: <strong>{item.value}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceSummaryChart;
