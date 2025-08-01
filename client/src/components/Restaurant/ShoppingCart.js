import React from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import './ShoppingCart.css';

const ShoppingCart = ({ isOpen, onClose, onCheckout }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getSubtotal, 
    getTax, 
    getTotal,
    isEmpty 
  } = useCart();

  const taxRate = 10; // 10% de impuestos

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(cartId);
    } else {
      updateQuantity(cartId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isEmpty()) {
      onCheckout();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shopping-cart-overlay">
      <div className="shopping-cart">
        {/* Header */}
        <div className="cart-header">
          <div className="header-content">
            <ShoppingBag size={24} />
            <h2>Tu Pedido</h2>
            <span className="item-count">
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {isEmpty() ? (
            <div className="empty-cart">
              <ShoppingBag size={48} />
              <h3>Tu carrito está vacío</h3>
              <p>Agrega algunos productos deliciosos para comenzar tu pedido.</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.cartId} className="cart-item">
                    <div className="item-image">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} />
                      ) : (
                        <div className="placeholder-image">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <div className="item-price">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </div>
                      {item.notes && (
                        <div className="item-notes">
                          <span>Notas: {item.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          className="quantity-button"
                          onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="quantity-button"
                          onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="remove-button"
                        onClick={() => removeItem(item.cartId)}
                        title="Eliminar del carrito"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Impuestos ({taxRate}%):</span>
                  <span>${getTax(taxRate).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${getTotal(taxRate).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer">
          {!isEmpty() && (
            <button
              className="clear-cart-button"
              onClick={clearCart}
            >
              <Trash2 size={16} />
              Limpiar Carrito
            </button>
          )}

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={isEmpty()}
          >
            <span>Continuar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;