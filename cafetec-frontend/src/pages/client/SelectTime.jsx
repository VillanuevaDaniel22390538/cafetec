import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/ClientHeader';
import { orderService } from '../../api/orderService';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  Shield,
  Package
} from 'lucide-react';

const SelectTime = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [horarios, setHorarios] = useState([]);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0 && !orderDetails) {
      navigate('/client/cart');
      return;
    }

    fetchHorarios();
  }, [cartItems.length, navigate, orderDetails]);

  const fetchHorarios = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAvailableSlots();
      
      // Ordenar por hora
      const sortedHorarios = data.sort((a, b) => 
        new Date(`1970-01-01T${a.hora_inicio}`) - new Date(`1970-01-01T${b.hora_inicio}`)
      );
      
      setHorarios(sortedHorarios);
      
      // Seleccionar el primer horario disponible por defecto
      if (sortedHorarios.length > 0 && !selectedHorario) {
        setSelectedHorario(sortedHorarios[0]);
      }
    } catch (err) {
      console.error('Error al cargar horarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeStatus = (horario) => {
    const now = new Date();
    const [hours, minutes] = horario.hora_inicio.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = slotTime - now;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff < 15) return 'pronto';
    if (minutesDiff < 30) return 'cercano';
    return 'disponible';
  };

  const handleConfirmOrder = async () => {
  if (!selectedHorario) return;
  
  setSubmitting(true);
  
  try {
    const productos = cartItems.map(item => ({
      id_producto: item.id_producto,
      cantidad: item.quantity,
      precio_unitario: item.precio
    }));

    const orderData = {
      id_horario: selectedHorario.id_horario,
      productos,
      notas: '',
      total: getTotalPrice()
    };

    console.log('🛒 Creando pedido con datos:', orderData);
    const response = await orderService.createOrder(orderData);
    
    console.log('✅ Pedido creado:', response);
    setOrderDetails(response);
    
    // IMPORTANTE: Guardar ID del pedido para la siguiente pantalla
    const pedidoId = response.id_pedido || response.data?.id_pedido || response.id;
    
    // Limpiar carrito
    clearCart();
    
    // ✅ CAMBIADO: Redirigir a PAGO en lugar de tracking directo
    setTimeout(() => {
      console.log('💰 Redirigiendo a pago para pedido:', pedidoId);
      navigate(`/client/payment/${pedidoId}`, { 
        state: { 
          orderId: pedidoId,
          orderDetails: response 
        } 
      });
    }, 500);
    
  } catch (err) {
    console.error('❌ Error al crear pedido:', err);
    alert('Error al crear el pedido: ' + (err.response?.data?.message || err.message));
    setSubmitting(false);
  }
};

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">Cargando horarios disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ClientHeader />
      
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-20">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
                1
              </div>
              <div className="w-24 h-1 bg-green-500"></div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
                2
              </div>
              <div className="w-24 h-1 bg-gray-300"></div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 px-4">
            <span className="text-center">Carrito</span>
            <span className="text-center">Horario</span>
            <span className="text-center font-semibold">Confirmación</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Horarios disponibles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Selecciona tu horario
                  </h2>
                  <p className="text-gray-600">
                    Elige cuándo quieres recoger tu pedido
                  </p>
                </div>
              </div>

              {/* Fecha actual */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-blue-800">
                      {new Date().toLocaleDateString('es-MX', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-blue-600">
                      Todos los horarios son para hoy
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de horarios */}
              {horarios.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay horarios disponibles
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Todos los horarios están llenos para hoy
                  </p>
                  <button
                    onClick={() => navigate('/client/cart')}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Volver al carrito
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {horarios.map((horario) => {
                    const status = getTimeStatus(horario);
                    const isSelected = selectedHorario?.id_horario === horario.id_horario;
                    
                    return (
                      <button
                        key={horario.id_horario}
                        onClick={() => setSelectedHorario(horario)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'pronto' ? 'bg-red-500' :
                              status === 'cercano' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <span className="text-lg font-bold">
                              {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {status === 'pronto' && '⏰ Empieza pronto'}
                            {status === 'cercano' && '🕒 Dentro de 30 min'}
                            {status === 'disponible' && '✅ Disponible'}
                          </div>
                          <div className={`text-sm font-medium ${
                            horario.espacios_disponibles < 3 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {horario.espacios_disponibles} {horario.espacios_disponibles === 1 ? 'espacio' : 'espacios'} restantes
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> Tu pedido estará listo aproximadamente 15 minutos después 
                      de la hora de inicio seleccionada. Llega a tiempo para recogerlo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                Resumen del Pedido
              </h3>

              {/* Productos */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-3">
                  {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en tu pedido
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id_producto} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {item.quantity || 1}x
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {item.nombre_producto}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(Number(item.precio || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horario seleccionado */}
              {selectedHorario && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Horario seleccionado:</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatTime(selectedHorario.hora_inicio)} - {formatTime(selectedHorario.hora_fin)}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Recogida en cafetería
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center py-3 border-t">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      ${getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Pago seguro • Sin cargos adicionales</span>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirmOrder}
                  disabled={!selectedHorario || submitting || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>

                <button
                  onClick={() => navigate('/client/cart')}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Volver al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTime;