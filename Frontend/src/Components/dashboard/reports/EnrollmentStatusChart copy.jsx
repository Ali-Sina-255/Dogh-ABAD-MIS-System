import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";

const COLORS = ["#16a34a", "#2563eb", "#dc2626", "#facc15"]; // green, blue, red, yellow

const FinanceSummaryChart = ({ fetchFullReport }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["fullReport"],
    queryFn: fetchFullReport,
    staleTime: 5 * 60 * 1000,
  });

  if (isError) {
    return (
      <div className="bg-white p-5 rounded shadow text-center text-red-600">
        Failed to load financial summary
      </div>
    );
  }

  // Prepare chart data
  const chartData =
    !isLoading && data
      ? [
          { name: "Student Income", value: Number(data.total_student_income) },
          { name: "Staff Salary", value: Number(data.total_staff_salary) },
          { name: "Expenses", value: Number(data.total_expense) },
          { name: "Remaining", value: Number(data.total_student_remaining) },
        ]
      : [];

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Finance Summary</h2>

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
            <Tooltip
              formatter={(value) => new Intl.NumberFormat().format(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {!isLoading && (
        <div className="flex justify-center gap-6 mt-4 text-sm flex-wrap">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>
                {item.name}:{" "}
                <strong>{Number(item.value).toLocaleString()}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceSummaryChart;
