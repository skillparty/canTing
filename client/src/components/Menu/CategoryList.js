import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Folder,
  FolderOpen
} from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './CategoryList.css';

const CategoryList = ({ 
  selectedCategory, 
  onCategorySelect, 
  onCategoryCreate,
  onCategoryEdit,
  onCategoryDelete
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const queryClient = useQueryClient();

  // Obtener categorías
  const { data: categoriesData, isLoading } = useQuery(
    'categories',
    () => categoryAPI.getAll(),
    {
      onError: (error) => {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      }
    }
  );

  const categories = categoriesData?.data?.data || [];

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden local inmediatamente
    const reorderedCategories = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    // Actualizar cache optimísticamente
    queryClient.setQueryData('categories', {
      data: { data: reorderedCategories }
    });

    setIsReordering(true);

    try {
      // Enviar nuevo orden al servidor
      const orderData = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        display_order: index
      }));

      await categoryAPI.reorder(orderData);
      toast.success('Orden de categorías actualizado');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Error al reordenar las categorías');
      
      // Revertir cambios en caso de error
      queryClient.invalidateQueries('categories');
    } finally {
      setIsReordering(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleEdit = (e, category) => {
    e.stopPropagation();
    if (onCategoryEdit) {
      onCategoryEdit(category);
    }
  };

  const handleDelete = (e, category) => {
    e.stopPropagation();
    if (onCategoryDelete) {
      onCategoryDelete(category);
    }
  };

  if (isLoading) {
    return (
      <div className="category-list">
        <div className="category-list-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
        <div className="category-items">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="category-item loading">
              <div className="skeleton skeleton-icon"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-actions"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="category-list">
      {/* Header */}
      <div className="category-list-header">
        <h3>Categorías</h3>
        <button
          className="add-category-button"
          onClick={onCategoryCreate}
          title="Agregar categoría"
        >
          <Plus size={16} />
          <span>Agregar</span>
        </button>
      </div>

      {/* All Items Option */}
      <div
        className={`category-item all-items ${!selectedCategory ? 'active' : ''}`}
        onClick={() => handleCategoryClick(null)}
      >
        <div className="category-content">
          <div className="category-icon">
            <FolderOpen size={20} />
          </div>
          <div className="category-info">
            <span className="category-name">Todos los elementos</span>
            <span className="category-count">
              {categories.reduce((total, cat) => total + (cat.menu_items?.length || 0), 0)} elementos
            </span>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {categories.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`category-items ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
              >
                {categories.map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id.toString()}
                    index={index}
                    isDragDisabled={isReordering}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`category-item ${
                          selectedCategory?.id === category.id ? 'active' : ''
                        } ${snapshot.isDragging ? 'dragging' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <div className="category-content">
                          <div
                            {...provided.dragHandleProps}
                            className="drag-handle"
                            title="Arrastrar para reordenar"
                          >
                            <GripVertical size={16} />
                          </div>
                          
                          <div className="category-icon">
                            <Folder size={20} />
                          </div>
                          
                          <div className="category-info">
                            <span className="category-name" title={category.name}>
                              {category.name}
                            </span>
                            <span className="category-count">
                              {category.menu_items?.length || 0} elementos
                            </span>
                          </div>
                        </div>

                        <div className="category-actions">
                          <button
                            className="action-button edit"
                            onClick={(e) => handleEdit(e, category)}
                            title="Editar categoría"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="action-button delete"
                            onClick={(e) => handleDelete(e, category)}
                            title="Eliminar categoría"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="empty-categories">
          <div className="empty-icon">
            <Folder size={48} />
          </div>
          <h4>No hay categorías</h4>
          <p>Crea tu primera categoría para organizar tu menú</p>
          <button
            className="create-first-category"
            onClick={onCategoryCreate}
          >
            <Plus size={16} />
            Crear categoría
          </button>
        </div>
      )}

      {/* Reordering Indicator */}
      {isReordering && (
        <div className="reordering-indicator">
          <div className="spinner"></div>
          <span>Actualizando orden...</span>
        </div>
      )}
    </div>
  );
};

export default CategoryList;