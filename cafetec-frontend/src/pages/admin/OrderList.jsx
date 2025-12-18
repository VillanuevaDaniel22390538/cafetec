// src/pages/admin/OrderList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminOrderService } from '../../api/adminOrderService';
import { formatCurrency } from '../../utils/formatters';
import { 
  Clock, 
  User, 
  DollarSign, 
  Filter, 
  Search, 
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Utensils,
  Truck,
  FileText,
  Eye
} from 'lucide-react';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_pedido', direction: 'desc' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await adminOrderService.getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatusId) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatusId);
      setOrders(prev =>
        prev.map(order =>
          order.id_pedido === orderId ? { ...order, id_estado: newStatusId } : order
        )
      );
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Sistema de colores mejorado para estados
  const getEstadoConfig = (estadoId) => {
    const configs = {
      1: { 
        nombre: 'Pendiente', 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        icon: <Clock className="w-4 h-4" />,
        badge: 'bg-gray-100 text-gray-800 border border-gray-300'
      },
      2: { 
        nombre: 'Preparando', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: <Utensils className="w-4 h-4" />,
        badge: 'bg-blue-100 text-blue-800 border border-blue-300'
      },
      3: { 
        nombre: 'Listo', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: <Package className="w-4 h-4" />,
        badge: 'bg-green-100 text-green-800 border border-green-300'
      },
      4: { 
        nombre: 'Entregado', 
        bgColor: 'bg-emerald-50', 
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        icon: <CheckCircle className="w-4 h-4" />,
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      },
      5: { 
        nombre: 'Cancelado', 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />,
        badge: 'bg-red-100 text-red-800 border border-red-300'
      }
    };
    return configs[estadoId] || configs[1];
  };

  // Filtrar y ordenar pedidos
  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id_pedido.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || order.id_estado.toString() === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'fecha_pedido') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.fecha_pedido) - new Date(b.fecha_pedido)
          : new Date(b.fecha_pedido) - new Date(a.fecha_pedido);
      }
      if (sortConfig.key === 'total') {
        return sortConfig.direction === 'asc' ? a.total - b.total : b.total - a.total;
      }
      return 0;
    });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">Control y seguimiento de todos los pedidos</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pedido o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full lg:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="1">Pendiente</option>
            <option value="2">Preparando</option>
            <option value="3">Listo</option>
            <option value="4">Entregado</option>
            <option value="5">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(statusId => {
          const config = getEstadoConfig(statusId);
          const count = orders.filter(order => order.id_estado === statusId).length;
          return (
            <div key={statusId} className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
              <div className="flex items-center space-x-2">
                {config.icon}
                <span className={`text-sm font-medium ${config.textColor}`}>
                  {config.nombre}
                </span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${config.textColor}`}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron pedidos</p>
            <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredAndSortedOrders.map(order => {
            const estadoConfig = getEstadoConfig(order.id_estado);
            const isExpanded = expandedOrder === order.id_pedido;
            const isUpdating = updating[order.id_pedido];

            return (
              <div
                key={order.id_pedido}
                className={`bg-white rounded-xl border-2 ${estadoConfig.borderColor} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                {/* Header del pedido */}
                <div className={`p-6 ${estadoConfig.bgColor}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${estadoConfig.badge}`}>
                          {estadoConfig.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            Pedido #{order.id_pedido}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.fecha_pedido).toLocaleString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{order.usuario?.nombre || 'Cliente'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{order.horario?.hora_inicio} - {order.horario?.hora_fin}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-primary font-bold">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido expandible */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoConfig.badge}`}>
                        {estadoConfig.icon}
                        <span className="ml-2">{estadoConfig.nombre}</span>
                      </span>
                      
                      <button
                        onClick={() => toggleOrderExpand(order.id_pedido)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <span>{isExpanded ? 'Menos detalles' : 'Más detalles'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-3">
                        <select
                          value={order.id_estado}
                          onChange={(e) => handleUpdateStatus(order.id_pedido, parseInt(e.target.value))}
                          disabled={isUpdating}
                          className={`min-w-[140px] py-2 pl-3 pr-8 text-sm font-medium rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                            isUpdating ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-400'
                          }`}
                        >
                          <option value={1}>Pendiente</option>
                          <option value={2}>Preparando</option>
                          <option value={3}>Listo</option>
                          <option value={4}>Entregado</option>
                          <option value={5}>Cancelado</option>
                        </select>
                        
                        {/* BOTÓN DE DETALLES - NUEVO */}
                        <Link
                          to={`/admin/orders/${order.id_pedido}`}
                          className="inline-flex items-center px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </div>
                      
                      {isUpdating && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Información del Cliente</h4>
                          <p><strong>Nombre:</strong> {order.usuario?.nombre || 'No especificado'}</p>
                          <p><strong>Email:</strong> {order.usuario?.email || 'No especificado'}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Detalles del Pedido</h4>
                          <p><strong>Horario programado:</strong> {order.horario?.hora_inicio} - {order.horario?.hora_fin}</p>
                          <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          ID del pedido: {order.id_pedido} | 
                          Última actualización: {new Date().toLocaleTimeString('es-MX')}
                        </p>
                        <Link
                          to={`/admin/orders/${order.id_pedido}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Ver página completa
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}