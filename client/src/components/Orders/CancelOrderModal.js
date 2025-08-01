import React, { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import './CancelOrderModal.css';

const CancelOrderModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm,
  loading = false 
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  if (!isOpen || !order) return null;

  const predefinedReasons = [
    'Cliente solicitó cancelación',
    'Ingredientes no disponibles',
    'Error en el pedido',
    'Problema con el pago',
    'Tiempo de espera excesivo',
    'Otro motivo'
  ];

  const handleReasonSelect = (reasonOption) => {
    setSelectedReason(reasonOption);
    if (reasonOption !== 'Otro motivo') {
      setReason(reasonOption);
    } else {
      setReason('');
    }
  };

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Otro motivo' ? reason : selectedReason;
    if (finalReason.trim()) {
      onConfirm(order, finalReason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    onClose();
  };

  const isValid = selectedReason && (selectedReason !== 'Otro motivo' || reason.trim());

  return (
    <div className="cancel-modal-overlay">
      <div className="cancel-modal">
        {/* Header */}
        <div className="cancel-modal-header">
          <div className="header-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="header-content">
            <h3>Cancelar Pedido</h3>
            <p>¿Estás seguro de que quieres cancelar el pedido #{order.id}?</p>
          </div>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cancel-modal-content">
          {/* Order Info */}
          <div className="order-info">
            <div className="info-row">
              <span className="label">Cliente:</span>
              <span className="value">{order.customer_name}</span>
            </div>
            <div className="info-row">
              <span className="label">Total:</span>
              <span className="value">${parseFloat(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="label">Estado actual:</span>
              <span className="value status">{order.status}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="reason-section">
            <label className="section-label">
              Motivo de cancelación <span className="required">*</span>
            </label>
            
            <div className="reason-options">
              {predefinedReasons.map((reasonOption, index) => (
                <label key={index} className="reason-option">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reasonOption}
                    checked={selectedReason === reasonOption}
                    onChange={() => handleReasonSelect(reasonOption)}
                    disabled={loading}
                  />
                  <span className="reason-text">{reasonOption}</span>
                </label>
              ))}
            </div>

            {/* Custom reason input */}
            {selectedReason === 'Otro motivo' && (
              <div className="custom-reason">
                <textarea
                  placeholder="Especifica el motivo de cancelación..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  rows={3}
                  maxLength={500}
                />
                <div className="char-count">
                  {reason.length}/500 caracteres
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="warning-box">
            <AlertTriangle size={16} />
            <div className="warning-content">
              <strong>Advertencia:</strong>
              <p>Esta acción no se puede deshacer. El pedido será marcado como cancelado y el cliente será notificado.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cancel-modal-footer">
          <button
            className="cancel-button secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Mantener Pedido
          </button>
          
          <button
            className="cancel-button danger"
            onClick={handleConfirm}
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Cancelando...
              </>
            ) : (
              <>
                <XCircle size={16} />
                Cancelar Pedido
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;