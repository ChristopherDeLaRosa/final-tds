import { Navigate } from "react-router-dom";
import authService from "../../services/authService";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles permitidos, verificar
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}