import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Components/dashboard/dashboard";
import Loginpage from "./Components/loginpage/loginpage";
import SignUp from "./Components/dashboard/Registeration/SignUp";
import "../src/App.css";
function App() {
  return (
    <>
      <BrowserRouter>
        {/* <Bill /> */}
        <Routes>
          <Route path="" element={<Dashboard role="Designer" />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
