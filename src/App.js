import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import LoginPage from "./pages/LoginPage";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import ChooseUser from "./pages/ChooseUser";

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
      <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />

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

      {/* Teacher */}
      <Route
        path="/Teacher/*"
        element={
          currentRole === "Teacher" ? (
            <TeacherDashboard />
          ) : (
            <Navigate to="/Teacherlogin" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;