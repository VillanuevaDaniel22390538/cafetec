// src/pages/client/Dashboard.jsx - VERSIÓN MEJORADA
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../api/productService";
import { orderService } from "../../api/orderService";
import { useNavigate } from "react-router-dom";
import ClientHeader from "../../components/ClientHeader";
import { 
  Coffee, 
  Package, 
  Clock, 
  CheckCircle, 
  ShoppingCart,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setRefreshing(true);
      
      console.log("🔄 Cargando datos del dashboard...");
      
      const [prodsResponse, ordersResponse] = await Promise.all([
        productService.getAll(),
        orderService.getMyOrders()
      ]);
      
      // Procesar productos
      let productosData = [];
      if (Array.isArray(prodsResponse)) {
        productosData = prodsResponse;
      } else if (prodsResponse && Array.isArray(prodsResponse.data)) {
        productosData = prodsResponse.data;
      }
      
      // Procesar pedidos - MEJORADO
      let pedidosData = [];
      if (Array.isArray(ordersResponse)) {
        pedidosData = ordersResponse;
      } else if (ordersResponse && ordersResponse.success && Array.isArray(ordersResponse.data)) {
        pedidosData = ordersResponse.data;
      } else if (ordersResponse && Array.isArray(ordersResponse.data)) {
        pedidosData = ordersResponse.data;
      }
      
      console.log(`✅ Productos cargados: ${productosData.length}`);
      console.log(`✅ Pedidos cargados: ${pedidosData.length}`);
      
      setProductos(productosData);
      setPedidos(pedidosData);
      setError(null);
      
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
      setError({
        message: "No se pudieron cargar tus datos.",
        details: err.message,
        action: () => loadData(true)
      });
      
      // Asegurar arrays vacíos en caso de error
      setProductos([]);
      setPedidos([]);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función segura para parsear números
  const safeParseNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Obtener estadísticas
  const safePedidos = Array.isArray(pedidos) ? pedidos : [];
  const pedidosRecientes = safePedidos.slice(0, 3);
  const totalPedidos = safePedidos.length;
  
  const pedidosActivos = safePedidos.filter(p => {
    const status = p.estado?.nombre_estado || p.id_estado;
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    return statusStr === 'pendiente' || statusStr === 'preparando';
  }).length;
  
  const pedidosCompletados = safePedidos.filter(p => {
    const status = p.estado?.nombre_estado || p.id_estado;
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    return statusStr === 'entregado' || statusStr === 'listo';
  }).length;

  const productosActivos = productos.filter(p => p.activo !== false).length;

  // Obtener color según estado
  const getStatusColor = (estado) => {
    const status = estado?.nombre_estado || estado;
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    
    switch (statusStr) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'preparando': return 'bg-blue-100 text-blue-700';
      case 'listo': return 'bg-green-100 text-green-700';
      case 'entregado': return 'bg-emerald-100 text-emerald-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando tu experiencia personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />

      <main className="max-w-7xl mx-auto px-4 py-24">
        {/* Header con botón de recargar */}
        <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              ¡Hola, {user?.nombre || "Usuario"}! 👋
            </h2>
            <p className="text-gray-600">
              Bienvenido al sistema de pedidos de <span className="text-primary font-semibold">CaféTec</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
            
            <button
              onClick={() => navigate("/client/menu")}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Nuevo Pedido
            </button>
          </div>
        </section>

        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error.message}</p>
                {error.details && (
                  <p className="text-red-700 text-sm mt-1">{error.details}</p>
                )}
                <button
                  onClick={error.action}
                  className="mt-3 text-sm bg-red-100 text-red-700 px-4 py-1.5 rounded hover:bg-red-200 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📊 Estadísticas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div 
            className="bg-white shadow rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
            onClick={() => navigate("/client/orders")}
          >
            <div className="bg-primary/10 p-3 rounded-lg">
              <Package className="text-primary w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Totales</p>
              <p className="text-2xl font-bold text-gray-800">{totalPedidos}</p>
            </div>
          </div>

          <div 
            className="bg-white shadow rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
            onClick={() => navigate("/client/orders")}
          >
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Activos</p>
              <p className="text-2xl font-bold text-gray-800">{pedidosActivos}</p>
            </div>
          </div>

          <div 
            className="bg-white shadow rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
            onClick={() => navigate("/client/orders")}
          >
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Entregados</p>
              <p className="text-2xl font-bold text-gray-800">{pedidosCompletados}</p>
            </div>
          </div>

          <div 
            className="bg-white shadow rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
            onClick={() => navigate("/client/menu")}
          >
            <div className="bg-orange-100 p-3 rounded-lg">
              <Coffee className="text-orange-600 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos disponibles</p>
              <p className="text-2xl font-bold text-gray-800">{productosActivos}</p>
            </div>
          </div>
        </section>

        {/* 🧾 Pedidos recientes */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="text-primary w-5 h-5" />
              Tus pedidos recientes
            </h3>
            {safePedidos.length > 0 && (
              <button
                onClick={() => navigate("/client/orders")}
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                Ver todos ({totalPedidos})
                <span className="text-xs">→</span>
              </button>
            )}
          </div>

          {pedidosRecientes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pedidosRecientes.map((pedido) => {
                const total = safeParseNumber(pedido.total);
                const estadoNombre = pedido.estado?.nombre_estado || "Pendiente";
                
                return (
                  <div
                    key={pedido.id_pedido}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 border-l-4 border-primary group cursor-pointer"
                    onClick={() => navigate(`/client/orders/${pedido.id_pedido}`)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">
                          Pedido #{pedido.id_pedido}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(pedido.fecha_pedido)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        ID: {pedido.id_pedido}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(pedido.estado)}`}>
                          {estadoNombre}
                        </span>
                      </div>
                      
                      {/* Pago */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pago:</span>
                        <span className={`font-medium ${pedido.pagado ? 'text-green-600' : 'text-yellow-600'}`}>
                          {pedido.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(total)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/client/orders/${pedido.id_pedido}`);
                          }}
                          className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition group-hover:bg-orange-600"
                        >
                          Ver Detalle
                        </button>
                      </div>
                      
                      {/* Productos mini preview */}
                      {pedido.productos && pedido.productos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            {pedido.productos.length} {pedido.productos.length === 1 ? 'producto' : 'productos'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {pedido.productos.slice(0, 3).map((prod, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
                              >
                                {prod.cantidad}x {prod.nombre?.substring(0, 10)}...
                              </span>
                            ))}
                            {pedido.productos.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">
                                +{pedido.productos.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                No tienes pedidos aún
              </h4>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Descubre nuestra selección de productos y haz tu primer pedido. ¡Te esperamos!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/client/menu")}
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  <ShoppingCart className="inline w-5 h-5 mr-2" />
                  Ver Menú y Ordenar
                </button>
                <button
                  onClick={() => navigate("/client/orders")}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Ver Historial de Pedidos
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ☕ Productos destacados */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Coffee className="text-orange-500 w-5 h-5" />
              Productos destacados
            </h3>
            <button
              onClick={() => navigate("/client/menu")}
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              Ver menú completo
              <span className="text-xs">→</span>
            </button>
          </div>
          
          {productos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {productos.slice(0, 6).map((producto) => {
                  const precio = safeParseNumber(producto.precio);
                  const isActive = producto.activo !== false;
                  
                  return (
                    <div
                      key={producto.id_producto}
                      className={`bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group ${!isActive ? 'opacity-60' : ''}`}
                      onClick={() => navigate("/client/menu")}
                    >
                      <div className="h-28 bg-gray-100 flex items-center justify-center relative">
                        {producto.imagen_url ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${producto.imagen_url}`}
                            alt={producto.nombre_producto}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E☕%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-200">
                            <Coffee className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/60 px-2 py-1 rounded">
                              No disponible
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <h4 className="font-medium text-gray-800 truncate text-sm mb-1">
                          {producto.nombre_producto}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-bold text-sm">
                            {formatCurrency(precio)}
                          </p>
                          {producto.stock !== null && producto.stock < 10 && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                              {producto.stock} restantes
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/client/menu");
                          }}
                          className="mt-2 w-full bg-primary text-white text-xs py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isActive}
                        >
                          {isActive ? 'Agregar al carrito' : 'No disponible'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center mt-8">
                <button
                  onClick={() => navigate("/client/menu")}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-full transition shadow hover:shadow-md"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Explorar Menú Completo
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow">
              <Coffee className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                No hay productos disponibles
              </h4>
              <p className="text-gray-500 mb-6">
                Lo sentimos, en este momento no tenemos productos disponibles.
              </p>
              <button
                onClick={() => loadData(true)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className="inline w-4 h-4 mr-2" />
                Reintentar
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}