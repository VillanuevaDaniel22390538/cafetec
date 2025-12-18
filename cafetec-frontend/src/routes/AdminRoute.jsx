// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando permisos...
      </div>
    );
  }

  // Si no hay usuario o no es admin, redirige
  if (!user || !roles.includes("administrador")) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
}
