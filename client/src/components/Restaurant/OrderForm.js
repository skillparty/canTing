import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { orderAPI } from '../../services/api';
import './OrderForm.css';

const OrderForm = ({ isOpen, onClose, restaurant }) => {
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    payment_method: 'qr_transfer',
    special_instructions: ''
  });

  const taxRate = 10;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    const { customer_name, customer_phone } = formData;
    return customer_name.trim() && customer_phone.trim();
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep1() || items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        restaurant_id: restaurant.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        delivery_address: formData.delivery_address || null,
        payment_method: formData.payment_method,
        special_instructions: formData.special_instructions || null,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          notes: item.notes || null
        })),
        subtotal: getSubtotal(),
        tax_amount: getTax(taxRate),
        total_amount: getTotal(taxRate)
      };

      const response = await orderAPI.create(orderData);
      
      if (response.data) {
        setStep(3);
        clearCart();
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Error al crear el pedido. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setError(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      delivery_address: '',
      payment_method: 'qr_transfer',
      special_instructions: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
            <h2>
              {step === 1 && 'Información del cliente'}
              {step === 2 && 'Método de pago'}
              {step === 3 && 'Pedido confirmado'}
            </h2>
          </div>
          
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {step === 1 && (
            <div className="step-content">
              <div className="form-section">
                <h3>Datos personales</h3>
                
                <div className="form-group">
                  <label htmlFor="customer_name">
                    <User size={16} />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer_phone">
                    <Phone size={16} />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="Tu número de teléfono"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer_email">
                    <Mail size={16} />
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="delivery_address">
                    <MapPin size={16} />
                    Dirección de entrega (opcional)
                  </label>
                  <textarea
                    id="delivery_address"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa para entrega a domicilio"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="special_instructions">
                    Instrucciones especiales (opcional)
                  </label>
                  <textarea
                    id="special_instructions"
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    placeholder="Alguna instrucción especial para tu pedido..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary-section">
                <h3>Resumen del pedido</h3>
                
                <div className="order-items">
                  {items.map(item => (
                    <div key={item.cartId} className="summary-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-total">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Impuestos ({taxRate}%):</span>
                    <span>${getTax(taxRate).toFixed(2)}</span>
                  </div>
                  <div className="total-row final">
                    <span>Total:</span>
                    <span>${getTotal(taxRate).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="payment-section">
                <h3>Método de pago</h3>
                
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment_method"
                      value="qr_transfer"
                      checked={formData.payment_method === 'qr_transfer'}
                      onChange={handleInputChange}
                    />
                    <div className="method-content">
                      <CreditCard size={20} />
                      <div className="method-info">
                        <span className="method-name">Transferencia QR</span>
                        <span className="method-description">
                          Paga con código QR desde tu app bancaria
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={formData.payment_method === 'cash'}
                      onChange={handleInputChange}
                    />
                    <div className="method-content">
                      <ShoppingBag size={20} />
                      <div className="method-info">
                        <span className="method-name">Efectivo</span>
                        <span className="method-description">
                          Pago en efectivo al recibir el pedido
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="payment-info">
                  <AlertTriangle size={16} />
                  <p>
                    {formData.payment_method === 'qr_transfer' 
                      ? 'Después de confirmar tu pedido, recibirás un código QR para realizar el pago.'
                      : 'Ten el monto exacto listo para cuando recibas tu pedido.'
                    }
                  </p>
                </div>
              </div>

              {/* Order Summary (smaller) */}
              <div className="order-summary-compact">
                <div className="summary-header">
                  <span>{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                  <span>${getTotal(taxRate).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content success-content">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              
              <h3>¡Pedido confirmado!</h3>
              
              <p>
                Tu pedido ha sido enviado al restaurante. Te contactaremos pronto 
                para confirmar los detalles y el tiempo de preparación.
              </p>

              <div className="success-details">
                <div className="detail-item">
                  <strong>Cliente:</strong>
                  <span>{formData.customer_name}</span>
                </div>
                <div className="detail-item">
                  <strong>Teléfono:</strong>
                  <span>{formData.customer_phone}</span>
                </div>
                <div className="detail-item">
                  <strong>Total:</strong>
                  <span>${getTotal(taxRate).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <strong>Método de pago:</strong>
                  <span>
                    {formData.payment_method === 'qr_transfer' ? 'Transferencia QR' : 'Efectivo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step === 1 && (
            <button
              className="next-button"
              onClick={handleNextStep}
              disabled={!validateStep1()}
            >
              <span>Continuar</span>
              <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}

          {step === 2 && (
            <div className="step2-buttons">
              <button
                className="back-button"
                onClick={handlePrevStep}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Volver</span>
              </button>
              
              <button
                className="submit-button"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <button
              className="close-success-button"
              onClick={handleClose}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;