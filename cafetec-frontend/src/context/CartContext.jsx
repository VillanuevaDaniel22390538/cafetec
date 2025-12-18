// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('cafetec_cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cafetec_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id_producto === product.id_producto);
      if (existing) {
        return prev.map(item =>
          item.id_producto === product.id_producto
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (id_producto) => {
    setCartItems(prev => prev.filter(item => item.id_producto !== id_producto));
  };

  const updateQuantity = (id_producto, quantity) => {
    if (quantity < 1) return removeFromCart(id_producto);
    setCartItems(prev =>
      prev.map(item =>
        item.id_producto === id_producto ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cafetec_cart');
  };

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  const returnCartState = () => cartItems;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        returnCartState
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Pequeña mejora para evitar bugs
const updateQuantity = (id_producto, quantity) => {
  if (quantity < 1) {
    removeFromCart(id_producto);
    return;
  }
  setCartItems(prev =>
    prev.map(item =>
      item.id_producto === id_producto ? { ...item, quantity } : item
    )
  );
};