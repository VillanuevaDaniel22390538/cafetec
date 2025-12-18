// src/api/adminProductService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

export const adminProductService = {
  getAll: async () => {
  const response = await fetch(`${API_URL}/productos/admin`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al cargar productos');
  return response.json();
},


  getCategories: async () => {
    // Simulamos categorías fijas (o puedes crear un endpoint en el backend)
    return [
      { id_categoria: 1, nombre_categoria: 'Bebidas' },
      { id_categoria: 2, nombre_categoria: 'Snacks' },
      { id_categoria: 3, nombre_categoria: 'Combos' },
      { id_categoria: 4, nombre_categoria: 'Promociones' }
    ];
  },

  create: async (productData) => {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al crear producto');
    }
    return response.json();
  },

  update: async (id, productData) => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al actualizar producto');
    }
    return response.json();
  },

  toggleActive: async (id) => {
    const response = await fetch(`${API_URL}/productos/${id}/activo`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al cambiar estado del producto');
    }
    return response.json();
  }
};