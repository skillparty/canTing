import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import { useQuery } from 'react-query';
import { categoryAPI, menuItemAPI, createFormData } from '../../services/api';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';
import './MenuItemForm.css';

const MenuItemForm = ({ 
  item = null, 
  isOpen, 
  onClose, 
  onSave,
  title = null
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const isEditing = !!item;
  const formTitle = title || (isEditing ? 'Editar Elemento' : 'Nuevo Elemento');

  // Obtener categorías
  const { data: categoriesData, isLoading: loadingCategories } = useQuery(
    'categories',
    () => categoryAPI.getAll(),
    {
      enabled: isOpen,
      onError: (error) => {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      }
    }
  );

  const categories = categoriesData?.data?.data || [];

  // Configurar formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category_id: '',
      available: true
    }
  });

  // Resetear formulario cuando cambie el item o se abra/cierre
  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        reset({
          name: item.name || '',
          description: item.description || '',
          price: item.price || '',
          category_id: item.category_id || '',
          available: item.available !== undefined ? item.available : true
        });
      } else {
        reset({
          name: '',
          description: '',
          price: '',
          category_id: '',
          available: true
        });
      }
      setSelectedImage(null);
      setImageRemoved(false);
    }
  }, [isOpen, item, isEditing, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Preparar datos del formulario
      const formData = createFormData({
        name: data.name.trim(),
        description: data.description?.trim() || '',
        price: parseFloat(data.price),
        category_id: data.category_id || null,
        available: data.available
      });

      // Agregar imagen si se seleccionó una nueva
      if (selectedImage) {
        formData.append('menu_image', selectedImage);
      }

      let result;
      if (isEditing) {
        // Si se removió la imagen, enviar null
        if (imageRemoved && !selectedImage) {
          formData.append('image_url', '');
        }
        result = await menuItemAPI.update(item.id, formData);
      } else {
        result = await menuItemAPI.create(formData);
      }

      if (result.data.success) {
        toast.success(
          isEditing 
            ? 'Elemento actualizado exitosamente' 
            : 'Elemento creado exitosamente'
        );
        
        if (onSave) {
          onSave(result.data.data);
        }
        
        onClose();
      } else {
        throw new Error(result.data.error?.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Error al guardar el elemento';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setImageRemoved(false);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImageRemoved(true);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="menu-item-form-overlay">
      <div className="menu-item-form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="menu-item-form">
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
            {/* Imagen */}
            <div className="form-section">
              <label className="section-label">Imagen del Producto</label>
              <ImageUploader
                currentImage={!imageRemoved ? item?.image_url : null}
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                disabled={isSubmitting}
              />
            </div>

            {/* Información básica */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    Nombre del Producto
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Ej: Pizza Margherita"
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
                  <label htmlFor="price" className="form-label required">
                    Precio
                  </label>
                  <div className="price-input-wrapper">
                    <span className="price-symbol">$</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-input price-input ${errors.price ? 'error' : ''}`}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...register('price', {
                        required: 'El precio es requerido',
                        min: {
                          value: 0,
                          message: 'El precio debe ser mayor o igual a 0'
                        },
                        max: {
                          value: 9999.99,
                          message: 'El precio no puede exceder $9,999.99'
                        }
                      })}
                    />
                  </div>
                  {errors.price && (
                    <span className="error-message">{errors.price.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="description"
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Describe el producto, ingredientes, etc."
                  rows={3}
                  disabled={isSubmitting}
                  {...register('description', {
                    maxLength: {
                      value: 1000,
                      message: 'La descripción no puede exceder 1000 caracteres'
                    }
                  })}
                />
                {errors.description && (
                  <span className="error-message">{errors.description.message}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category_id" className="form-label">
                    Categoría
                  </label>
                  <select
                    id="category_id"
                    className={`form-select ${errors.category_id ? 'error' : ''}`}
                    disabled={isSubmitting || loadingCategories}
                    {...register('category_id')}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {loadingCategories && (
                    <span className="loading-text">Cargando categorías...</span>
                  )}
                  {errors.category_id && (
                    <span className="error-message">{errors.category_id.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Disponibilidad</label>
                  <div className="checkbox-wrapper">
                    <input
                      id="available"
                      type="checkbox"
                      className="form-checkbox"
                      disabled={isSubmitting}
                      {...register('available')}
                    />
                    <label htmlFor="available" className="checkbox-label">
                      Producto disponible para pedidos
                    </label>
                  </div>
                </div>
              </div>
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

export default MenuItemForm;