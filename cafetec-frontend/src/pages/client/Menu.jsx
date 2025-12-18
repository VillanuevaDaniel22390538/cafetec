// src/pages/client/Menu.jsx - VERSIÓN CORREGIDA
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useFavorites, FavoritesProvider } from '../../context/FavoritesContext';
import ClientHeader from '../../components/ClientHeader';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star, 
  Clock,
  Zap,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Menu = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { addToCart, getTotalItems } = useCart();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [productos, searchTerm, selectedCategory, activeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/productos');
      
      // Si no hay imagen, usar placeholder
      const productsWithImages = response.data.map(product => ({
        ...product,
        imagen_url: product.imagen_url || 'https://via.placeholder.com/300x200/FFA726/FFFFFF?text=Producto'
      }));
      
      setProductos(productsWithImages);
      setFilteredProducts(productsWithImages);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categorias');
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      // Categorías por defecto
      setCategories([
        { id_categoria: 1, nombre: 'Bebidas' },
        { id_categoria: 2, nombre: 'Alimentos' },
        { id_categoria: 3, nombre: 'Snacks' }
      ]);
    }
  };

  const filterProducts = () => {
    let filtered = [...productos];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.id_categoria === parseInt(selectedCategory)
      );
    }

    // Filtro especial
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(product => isFavorite(product.id_producto));
        break;
      case 'popular':
        filtered = filtered.filter(product => product.destacado);
        break;
      case 'available':
        filtered = filtered.filter(product => product.disponible !== false);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      nombre_producto: product.nombre,
      descripcion: product.descripcion
    });
    
    // Feedback visual
    const button = document.getElementById(`add-btn-${product.id_producto}`);
    if (button) {
      button.textContent = '✓ Agregado';
      button.classList.add('bg-green-500', 'hover:bg-green-600');
      
      setTimeout(() => {
        button.textContent = 'Agregar al carrito';
        button.classList.remove('bg-green-500', 'hover:bg-green-600');
      }, 1500);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200/FFA726/FFFFFF?text=Producto';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="pt-24 max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-orange-500 mr-3" />
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />
      
      {/* Hero Section */}
      <div className="pt-20 bg-gradient-to-r from-orange-50 to-blue-50 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Menú CaféTec
          </h1>
          <p className="text-gray-600">
            Descubre nuestros deliciosos productos y haz tu pedido fácilmente
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20 -mt-4">
        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 sticky top-20 z-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de categorías */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category.id_categoria}
                  onClick={() => setSelectedCategory(category.id_categoria.toString())}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category.id_categoria.toString()
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {category.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${activeFilter === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Filter className="w-4 h-4" />
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${activeFilter === 'favorites' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Star className="w-4 h-4" />
              Favoritos
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${activeFilter === 'popular' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Zap className="w-4 h-4" />
              Destacados
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${activeFilter === 'available' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Clock className="w-4 h-4" />
              Disponibles
            </button>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{searchTerm}"
            </p>
          </div>
        )}

        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otros términos o categorías
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Mostrar todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id_producto} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Imagen del producto */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.imagen_url}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.destacado && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    )}
                    {product.disponible === false && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>
                  
                  {/* Botón favorito */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white"
                  >
                    {isFavorite(product.id_producto) ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-400" fill="none" />
                    )}
                  </button>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {product.nombre}
                    </h3>
                    <span className="text-xl font-bold text-orange-600">
                      ${parseFloat(product.precio).toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.descripcion || "Sin descripción"}
                  </p>

                  <button
                    id={`add-btn-${product.id_producto}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.disponible === false}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${product.disponible === false
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'}`}
                  >
                    {product.disponible === false ? 'Agotado' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante del carrito mejorado */}
      <button
        onClick={() => navigate('/client/cart')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-50 group"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-orange-500">
              {getTotalItems()}
            </span>
          )}
        </div>
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ver carrito ({getTotalItems()} items)
        </div>
      </button>
    </div>
  );
};

// Envolver el componente con FavoritesProvider
const MenuWithFavorites = () => (
  <FavoritesProvider>
    <Menu />
  </FavoritesProvider>
);

export default MenuWithFavorites;