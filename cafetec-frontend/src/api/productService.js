// src/api/productService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const productService = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/productos`, {
      headers: token ? { 'x-auth-token': token } : {}
    });
    if (!response.ok) throw new Error('Error al cargar productos');
    return response.json();
  }
};