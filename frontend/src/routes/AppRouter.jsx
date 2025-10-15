import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../templates/AppLayout/AppLayout.jsx";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Students from "../pages/Students/Students.jsx";
import Courses from "../pages/Courses/Courses.jsx";
import Grades from "../pages/Grades/Grades.jsx";
import Attendance from "../pages/Attendance/Attendance.jsx";
import Payments from "../pages/Payments/Payments.jsx";
import Menu from "../pages/Menu/Menu.jsx";
import { GlobalStyle } from "../styles/globalStyles.js";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="courses" element={<Courses />} />
          <Route path="grades" element={<Grades />} />
          {/* <Route path="payments" element={<Payments />} /> */}
          <Route path="students" element={<Students />} />
          {/* <Route path="login" element={<Login />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
