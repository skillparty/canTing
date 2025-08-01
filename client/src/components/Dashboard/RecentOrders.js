import React from 'react';
import { Clock, User, DollarSign, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './RecentOrders.css';

const RecentOrders = ({ orders = [], loading = false, onOrderClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'purple',
      ready: 'green',
      delivered: 'gray',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="recent-orders-container">
        <div className="orders-header">
          <div className="skeleton skeleton-title"></div>
        </div>
        <div className="orders-list">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="order-item loading">
              <div className="order-main">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text-small"></div>
              </div>
              <div className="order-meta">
                <div className="skeleton skeleton-badge"></div>
                <div className="skeleton skeleton-text-small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-orders-container">
      <div className="orders-header">
        <h3 className="orders-title">Pedidos Recientes</h3>
        <button className="view-all-btn">Ver todos</button>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="order-item"
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <div className="order-main">
                <div className="order-info">
                  <div className="order-customer">
                    <User size={16} />
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="order-id">
                    Pedido #{order.id}
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-items">
                    {order.items && order.items.length > 0 && (
                      <span>
                        {order.items.length} elemento{order.items.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="order-time">
                    <Clock size={14} />
                    <span>
                      {formatDistanceToNow(new Date(order.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-meta">
                <div className="order-amount">
                  <DollarSign size={16} />
                  <span>${order.total_amount?.toFixed(2)}</span>
                </div>
                
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>

                <button 
                  className="order-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implementar menú de acciones
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="orders-empty">
            <div className="empty-icon">
              <Clock size={48} />
            </div>
            <h4>No hay pedidos recientes</h4>
            <p>Los nuevos pedidos aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;