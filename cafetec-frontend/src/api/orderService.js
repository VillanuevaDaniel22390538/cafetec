// src/api/orderService.js - VERSIÓN MEJORADA
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 
    'x-auth-token': token,
    'Content-Type': 'application/json'
  } : {};
};

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.msg || result.error || 'Error en la solicitud');
  }
  
  return result;
};

export const orderService = {
  // Obtener pedidos del usuario - VERSIÓN MEJORADA
  getMyOrders: async () => {
    try {
      console.log('📞 Llamando a /api/pedidos...');
      const response = await fetch(`${API_URL}/pedidos`, {
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      console.log('✅ Respuesta de /api/pedidos:', result);
      
      // Asegurar que siempre retornamos un array
      if (result.success && result.data && Array.isArray(result.data)) {
        return result.data; // Retorna solo el array
      } else if (Array.isArray(result)) {
        return result; // Ya es un array directamente
      } else if (result.data && Array.isArray(result.data)) {
        return result.data; // Estructura {data: []}
      } else {
        console.warn('⚠️ Formato inesperado, retornando array vacío:', result);
        return []; // Fallback seguro
      }
    } catch (error) {
      console.error('❌ Error en getMyOrders:', error);
      return []; // Retorna array vacío en caso de error
    }
  },

  // Obtener horarios disponibles
  getAvailableSlots: async () => {
    try {
      console.log('🕐 Obteniendo horarios disponibles...');
      const response = await fetch(`${API_URL}/pedidos/horarios/disponibles`);
      const result = await handleResponse(response);
      
      // Asegurar formato consistente
      return result.success && result.data ? result.data : result;
    } catch (error) {
      console.error('❌ Error en getAvailableSlots:', error);
      throw error;
    }
  },

  // Crear nuevo pedido
  createOrder: async (orderData) => {
    try {
      console.log('🛒 Creando pedido:', orderData);
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      
      const result = await handleResponse(response);
      console.log('✅ Pedido creado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en createOrder:', error);
      throw error;
    }
  },

  // Obtener pedido específico por ID
  getOrderById: async (orderId) => {
    try {
      console.log(`🔍 Obteniendo pedido #${orderId}...`);
      const response = await fetch(`${API_URL}/pedidos/${orderId}`, {
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      // Extraer datos si están en data
      return result.data || result;
    } catch (error) {
      console.error('❌ Error en getOrderById:', error);
      throw error;
    }
  },

  // Obtener solo el estado del pedido (para polling)
  getOrderStatus: async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${orderId}/estado`, {
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      // Extraer datos si están en data
      return result.data || result;
    } catch (error) {
      console.error('❌ Error en getOrderStatus:', error);
      throw error;
    }
  },

  // Registrar pago
  processPayment: async (orderId, paymentData) => {
    try {
      console.log(`💰 Procesando pago para pedido #${orderId}:`, paymentData);
      const response = await fetch(`${API_URL}/pedidos/${orderId}/pagar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });
      
      const result = await handleResponse(response);
      console.log('✅ Pago procesado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en processPayment:', error);
      throw error;
    }
  },

  // NUEVO: Actualizar estado del pedido (para admin)
  updateOrderStatus: async (orderId, statusData) => {
    try {
      console.log(`🔄 Actualizando estado del pedido #${orderId}:`, statusData);
      const response = await fetch(`${API_URL}/pedidos/${orderId}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData)
      });
      
      const result = await handleResponse(response);
      console.log('✅ Estado actualizado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en updateOrderStatus:', error);
      throw error;
    }
  }
};