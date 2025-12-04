import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../templates/AppLayout/AppLayout.jsx";
import Login from "../components/organisms/Auth/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Students from "../pages/Students/Students.jsx";
import Docentes from "../pages/Docentes/Docentes.jsx";
import Cursos from "../pages/Cursos/Cursos.jsx";
import GruposCursos from "../pages/GruposCursos/GruposCursos.jsx";
import Inscripciones from "../pages/Inscripciones/Inscripciones.jsx";
import Sesiones from "../pages/Sesiones/Sesiones.jsx";
import ReportesAsistencia from "../pages/ReportesAsistencia/ReportesAsistencia.jsx";
import HistorialAsistencias from "../pages/HistorialAsistencias/HistorialAsistencias.jsx";
import PaseLista from "../pages/PaseLista/PaseLista.jsx";
// import Asistencias from "../pages/Asistencias/Asistencias.jsx";
import Calificaciones from "../pages/Calificaciones/Calificaciones.jsx";
import Rubros from "../pages/Rubros/Rubros.jsx";
import Aulas from "../pages/Aulas/Aulas.jsx";
import ConfigurarAula from "../pages/Aulas/ConfigurarAula.jsx";
// import ConfigurarAula from "../pages/Aulas/Configuraraulanew.jsx";
import ProtectedRoute from "../routes/ProtectedRoute/ProtectedRoute.jsx";
import { GlobalStyle } from "../styles/globalStyles.js";
import authService from "../services/authService.js";
import AsistenciasUnificado from "../pages/Asistencias/AsistenciasUnificado.jsx";

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
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Gestión Académica */}
          <Route path="estudiantes" element={<Students />} />
          <Route path="docentes" element={<Docentes />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="aulas" element={<Aulas />} />
          <Route path="aulas/:id/configurar" element={<ConfigurarAula />} />
          <Route path="grupos-cursos" element={<GruposCursos />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="rubros" element={<Rubros />} />
          
          {/* Gestión de Clases */}
          <Route path="sesiones" element={<Sesiones />} />
          <Route path="pase-lista" element={<PaseLista />} /> 
          <Route path="reportes-asistencia" element={<ReportesAsistencia />} />
          <Route path="historial-asistencias" element={<HistorialAsistencias />} />
          {/* <Route path="asistencias" element={<Asistencias />} /> */}
          <Route path="asistencias" element={<AsistenciasUnificado />} />
          <Route path="calificaciones" element={<Calificaciones />} />
          
        </Route>

        {/* Ruta para no autorizados */}
        <Route 
          path="/unauthorized" 
          element={
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h1>Acceso Denegado</h1>
              <p>No tienes permisos para acceder a esta página.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4F8CFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '20px'
                }}
              >
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

