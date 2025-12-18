// src/pages/client/OrderList.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../api/orderService";
import ClientHeader from "../../components/ClientHeader";
import { 
  ArrowLeft, 
  Package, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function OrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [pedidos, searchTerm, filterStatus, sortBy]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getMyOrders();
      console.log("📦 Todos los pedidos:", ordersData);
      setPedidos(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("❌ Error cargando pedidos:", err);
      setError(err.message || "No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...pedidos];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pedido =>
        pedido.id_pedido.toString().includes(searchTerm) ||
        (pedido.notas && pedido.notas.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter(pedido => {
        const status = pedido.estado?.nombre_estado || pedido.id_estado;
        const statusName = typeof status === 'string' ? status.toLowerCase() : '';
        return statusName === filterStatus;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha_pedido || 0);
      const dateB = new Date(b.fecha_pedido || 0);
      
      switch (sortBy) {
        case "date-asc": return dateA - dateB;
        case "price-desc": return (b.total || 0) - (a.total || 0);
        case "price-asc": return (a.total || 0) - (b.total || 0);
        default: return dateB - dateA; // date-desc
      }
    });

    setFilteredPedidos(filtered);
  };

  const getStatusInfo = (status) => {
    const statusName = typeof status === 'object' ? status?.nombre_estado : status;
    
    switch (statusName?.toLowerCase()) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'preparando':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'listo':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'entregado':
        return { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle };
      case 'cancelado':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Package };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <main className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando tus pedidos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />

      <main className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/client/dashboard"
            className="inline-flex items-center text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
              <p className="text-gray-600">
                {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} en total
              </p>
            </div>
            
            <button
              onClick={() => navigate("/client/menu")}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              + Nuevo Pedido
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar pedido
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ID del pedido o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="preparando">Preparando</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date-desc">Más recientes primero</option>
                <option value="date-asc">Más antiguos primero</option>
                <option value="price-desc">Mayor precio primero</option>
                <option value="price-asc">Menor precio primero</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {error ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-red-600 mb-4">⚠️ {error}</p>
            <button
              onClick={loadOrders}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Reintentar
            </button>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || filterStatus !== "all" ? "No hay resultados" : "No tienes pedidos"}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || filterStatus !== "all" 
                ? "Intenta con otros filtros de búsqueda." 
                : "¡Haz tu primer pedido ahora mismo!"}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                navigate("/client/menu");
              }}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition text-lg"
            >
              Hacer un pedido
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPedidos.map((pedido) => {
              const StatusIcon = getStatusInfo(pedido.estado).icon;
              
              return (
                <div
                  key={pedido.id_pedido}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            Pedido #{pedido.id_pedido}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(pedido.estado).color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {pedido.estado?.nombre_estado || "Pendiente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(pedido.fecha_pedido)}
                          </span>
                          {pedido.horario && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {pedido.horario.hora_inicio} - {pedido.horario.hora_fin}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary mb-2">
                          {formatCurrency(pedido.total || 0)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${pedido.pagado ? 'text-green-600' : 'text-yellow-600'}`}>
                            <DollarSign className="inline w-4 h-4 mr-1" />
                            {pedido.pagado ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Productos resumen */}
                    {pedido.productos && pedido.productos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {pedido.productos.length} {pedido.productos.length === 1 ? 'producto' : 'productos'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pedido.productos.slice(0, 3).map((prod, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                            >
                              {prod.cantidad}x {prod.nombre}
                            </span>
                          ))}
                          {pedido.productos.length > 3 && (
                            <span className="inline-block bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full">
                              +{pedido.productos.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate(`/client/orders/${pedido.id_pedido}`)}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        Ver Detalles
                      </button>
                      
                      {!pedido.pagado && pedido.id_estado !== 4 && (
                        <button
                          onClick={() => navigate(`/client/payment/${pedido.id_pedido}`)}
                          className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                        >
                          Pagar Ahora
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/client/track/${pedido.id_pedido}`)}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        Seguir Pedido
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}