import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './CategoryForm.css';

const CategoryForm = ({ 
  category = null, 
  isOpen, 
  onClose, 
  onSave,
  title = null
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!category;
  const formTitle = title || (isEditing ? 'Editar Categoría' : 'Nueva Categoría');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && category) {
        reset({
          name: category.name || '',
          description: category.description || ''
        });
      } else {
        reset({
          name: '',
          description: ''
        });
      }
    }
  }, [isOpen, category, isEditing, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const categoryData = {
        name: data.name.trim(),
        description: data.description?.trim() || ''
      };

      let result;
      if (isEditing) {
        result = await categoryAPI.update(category.id, categoryData);
      } else {
        result = await categoryAPI.create(categoryData);
      }

      if (result.data.success) {
        toast.success(
          isEditing 
            ? 'Categoría actualizada exitosamente' 
            : 'Categoría creada exitosamente'
        );
        
        if (onSave) {
          onSave(result.data.data);
        }
        
        onClose();
      } else {
        throw new Error(result.data.error?.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Error al guardar la categoría';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="category-form-overlay">
      <div className="category-form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="category-form">
          {/* Header */}
          <div className="form-header">
            <h2>{formTitle}</h2>
            <button
              type="button"
              className="close-button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Cerrar formulario"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="form-content">
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Nombre de la Categoría
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Ej: Entradas, Platos Principales, Postres"
                disabled={isSubmitting}
                {...register('name', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  },
                  maxLength: {
                    value: 255,
                    message: 'El nombre no puede exceder 255 caracteres'
                  }
                })}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción (Opcional)
              </label>
              <textarea
                id="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe brevemente esta categoría..."
                rows={3}
                disabled={isSubmitting}
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'La descripción no puede exceder 500 caracteres'
                  }
                })}
              />
              {errors.description && (
                <span className="error-message">{errors.description.message}</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="form-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;