// src/api/adminOrderService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 
    'x-auth-token': token,
    'Content-Type': 'application/json'
  } : {};
};

export const adminOrderService = {
  // Obtener todos los pedidos
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/admin/pedidos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al cargar pedidos');
    }
    
    return response.json();
  },

  // Obtener estadísticas del dashboard
getDashboardStats: async () => {
  const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.msg || 'Error al cargar estadísticas');
  }
  
  return response.json();
},

  // Obtener un pedido por ID con detalles (NUEVO)
  getOrderDetails: async (id) => {
    const response = await fetch(`${API_URL}/admin/pedidos/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al cargar detalles del pedido');
    }
    
    return response.json();
  },

  // Obtener un pedido por ID (para compatibilidad)
  getOrderById: async (id) => {
    const response = await fetch(`${API_URL}/admin/pedidos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al cargar pedidos');
    
    const orders = await response.json();
    const order = orders.find(o => o.id_pedido == id);
    if (!order) throw new Error('Pedido no encontrado');
    return order;
  },

  // Actualizar estado de un pedido
  updateOrderStatus: async (id, id_estado) => {
    const response = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_estado })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.msg || 'Error al actualizar estado');
    }
    
    return response.json();
  }
};