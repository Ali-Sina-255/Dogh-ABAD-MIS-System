import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaBars,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaChevronDown,
  FaServicestack,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import jwt_decode from "jwt-decode";

import RegisterPatients from "./RegisterPatients";
import Categories from "./CategotySection.jsx";
import Pharmacy from "./Pharmacy.jsx";
import AddPharmacy from "./AddPharmacy";
import ListPharmacy from "./ListPharmacy";
import CopyPrescription from "./CopyPrescription";
import TakenPrice from "./TakenPrice.jsx";
import DailyExpense from "./DailyExpense.jsx";
import StaffManagement from "./stff/StaffManagement.jsx";
import SalaryManagement from "./salary/Salary.jsx";
import StocksList from "./StocksList.jsx";
import DailyCopyPrescription from "./DailyCopyPrescription.jsx";

// Chart.js imports
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [darkMode, setDarkMode] = useState(false);
  const [activeComponent, setActiveComponent] = useState("DashboardHome");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const [subMenuStates, setSubMenuStates] = useState({
    Categories: false,
    Patients: false,
    Pharmacy: false,
    Expenses: false,
    Staff: false,
  });

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token || isTokenExpired(token)) {
        handleLogout();
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/users/profiles/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const menuItems = {
    Dashboard: {
      component: "DashboardHome",
      icon: <MdDashboard className="text-3xl" />,
      label: "داشبورد",
    },
    Categories: {
      icon: <FaUsers className="text-3xl" />,
      label: "بخش‌ها",
      subMenu: [
        {
          component: "Categories",
          label: "نمایش بخش‌ها",
          icon: <FaUsers className="text-2xl" />,
        },
      ],
    },
    Patients: {
      icon: <FaUsers className="text-3xl" />,
      label: "بیماران",
      subMenu: [
        {
          component: "PatientsList",
          label: "لیست بیماران",
          icon: <FaUsers className="text-2xl" />,
        },
        {
          component: "RegisterPatient",
          label: "ثبت بیمار جدید",
          icon: <FaPlusCircle className="text-2xl" />,
        },
      ],
    },
    Pharmacy: {
      icon: <FaServicestack className="text-3xl" />,
      label: "داروخانه",
      subMenu: [
        {
          component: "AddPharmacy",
          label: "افزودن دارو",
          icon: <FaPlusCircle className="text-2xl" />,
        },
        {
          component: "ListPharmacy",
          label: "لیست داروها",
          icon: <FaClipboardList className="text-2xl" />,
        },
        {
          component: "CopyPrescription",
          label: "نسخه‌ها",
          icon: <FaClipboardList className="text-2xl" />,
        },
        {
          component: "DailyCopyPrescription",
          label: "اضافه نسخه جدید",
          icon: <FaClipboardList className="text-2xl" />,
        },
      ],
    },
    Expenses: {
      icon: <FaClipboardList className="text-3xl" />,
      label: "هزینه‌ها",
      subMenu: [
        {
          component: "DailyExpense",
          label: "درآمد روزانه",
          icon: <FaClipboardList className="text-2xl" />,
        },
        {
          component: "TakenPrice",
          label: "پول‌های گرفته شده",
          icon: <FaClipboardList className="text-2xl" />,
        },
      ],
    },
    Staff: {
      icon: <FaUsers className="text-3xl" />,
      label: "کارمندان",
      subMenu: [
        {
          component: "StaffManagement",
          label: "مدیریت کارمندان",
          icon: <FaUsers className="text-2xl" />,
        },
        {
          component: "SalaryManagement",
          label: "معاشات",
          icon: <FaUsers className="text-2xl" />,
        },
        {
          component: "NormalStaff",
          label: "کارمندان عادی",
          icon: <FaUsers className="text-2xl" />,
        },
      ],
    },
    Logout: {
      icon: <FaSignOutAlt className="text-3xl" />,
      label: "خروج",
    },
  };

  const handleMenuClick = (item, subItem = null) => {
    if (item === "Logout") {
      handleLogout();
    } else if (subItem) {
      setActiveComponent(subItem.component);
      setActiveSubMenu(subItem.label);
    } else {
      setSubMenuStates((prev) => ({
        ...prev,
        [item]: !prev[item],
      }));
    }
  };

  const sampleChartData = {
    labels: [
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
      "یکشنبه",
    ],
    datasets: [
      {
        label: "بیماران جدید",
        data: [12, 19, 8, 14, 20, 16, 25],
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "درآمد ($)",
        data: [200, 450, 300, 500, 650, 400, 700],
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "هزینه‌ها ($)",
        data: [150, 300, 200, 400, 350, 300, 500],
        borderColor: "rgba(239,68,68,1)",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "نمای کلی هفته" },
    },
    scales: {
      x: { ticks: { autoSkip: false } },
      y: { beginAtZero: true },
    },
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "PatientsList":
        return <ListPharmacy />;
      case "RegisterPatient":
        return <RegisterPatients />;
      case "Categories":
        return <Categories />;
      case "SalaryManagement":
        return <SalaryManagement />;
      case "Pharmacy":
        return <Pharmacy />;
      case "AddPharmacy":
        return <AddPharmacy />;
      case "ListPharmacy":
        return <StocksList />;
      case "CopyPrescription":
        return <CopyPrescription />;
      case "DailyCopyPrescription":
        return <DailyCopyPrescription />;
      case "DailyExpense":
        return <DailyExpense />;
      case "TakenPrice":
        return <TakenPrice />;
      case "StaffManagement":
        return <StaffManagement />;
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md flex-1 h-full">
            <Line data={sampleChartData} options={chartOptions} />
          </div>
        );
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div
      dir="rtl"
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } min-h-screen flex overflow-hidden`}
    >
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarExpanded ? "w-64" : "w-20"
        } fixed top-0 right-0 h-full bg-blue-600 text-white p-6 space-y-6 transition-all duration-300`}
      >
        <button
          onClick={() => setIsSidebarExpanded((p) => !p)}
          className="absolute top-4 left-4 text-3xl"
        >
          <FaBars />
        </button>

        <ul className="mt-16">
          {Object.keys(menuItems).map((item) => {
            const entry = menuItems[item];
            return (
              <li key={item}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className="flex items-center gap-4 p-3 hover:bg-blue-700 rounded w-full"
                >
                  <span>{entry.icon}</span>
                  <span className={`${!isSidebarExpanded ? "hidden" : ""}`}>
                    {entry.label}
                  </span>
                  {entry.subMenu && (
                    <FaChevronDown
                      className={`mr-auto transition-transform duration-200 ${
                        subMenuStates[item] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {entry.subMenu && subMenuStates[item] && (
                  <ul
                    className={`mt-2 space-y-2 ${
                      !isSidebarExpanded ? "hidden" : ""
                    } flex flex-col items-center`}
                  >
                    {entry.subMenu.map((subItem, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleMenuClick(item, subItem)}
                          className={`flex items-center justify-center gap-3 p-3 rounded w-full max-w-[200px] hover:bg-blue-500 ${
                            activeSubMenu === subItem.label ? "bg-blue-700" : ""
                          }`}
                        >
                          <span className="text-2xl">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Content */}
      <div
        className={`flex-1 mr-64 ${
          !isSidebarExpanded ? "mr-20" : ""
        } flex flex-col`}
      >
        {/* Topbar */}
        <nav className="fixed top-0 right-64 w-full max-w-full md:max-w-[calc(100%-16rem)] bg-white shadow-md flex justify-between items-center p-4 z-10 transition-all duration-300">
          <button onClick={() => setDarkMode((p) => !p)} className="text-2xl">
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-blue-600" />
            )}
          </button>
          <div>خوش آمدید! {username}</div>
        </nav>

        {/* Main content */}
        <main className="mt-20 p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
          {/* Render component */}
          <div className="flex-1 flex overflow-hidden">{renderComponent()}</div>
        </main>
      </div>
    </div> 
  );
};

export default Dashboard;
