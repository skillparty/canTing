import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './OrderDetails.css';

const OrderDetails = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusChange,
  onCancel
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Nuevo',
        color: 'orange',
        icon: AlertCircle,
        nextStatus: 'confirmed',
        nextLabel: 'Confirmar Pedido'
      },
      confirmed: {
        label: 'Confirmado',
        color: 'blue',
        icon: CheckCircle,
        nextStatus: 'preparing',
        nextLabel: 'Iniciar Preparación'
      },
      preparing: {
        label: 'En Preparación',
        color: 'purple',
        icon: Package,
        nextStatus: 'ready',
        nextLabel: 'Marcar como Listo'
      },
      ready: {
        label: 'Listo para Entrega',
        color: 'green',
        icon: CheckCircle,
        nextStatus: 'delivered',
        nextLabel: 'Marcar como Entregado'
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
    try {
      await onStatusChange(order.id, statusConfig.nextStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(order);
    }
  };

  const calculateSubtotal = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const getStatusHistory = () => {
    const history = [
      { status: 'pending', label: 'Pedido Recibido', time: order.created_at, completed: true },
      { status: 'confirmed', label: 'Confirmado', time: null, completed: ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) },
      { status: 'preparing', label: 'En Preparación', time: null, completed: ['preparing', 'ready', 'delivered'].includes(order.status) },
      { status: 'ready', label: 'Listo', time: null, completed: ['ready', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Entregado', time: null, completed: order.status === 'delivered' }
    ];

    if (order.status === 'cancelled') {
      return [
        { status: 'pending', label: 'Pedido Recibido', time: order.created_at, completed: true },
        { status: 'cancelled', label: 'Cancelado', time: null, completed: true }
      ];
    }

    return history;
  };

  return (
    <div className="order-details-overlay">
      <div className="order-details-container">
        <div className="order-details-modal">
          {/* Header */}
          <div className="modal-header">
            <div className="header-info">
              <h2>Pedido #{order.id}</h2>
              <div className={`order-status ${statusConfig.color}`}>
                <StatusIcon size={16} />
                <span>{statusConfig.label}</span>
              </div>
            </div>
            
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Cerrar detalles"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Customer Information */}
            <div className="details-section">
              <h3 className="section-title">
                <User size={18} />
                Información del Cliente
              </h3>
              
              <div className="customer-details">
                <div className="detail-item">
                  <User size={16} />
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{order.customer_name}</span>
                </div>
                
                {order.customer_phone && (
                  <div className="detail-item">
                    <Phone size={16} />
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{order.customer_phone}</span>
                  </div>
                )}
                
                {order.customer_email && (
                  <div className="detail-item">
                    <Mail size={16} />
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="details-section">
              <h3 className="section-title">
                <Calendar size={18} />
                Información del Pedido
              </h3>
              
              <div className="order-info-grid">
                <div className="detail-item">
                  <Clock size={16} />
                  <span className="detail-label">Fecha y Hora:</span>
                  <span className="detail-value">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
                
                <div className="detail-item">
                  <CreditCard size={16} />
                  <span className="detail-label">Estado de Pago:</span>
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status === 'paid' ? 'Pagado' : 
                     order.payment_status === 'pending' ? 'Pendiente' : 
                     order.payment_status === 'failed' ? 'Fallido' : 'Reembolsado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="details-section">
              <h3 className="section-title">
                <Package size={18} />
                Elementos del Pedido
              </h3>
              
              <div className="order-items-list">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        {item.description && (
                          <span className="item-description">{item.description}</span>
                        )}
                      </div>
                      
                      <div className="item-quantity">
                        <span>x{item.quantity}</span>
                      </div>
                      
                      <div className="item-price">
                        <span className="unit-price">${item.unit_price?.toFixed(2)}</span>
                        <span className="subtotal">${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-items">
                    <Package size={24} />
                    <span>No hay elementos en este pedido</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="details-section">
              <h3 className="section-title">
                <DollarSign size={18} />
                Resumen del Pedido
              </h3>
              
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="details-section">
              <h3 className="section-title">
                <Clock size={18} />
                Historial del Pedido
              </h3>
              
              <div className="status-timeline">
                {getStatusHistory().map((step, index) => (
                  <div key={index} className={`timeline-step ${step.completed ? 'completed' : 'pending'}`}>
                    <div className="step-indicator">
                      <div className="step-dot"></div>
                      {index < getStatusHistory().length - 1 && <div className="step-line"></div>}
                    </div>
                    
                    <div className="step-content">
                      <span className="step-label">{step.label}</span>
                      {step.time && (
                        <span className="step-time">
                          {format(new Date(step.time), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <div className="footer-actions">
              {statusConfig.nextStatus && (
                <button
                  className="action-button primary"
                  onClick={handleStatusChange}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="button-spinner"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <StatusIcon size={16} />
                      {statusConfig.nextLabel}
                    </>
                  )}
                </button>
              )}
              
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  className="action-button danger"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <XCircle size={16} />
                  Cancelar Pedido
                </button>
              )}
              
              <button
                className="action-button secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;