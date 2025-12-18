// src/pages/client/OrderTracking.jsx - VERSIÓN MEJORADA
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ClientHeader from '../../components/ClientHeader';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  ChefHat,
  Truck,
  Home,
  RefreshCw,
  Phone,
  MapPin,
  AlertCircle,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { orderService } from '../../api/orderService';

const OrderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams() || location.state?.orderId;
  
  const [order, setOrder] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(!location.state?.orderDetails);
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [polling, setPolling] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const orderStatuses = [
    { id: 1, name: 'Recibido', icon: Package, color: 'bg-blue-500', description: 'Pedido recibido' },
    { id: 2, name: 'En preparación', icon: ChefHat, color: 'bg-yellow-500', description: 'Cocinando tu pedido' },
    { id: 3, name: 'Listo para recoger', icon: CheckCircle, color: 'bg-orange-500', description: 'Tu pedido está listo' },
    { id: 4, name: 'Completado', icon: Home, color: 'bg-green-500', description: 'Pedido recogido' }
  ];

  useEffect(() => {
    if (!orderId) {
      navigate('/client/dashboard');
      return;
    }

    fetchOrderDetails();

    // Polling cada 15 segundos para actualizar estado
    const interval = setInterval(() => {
      if (polling) {
        fetchOrderStatus();
      }
    }, 15000);

    // Contador de tiempo
    const timer = setInterval(updateTimeLeft, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [orderId, polling]);

  const fetchOrderDetails = async () => {
    try {
      setError(null);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
      setLastUpdate(new Date());
      
      // Si el pedido está completado, dejar de hacer polling
      if (data.estado === 'completado' || data.estado === 'cancelado') {
        setPolling(false);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Si falla, intentar solo el estado
      fetchOrderStatus();
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatus = async () => {
    try {
      const data = await orderService.getOrderStatus(orderId);
      setOrder(prev => ({
        ...prev,
        estado: data.estado,
        updatedAt: data.updatedAt
      }));
      setLastUpdate(new Date());
      
      if (data.estado === 'completado' || data.estado === 'cancelado') {
        setPolling(false);
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      // No mostrar error en consola para el usuario
    }
  };

  const updateTimeLeft = () => {
    if (!order || !order.horario) return;
    
    const now = new Date();
    const [hours, minutes] = order.horario.hora_inicio.split(':');
    const targetTime = new Date();
    targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = targetTime - now;
    
    if (diffMs <= 0) {
      setTimeLeft('¡Listo para recoger!');
      return;
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    setTimeLeft(`${diffHours > 0 ? diffHours + 'h ' : ''}${remainingMins}m`);
  };

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    
    // Mapear estados del backend a nuestros estados visuales
    switch (order.estado) {
      case 'pendiente': return 0;
      case 'preparacion': return 1;
      case 'listo': return 2;
      case 'completado': return 3;
      case 'pagado': return 0; // Si ya está pagado, mostrar como recibido
      default: return 0;
    }
  };

  const getEstimatedTime = () => {
    if (!order || !order.horario) return '--:--';
    
    const [hours, minutes] = order.horario.hora_inicio.split(':');
    const estimatedTime = new Date();
    estimatedTime.setHours(parseInt(hours), parseInt(minutes) + 15, 0, 0);
    
    return estimatedTime.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleRefresh = () => {
    setPolling(true);
    fetchOrderDetails();
  };

  const formatLastUpdate = () => {
    const diff = new Date() - lastUpdate;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace unos segundos';
    if (minutes === 1) return 'Hace 1 minuto';
    return `Hace ${minutes} minutos`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600">Cargando información del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              {error ? 'Error al cargar el pedido' : 'Pedido no encontrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {error || 'No se pudo cargar la información del pedido'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Volver al Dashboard
              </button>
              {error && (
                <button
                  onClick={handleRefresh}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const needsPayment = order.estado === 'pendiente' && !order.pagado;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ClientHeader />
      
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-20">
        {/* Header con ID de pedido */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Seguimiento del Pedido
              </h1>
              <p className="text-gray-600">
                ID: <span className="font-mono font-bold">{order.id_pedido || order.id}</span>
                <span className="ml-4 text-sm text-gray-500">
                  Última actualización: {formatLastUpdate()}
                </span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${polling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {polling ? 'Actualizando automáticamente' : 'Actualización pausada'}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-2 rounded-lg"
              >
                <RefreshCw className={`w-5 h-5 ${polling ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Alerta de pago pendiente */}
          {needsPayment && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pago pendiente
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Tu pedido está esperando el pago. 
                      <button 
                        onClick={() => navigate(`/client/payment/${orderId}`)}
                        className="ml-2 font-semibold underline hover:text-yellow-900"
                      >
                        Realizar pago ahora →
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta de estado */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {orderStatuses[currentStatusIndex].name}
                  {order.pagado && order.estado === 'pendiente' && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CreditCard className="w-3 h-3 mr-1" />
                      Pagado
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">
                  {orderStatuses[currentStatusIndex].description}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tiempo estimado:</p>
                    <p className="text-xl font-bold text-orange-600">
                      {getEstimatedTime()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline del pedido */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-8">
            Progreso del pedido
          </h3>
          
          <div className="relative">
            {/* Línea de progreso */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200">
              <div 
                className="bg-orange-500 transition-all duration-500"
                style={{ 
                  height: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` 
                }}
              ></div>
            </div>
            
            {/* Pasos */}
            <div className="space-y-12 ml-4">
              {orderStatuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={status.id} className="relative flex items-start gap-6">
                    <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${
                      isCompleted ? status.color : 'bg-gray-200'
                    } transition-all duration-500`}>
                      <status.icon className={`w-8 h-8 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                      {isCompleted && (
                        <div className="absolute -right-1 -top-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 pt-2 ${isCurrent ? 'animate-pulse' : ''}`}>
                      <h4 className={`text-lg font-bold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {status.name}
                        {isCurrent && <span className="ml-2 text-sm font-normal text-orange-500">(Actual)</span>}
                      </h4>
                      <p className={`mt-1 ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {status.description}
                      </p>
                      
                      {isCurrent && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-700 text-sm">
                            {index === 0 && 'Tu pedido ha sido recibido y será preparado pronto.'}
                            {index === 1 && 'Nuestros chefs están preparando tu pedido con los mejores ingredientes.'}
                            {index === 2 && '¡Tu pedido está listo! Puedes recogerlo en la cafetería.'}
                            {index === 3 && 'Pedido completado. ¡Gracias por tu compra!'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tiempo estimado para este paso */}
                    {isCurrent && index < 3 && (
                      <div className="hidden md:block bg-gray-100 px-4 py-2 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          {index === 0 ? 'En ~2 min' : index === 1 ? 'En ~10 min' : 'En ~3 min'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del pedido */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Detalles del pedido
            </h3>
            
            <div className="space-y-6">
              {/* Productos */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Productos</h4>
                <div className="space-y-2">
                  {order.productos?.map((producto, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
                          {producto.cantidad || 1}x
                        </span>
                        <span className="font-medium">{producto.nombre || producto.nombre_producto}</span>
                      </div>
                      <span className="font-semibold">
                        ${((producto.precio_unitario || producto.precio) * (producto.cantidad || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumen de pago */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Resumen de pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${order.subtotal?.toFixed(2) || order.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%):</span>
                    <span className="font-medium">${((order.total * 0.16) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-orange-600">
                      ${order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.pagado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.pagado ? '✅ Pagado' : '⏳ Pendiente de pago'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Información de recolección */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Recolección</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Cafetería Principal</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Edificio A, Planta Baja
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.horario ? `Horario: ${order.horario.hora_inicio} - ${order.horario.hora_fin}` : 'Horario no disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto y ayuda */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              ¿Necesitas ayuda?
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Contacto Cafetería</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Si tienes alguna duda sobre tu pedido:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Teléfono: (55) 1234-5678</li>
                  <li>• Horario: 7:00 AM - 8:00 PM</li>
                  <li>• Ubicación: Mostrador principal</li>
                </ul>
              </div>
              
              {/* Contador de tiempo */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tiempo restante para recoger:</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {timeLeft}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  {timeLeft === '¡Listo para recoger!' 
                    ? 'Tu pedido está listo. ¡Ven a recogerlo!' 
                    : 'Tu pedido estará listo a tiempo'}
                </p>
              </div>
              
              {/* Botón de pago si está pendiente */}
              {needsPayment && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-green-800">Completar pago</span>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Para continuar con la preparación de tu pedido, realiza el pago ahora.
                  </p>
                  <button
                    onClick={() => navigate(`/client/payment/${orderId}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Realizar pago
                  </button>
                </div>
              )}
              
              {/* Notas importantes */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  📢 Importante
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Presenta tu ID de pedido al recoger</li>
                  <li>• Llega 5 minutos antes de tu horario</li>
                  <li>• Los pedidos se mantienen por 30 minutos</li>
                  <li>• El pago se realiza al momento de recoger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {needsPayment ? (
            <button
              onClick={() => navigate(`/client/payment/${orderId}`)}
              className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
            >
              Realizar pago ahora
            </button>
          ) : (
            <button
              onClick={() => navigate('/client/menu')}
              className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Hacer otro pedido
            </button>
          )}
          <button
            onClick={() => navigate('/client/dashboard')}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;