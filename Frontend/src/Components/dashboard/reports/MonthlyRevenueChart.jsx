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
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { fetchMonthlyRevenue } from "../../../../services/api";

const MonthlyRevenueChart = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["monthlyRevenue"],
    queryFn: fetchMonthlyRevenue,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  if (isError)
    return (
      <div className="bg-white p-5 rounded shadow text-center text-red-600">
        Failed to load monthly revenue
      </div>
    );

  // Use month_name directly from backend
  const chartData =
    data?.map((item) => ({
      month: item.month_name,
      course: item.course,
      card: item.card,
      book: item.book,
      total: item.total,
    })) || [];

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Monthly Revenue (AF)</h2>

      {isLoading ? (
        <Skeleton height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `AF ${v}`} />

            {/* Legend with formatted labels and spacing */}
            <Legend
              formatter={(value) => {
                switch (value) {
                  case "Patients":
                    return "Patients";
                  case "Visit":
                    return "Visit";

                  case "pharmacy":
                    return "pharmacy";
                  case "total":
                    return "Total Income";
                  default:
                    return value;
                }
              }}
              layout="horizontal"
              verticalAlign="top"
              align="center"
              wrapperStyle={{ padding: "10px 0", fontSize: "16px" }}
            />

            <Line
              dataKey="Patient"
              name="Patient"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              dataKey="Pharmacy"
              name="Pharmacy"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              dataKey="Visit"
              name="Visit"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              dataKey="total"
              name="Total Income"
              stroke="#16a34a"
              strokeWidth={4}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyRevenueChart;
