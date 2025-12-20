import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ReportSummary = ({ reportType }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `http://127.0.0.1:8000/reports/api/v1/reports/?type=${reportType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType]);

  if (loading)
    return (
      <div className="flex-1 flex justify-center items-center">
        در حال بارگذاری...
      </div>
    );
  if (!reportData)
    return (
      <div className="flex-1 flex justify-center items-center">
        هیچ گزارشی موجود نیست.
      </div>
    );

  const { patients_registered, income, expenses, net_profit } = reportData.data;

  const chartData = {
    labels: ["درآمد کل", "هزینه کل", "سود/زیان خالص"],
    datasets: [
      {
        label: "گزارش خلاصه",
        data: [income.total_income, expenses.total_expenses, net_profit],
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
        hoverOffset: 30,
      },
    ],
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-4">
        {reportType === "daily"
          ? "گزارش روزانه"
          : reportType === "weekly"
          ? "گزارش هفتگی"
          : "گزارش ماهانه"}
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Chart */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: "خلاصه گزارش" },
              },
            }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">جزئیات گزارش</h3>
          <p>
            تعداد بیماران ثبت شده: <strong>{patients_registered}</strong>
          </p>
          <p>
            درآمد کل: <strong>{income.total_income}</strong>
          </p>
          <p>
            هزینه کل: <strong>{expenses.total_expenses}</strong>
          </p>
          <p>
            سود/زیان خالص: <strong>{net_profit}</strong>
          </p>
          <h4 className="mt-4 font-semibold">استفاده از داروها</h4>
          <ul className="list-disc list-inside">
            {reportData.data.stock_usage.map((item, index) => (
              <li key={index}>
                {item.drug__name}: {item.total_used}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
