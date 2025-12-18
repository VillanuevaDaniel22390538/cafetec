// src/routes/ClientRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ClientRoute({ children }) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando usuario...
      </div>
    );
  }

  // Solo permitir si es estudiante
  if (!user || !roles.includes("estudiante")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
