import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    fullname: 'Suraj Sahni',
    email: 'farmer@agrohaat.com',
    role: 'Farmer', // 'Farmer' or 'Customer'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Cart state for Customer shopping
  const [cart, setCart] = useState([
    { id: '1', name: 'Fresh Organic Spinach (पालक)', price: 40, unit: '500g', qty: 2, image: '🌿' },
    { id: '2', name: 'Vine-Ripened Tomatoes (टमाटर)', price: 35, unit: '1 kg', qty: 1, image: '🍅' },
  ]);

  const login = (email, password, selectedRole = 'Farmer') => {
    setUser({
      fullname: selectedRole === 'Farmer' ? 'Suraj Sahni' : 'Pranshu Jindal',
      email: email || 'user@agrohaat.com',
      role: selectedRole,
    });
    setIsAuthenticated(true);
  };

  const register = (fullname, email, username, phone, role) => {
    setUser({
      fullname: fullname || 'New User',
      email: email || 'user@agrohaat.com',
      role: role || 'Farmer',
    });
    setIsAuthenticated(true);
  };

  const switchRole = () => {
    setUser(prev => ({
      ...prev,
      role: prev.role === 'Farmer' ? 'Customer' : 'Farmer',
      fullname: prev.role === 'Farmer' ? 'Pranshu Jindal' : 'Suraj Sahni',
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        switchRole,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
