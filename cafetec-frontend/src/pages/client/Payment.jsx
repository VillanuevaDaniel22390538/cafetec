// src/pages/client/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/ClientHeader';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { orderService } from '../../api/orderService';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/client/dashboard');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('No se pudo cargar la información del pedido');
    } finally {
      setLoading(false);
    }
  };

  // función handlePayment:
const handlePayment = async () => {
  if (!order || order.pagado) return;
  
  setProcessing(true);
  setError(null);

  try {
    // Usar el servicio de orderService
    const paymentData = {
      metodo_pago: paymentMethod
    };

    const result = await orderService.processPayment(orderId, paymentData);
    
    if (result.success) {
      setSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate(`/client/order-tracking/${orderId}`, { 
          state: { 
            orderId: orderId,
            orderDetails: { ...order, pagado: true, estado: 'preparacion' }
          } 
        });
      }, 3000);
    } else {
      throw new Error(result.msg || 'Error al procesar el pago');
    }

  } catch (error) {
    console.error('Payment error:', error);
    setError(error.message || 'Error al procesar el pago. Intenta nuevamente.');
  } finally {
    setProcessing(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-orange-500 mb-4" />
            <p className="text-gray-600">Cargando información del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Error</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/client/dashboard')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h3>
            <p className="text-gray-600 mb-6">
              Tu pago de <span className="font-bold text-orange-600">${order?.total?.toFixed(2)}</span> ha sido procesado correctamente.
            </p>
            <p className="text-gray-500 mb-8">
              Tu pedido ahora está en proceso de preparación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(`/client/order-tracking`, { 
                  state: { orderId: orderId } 
                })}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Ver seguimiento del pedido
              </button>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
              >
                Ir al Dashboard
              </button>
            </div>
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
              <div className="w-24 h-1 bg-green-500"></div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 px-4">
            <span className="text-center">Pedido</span>
            <span className="text-center">Horario</span>
            <span className="text-center font-semibold">Pago</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Completar Pago
                  </h2>
                  <p className="text-gray-600">
                    Selecciona tu método de pago preferido
                  </p>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Método de pago
                </h3>
                
                <button
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">$</span>
                      </div>
                      <div>
                        <p className="font-semibold">Efectivo</p>
                        <p className="text-sm text-gray-500">Paga al recoger tu pedido</p>
                      </div>
                    </div>
                    {paymentMethod === 'efectivo' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Tarjeta de crédito/débito</p>
                        <p className="text-sm text-gray-500">Pago seguro en línea</p>
                      </div>
                    </div>
                    {paymentMethod === 'tarjeta' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'transferencia'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold">Transferencia bancaria</p>
                        <p className="text-sm text-gray-500">CLABE: 0121 8000 1234 5678 90</p>
                      </div>
                    </div>
                    {paymentMethod === 'transferencia' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Información de seguridad */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 mb-1">
                      Pago 100% seguro
                    </p>
                    <p className="text-sm text-gray-600">
                      Todos los pagos están protegidos con encriptación SSL. 
                      No almacenamos los datos de tu tarjeta.
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

              {/* Información del pedido */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-3">
                  Pedido #{order?.id_pedido || order?.id}
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {order?.productos?.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-600">
                          {producto.cantidad || 1}x
                        </span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                          {producto.nombre || producto.nombre_producto}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ${((producto.precio_unitario || producto.precio) * (producto.cantidad || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalles del precio */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${(order?.total ? order.total / 1.16 : 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (16%)</span>
                  <span className="font-medium">
                    ${(order?.total ? order.total * 0.16 : 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-bold text-gray-900">Total a pagar</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      ${order?.total?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Conexión segura • SSL encriptado</span>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={processing || !order}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      {paymentMethod === 'efectivo' ? 'Confirmar pago en efectivo' : 'Pagar ahora'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(`/client/order-tracking`, { 
                    state: { orderId: orderId } 
                  })}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver al seguimiento
                </button>
              </div>

              {/* Advertencia para efectivo */}
              {paymentMethod === 'efectivo' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700 text-center">
                    <strong>Nota:</strong> Deberás pagar al momento de recoger tu pedido en la cafetería.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;