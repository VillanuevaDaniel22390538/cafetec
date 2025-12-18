// src/pages/client/OrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../api/orderService";
import ClientHeader from "../../components/ClientHeader";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Clock, 
  DollarSign, 
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      console.log("📦 Detalles del pedido:", orderData);
      setPedido(orderData);
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      setError(err.message || "No se pudo cargar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrder();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePayNow = async () => {
    if (!window.confirm("¿Deseas proceder con el pago de este pedido?")) return;
    
    try {
      // Aquí implementarías la lógica de pago
      navigate(`/client/payment/${id}`);
    } catch (err) {
      console.error("Error al procesar pago:", err);
      alert("Error al procesar el pago. Intenta de nuevo.");
    }
  };

  const getStatusColor = (status) => {
    const statusName = typeof status === 'object' ? status?.nombre_estado : status;
    
    switch (statusName?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'listo': return 'bg-green-100 text-green-800 border-green-300';
      case 'entregado': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    const statusName = typeof status === 'object' ? status?.nombre_estado : status;
    
    switch (statusName?.toLowerCase()) {
      case 'entregado': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'cancelado': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'listo': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <main className="max-w-4xl mx-auto px-4 py-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando detalles del pedido...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <main className="max-w-4xl mx-auto px-4 py-24">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
            <p className="text-gray-600 mb-6">{error || "El pedido solicitado no existe o no tienes acceso."}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/client/orders")}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Ver todos mis pedidos
              </button>
              <button
                onClick={() => navigate("/client/dashboard")}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />

      <main className="max-w-4xl mx-auto px-4 py-24">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link
            to="/client/orders"
            className="inline-flex items-center text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis pedidos
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Pedido #{pedido.id_pedido}
              </h1>
              <p className="text-gray-600">Detalles completos de tu pedido</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                {refreshing ? "Actualizando..." : "Actualizar estado"}
              </button>
              
              {!pedido.pagado && pedido.id_estado !== 4 && (
                <button
                  onClick={handlePayNow}
                  className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Pagar ahora
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado del pedido */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Estado del pedido
              </h3>
              {getStatusIcon(pedido.estado)}
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(pedido.estado)}`}>
              <span className="font-medium">
                {pedido.estado?.nombre_estado || "Pendiente"}
              </span>
            </div>
            
            {pedido.notas && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Notas:</span> {pedido.notas}
                </p>
              </div>
            )}
          </div>

          {/* Información de pago */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              Información de pago
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(pedido.total || 0)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estado de pago:</span>
                <span className={`font-medium ${pedido.pagado ? 'text-green-600' : 'text-yellow-600'}`}>
                  {pedido.pagado ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              
              {pedido.metodo_pago && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium text-gray-800">
                    <CreditCard className="inline w-4 h-4 mr-1" />
                    {pedido.metodo_pago}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fechas y horarios */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5" />
            Fechas y horarios
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Fecha del pedido</h4>
              <p className="font-medium text-gray-800">
                {formatDate(pedido.fecha_pedido)}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Hora programada</h4>
              <p className="font-medium text-gray-800">
                {pedido.hora_programada ? formatDate(pedido.hora_programada) : "No programada"}
              </p>
            </div>
            
            {pedido.horario && (
              <div className="md:col-span-2">
                <h4 className="text-sm text-gray-500 mb-2">Horario seleccionado</h4>
                <p className="font-medium text-gray-800">
                  {pedido.horario.hora_inicio} - {pedido.horario.hora_fin}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Productos del pedido */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <Package className="w-5 h-5" />
            Productos ({pedido.productos?.length || 0})
          </h3>
          
          {pedido.productos && pedido.productos.length > 0 ? (
            <div className="space-y-4">
              {pedido.productos.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {producto.imagen_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${producto.imagen_url}`}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E☕%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">☕</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">{producto.nombre}</h4>
                      {producto.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {producto.cantidad} × {formatCurrency(producto.precio_unitario || producto.precio_actual || 0)}
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(producto.subtotal || producto.cantidad * (producto.precio_unitario || producto.precio_actual || 0))}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total del pedido</span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(pedido.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No hay productos en este pedido.</p>
            </div>
          )}
        </div>

        {/* Información del cliente (solo para referencia) */}
        {pedido.usuario && (
          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Nombre</h4>
                <p className="font-medium text-gray-800">{pedido.usuario.nombre}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Email</h4>
                <p className="font-medium text-gray-800">{pedido.usuario.email}</p>
              </div>
              {pedido.usuario.telefono && (
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Teléfono</h4>
                  <p className="font-medium text-gray-800">{pedido.usuario.telefono}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}