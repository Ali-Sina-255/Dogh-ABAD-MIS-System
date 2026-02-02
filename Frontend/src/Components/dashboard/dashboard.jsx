import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";

// Icons
import { MdPermDeviceInformation } from "react-icons/md";
import {
  FaUsers,
  FaMoneyBillWave,
  FaChartBar,
  FaSignOutAlt,
  FaChevronDown,
  FaBlog,
  FaSlidersH,
  FaBars,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

// Components
import UserManagement from "./Admin/UserManagement";
import TeacherLevelManagement from "./Admin/TeacherLevelManagement.jsx";
import WebBlog from "./Admin/WebBlog";
import Slider from "./Admin/Slider";

import DailyExpense from "./Finance/DailyExpense.jsx";

import Payrolls from "./Finance/Payrolls.jsx";
import AddPharmacy from "./Pharmacy/AddPharmacy.jsx";
import Prescription from "./Pharmacy/Prescription.jsx";
import Fine from "./Finance/Fine.jsx";
import WellcomePage from "./wellcomePage.jsx";
import MonthlyEnrollManagement from "../courses/enrollments/MonthlyEnrolleManagement.jsx";
import MonthlyDashboard from "./Admin/MonthlyDashboard.jsx";
import LabManager from "./Finance/LabManager.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();

  // ---------------- States ----------------
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole ? [parseInt(storedRole)] : [0];
  });
  const [activeComponent, setActiveComponent] = useState("MonthlyDashboard");
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isWebsiteManagementOpen, setIsWebsiteManagementOpen] = useState(false);
  const [isFinanceManagementOpen, setIsFinanceManagementOpen] = useState(false);
  const [isMonthlyManagement, setIsMonthlyManagement] = useState(false);
  const [isStaffManagement, setIsStaffManagement] = useState(false);
  const [isPharmacy, setIsPharmacy] = useState(false);
  const [isDiagnosis, setIsDiagnosis] = useState(false);
  const [user, setUser] = useState({});
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [classes, setClasses] = useState([]);

  // ---------------- Logout ----------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const checkSessionExpiration = () => {
    const loginTimestamp = localStorage.getItem("login_timestamp");
    if (loginTimestamp) {
      const elapsedTime = new Date().getTime() - parseInt(loginTimestamp, 10);
      if (elapsedTime >= 43200000) handleLogout();
    }
  };

  useEffect(() => {
    checkSessionExpiration();
  }, [loading, activeComponent, isProfilePopupOpen]);

  // ---------------- Fetch user profile ----------------
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return handleLogout();

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const email = localStorage.getItem("email");

    try {
      const response = await axios.get(`${BASE_URL}/users/profile/${email}/`);
      if (response.status === 200) setUserImage(response.data.profile_pic);
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [isProfilePopupOpen]);

  // ---------------- Fetch Classes ----------------
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/courses/classes/`);
      setClasses(res.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ---------------- Sidebar items ----------------
  const websiteManagementItems = [
    {
      component: "WebBlog",
      label: "مدیریت وبلاگ",
      icon: <FaBlog />,
      element: <WebBlog />,
    },
    {
      component: "Slider",
      label: "بخش بیماران",
      icon: <FaSlidersH />,
      element: <Slider />,
    },
  ];

  const Pharmacy = [
    {
      component: "AddPharmacy",
      label: "داروخانه",
      icon: <FaChartBar />,
      element: <AddPharmacy />,
    },
    {
      component: "Prescription",
      label: "نسخه‌ها",
      icon: <FaChartBar />,
      element: <Prescription />,
    },
  ];

  const Diagnosis = [
    {
      component: "Fine",
      label: "تشخیص",
      icon: <FaMoneyBillWave />,
      element: <Fine />,
    },
    {
      component: "LabManager",
      label: "مدیریت تشخیص",
      icon: <FaMoneyBillWave />,
      element: <LabManager />,
    },
  ];

  const financeManagementItems = [
    {
      component: "DailyExpense",
      label: "هزینه روزانه",
      icon: <FaMoneyBillWave />,
      element: <DailyExpense />,
    },
    {
      component: "Payrolls",
      label: "حقوق و دستمزد",
      icon: <FaChartBar />,
      element: <Payrolls />,
    },
  ];

  const monthlyManagementItems = [
    {
      component: "MonthlyDashboard",
      label: "داشبورد ماهانه",
      icon: <FaMoneyBillWave />,
      element: <MonthlyDashboard />,
    },
  ];

  const staffManagement = [
    {
      component: "UserManagement",
      label: "کارمندان",
      icon: <FaUsers />,
      element: <UserManagement />,
    },
    {
      component: "TeacherLevelManagement",
      label: "سطح کارکنان",
      icon: <FaUsers />,
      element: <TeacherLevelManagement />,
    },
  ];

  // ---------------- Render main component ----------------
  const renderComponent = () => {
    const allItems = [
      ...websiteManagementItems,
      ...Pharmacy,
      ...Diagnosis,
      ...financeManagementItems,
      ...monthlyManagementItems,
      ...staffManagement,
    ];
    const found = allItems.find((item) => item.component === activeComponent);
    return found && found.element ? found.element : <WellcomePage />;
  };

  // ---------------- Loader ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader mr-3"></div>
        <span className="text-xl font-semibold">در حال بارگذاری...</span>
        <style jsx>{`
          .loader {
            width: 40px;
            height: 40px;
            border: 4px solid #16a34a;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-800 h-screen w-full flex flex-col">
      {/* Navbar */}
      <nav className="flex fixed right-0 left-0 bg-green top-0 justify-between items-center p-4 z-10">
        <div className="lg:flex items-center hidden gap-x-5">
          <Link to="/" className="text-white font-bold text-2xl">
            بیمارستان تخصصی آقای ابوالفضل
          </Link>
        </div>
        <div className="flex items-center gap-x-4">
          <p className="font-serif text-2xl text-white font-bold">
            {localStorage.getItem("username")}
          </p>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
          >
            {userImage ? (
              <img
                src={userImage}
                alt="User"
                className="w-10 h-10 rounded-full border-2"
              />
            ) : (
              <CgProfile
                size={28}
                className="text-gray-700 hover:text-green-500"
              />
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar + Main */}
      <div className="flex flex-1 pt-[74px] overflow-hidden">
        <aside
          className={`bg-white text-gray-900 py-3 ${
            isSideOpen ? "w-[60%] md:w-[35%] z-20" : "w-[60px] lg:w-[250px]"
          } lg:flex flex-col fixed top-0 h-screen px-5 md:relative transition-all duration-300`}
        >
          <div className="w-full space-y-1 overflow-hidden">
            <button
              onClick={() => setIsSideOpen(!isSideOpen)}
              className="lg:hidden text-2xl focus:outline-none"
            >
              <FaBars />
            </button>

            {/* Website Management */}
            {/* مدیریت وب‌سایت */}
            <li className="flex flex-col space-y-1">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() =>
                  setIsWebsiteManagementOpen(!isWebsiteManagementOpen)
                }
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaUsers />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    مدیریت وب‌سایت
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isWebsiteManagementOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isWebsiteManagementOpen &&
                websiteManagementItems.map((item) => (
                  <div
                    key={item.component}
                    className={`flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer ${
                      activeComponent === item.component
                        ? "bg-green text-white"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* مدیریت آزمایشگاه */}
            <li className="flex flex-col space-y-1">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() => setIsDiagnosis(!isDiagnosis)}
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaUsers />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    مدیریت آزمایشگاه
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isDiagnosis ? "rotate-180" : ""}`}
                />
              </div>
              {isDiagnosis &&
                Diagnosis.map((item) => (
                  <div
                    key={item.component}
                    className={`flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer ${
                      activeComponent === item.component
                        ? "bg-green text-white"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* داروخانه */}
            <li className="flex flex-col space-y-1">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() => setIsPharmacy(!isPharmacy)}
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaUsers />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    داروخانه
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isPharmacy ? "rotate-180" : ""}`}
                />
              </div>
              {isPharmacy &&
                Pharmacy.map((item) => (
                  <div
                    key={item.component}
                    className={`flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer ${
                      activeComponent === item.component
                        ? "bg-green text-white"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* مدیریت مالی */}
            <li className="flex flex-col space-y-1 mt-4">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() =>
                  setIsFinanceManagementOpen(!isFinanceManagementOpen)
                }
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaMoneyBillWave />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    مدیریت مالی
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isFinanceManagementOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isFinanceManagementOpen &&
                financeManagementItems.map((item) => (
                  <div
                    key={item.component}
                    className={`flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer ${
                      activeComponent === item.component
                        ? "bg-green text-white"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* مدیریت ماهانه */}
            <li className="flex flex-col space-y-1 mt-4">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() => setIsMonthlyManagement(!isMonthlyManagement)}
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaMoneyBillWave />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    مدیریت ماهانه
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isMonthlyManagement ? "rotate-180" : ""}`}
                />
              </div>
              {isMonthlyManagement &&
                monthlyManagementItems.map((item) => (
                  <div
                    key={item.component}
                    className="flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* مدیریت کارکنان */}
            <li className="flex flex-col space-y-1 mt-4">
              <div
                className="flex items-center justify-between font-bold pr-2 py-2 hover:bg-green hover:text-white rounded cursor-pointer"
                onClick={() => setIsStaffManagement(!isStaffManagement)}
              >
                <div className="flex items-center font-bold gap-x-4">
                  <span className="text-xl">
                    <FaUsers />
                  </span>
                  <span className="ml-5 text-md font-bold flex items-center">
                    مدیریت کارکنان
                  </span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-300 ${isStaffManagement ? "rotate-180" : ""}`}
                />
              </div>
              {isStaffManagement &&
                staffManagement.map((item) => (
                  <div
                    key={item.component}
                    className="flex items-center gap-x-3 py-2 px-5 font-bold hover:bg-green hover:text-white rounded cursor-pointer"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else setActiveComponent(item.component);
                      setIsSideOpen(false);
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="ml-4 text-md">{item.label}</span>
                  </div>
                ))}
            </li>

            {/* خروج */}
            <li className="mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-3 py-2 px-3 font-bold hover:bg-green hover:text-white rounded w-full"
              >
                <FaSignOutAlt className="text-xl" /> <span>خروج</span>
              </button>
            </li>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{renderComponent()}</main>

        {/* Enrollment Modal */}
        {showEnrollmentModal && (
          <MonthlyEnrollManagement
            show={showEnrollmentModal}
            onClose={() => setShowEnrollmentModal(false)}
            refreshEnrollments={fetchClasses}
            classesList={classes}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
