import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../templates/AppLayout/AppLayout.jsx";
import Login from "../components/organisms/Auth/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Students from "../pages/Students/Students.jsx";
import Courses from "../pages/Courses/Courses.jsx";
import Grades from "../pages/Grades/Grades.jsx";
import Attendance from "../pages/Attendance/Attendance.jsx";
import ProtectedRoute from "../routes/ProtectedRoute/ProtectedRoute.jsx";
import { GlobalStyle } from "../styles/globalStyles.js";
import authService from "../services/authService.js";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        {/* Ruta de Login (pública) */}
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() 
              ? <Navigate to="/dashboard" replace /> 
              : <Login />
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="courses" element={<Courses />} />
          <Route path="grades" element={<Grades />} />
          <Route path="students" element={<Students />} />
          {/* <Route path="payments" element={<Payments />} /> */}
        </Route>

        {/* Ruta para no autorizados */}
        <Route 
          path="/unauthorized" 
          element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Acceso Denegado</h1>
              <p>No tienes permisos para acceder a esta página.</p>
              <button onClick={() => window.location.href = '/dashboard'}>
                Volver al Dashboard
              </button>
            </div>
          } 
        />

        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
