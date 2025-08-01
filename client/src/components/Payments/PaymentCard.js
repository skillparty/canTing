import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  User, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Upload,
  MoreVertical,
  Calendar,
  Hash,
  CreditCard
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import './PaymentCard.css';

const PaymentCard = ({ 
  payment, 
  onStatusChange, 
  onConfirm, 
  onReject, 
  onUploadQR,
  loading = false,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pendiente',
        color: 'orange',
        icon: Clock,
        bgColor: '#fef3c7',
        textColor: '#d97706',
        borderColor: '#f59e0b'
      },
      qr_uploaded: {
        label: 'QR Subido',
        color: 'blue',
        icon: QrCode,
        bgColor: '#dbeafe',
        textColor: '#2563eb',
        borderColor: '#3b82f6'
      },
      verified: {
        label: 'Verificado',
        color: 'purple',
        icon: CheckCircle,
        bgColor: '#e9d5ff',
        textColor: '#7c3aed',
        borderColor: '#8b5cf6'
      },
      paid: {
        label: 'Pagado',
        color: 'green',
        icon: CheckCircle,
        bgColor: '#d1fae5',
        textColor: '#059669',
        borderColor: '#10b981'
      },
      failed: {
        label: 'Fallido',
        color: 'red',
        icon: XCircle,
        bgColor: '#fee2e2',
        textColor: '#dc2626',
        borderColor: '#ef4444'
      }
    };
    return configs[status] || configs.pending;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      qr_transfer: 'Transferencia QR',
      bank_transfer: 'Transferencia Bancaria',
      cash: 'Efectivo',
      card: 'Tarjeta'
    };
    return methods[method] || method;
  };

  const handleConfirm = async () => {
    if (onConfirm && !isUpdating) {
      setIsUpdating(true);
      try {
        await onConfirm(payment, {
          confirmed_by: 'admin', // En una implementación real, esto vendría del contexto de usuario
          confirmation_notes: 'Pago confirmado desde el panel de administración'
        });
      } finally {
        setIsUpdating(false);
        setShowActions(false);
      }
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Motivo del rechazo:');
    if (reason && onReject && !isUpdating) {
      setIsUpdating(true);
      try {
        await onReject(payment, reason);
      } finally {
        setIsUpdating(false);
        setShowActions(false);
      }
    }
  };

  const handleUploadQR = () => {
    if (onUploadQR) {
      onUploadQR(payment);
    }
    setShowActions(false);
  };

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  
  const canConfirm = ['qr_uploaded', 'verified'].includes(payment.status);
  const canReject = ['qr_uploaded', 'verified'].includes(payment.status);
  const canUploadQR = payment.status === 'pending';

  if (loading) {
    return (
      <div className="payment-card loading">
        <div className="payment-card-header">
          <div className="skeleton skeleton-status"></div>
          <div className="skeleton skeleton-time"></div>
        </div>
        <div className="payment-card-content">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
        <div className="payment-card-footer">
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`payment-card ${statusConfig.color} ${className}`}
      style={{
        borderLeftColor: statusConfig.borderColor
      }}
    >
      {/* Header */}
      <div className="payment-card-header">
        <div 
          className="payment-status"
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.textColor
          }}
        >
          <StatusIcon size={16} />
          <span>{statusConfig.label}</span>
        </div>
        
        <div className="payment-time">
          <Clock size={14} />
          <span>
            {formatDistanceToNow(new Date(payment.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
        
        <div className="payment-actions">
          <button
            className="actions-trigger"
            onClick={() => setShowActions(!showActions)}
            disabled={isUpdating}
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <div className="actions-dropdown">
              <button
                className="action-item"
                onClick={() => setShowActions(false)}
              >
                <Eye size={14} />
                <span>Ver Detalles</span>
              </button>
              
              {canUploadQR && (
                <button
                  className="action-item upload"
                  onClick={handleUploadQR}
                >
                  <Upload size={14} />
                  <span>Subir QR</span>
                </button>
              )}
              
              {canConfirm && (
                <button
                  className="action-item confirm"
                  onClick={handleConfirm}
                  disabled={isUpdating}
                >
                  <CheckCircle size={14} />
                  <span>Confirmar Pago</span>
                </button>
              )}
              
              {canReject && (
                <>
                  <div className="action-divider"></div>
                  <button
                    className="action-item reject"
                    onClick={handleReject}
                    disabled={isUpdating}
                  >
                    <XCircle size={14} />
                    <span>Rechazar</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="payment-card-content">
        <div className="payment-info">
          <h3 className="payment-title">
            Pago #{payment.id}
          </h3>
          
          <div className="payment-details">
            <div className="detail-row">
              <Hash size={16} />
              <span className="detail-label">Pedido:</span>
              <span className="detail-value">#{payment.order_id}</span>
            </div>
            
            <div className="detail-row">
              <User size={16} />
              <span className="detail-label">Cliente:</span>
              <span className="detail-value">{payment.customer_name || 'No especificado'}</span>
            </div>
            
            <div className="detail-row">
              <CreditCard size={16} />
              <span className="detail-label">Método:</span>
              <span className="detail-value">{getPaymentMethodLabel(payment.payment_method)}</span>
            </div>
            
            {payment.reference_number && (
              <div className="detail-row">
                <Hash size={16} />
                <span className="detail-label">Referencia:</span>
                <span className="detail-value">{payment.reference_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Image Preview */}
        {payment.qr_image_url && (
          <div className="qr-preview">
            <img 
              src={payment.qr_image_url} 
              alt="QR de pago" 
              className="qr-image"
            />
            <span className="qr-label">QR Subido</span>
          </div>
        )}

        {/* Payment Notes */}
        {payment.notes && (
          <div className="payment-notes">
            <AlertTriangle size={14} />
            <span>{payment.notes}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="payment-card-footer">
        <div className="payment-amount">
          <DollarSign size={16} />
          <span className="amount-value">
            ${parseFloat(payment.amount || 0).toFixed(2)}
          </span>
        </div>
        
        <div className="footer-actions">
          {canConfirm && (
            <button
              className={`action-button confirm ${statusConfig.color}`}
              onClick={handleConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="button-spinner"></div>
              ) : (
                <CheckCircle size={16} />
              )}
              <span>Confirmar</span>
            </button>
          )}
          
          {canUploadQR && (
            <button
              className="action-button upload"
              onClick={handleUploadQR}
            >
              <Upload size={16} />
              <span>Subir QR</span>
            </button>
          )}
          
          {!canConfirm && !canUploadQR && (
            <button
              className="action-button details"
              onClick={() => setShowActions(false)}
            >
              <Eye size={16} />
              <span>Ver Detalles</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay para cerrar acciones */}
      {showActions && (
        <div 
          className="actions-overlay"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default PaymentCard;