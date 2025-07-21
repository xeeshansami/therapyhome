import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';

const App = () => {
  const { currentRole } = useSelector(state => state.user);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/choose" element={<ChooseUser visitor="normal" />} />
      <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

      <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
      <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
      <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />

      <Route path="/Adminregister" element={<AdminRegisterPage />} />

      {/* Protected Admin Routes */}
      {/* Any URL starting with /Admin will render the AdminDashboard if the role is Admin */}
      <Route
        path="/Admin/*"
        element={
          currentRole === "Admin" ? <AdminDashboard /> : <Navigate to="/Adminlogin" />
        }
      />

      {/* Protected Student Routes (assuming you have a StudentDashboard) */}
      <Route
        path="/Student/*"
        element={
          currentRole === "Student" ? <StudentDashboard /> : <Navigate to="/Studentlogin" />
        }
      />

      {/* Protected Teacher Routes (assuming you have a TeacherDashboard) */}
      <Route
        path="/Teacher/*"
        element={
          currentRole === "Teacher" ? <TeacherDashboard /> : <Navigate to="/Teacherlogin" />
        }
      />

      {/* Fallback route to redirect to home page for any other path */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;