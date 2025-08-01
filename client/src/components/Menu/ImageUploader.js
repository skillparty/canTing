import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import './ImageUploader.css';

const ImageUploader = ({ 
  onImageSelect, 
  currentImage = null, 
  onImageRemove,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'No se seleccionó ningún archivo';
    
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no válido. Tipos permitidos: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      return `El archivo es demasiado grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    
    return null;
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Notificar al componente padre
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

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
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`image-uploader ${className} ${disabled ? 'disabled' : ''}`}>
      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Preview" className="preview-image" />
          <div className="image-overlay">
            <button
              type="button"
              className="remove-button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Eliminar imagen"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              className="change-button"
              onClick={handleClick}
              disabled={disabled}
            >
              <Upload size={16} />
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-content">
            <div className="upload-icon">
              <Image size={48} />
            </div>
            <div className="upload-text">
              <h4>Subir imagen</h4>
              <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
              <span className="upload-hint">
                Formatos: JPG, PNG, WebP (máx. {(maxSize / 1024 / 1024).toFixed(1)}MB)
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="file-input"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUploader;