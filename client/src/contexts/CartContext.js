import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Acciones del carrito
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_RESTAURANT: 'SET_RESTAURANT'
};

// Reducer del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { item, quantity = 1, notes = '' } = action.payload;
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.id === item.id && cartItem.notes === notes
      );

      if (existingItemIndex >= 0) {
        // Si el item ya existe con las mismas notas, actualizar cantidad
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Agregar nuevo item
        return {
          ...state,
          items: [...state.items, {
            ...item,
            quantity,
            notes,
            cartId: `${item.id}-${Date.now()}`
          }]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload.cartId)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { cartId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.cartId !== cartId)
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.cartId === cartId ? { ...item, quantity } : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.SET_RESTAURANT: {
      return {
        ...state,
        restaurant: action.payload
      };
    }

    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  items: [],
  restaurant: null
};

// Hook personalizado para usar el carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

// Provider del carrito
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items) {
          parsedCart.items.forEach(item => {
            dispatch({
              type: CART_ACTIONS.ADD_ITEM,
              payload: { item, quantity: item.quantity, notes: item.notes }
            });
          });
        }
        if (parsedCart.restaurant) {
          dispatch({
            type: CART_ACTIONS.SET_RESTAURANT,
            payload: parsedCart.restaurant
          });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('restaurant-cart', JSON.stringify(state));
  }, [state]);

  // Funciones de utilidad
  const addItem = (item, quantity = 1, notes = '') => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { item, quantity, notes }
    });
  };

  const removeItem = (cartId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { cartId }
    });
  };

  const updateQuantity = (cartId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { cartId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const setRestaurant = (restaurant) => {
    dispatch({
      type: CART_ACTIONS.SET_RESTAURANT,
      payload: restaurant
    });
  };

  // Calcular totales
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return state.items.reduce((total, item) => {
      return total + (parseFloat(item.price || 0) * item.quantity);
    }, 0);
  };

  const getTax = (taxRate = 0) => {
    return getSubtotal() * (taxRate / 100);
  };

  const getTotal = (taxRate = 0) => {
    return getSubtotal() + getTax(taxRate);
  };

  const isEmpty = () => {
    return state.items.length === 0;
  };

  const value = {
    // Estado
    items: state.items,
    restaurant: state.restaurant,
    
    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setRestaurant,
    
    // Utilidades
    getItemCount,
    getSubtotal,
    getTax,
    getTotal,
    isEmpty
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;