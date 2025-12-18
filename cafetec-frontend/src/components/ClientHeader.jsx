// src/components/ClientHeader.jsx
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function ClientHeader() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const total = getTotalItems();

  return (
    <header className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-secondary cursor-pointer"
          onClick={() => navigate('/client/dashboard')}
        >
          CaféTec
        </h1>

        <div className="flex items-center gap-4">
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/client/cart')}
          >
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-secondary transition" />
            {total > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {total}
              </span>
            )}
          </div>

          <span className="text-gray-700">Hola, {user?.nombre || 'Usuario'}</span>

          <button
            onClick={logout}
            className="text-primary hover:text-orange-600 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
