// src/pages/admin/ProductList.jsx
import { useState, useEffect } from 'react';
import { adminProductService } from '../../api/adminProductService';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // 'todos', 'activos', 'inactivos'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await adminProductService.getAll();
        setProducts(data);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
  const isActive = product.activo === true || product.activo === 1 || product.activo === 'true';
  if (filter === 'activos') return isActive;
  if (filter === 'inactivos') return !isActive;
  return true;
});


  if (loading) {
    return <div className="text-center py-10">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <Link
          to="/admin/products/new"
          className="bg-primary hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'todos' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('activos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'activos' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Activos
        </button>
        <button
          onClick={() => setFilter('inactivos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'inactivos' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Inactivos
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
  </tr>
</thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay productos {filter !== 'todos' ? filter : ''}.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id_producto} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.nombre_producto}</div>
                    <div className="text-sm text-gray-500">{product.descripcion?.substring(0, 30)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.categoria?.nombre_categoria || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    ${product.precio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock ?? 'N/A'}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/products/edit/${product.id_producto}`}
                      className="text-secondary hover:text-blue-800 mr-3"
                    >
                      Editar
                    </Link>
                  <button
                     onClick={async () => {
                        try {
                          await adminProductService.toggleActive(product.id_producto);
                          // Recargar la lista
                          const data = await adminProductService.getAll();
                          setProducts(data);
                          } catch (err) {
                          alert('Error: ' + err.message);
                     }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    {product.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}