// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadUserProfile(token);
    else setLoading(false);
  }, []);

  const loadUserProfile = async (token) => {
    try {
      const profile = await authService.getProfile(token);
      console.log("Perfil recibido:", profile);

      setUser(profile);

      // Manejo flexible de roles
      if (Array.isArray(profile.roles)) {
        // Ejemplo: [{ nombre_rol: "administrador" }]
        setRoles(profile.roles.map((r) => r.nombre_rol));
      } else if (typeof profile.roles === "string") {
        // Ejemplo: "estudiante"
        setRoles([profile.roles]);
      } else if (profile.rol) {
        // Ejemplo: { rol: "estudiante" }
        setRoles([profile.rol]);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    await loadUserProfile(data.token);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, roles, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
