import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  DollarSign, 
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './MenuItemCard.css';

const MenuItemCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  onImageClick,
  loading = false,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleToggleAvailability = async () => {
    if (onToggleAvailability) {
      await onToggleAvailability(item.id);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(item);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageClick = () => {
    if (onImageClick && item.image_url && !imageError) {
      onImageClick(item.image_url);
    }
  };

  if (loading) {
    return (
      <div className="menu-item-card loading">
        <div className="card-image">
          <div className="skeleton skeleton-image"></div>
        </div>
        <div className="card-content">
          <div className="card-header">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-menu"></div>
          </div>
          <div className="card-body">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
          <div className="card-footer">
            <div className="skeleton skeleton-price"></div>
            <div className="skeleton skeleton-badge"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`menu-item-card ${!item.available ? 'unavailable' : ''} ${className}`}>
      {/* Imagen del producto */}
      <div className="card-image">
        {item.image_url && !imageError ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="item-image"
            onError={handleImageError}
            onClick={handleImageClick}
          />
        ) : (
          <div className="image-placeholder" onClick={handleImageClick}>
            <ImageIcon size={32} />
            <span>Sin imagen</span>
          </div>
        )}
        
        {/* Badge de disponibilidad */}
        <div className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
          {item.available ? (
            <>
              <Eye size={14} />
              <span>Disponible</span>
            </>
          ) : (
            <>
              <EyeOff size={14} />
              <span>No disponible</span>
            </>
          )}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="card-content">
        {/* Header con título y menú */}
        <div className="card-header">
          <h3 className="item-name" title={item.name}>
            {item.name}
          </h3>
          
          <div className="card-menu">
            <button
              className="menu-trigger"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Opciones del elemento"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="menu-dropdown">
                <button
                  className="menu-item"
                  onClick={handleEdit}
                >
                  <Edit size={14} />
                  <span>Editar</span>
                </button>
                
                <button
                  className="menu-item"
                  onClick={handleToggleAvailability}
                >
                  {item.available ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{item.available ? 'Ocultar' : 'Mostrar'}</span>
                </button>
                
                <div className="menu-divider"></div>
                
                <button
                  className="menu-item danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cuerpo con descripción y categoría */}
        <div className="card-body">
          {item.description && (
            <p className="item-description" title={item.description}>
              {item.description}
            </p>
          )}
          
          {item.category_name && (
            <div className="item-category">
              <span>{item.category_name}</span>
            </div>
          )}
        </div>

        {/* Footer con precio y fecha */}
        <div className="card-footer">
          <div className="item-price">
            <DollarSign size={16} />
            <span className="price-value">${item.price?.toFixed(2)}</span>
          </div>
          
          <div className="item-meta">
            {item.created_at && (
              <span className="created-date">
                Creado {formatDistanceToNow(new Date(item.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menú */}
      {showMenu && (
        <div 
          className="menu-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default MenuItemCard;