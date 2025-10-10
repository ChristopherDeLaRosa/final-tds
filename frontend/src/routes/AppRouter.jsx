import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Students from "../pages/Students/Students.jsx";
import Courses from "../pages/Courses/Courses.jsx";
import Grades from "../pages/Grades/Grades.jsx";
import Attendance from "../pages/Attendance/Attendance.jsx";
import Payments from "../pages/Payments/Payments.jsx";
import Menu from "../pages/Menu/Menu.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/students" element={<Students />} /> */}
        <Route path="/students" element={<Students />}/>
        <Route path="/courses" element={<Courses />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </BrowserRouter>
  );
}
