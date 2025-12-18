// src/api/adminUserService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

export const adminUserService = {
  // Obtener todos los usuarios (requiere endpoint en backend)
  getAllUsers: async () => {
    // ⚠️ Tu backend actual NO tiene este endpoint.
    // Para MVP, simulamos datos o usamos /auth/profile repetidamente (no ideal).
    // Aquí asumimos que crearás: GET /api/admin/users
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar usuarios');
    return response.json();
  },

  // Asignar rol de administrador (requiere endpoint PATCH /api/admin/users/:id/role)
  toggleAdminRole: async (userId, makeAdmin) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_admin: makeAdmin })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al actualizar rol');
    }
    return response.json();
  },

  // Activar/desactivar usuario
  toggleActive: async (userId, isActive) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/active`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ activo: isActive })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al actualizar estado');
    }
    return response.json();
  }
};