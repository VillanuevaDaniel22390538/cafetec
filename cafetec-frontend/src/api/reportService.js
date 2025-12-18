// src/api/reportService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

export const reportService = {
  // Obtener todas las ventas
  getAllSales: async () => {
    const response = await fetch(`${API_URL}/ventas`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar ventas');
    return response.json();
  },

  // Obtener métodos de pago
  getPaymentMethods: async () => {
    const response = await fetch(`${API_URL}/ventas/metodos`);
    if (!response.ok) throw new Error('Error al cargar métodos de pago');
    return response.json();
  },

  // NUEVO: Obtener resumen de ventas
  getSalesSummary: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/ventas/reports/sales-summary?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar resumen de ventas');
    return response.json();
  },

  // NUEVO: Obtener ventas por periodo
  getSalesByPeriod: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/ventas/reports/sales-by-period?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar ventas por periodo');
    return response.json();
  },

  // NUEVO: Obtener productos más vendidos
  getTopProducts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/ventas/reports/top-products?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar productos más vendidos');
    return response.json();
  },

  // NUEVO: Obtener estadísticas de métodos de pago
  getPaymentMethodsStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/ventas/reports/payment-methods-stats?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar estadísticas de métodos');
    return response.json();
  },

  // NUEVO: Obtener ventas filtradas
  getFilteredSales: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/ventas/reports/filtered?${queryParams}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar ventas filtradas');
    return response.json();
  }
};