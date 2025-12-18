// src/pages/client/OrderHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { formatCurrency } from '../../utils/formatters';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Cargando historial...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-secondary">Historial de Pedidos</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No has realizado pedidos aún.</p>
            <button
              onClick={() => navigate('/client/menu')}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Explorar menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id_pedido} className="bg-white p-5 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">Pedido #{order.id_pedido}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.fecha_pedido).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.id_estado === 4 // Entregado
                        ? 'bg-green-100 text-green-800'
                        : order.id_estado === 3 // Listo
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.estado?.nombre_estado || 'Pendiente'}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-medium text-gray-700">Productos:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                    {order.detalles?.map((detalle, idx) => (
                      <li key={idx}>
                        {detalle.cantidad}x {detalle.producto?.nombre_producto}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <span className="text-primary font-bold">{formatCurrency(order.total)}</span>
                  <span className="text-sm text-gray-500">
                    Horario: {order.horario?.hora_inicio} - {order.horario?.hora_fin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}