import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Star, 
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  isRestaurantOpen = true, 
  viewMode = 'grid' 
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isRestaurantOpen || !product.is_available) return;

    setIsAdding(true);
    try {
      await addItem(product, quantity, notes);
      
      // Reset form
      setQuantity(1);
      setNotes('');
      setShowNotes(false);
      
      // Feedback visual
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const isAvailable = product.is_available !== false && isRestaurantOpen;
  const price = parseFloat(product.price || 0);

  return (
    <div className={`product-card ${viewMode} ${!isAvailable ? 'unavailable' : ''}`}>
      {/* Imagen del producto */}
      <div className="product-image">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="placeholder-image">
            <ShoppingCart size={32} />
          </div>
        )}
        
        {!isAvailable && (
          <div className="unavailable-overlay">
            <AlertCircle size={20} />
            <span>No disponible</span>
          </div>
        )}

        {product.rating && (
          <div className="product-rating">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        )}
      </div>

      {/* Contenido del producto */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">
            ${price.toFixed(2)}
          </div>
        </div>

        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}

        {/* Información adicional */}
        <div className="product-meta">
          {product.preparation_time && (
            <div className="meta-item">
              <Clock size={14} />
              <span>{product.preparation_time} min</span>
            </div>
          )}
          
          {product.category_name && (
            <div className="meta-item category">
              <span>{product.category_name}</span>
            </div>
          )}
        </div>

        {/* Controles de cantidad y notas */}
        {isAvailable && (
          <div className="product-controls">
            {/* Selector de cantidad */}
            <div className="quantity-selector">
              <button
                className="quantity-button"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="quantity-display">{quantity}</span>
              <button
                className="quantity-button"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Botón de notas */}
            <button
              className={`notes-button ${showNotes ? 'active' : ''}`}
              onClick={() => setShowNotes(!showNotes)}
              title="Agregar notas especiales"
            >
              <MessageSquare size={16} />
            </button>

            {/* Botón agregar al carrito */}
            <button
              className={`add-to-cart-button ${isAdding ? 'adding' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <div className="adding-spinner"></div>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Campo de notas */}
        {showNotes && isAvailable && (
          <div className="notes-section">
            <textarea
              placeholder="Notas especiales (ej: sin cebolla, extra salsa...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              rows={2}
            />
            <div className="notes-counter">
              {notes.length}/200
            </div>
          </div>
        )}

        {/* Total del item */}
        {quantity > 1 && isAvailable && (
          <div className="item-total">
            <span>Total: ${(price * quantity).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;