import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
// import Bill from "./Components/Bill_Page/Bill";
import "./App.css";

import Dashboard from "./Components/dashboard/dashboard";
import NotFound from "./Pages/NotFound";

import ForgotPassword from "./Components/loginpage/ForgotPassword";
import CreateNewPassword from "./Components/loginpage/CreateNewPassword";

import Payrolls from "./Components/dashboard/Finance/Payrolls";
import LoginPage from "./Components/loginpage/loginpage";

import TeacherSalarySummary from "./Components/dashboard/Finance/SalaryPayment";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/payrolls" element={<Payrolls />} />
        <Route
          path="/salary-payment/:payrollId"
          element={<TeacherSalarySummary />}
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/dashboard" element={<Dashboard role="Designer" />} />
        {/* <Route path="/login" element={<Loginpage />} /> */}
        <Route path="/forgot-password/" element={<ForgotPassword />} />
        <Route path="/create-new-password/" element={<CreateNewPassword />} />

        {/* <Route path="/print-bill/:id" element={<Bill />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
