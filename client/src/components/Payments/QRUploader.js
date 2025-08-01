import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle,
  QrCode,
  Camera,
  File
} from 'lucide-react';
import './QRUploader.css';

const QRUploader = ({ 
  payment, 
  isOpen, 
  onClose, 
  onUpload,
  loading = false 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !payment) return null;

  // Validar tipo de archivo
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten archivos de imagen (JPG, PNG, WebP)';
    }

    if (file.size > maxSize) {
      return 'El archivo no puede ser mayor a 5MB';
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Manejar cambio en input de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Subir archivo
  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(payment.id, selectedFile);
      handleClose();
    } catch (err) {
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  // Limpiar y cerrar
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setDragActive(false);
    setUploading(false);
    onClose();
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="qr-uploader-overlay">
      <div className="qr-uploader-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-icon">
            <QrCode size={24} />
          </div>
          <div className="header-content">
            <h3>Subir Código QR</h3>
            <p>Sube el comprobante de pago para el pedido #{payment.order_id}</p>
          </div>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Payment Info */}
          <div className="payment-info">
            <div className="info-row">
              <span className="label">Monto:</span>
              <span className="value">${parseFloat(payment.amount || 0).toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="label">Cliente:</span>
              <span className="value">{payment.customer_name || 'No especificado'}</span>
            </div>
            <div className="info-row">
              <span className="label">Método:</span>
              <span className="value">
                {payment.payment_method === 'qr_transfer' ? 'Transferencia QR' : 
                 payment.payment_method === 'bank_transfer' ? 'Transferencia Bancaria' : 
                 payment.payment_method}
              </span>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="upload-section">
            <h4>Comprobante de Pago</h4>
            
            {!selectedFile ? (
              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileSelector}
              >
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <div className="upload-text">
                  <p className="upload-title">
                    Arrastra tu imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="upload-subtitle">
                    Formatos soportados: JPG, PNG, WebP (máx. 5MB)
                  </p>
                </div>
                <div className="upload-actions">
                  <button className="upload-button" type="button">
                    <ImageIcon size={16} />
                    Seleccionar Imagen
                  </button>
                </div>
              </div>
            ) : (
              <div className="file-preview">
                <div className="preview-container">
                  <img 
                    src={preview} 
                    alt="Preview del QR" 
                    className="preview-image"
                  />
                  <div className="preview-overlay">
                    <button
                      className="change-file-button"
                      onClick={openFileSelector}
                      disabled={uploading}
                    >
                      <Camera size={16} />
                      Cambiar
                    </button>
                  </div>
                </div>
                
                <div className="file-info">
                  <div className="file-details">
                    <File size={16} />
                    <div className="file-meta">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  
                  <button
                    className="remove-file-button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="instructions">
            <h5>Instrucciones:</h5>
            <ul>
              <li>Asegúrate de que la imagen sea clara y legible</li>
              <li>El código QR debe estar completamente visible</li>
              <li>Evita imágenes borrosas o con poca luz</li>
              <li>Formatos aceptados: JPG, PNG, WebP</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancelar
          </button>
          
          <button
            className="upload-submit-button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <div className="button-spinner"></div>
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} />
                Subir Comprobante
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRUploader;