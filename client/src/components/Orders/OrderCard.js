import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  Eye, 
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './OrderCard.css';

const OrderCard = ({ 
  order, 
  onStatusChange, 
  onViewDetails, 
  onCancel,
  loading = false,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Nuevo',
        color: 'orange',
        icon: AlertCircle,
        nextStatus: 'confirmed',
        nextLabel: 'Confirmar'
      },
      confirmed: {
        label: 'Confirmado',
        color: 'blue',
        icon: CheckCircle,
        nextStatus: 'preparing',
        nextLabel: 'Preparar'
      },
      preparing: {
        label: 'En Preparación',
        color: 'purple',
        icon: Package,
        nextStatus: 'ready',
        nextLabel: 'Marcar Listo'
      },
      ready: {
        label: 'Listo',
        color: 'green',
        icon: CheckCircle,
        nextStatus: 'delivered',
        nextLabel: 'Entregar'
      },
      delivered: {
        label: 'Entregado',
        color: 'gray',
        icon: Truck,
        nextStatus: null,
        nextLabel: null
      },
      cancelled: {
        label: 'Cancelado',
        color: 'red',
        icon: XCircle,
        nextStatus: null,
        nextLabel: null
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async () => {
    if (!statusConfig.nextStatus || isUpdating) return;

    setIsUpdating(true);
    setShowMenu(false);

    try {
      await onStatusChange(order.id, statusConfig.nextStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setShowMenu(false);
    if (onCancel) {
      onCancel(order);
    }
  };

  const handleViewDetails = () => {
    setShowMenu(false);
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  const getTimeElapsed = () => {
    return formatDistanceToNow(new Date(order.created_at), { 
      addSuffix: true, 
      locale: es 
    });
  };

  const getEstimatedTime = () => {
    const createdTime = new Date(order.created_at);
    const estimatedMinutes = 30; // Tiempo estimado base
    const estimatedTime = new Date(createdTime.getTime() + estimatedMinutes * 60000);
    
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return null;
    }
    
    const now = new Date();
    const isOverdue = now > estimatedTime;
    
    return {
      time: formatDistanceToNow(estimatedTime, { locale: es }),
      isOverdue
    };
  };

  const estimatedTime = getEstimatedTime();

  if (loading) {
    return (
      <div className="order-card loading">
        <div className="order-header">
          <div className="skeleton skeleton-status"></div>
          <div className="skeleton skeleton-menu"></div>
        </div>
        <div className="order-content">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
        <div className="order-footer">
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-time"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`order-card ${statusConfig.color} ${className}`}>
      {/* Header con estado y menú */}
      <div className="order-header">
        <div className={`order-status ${statusConfig.color}`}>
          <StatusIcon size={16} />
          <span>{statusConfig.label}</span>
        </div>
        
        <div className="order-menu">
          <button
            className="menu-trigger"
            onClick={() => setShowMenu(!showMenu)}
            disabled={isUpdating}
            aria-label="Opciones del pedido"
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="menu-dropdown">
              <button
                className="menu-item"
                onClick={handleViewDetails}
              >
                <Eye size={14} />
                <span>Ver Detalles</span>
              </button>
              
              {statusConfig.nextStatus && (
                <button
                  className="menu-item primary"
                  onClick={handleStatusChange}
                  disabled={isUpdating}
                >
                  <StatusIcon size={14} />
                  <span>{statusConfig.nextLabel}</span>
                </button>
              )}
              
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <>
                  <div className="menu-divider"></div>
                  <button
                    className="menu-item danger"
                    onClick={handleCancel}
                  >
                    <XCircle size={14} />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="order-content">
        <div className="order-info">
          <h3 className="order-id">Pedido #{order.id}</h3>
          
          <div className="customer-info">
            <div className="customer-name">
              <User size={16} />
              <span>{order.customer_name}</span>
            </div>
            
            {order.customer_phone && (
              <div className="customer-phone">
                <Phone size={14} />
                <span>{order.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items del pedido */}
        <div className="order-items">
          <div className="items-summary">
            {order.items && order.items.length > 0 ? (
              <>
                <span className="items-count">
                  {order.items.length} elemento{order.items.length !== 1 ? 's' : ''}
                </span>
                <div className="items-preview">
                  {order.items.slice(0, 2).map((item, index) => (
                    <span key={index} className="item-name">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="items-more">
                      +{order.items.length - 2} más
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="no-items">Sin elementos</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer con precio y tiempo */}
      <div className="order-footer">
        <div className="order-price">
          <DollarSign size={16} />
          <span className="price-value">${order.total_amount?.toFixed(2)}</span>
        </div>
        
        <div className="order-timing">
          <div className="time-elapsed">
            <Clock size={14} />
            <span>{getTimeElapsed()}</span>
          </div>
          
          {estimatedTime && (
            <div className={`estimated-time ${estimatedTime.isOverdue ? 'overdue' : ''}`}>
              <span>
                {estimatedTime.isOverdue ? 'Retrasado' : 'Listo en'} {estimatedTime.time}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de actualización */}
      {isUpdating && (
        <div className="updating-overlay">
          <div className="updating-spinner"></div>
        </div>
      )}

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

export default OrderCard;