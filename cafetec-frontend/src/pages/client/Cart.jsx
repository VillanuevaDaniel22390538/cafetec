import React from "react";
import { useCart } from "../../context/CartContext";
import ClientHeader from "../../components/ClientHeader";
import { useNavigate } from "react-router-dom";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft,
  Package,
  Clock,
  Shield
} from "lucide-react";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate("/client/menu");
  };

  const handleConfirm = () => {
    if (cartItems.length === 0) return;
    navigate("/client/select-time");
  };

  const handleEmptyCart = () => {
    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
      clearCart();
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.precio || 0) * (item.quantity || 1),
    0
  );

  const tax = total * 0.16; // IVA 16%
  const subtotal = total - tax;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ClientHeader />

      <div className="pt-24 max-w-6xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tu Carrito</h1>
            <p className="text-gray-600">
              Revisa y ajusta tus productos antes de confirmar
            </p>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={handleEmptyCart}
              className="text-red-500 hover:text-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Vaciar carrito
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lista de productos */}
          <div className="lg:w-2/3">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <ShoppingBag className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Añade algunos productos deliciosos de nuestro menú
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleContinueShopping}
                    className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    Explorar Menú
                  </button>
                  <button
                    onClick={() => navigate("/client/dashboard")}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Ir al Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header de la tabla */}
                <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b text-sm font-semibold text-gray-600">
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-2 text-center">Precio</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-center">Subtotal</div>
                </div>

                {/* Lista de productos */}
                {cartItems.map((item) => (
                  <div
                    key={item.id_producto}
                    className="flex flex-col md:grid md:grid-cols-12 items-center p-4 md:p-6 border-b hover:bg-gray-50 transition"
                  >
                    {/* Producto */}
                    <div className="col-span-6 flex items-center gap-4 w-full mb-4 md:mb-0">
                      <div className="relative">
                        <img
                          src={item.imagen_url}
                          alt={item.nombre_producto}
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100/FFA726/FFFFFF?text=Producto';
                          }}
                        />
                        {item.quantity > 1 && (
                          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.nombre_producto}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.descripcion || "Sin descripción"}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => removeFromCart(item.id_producto)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Precio unitario */}
                    <div className="col-span-2 text-center mb-3 md:mb-0">
                      <span className="font-semibold text-gray-900 md:hidden">
                        Precio:{" "}
                      </span>
                      <span className="text-primary font-semibold">
                        ${Number(item.precio || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-2 mb-3 md:mb-0">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id_producto,
                              Math.max((item.quantity || 1) - 1, 0)
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="font-semibold text-lg w-8 text-center">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id_producto,
                              (item.quantity || 1) + 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-center">
                      <span className="font-semibold text-gray-900 md:hidden">
                        Subtotal:{" "}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${(Number(item.precio || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Botón continuar comprando */}
                <div className="p-4 border-t">
                  <button
                    onClick={handleContinueShopping}
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Seguir comprando
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg sticky top-28 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                  Resumen del Pedido
                </h3>

                {/* Información de entrega */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-800">
                      Recolección en cafetería
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Seleccionarás el horario en el siguiente paso
                  </p>
                </div>

                {/* Detalles del precio */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        ${total.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Beneficios */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">
                      Pago seguro en línea
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-600">
                      Prepara tu pedido en 15-20 min
                    </span>
                  </div>
                </div>

                {/* Botón confirmar */}
                <button
                  onClick={handleConfirm}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all active:scale-98 shadow-lg hover:shadow-xl"
                >
                  Continuar con el pedido
                </button>

                {/* Nota */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Al confirmar, serás redirigido a seleccionar el horario de recolección
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;