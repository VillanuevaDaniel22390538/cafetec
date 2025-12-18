// src/pages/client/OrderConfirmed.jsx - VERSIÓN MEJORADA
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import { 
  CheckCircle, 
  Clock, 
  Package, 
  ShoppingBag,
  ExternalLink,
  ArrowLeft
} from "lucide-react";

const OrderConfirmed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Obtener detalles del pedido de location.state
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
    }

    // Temporizador para redirigir automáticamente
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/client/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const handleGoTracking = () => {
    if (orderDetails?.id_pedido) {
      navigate(`/client/order-tracking/${orderDetails.id_pedido}`, {
        state: { orderDetails }
      });
    } else {
      navigate('/client/order-tracking');
    }
  };

  const handleGoDashboard = () => {
    navigate("/client/dashboard");
  };

  const handleNewOrder = () => {
    navigate("/client/menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ClientHeader />
      
      <div className="pt-24 max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-white shadow-2xl rounded-3xl p-10 text-center relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            {/* Icono animado */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-20 h-20 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Pedido Confirmado!
            </h1>
            
            {/* Mensaje */}
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Tu pedido ha sido recibido exitosamente y está siendo preparado.
              Recibirás una notificación cuando esté listo.
            </p>

            {/* Información del pedido */}
            {orderDetails && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Resumen del Pedido
                  </h3>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de pedido:</span>
                    <span className="font-bold text-gray-900">
                      #{orderDetails.id_pedido || orderDetails.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${orderDetails.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-blue-600">
                      {orderDetails.estado || 'En preparación'}
                    </span>
                  </div>
                  {orderDetails.horario && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recoger a las:</span>
                      <span className="font-medium">
                        {orderDetails.horario.hora_inicio} - {orderDetails.horario.hora_fin}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contador */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <p className="text-blue-700">
                  Serás redirigido automáticamente en{" "}
                  <span className="font-bold text-xl">{countdown}</span> segundos
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleGoTracking}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Package className="w-5 h-5" />
                Seguir Pedido
              </button>

              <button
                onClick={handleNewOrder}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                Nuevo Pedido
              </button>

              <button
                onClick={handleGoDashboard}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Recibirás un correo electrónico con los detalles del pedido.
                Para cualquier duda, contacta al soporte de la cafetería.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;