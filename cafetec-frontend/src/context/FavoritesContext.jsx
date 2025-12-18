import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Cargar favoritos del localStorage
    const savedFavorites = localStorage.getItem('cafetec_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id_producto === product.id_producto);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = prev.filter(fav => fav.id_producto !== product.id_producto);
      } else {
        newFavorites = [...prev, product];
      }
      
      // Guardar en localStorage
      localStorage.setItem('cafetec_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id_producto === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('cafetec_favorites');
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};