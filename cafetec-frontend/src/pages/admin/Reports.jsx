// src/pages/admin/Reports.jsx
import { useState, useEffect } from 'react';
import { reportService } from '../../api/reportService';
import { formatCurrency } from '../../utils/formatters';
import { 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  TrendingDown,
  Clock,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]); // Cambiado: estado separado para ventas filtradas
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dateRange, setDateRange] = useState('30dias'); // 'hoy', '7dias', '30dias', 'personalizado'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    method: 'todos',
    minAmount: '',
    maxAmount: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_pago', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedView, setExpandedView] = useState('overview'); // 'overview', 'detailed', 'charts'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, methods] = await Promise.all([
          reportService.getAllSales(),
          reportService.getPaymentMethods()
        ]);
        setSales(salesData);
        setPaymentMethods(methods);
        setFilteredSales(salesData); // Inicialmente mostrar todas las ventas
        
        // Establecer fechas por defecto (últimos 30 días)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        setFilters(prev => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }));
      } catch (err) {
        console.error('Error al cargar reportes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.fecha_pago).toISOString().split('T')[0];
        const saleAmount = sale.monto_pagado;
        
        const matchesDate = (!filters.startDate || saleDate >= filters.startDate) &&
                            (!filters.endDate || saleDate <= filters.endDate);
        const matchesMethod = filters.method === 'todos' || sale.id_metodo == filters.method;
        const matchesMinAmount = !filters.minAmount || saleAmount >= parseFloat(filters.minAmount);
        const matchesMaxAmount = !filters.maxAmount || saleAmount <= parseFloat(filters.maxAmount);
        
        return matchesDate && matchesMethod && matchesMinAmount && matchesMaxAmount;
      });
      
      setFilteredSales(filtered);
      setCurrentPage(1); // Resetear a primera página al filtrar
    };
    
    if (sales.length > 0) {
      applyFilters();
    }
  }, [filters, sales]);

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    const newFilters = { ...filters };
    
    switch (range) {
      case 'hoy':
        const todayStr = today.toISOString().split('T')[0];
        newFilters.startDate = todayStr;
        newFilters.endDate = todayStr;
        break;
      case '7dias':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        newFilters.startDate = weekAgo.toISOString().split('T')[0];
        newFilters.endDate = today.toISOString().split('T')[0];
        break;
      case '30dias':
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        newFilters.startDate = monthAgo.toISOString().split('T')[0];
        newFilters.endDate = today.toISOString().split('T')[0];
        break;
      case 'personalizado':
        // No cambia las fechas, el usuario las establecerá manualmente
        break;
    }
    
    setFilters(newFilters);
  };

  // Ordenar ventas
  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortConfig.key === 'fecha_pago') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.fecha_pago) - new Date(b.fecha_pago)
        : new Date(b.fecha_pago) - new Date(a.fecha_pago);
    }
    if (sortConfig.key === 'monto_pagado') {
      return sortConfig.direction === 'asc' 
        ? a.monto_pagado - b.monto_pagado
        : b.monto_pagado - a.monto_pagado;
    }
    if (sortConfig.key === 'id_venta') {
      return sortConfig.direction === 'asc' 
        ? a.id_venta - b.id_venta
        : b.id_venta - a.id_venta;
    }
    if (sortConfig.key === 'id_pedido') {
      return sortConfig.direction === 'asc' 
        ? a.id_pedido - b.id_pedido
        : b.id_pedido - a.id_pedido;
    }
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcular estadísticas
  const totalVentas = filteredSales.length;
  const totalMonto = filteredSales.reduce((sum, sale) => sum + sale.monto_pagado, 0);
  const promedioVenta = totalVentas > 0 ? totalMonto / totalVentas : 0;
  
  // Ventas por día de la semana
  const salesByDayOfWeek = filteredSales.reduce((acc, sale) => {
    const day = new Date(sale.fecha_pago).getDay();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (!acc[day]) {
      acc[day] = { name: dayNames[day], count: 0, amount: 0 };
    }
    acc[day].count += 1;
    acc[day].amount += sale.monto_pagado;
    return acc;
  }, []);

  // Agrupar por método de pago
  const salesByMethod = paymentMethods.map(method => {
    const methodSales = filteredSales.filter(s => s.id_metodo === method.id_metodo);
    const count = methodSales.length;
    const amount = methodSales.reduce((sum, s) => sum + s.monto_pagado, 0);
    const percentage = totalMonto > 0 ? (amount / totalMonto * 100).toFixed(1) : 0;
    
    return { 
      ...method, 
      count, 
      amount, 
      percentage,
      icon: getPaymentMethodIcon(method.nombre_metodo)
    };
  }).sort((a, b) => b.amount - a.amount);

  // Ventas por hora (agrupadas)
  const salesByHour = filteredSales.reduce((acc, sale) => {
    const hour = new Date(sale.fecha_pago).getHours();
    const hourGroup = `${hour}:00`;
    if (!acc[hourGroup]) {
      acc[hourGroup] = { hour: hourGroup, count: 0, amount: 0 };
    }
    acc[hourGroup].count += 1;
    acc[hourGroup].amount += sale.monto_pagado;
    return acc;
  }, {});

  const salesByHourArray = Object.values(salesByHour).sort((a, b) => {
    const hourA = parseInt(a.hour);
    const hourB = parseInt(b.hour);
    return hourA - hourB;
  });

  // Obtener icono según método de pago
  function getPaymentMethodIcon(methodName) {
    const icons = {
      'Efectivo': <Wallet className="w-5 h-5" />,
      'Tarjeta Débito': <CreditCard className="w-5 h-5" />,
      'Tarjeta Crédito': <CreditCard className="w-5 h-5" />,
      'Transferencia': <TrendingUp className="w-5 h-5" />
    };
    return icons[methodName] || <DollarSign className="w-5 h-5" />;
  }

  // Exportar a CSV
  const exportToCSV = async () => {
    try {
      setExporting(true);
      const headers = ['ID Venta', 'ID Pedido', 'Método de Pago', 'Monto', 'Fecha', 'Referencia', 'Estado'];
      const rows = filteredSales.map(sale => [
        sale.id_venta,
        sale.id_pedido,
        paymentMethods.find(m => m.id_metodo === sale.id_metodo)?.nombre_metodo || 'N/A',
        sale.monto_pagado,
        new Date(sale.fecha_pago).toLocaleString('es-MX'),
        sale.referencia_pago || '',
        sale.estado_pago || 'completado'
      ]);

      let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // BOM para Excel
      csvContent += [headers, ...rows].map(e => e.join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `reporte_ventas_cafetec_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el archivo CSV');
    } finally {
      setExporting(false);
    }
  };

  // Exportar a PDF (simulación)
  const exportToPDF = () => {
    alert('La exportación a PDF estará disponible próximamente');
    // En una implementación real, usarías una librería como jsPDF
  };

  // Imprimir reporte
  const printReport = () => {
    window.print();
  };

  // Calcular crecimiento vs periodo anterior
  const calculateGrowth = () => {
    // En una implementación real, compararías con datos del periodo anterior
    return totalVentas > 10 ? 12.5 : 0; // Simulación
  };

  const growth = calculateGrowth();

  // Función para cargar datos con filtros usando el endpoint optimizado
  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const filteredData = await reportService.getFilteredSales({
        startDate: filters.startDate,
        endDate: filters.endDate,
        method: filters.method !== 'todos' ? filters.method : undefined,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount
      });
      setFilteredSales(filteredData);
    } catch (err) {
      console.error('Error al cargar datos filtrados:', err);
      // Si falla, usar filtrado local como fallback
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.fecha_pago).toISOString().split('T')[0];
        const saleAmount = sale.monto_pagado;
        
        const matchesDate = (!filters.startDate || saleDate >= filters.startDate) &&
                            (!filters.endDate || saleDate <= filters.endDate);
        const matchesMethod = filters.method === 'todos' || sale.id_metodo == filters.method;
        const matchesMinAmount = !filters.minAmount || saleAmount >= parseFloat(filters.minAmount);
        const matchesMaxAmount = !filters.maxAmount || saleAmount <= parseFloat(filters.maxAmount);
        
        return matchesDate && matchesMethod && matchesMinAmount && matchesMaxAmount;
      });
      setFilteredSales(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Botón para usar el endpoint optimizado
  const handleOptimizedFilter = () => {
    fetchFilteredData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reportes de Ventas</h1>
          <p className="text-gray-500 mt-1">Análisis detallado de transacciones y tendencias</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                expandedView === 'overview' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setExpandedView('detailed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                expandedView === 'detailed' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setExpandedView('charts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                expandedView === 'charts' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gráficos
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOptimizedFilter}
              className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Aplicar Filtros
            </button>
            <button
              onClick={() => handleDateRangeChange('30dias')}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              Restablecer
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Rango de fechas rápido */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Rango de fechas:</p>
            <div className="flex flex-wrap gap-2">
              {['hoy', '7dias', '30dias', 'personalizado'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'hoy' && 'Hoy'}
                  {range === '7dias' && 'Últimos 7 días'}
                  {range === '30dias' && 'Últimos 30 días'}
                  {range === 'personalizado' && 'Personalizado'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Fechas personalizadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todos los métodos</option>
                {paymentMethods.map(method => (
                  <option key={method.id_metodo} value={method.id_metodo}>
                    {method.nombre_metodo}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto Mínimo</label>
                <input
                  type="number"
                  placeholder="Mín."
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto Máximo</label>
                <input
                  type="number"
                  placeholder="Máx."
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ventas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            {growth > 0 ? (
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{growth}%
              </span>
            ) : (
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                Estable
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{totalVentas}</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">Total Ventas</p>
          <p className="text-sm text-gray-500 mt-2">En el periodo seleccionado</p>
        </div>

        {/* Monto Total */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{formatCurrency(totalMonto)}</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">Monto Total</p>
          <p className="text-sm text-gray-500 mt-2">Ingresos generados</p>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">{formatCurrency(promedioVenta)}</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">Ticket Promedio</p>
          <p className="text-sm text-gray-500 mt-2">Por transacción</p>
        </div>

        {/* Métodos de Pago */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-4">
            {salesByMethod.filter(m => m.count > 0).length}
          </p>
          <p className="text-lg font-semibold text-gray-700 mt-1">Métodos Usados</p>
          <p className="text-sm text-gray-500 mt-2">Distintos tipos de pago</p>
        </div>
      </div>

      {/* Vista de Resumen */}
      {expandedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métodos de pago */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Distribución por Método de Pago
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {salesByMethod.map((method, index) => (
                  method.count > 0 && (
                    <div key={method.id_metodo} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            index === 0 ? 'bg-primary/10 text-primary' :
                            index === 1 ? 'bg-secondary/10 text-secondary' :
                            index === 2 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{method.nombre_metodo}</p>
                            <p className="text-sm text-gray-500">{method.count} transacciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatCurrency(method.amount)}</p>
                          <p className="text-sm text-gray-500">{method.percentage}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-secondary' :
                            index === 2 ? 'bg-green-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Ventas por hora */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Ventas por Hora del Día
              </h2>
            </div>
            <div className="p-6">
              {salesByHourArray.length > 0 ? (
                <div className="h-64 flex items-end space-x-1">
                  {salesByHourArray.map((hourData, index) => {
                    const maxAmount = Math.max(...salesByHourArray.map(h => h.amount), 1);
                    const height = (hourData.amount / maxAmount) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-orange-500"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${hourData.hour}: ${formatCurrency(hourData.amount)} (${hourData.count} ventas)`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              {formatCurrency(hourData.amount)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{hourData.hour}</span>
                        <span className="text-xs font-medium text-gray-700">
                          {hourData.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay datos de ventas por hora</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Detalles */}
      {expandedView === 'detailed' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Detalle de Ventas
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToPDF}
                disabled={exporting}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                onClick={printReport}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </button>
              <button
                onClick={exportToCSV}
                disabled={exporting || filteredSales.length === 0}
                className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortConfig({ key: 'id_venta', direction: sortConfig.key === 'id_venta' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  >
                    <div className="flex items-center">
                      ID Venta
                      {sortConfig.key === 'id_venta' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortConfig({ key: 'id_pedido', direction: sortConfig.key === 'id_pedido' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  >
                    <div className="flex items-center">
                      ID Pedido
                      {sortConfig.key === 'id_pedido' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortConfig({ key: 'monto_pagado', direction: sortConfig.key === 'monto_pagado' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  >
                    <div className="flex items-center">
                      Monto
                      {sortConfig.key === 'monto_pagado' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => setSortConfig({ key: 'fecha_pago', direction: sortConfig.key === 'fecha_pago' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  >
                    <div className="flex items-center">
                      Fecha
                      {sortConfig.key === 'fecha_pago' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">No hay ventas en el periodo seleccionado</p>
                        <p className="text-sm mt-1">Intenta ajustar los filtros</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map(sale => (
                    <tr key={sale.id_venta} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{sale.id_venta}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">#{sale.id_pedido}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 rounded mr-2">
                            {getPaymentMethodIcon(paymentMethods.find(m => m.id_metodo === sale.id_metodo)?.nombre_metodo)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {paymentMethods.find(m => m.id_metodo === sale.id_metodo)?.nombre_metodo || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary">{formatCurrency(sale.monto_pagado)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(sale.fecha_pago).toLocaleDateString('es-MX')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.fecha_pago).toLocaleTimeString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {sale.referencia_pago ? (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{sale.referencia_pago}</span>
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sale.estado_pago === 'completado' ? 'bg-green-100 text-green-800' :
                          sale.estado_pago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          sale.estado_pago === 'fallido' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.estado_pago || 'completado'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {paginatedSales.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedSales.length)}</span> de{' '}
                <span className="font-medium">{sortedSales.length}</span> ventas
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === pageNumber
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista de Gráficos */}
      {expandedView === 'charts' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Visualización de Datos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico circular métodos de pago */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Distribución de Pagos</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {salesByMethod.filter(m => m.amount > 0).map((method, index, array) => {
                    const total = array.reduce((sum, m) => sum + m.amount, 0);
                    const percentage = (method.amount / total) * 100;
                    const startAngle = array.slice(0, index).reduce((sum, m) => sum + (m.amount / total) * 360, 0);
                    const endAngle = startAngle + (percentage / 100) * 360;
                    
                    return (
                      <div key={method.id_metodo}>
                        <div 
                          className="absolute top-0 left-0 w-full h-full rounded-full"
                          style={{
                            background: `conic-gradient(
                              from ${startAngle}deg,
                              ${index === 0 ? '#F57C00' : index === 1 ? '#00488f' : index === 2 ? '#10b981' : '#9ca3af'} 0deg,
                              ${index === 0 ? '#F57C00' : index === 1 ? '#00488f' : index === 2 ? '#10b981' : '#9ca3af'} ${endAngle - startAngle}deg,
                              transparent ${endAngle - startAngle}deg,
                              transparent 360deg
                            )`
                          }}
                        ></div>
                      </div>
                    );
                  })}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {salesByMethod.filter(m => m.amount > 0).map((method, index) => (
                  <div key={method.id_metodo} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: index === 0 ? '#F57C00' : index === 1 ? '#00488f' : index === 2 ? '#10b981' : '#9ca3af'
                        }}
                      ></div>
                      <span className="text-sm text-gray-700">{method.nombre_metodo}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{method.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ventas por día de la semana */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Ventas por Día de la Semana</h3>
              <div className="h-64">
                {salesByDayOfWeek.length > 0 ? (
                  <div className="h-full flex items-end space-x-4">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
                      const dayData = salesByDayOfWeek[index] || { amount: 0, count: 0 };
                      const maxAmount = Math.max(...salesByDayOfWeek.filter(d => d).map(d => d.amount), 1);
                      const height = (dayData.amount / maxAmount) * 100;
                      
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full">
                            <div 
                              className="w-full bg-secondary rounded-t transition-all duration-300 hover:bg-blue-600"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${day}: ${formatCurrency(dayData.amount)} (${dayData.count} ventas)`}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatCurrency(dayData.amount)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{day}</span>
                          <span className="text-xs font-medium text-gray-700">
                            {dayData.count || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No hay datos por día de la semana</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen final */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen del Reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Periodo analizado</p>
            <p className="font-medium text-gray-800">
              {filters.startDate} a {filters.endDate}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monto promedio por venta</p>
            <p className="font-medium text-gray-800">{formatCurrency(promedioVenta)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Método más popular</p>
            <p className="font-medium text-gray-800">
              {salesByMethod[0]?.nombre_metodo || 'No hay datos'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Fecha de generación</p>
            <p className="font-medium text-gray-800">
              {new Date().toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}