import { axiosInstance } from "../src/utils/api";

// ==========================
// DASHBOARD API
// ==========================

export const fetchEnrollmentsByMonth = async () => {
  const res = await axiosInstance.get(
    "/courses/dashboard/enrollments-by-month/"
  );
  return res.data;
};

export const fetchTopClasses = async () => {
  const res = await axiosInstance.get("/courses/dashboard/top-classes/");
  return res.data;
};

// ---------------- Dashboard Summary ----------------
export const fetchDashboardSummary = async () => {
  try {
    const res = await axiosInstance.get("/courses/dashboard/summary/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch dashboard summary", err);
    throw err;
  }
};

// ---------------- Recent Enrollments ----------------
export const fetchRecentEnrollments = async () => {
  try {
    const res = await axiosInstance.get(
      "/courses/dashboard/recent-enrollments/"
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch recent enrollments", err);
    throw err;
  }
};

// ---------------- Monthly Revenue ----------------
export const fetchMonthlyRevenue = async () => {
  try {
    const res = await axiosInstance.get("/courses/dashboard/monthly-revenue/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch monthly revenue", err);
    throw err;
  }
};

// ---------------- Enrollment Status ----------------
export const fetchEnrollmentStatus = async () => {
  try {
    const res = await axiosInstance.get(
      "/courses/dashboard/enrollment-status/"
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch enrollment status", err);
    throw err;
  }
};

export const fetchFullReport = async () => {
  const res = await axiosInstance.get("payment/reports/full/");
  return res.data; // This is the JSON your Django API returns
};
