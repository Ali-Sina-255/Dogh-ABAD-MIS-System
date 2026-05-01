// services/api.js
import { axiosInstance } from "../src/utils/api";

// ==========================
// EXISTING DASHBOARD API
// ==========================

export const fetchEnrollmentsByMonth = async () => {
  const res = await axiosInstance.get("/courses/dashboard/enrollments-by-month/");
  return res.data;
};

export const fetchTopClasses = async () => {
  const res = await axiosInstance.get("/courses/dashboard/top-classes/");
  return res.data;
};

export const fetchDashboardSummary = async () => {
  try {
    const res = await axiosInstance.get("/courses/dashboard/summary/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch dashboard summary", err);
    throw err;
  }
};

export const fetchRecentEnrollments = async () => {
  try {
    const res = await axiosInstance.get("/courses/dashboard/recent-enrollments/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch recent enrollments", err);
    throw err;
  }
};

export const fetchMonthlyRevenue = async () => {
  try {
    const res = await axiosInstance.get("/core/dashboard/monthly-revenue/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch monthly revenue", err);
    throw err;
  }
};

export const fetchEnrollmentStatus = async () => {
  try {
    const res = await axiosInstance.get("/courses/dashboard/enrollment-status/");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch enrollment status", err);
    throw err;
  }
};

export const fetchFullReport = async () => {
  const res = await axiosInstance.get("payment/reports/full/");
  return res.data;
};

// ==========================
// HOSPITAL DASHBOARD API
// ==========================

export const fetchHospitalDashboardSummary = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/dashboard/summary/
    const response = await axiosInstance.get('/core/hospital/dashboard/summary/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch hospital dashboard summary", err);
    throw err;
  }
};

export const fetchRecentPatients = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/patients/recent/
    const response = await axiosInstance.get('/core/hospital/patients/recent/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch recent patients", err);
    throw err;
  }
};

export const fetchRecentLabTests = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/lab-tests/recent/
    const response = await axiosInstance.get('/core/hospital/lab-tests/recent/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch recent lab tests", err);
    throw err;
  }
};

export const fetchRecentPharmaceuticals = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/pharmaceuticals/recent/
    const response = await axiosInstance.get('/core/hospital/pharmaceuticals/recent/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch recent pharmaceuticals", err);
    throw err;
  }
};

export const fetchHospitalMonthlyRevenue = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/revenue/monthly/
    const response = await axiosInstance.get('/core/hospital/revenue/monthly/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch hospital monthly revenue", err);
    throw err;
  }
};

export const fetchHospitalFullReport = async () => {
  try {
    // Full URL will be: http://127.0.0.1:8000/core/hospital/financial-report/
    const response = await axiosInstance.get('/core/hospital/financial-report/');
    return response.data;
  } catch (err) {
    console.error("Failed to fetch hospital financial report", err);
    throw err;
  }
};