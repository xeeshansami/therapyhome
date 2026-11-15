import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import LoginPage from "./pages/LoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import ChooseUser from "./pages/ChooseUser";

// Staff do not use the web portal: they sign in with the TherapyHome mobile app.
const StaffUseApp = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", fontFamily: "inherit" }}>
    <div style={{ maxWidth: 420 }}>
      <h2 style={{ marginBottom: 8 }}>Staff use the TherapyHome app</h2>
      <p style={{ opacity: 0.8 }}>Sign in with your staff email in the TherapyHome mobile app to mark attendance, sessions and leave. The web portal is for admins.</p>
      <a href={`${process.env.PUBLIC_URL || ""}/Adminlogin`}>Admin sign-in</a>
    </div>
  </div>
);

const App = () => {
  const { currentRole } = useSelector((state) => state.user);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/choose" element={<ChooseUser />} />
      <Route path="/chooseasguest" element={<ChooseUser />} />

      {/* Login */}
      <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
      <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
      <Route path="/Teacherlogin" element={<StaffUseApp />} />

      {/* Register */}
      <Route path="/Adminregister" element={<AdminRegisterPage />} />

      {/* Admin */}
      <Route
        path="/Admin/*"
        element={
          currentRole === "Admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/Adminlogin" replace />
          )
        }
      />

      {/* Student */}
      <Route
        path="/Student/*"
        element={
          currentRole === "Student" ? (
            <StudentDashboard />
          ) : (
            <Navigate to="/Studentlogin" replace />
          )
        }
      />

      {/* Staff: mobile app only */}
      <Route path="/Teacher/*" element={<StaffUseApp />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;