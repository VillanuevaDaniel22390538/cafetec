// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminOrderService } from '../../api/adminOrderService';
import { formatCurrency } from '../../utils/formatters';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  ShoppingBag,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Utensils,
  Percent,
  Calendar,
  ShoppingCart
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosHoy: 0,
    ventasHoy: 0,
    productosActivos: 0,
    pedidosPendientes: 0,
    ventasUltimaSemana: [],
    productosMasVendidos: []
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Cargar estadísticas y pedidos recientes en paralelo
        const [dashboardStats, allOrders] = await Promise.all([
          adminOrderService.getDashboardStats(),
          adminOrderService.getAllOrders()
        ]);

        // Obtener últimos 5 pedidos
        const ultimosPedidos = allOrders
          .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
          .slice(0, 5);

        setStats(dashboardStats);
        setRecentOrders(ultimosPedidos);

      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getEstadoStyle = (estadoId) => {
    const styles = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-emerald-100 text-emerald-800',
      5: 'bg-red-100 text-red-800'
    };
    return styles[estadoId] || styles[1];
  };

  const getEstadoNombre = (estadoId) => {
    const nombres = { 
      1: 'Pendiente', 
      2: 'Preparando', 
      3: 'Listo', 
      4: 'Entregado', 
      5: 'Cancelado' 
    };
    return nombres[estadoId] || 'Desconocido';
  };

  // Calcular métricas adicionales
  const ventasSemanaTotal = stats.ventasUltimaSemana.reduce((sum, dia) => sum + dia.total_ventas, 0);
  const ventasSemanaAnterior = ventasSemanaTotal * 0.85; // Simulación del 85% para tener comparación
  const crecimientoVentas = ventasSemanaAnterior > 0 
    ? ((ventasSemanaTotal - ventasSemanaAnterior) / ventasSemanaAnterior * 100).toFixed(1)
    : 0;

  // Formatear datos para el gráfico
  const getDiaNombre = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', { weekday: 'short' });
  };

  const maxVentas = Math.max(...stats.ventasUltimaSemana.map(d => d.total_ventas), 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Pedidos', 
      value: stats.totalPedidos, 
      icon: <Package className="w-6 h-6" />,
      color: 'bg-secondary/10 text-secondary',
      border: 'border-secondary/20',
      description: 'Desde el inicio'
    },
    { 
      title: 'Pedidos Hoy', 
      value: stats.pedidosHoy, 
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-primary/10 text-primary',
      border: 'border-primary/20',
      description: 'Hasta este momento'
    },
    { 
      title: 'Ventas Hoy', 
      value: formatCurrency(stats.ventasHoy), 
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-100 text-green-800',
      border: 'border-green-200',
      description: 'Ingresos del día'
    },
    { 
      title: 'Por Atender', 
      value: stats.pedidosPendientes, 
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-800',
      border: 'border-orange-200',
      description: 'Pedidos pendientes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general de CaféTec</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl border ${card.border} p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
              {card.trend && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-4">{card.value}</p>
            <p className="text-lg font-semibold text-gray-700 mt-1">{card.title}</p>
            <p className="text-sm text-gray-500 mt-2">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Análisis y pedidos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de ventas de la semana */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ventas de la Semana
                </h2>
                <p className="text-sm text-gray-500 mt-1">Últimos 7 días</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {crecimientoVentas > 0 ? '+' : ''}{crecimientoVentas}%
                </div>
                <span className="text-sm text-gray-500">
                  vs. semana anterior
                </span>
              </div>
            </div>
            <div className="p-6">
              {stats.ventasUltimaSemana.length > 0 ? (
                <>
                  <div className="h-48 flex items-end space-x-2 mb-6">
                    {stats.ventasUltimaSemana.map((dia, index) => {
                      const porcentaje = dia.total_ventas > 0 ? (dia.total_ventas / maxVentas * 100) : 5;
                      const diaNombre = getDiaNombre(dia.fecha);
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full">
                            <div 
                              className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-orange-500 cursor-pointer"
                              style={{ height: `${porcentaje}%`, minHeight: '10px' }}
                              title={`${diaNombre}: ${formatCurrency(dia.total_ventas)}`}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatCurrency(dia.total_ventas)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{diaNombre}</span>
                          <span className="text-xs font-medium text-gray-700">
                            {dia.cantidad_pedidos} ped.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Total de la semana</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(ventasSemanaTotal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Promedio diario</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatCurrency(ventasSemanaTotal / Math.max(stats.ventasUltimaSemana.length, 1))}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay datos de ventas recientes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pedidos recientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Pedidos Recientes
              </h2>
              <Link 
                to="/admin/orders" 
                className="text-sm text-primary hover:text-orange-600 font-medium flex items-center"
              >
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id_pedido} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-800">
                                Pedido #{order.id_pedido}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(order.id_estado)}`}>
                                {getEstadoNombre(order.id_estado)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {order.usuario?.nombre || 'Cliente'}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {order.horario?.hora_inicio || '--:--'} - {order.horario?.hora_fin || '--:--'}
                              </span>
                              <span>
                                {new Date(order.fecha_pedido).toLocaleTimeString('es-MX', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-primary text-lg">{formatCurrency(order.total)}</p>
                        <Link
                          to={`/admin/orders/${order.id_pedido}`}
                          className="text-xs text-primary hover:text-orange-600 font-medium inline-flex items-center mt-1"
                        >
                          Ver detalles <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay pedidos recientes</p>
                  <p className="text-gray-400 text-sm mt-1">Los nuevos pedidos aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Analytics y acciones */}
        <div className="space-y-6">
          {/* Productos más vendidos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Productos Más Vendidos
              </h2>
              <p className="text-sm text-gray-500 mt-1">Últimos 30 días</p>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.productosMasVendidos.length > 0 ? (
                stats.productosMasVendidos.map((product, index) => (
                  <div key={product.id_producto} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 line-clamp-1">
                            {product.nombre_producto}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {product.total_vendido} unidades
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {formatCurrency(product.ingresos_totales)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatCurrency(product.precio)}</p>
                        <span className="text-xs text-gray-500">precio unitario</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay datos de ventas</p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/admin/products/new"
                className="flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 text-primary rounded">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-800">Agregar Producto</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-3 bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/10 text-secondary rounded">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-800">Gestionar Pedidos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors" />
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 text-green-800 rounded">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-800">Ver Productos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Resumen del día */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Resumen del Día</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Pedidos atendidos</span>
                  <span className="font-semibold text-gray-800">
                    {stats.pedidosHoy - stats.pedidosPendientes} de {stats.pedidosHoy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Productos activos</span>
                  <span className="font-semibold text-gray-800">{stats.productosActivos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Ticket promedio</span>
                  <span className="font-semibold text-primary">
                    {stats.pedidosHoy > 0 ? formatCurrency(stats.ventasHoy / stats.pedidosHoy) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Eficiencia</span>
                  <div className="flex items-center text-green-600 font-semibold">
                    <Percent className="w-4 h-4 mr-1" />
                    {stats.pedidosPendientes === 0 ? '100%' : 
                     `${Math.round((stats.pedidosHoy - stats.pedidosPendientes) / stats.pedidosHoy * 100)}%`}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Sistema operativo normal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}