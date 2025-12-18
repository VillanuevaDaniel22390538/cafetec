// src/pages/admin/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminOrderService } from '../../api/adminOrderService';
import { formatCurrency } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  DollarSign, 
  Package, 
  Calendar,
  Phone,
  Mail,
  FileText,
  History,
  ShoppingCart,
  Tag,
  Image as ImageIcon
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await adminOrderService.getOrderDetails(id);
        setOrder(data);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar detalles del pedido:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const getEstadoConfig = (estadoId) => {
    const configs = {
      1: { 
        nombre: 'Pendiente', 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800 border border-gray-300'
      },
      2: { 
        nombre: 'Preparando', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border border-blue-300'
      },
      3: { 
        nombre: 'Listo', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        badge: 'bg-green-100 text-green-800 border border-green-300'
      },
      4: { 
        nombre: 'Entregado', 
        bgColor: 'bg-emerald-50', 
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      },
      5: { 
        nombre: 'Cancelado', 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border border-red-300'
      }
    };
    return configs[estadoId] || configs[1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Volver a Pedidos
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Pedido no encontrado</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Volver a Pedidos
        </button>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(order.id_estado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/orders"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Pedidos</span>
          </Link>
          <div className="w-px h-6 bg-gray-300"></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Pedido #{order.id_pedido}
            </h1>
            <p className="text-gray-500 mt-1">
              Detalles completos del pedido
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${estadoConfig.badge}`}>
          {estadoConfig.nombre}
        </span>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de productos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Productos del Pedido
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.productos.map((producto) => (
                  <div key={producto.id_detalle} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      {producto.imagen_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${producto.imagen_url}`}
                          alt={producto.nombre_producto}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {producto.nombre_producto}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {producto.descripcion || 'Sin descripción'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {producto.categoria}
                        </span>
                        <span className="text-sm text-gray-500">
                          Cantidad: {producto.cantidad}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(producto.precio_unitario)} c/u
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(producto.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total del Pedido:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas del pedido */}
          {order.notas && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Notas Especiales
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{order.notas}</p>
              </div>
            </div>
          )}

          {/* Historial de estados */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historial de Estados
              </h2>
            </div>
            <div className="p-6">
              {order.historial_estados.length > 0 ? (
                <div className="space-y-4">
                  {order.historial_estados.map((historial, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">
                            Cambiado de {historial.estado_anterior || 'N/A'} a {historial.estado_nuevo}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(historial.fecha_cambio).toLocaleString('es-MX')}
                          </span>
                        </div>
                        {historial.admin_cambio && (
                          <p className="text-sm text-gray-600 mt-1">
                            Por: {historial.admin_cambio}
                          </p>
                        )}
                        {historial.nota_cambio && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            "{historial.nota_cambio}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay historial de cambios de estado
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Información lateral */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información del Cliente
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="font-semibold text-gray-800">{order.usuario.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <p className="text-gray-700">{order.usuario.email}</p>
              </div>
              {order.usuario.telefono && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Teléfono
                  </label>
                  <p className="text-gray-700">{order.usuario.telefono}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Cliente desde</label>
                <p className="text-gray-700">
                  {new Date(order.usuario.fecha_registro).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </div>

          {/* Información del pedido */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Información del Pedido
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Fecha del Pedido
                </label>
                <p className="text-gray-700">
                  {new Date(order.fecha_pedido).toLocaleString('es-MX')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Horario Programado
                </label>
                <p className="text-gray-700">
                  {order.horario.hora_inicio} - {order.horario.hora_fin}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hora de Recogida</label>
                <p className="text-gray-700">
                  {new Date(order.hora_programada).toLocaleTimeString('es-MX')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Capacidad del Horario</label>
                <p className="text-gray-700">
                  {order.horario.capacidad_maxima} pedidos máximo
                </p>
              </div>
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Resumen
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos:</span>
                <span className="font-medium">{order.productos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">
                  {order.productos.reduce((sum, p) => sum + p.cantidad, 0)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span className="text-gray-800">Total:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}