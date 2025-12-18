// src/pages/auth/RedirectAfterLogin.jsx
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RedirectAfterLogin() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (roles.includes('administrador')) {
        navigate('/admin');
      } else {
        navigate('/client/dashboard');
      }
    }
  }, [roles, loading, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Redirigiendo...</div>;
}