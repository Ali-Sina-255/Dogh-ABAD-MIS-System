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
import Doctors from "./Doctors.jsx";
import NormalStaff from "./NormalStaff.jsx";
import ReportDashboard from "./designer/Ddashboard.jsx";
import StocksList from "./StocksList.jsx";
import DailyCopyPrescription from "./DailyCopyPrescription.jsx";
import StaffManagement from "./stff/StaffManagement.jsx";

import DailyPharmacyExpense from "./dailyPharmacyExpense";
import SalaryManagement from "./salary/Salary.jsx";
const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [darkMode, setDarkMode] = useState(false);
  const [activeComponent, setActiveComponent] = useState("DashboardHome");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [subMenuStates, setSubMenuStates] = useState({
    Patients: false,
    Pharmacy: false,
    Expenses: false,
    Staff: false, // Add Staff state for toggling submenu
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
        console.error("Token is expired or not available.");
        handleLogout();
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/users/profiles/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error(
            "Failed to fetch user profile. Status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const access = {
    1: ["Dashboard", "Orders", "Add Order", "Logout"],
    3: ["Dashboard", "Orders", "Add Order", "Logout"],
    0: [
      "Dashboard",
      "User Management",
      "Website Management",
      "Reports",
      "Logout",
    ],
    2: ["Dashboard", "Patients", "Logout"],
  };

  const menuItems = {
    Dashboard: {
      component: "DashboardHome",
      icon: <MdDashboard />,
      label: "داشبورد",
    },
    Categories: {
      component: "Categories",
      icon: <FaUsers />,
      label: "بخش های فعال",
    },
    Patients: {
      icon: <FaUsers />,
      label: "بیماران",
      subMenu: [
        {
          component: "PatientsList",
          label: "لیست بیماران",
          icon: <FaUsers />,
        },
        {
          component: "RegisterPatient",
          label: "ثبت بیمار جدید",
          icon: <FaPlusCircle />,
        },
      ],
    },
    Pharmacy: {
      icon: <FaServicestack />,
      label: "داروخانه",
      subMenu: [
        {
          component: "DailyPharmacyExpense",
          label: " مصرف روزانه",
          icon: <FaClipboardList />,
        },
        {
          component: "AddPharmacy",
          label: "افزودن دارو",
          icon: <FaPlusCircle />,
        },
        {
          component: "ListPharmacy",
          label: "لیست داروها",
          icon: <FaClipboardList />,
        },
        {
          component: "CopyPrescription",
          label: "نسخه ها",
          icon: <FaClipboardList />,
        },

        {
          component: "DailyCopyPrescription",
          label: "اضافه نسخه جدید ",
          icon: <FaClipboardList />,
        },
      ],
    },
    Expenses: {
      icon: <FaClipboardList />,
      label: "هزینه‌ها",
      subMenu: [
        {
          component: "DailyExpense",
          label: "درآمد روزانه",
          icon: <FaClipboardList />,
        },
        {
          component: "TakenPrice",
          label: "پول های گرفته شده",
          icon: <FaClipboardList />,
        },
      ],
    },
    Staff: {
      icon: <FaUsers />,
      label: "کارمندان",
      subMenu: [
        {
          component: "StaffManagement",
          label: "مدریت کارمندان",
          icon: <FaUsers />,
        },
        {
          component: "SalaryManagement",
          label: "معاشات",
          icon: <FaUsers />,
        },

        {
          component: "NormalStaff",
          label: "کارمندان عادی",
          icon: <FaUsers />,
        },
      ],
    },
    Logout: {
      icon: <FaSignOutAlt />,
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
      const itemDetails = menuItems[item];
      if (itemDetails.subMenu) {
        setSubMenuStates((prev) => ({
          ...prev,
          [item]: !prev[item], // Toggle the respective submenu
        }));
      } else {
        setActiveComponent(itemDetails.component);
        setActiveSubMenu(null);
      }
    }
  };

  const renderSubMenu = (subMenu) => {
    return (
      <ul className="ml-4 space-y-2">
        {subMenu.map((subItem, index) => (
          <li
            key={index}
            className={`p-2 hover:bg-blue-500 rounded cursor-pointer ${
              activeSubMenu === subItem.label ? "bg-blue-700" : ""
            }`}
            onClick={() => handleMenuClick("Patients", subItem)} // Dynamically pass subItem
          >
            <div className="flex items-center space-x-4">
              {subItem.icon && <span>{subItem.icon}</span>}
              <span>{subItem.label}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "PatientsList":
        return <ListPharmacy />;
      case "RegisterPatient":
        return <RegisterPatients />;
      case "Categories":
        return <Categories />;
      case "Doctors":
        return <Doctors />;
      case "SalaryManagement":
        return <SalaryManagement />;
      case "NormalStaff":
        return <NormalStaff />;
      case "TakenPrice":
        return <TakenPrice />;
      case "Pharmacy":
        return <Pharmacy />;
      case "AddPharmacy":
        return <AddPharmacy />;
      case "ListPharmacy":
        return <StocksList />;
      case "DailyPharmacyExpense":
        return <DailyPharmacyExpense />;

      case "CopyPrescription":
        return <CopyPrescription />;

      case "DailyCopyPrescription":
        return <DailyCopyPrescription />;
      case "DailyExpense":
        return <DailyExpense />;
      case "StaffManagement":
        return <StaffManagement />;
      default:
        return <ReportDashboard />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error fetching profile or profile not found.</div>;
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } min-h-screen flex`}
    >
      <aside
        className={`${
          isSidebarExpanded ? "w-64" : "w-20"
        } bg-blue-600 text-white p-6 space-y-6 relative transition-width duration-300`}
      >
        <button
          onClick={() => setIsSidebarExpanded((prev) => !prev)}
          className="absolute top-4 right-4 text-2xl focus:outline-none"
        >
          <FaBars />
        </button>
        <div className="flex items-center justify-center mb-6"></div>
        <ul>
          {Object.keys(menuItems).map((item) => {
            const itemDetails = menuItems[item];
            return (
              <li key={item}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className="flex items-center space-x-4 p-2 hover:bg-blue-700 rounded w-full"
                >
                  {/* Render icon */}
                  {itemDetails.icon}

                  {/* Conditionally render label only if the sidebar is expanded */}
                  <span className={`${!isSidebarExpanded ? "hidden" : ""}`}>
                    {itemDetails.label}
                  </span>

                  {/* Render submenu indicator (arrow) */}
                  {itemDetails.subMenu && (
                    <FaChevronDown
                      className={`ml-auto ${
                        subMenuStates[item] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Render sub-menu if it's open and sidebar is expanded */}
                {subMenuStates[item] && (
                  <ul
                    className={`ml-4 space-y-2 ${
                      !isSidebarExpanded ? "hidden" : ""
                    }`}
                  >
                    {itemDetails.subMenu.map((subItem, index) => (
                      <li
                        key={index}
                        className={`p-2 hover:bg-blue-500 rounded cursor-pointer ${
                          activeSubMenu === subItem.label ? "bg-blue-700" : ""
                        }`}
                        onClick={() => handleMenuClick(item, subItem)} // Dynamically pass subItem
                      >
                        <div className="flex items-center space-x-4">
                          {subItem.icon && <span>{subItem.icon}</span>}
                          <span
                            className={`${!isSidebarExpanded ? "hidden" : ""}`}
                          >
                            {subItem.label}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex-1">
        <nav className="flex justify-between items-center p-4 shadow-md bg-white">
          <button
            onClick={() => setDarkMode((prevMode) => !prevMode)}
            className="text-2xl"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-blue-600" />
            )}
          </button>

          <div className="flex items-center cursor-pointer">
            Welcome dear !{username}
          </div>
        </nav>
        <main className="flex-1 p-6">{renderComponent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
