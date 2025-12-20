import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Report = ({ reportType }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/reports/api/v1/reports/?type=${reportType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to fetch report");

        const json = await response.json();
        setReportData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType]);

  if (loading) return <div>در حال بارگذاری گزارش...</div>;
  if (!reportData) return <div>هیچ گزارشی موجود نیست.</div>;

  const { data } = reportData;

  // Chart for Income vs Expenses
  const financialChart = {
    labels: [
      "داروخانه",
      "آزمایشگاه",
      "پول‌های گرفته شده",
      "هزینه‌های روزانه",
      "هزینه داروخانه",
      "حقوق کارکنان",
    ],
    datasets: [
      {
        label: "درآمد",
        data: [
          data.income.pharmacy_sales,
          data.income.lab_tests,
          data.income.taken_price,
          0,
          0,
          0,
        ],
        backgroundColor: "rgba(34,197,94,0.5)",
      },
      {
        label: "هزینه‌ها",
        data: [
          0,
          0,
          0,
          data.expenses.daily_expense,
          data.expenses.pharmacy_expense,
          data.expenses.staff_salary,
        ],
        backgroundColor: "rgba(239,68,68,0.5)",
      },
    ],
  };

  const financialOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "درآمد و هزینه‌ها" },
    },
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold">
        گزارش{" "}
        {reportType === "daily"
          ? "روزانه"
          : reportType === "weekly"
          ? "هفتگی"
          : "ماهانه"}
      </h2>

      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="font-semibold mb-2">خلاصه</h3>
        <p>تعداد بیماران ثبت شده: {data.patients_registered}</p>
        <p>درآمد کل: {data.income.total_income}</p>
        <p>هزینه کل: {data.expenses.total_expenses}</p>
        <p>سود/زیان خالص: {data.net_profit}</p>
      </div>

      <div className="bg-white p-4 rounded shadow-md h-80">
        <Bar data={financialChart} options={financialOptions} />
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="font-semibold mb-2">استفاده از داروها</h3>
        <table className="w-full text-right border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">نام دارو</th>
              <th className="border p-2">مقدار استفاده شده</th>
            </tr>
          </thead>
          <tbody>
            {data.stock_usage.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.drug__name}</td>
                <td className="border p-2">{item.total_used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
