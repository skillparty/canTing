import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { menuItemAPI, categoryAPI } from '../../services/api';
import CategoryList from '../../components/Menu/CategoryList';
import MenuItemCard from '../../components/Menu/MenuItemCard';
import MenuItemForm from '../../components/Menu/MenuItemForm';
import CategoryForm from '../../components/Menu/CategoryForm';
import toast from 'react-hot-toast';
import './MenuManager.css';

const MenuManager = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const queryClient = useQueryClient();

  // Obtener elementos del menú
  const { data: menuItemsData, isLoading: loadingItems } = useQuery(
    ['menuItems', selectedCategory?.id, searchQuery, showAvailableOnly],
    () => {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory.id;
      if (showAvailableOnly) params.available = true;
      if (searchQuery) params.search = searchQuery;
      return menuItemAPI.getAll(params);
    },
    {
      onError: (error) => {
        console.error('Error fetching menu items:', error);
        toast.error('Error al cargar los elementos del menú');
      }
    }
  );

  const menuItems = menuItemsData?.data?.data || [];

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Manejar selección de categoría
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Manejar creación de elemento
  const handleCreateItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  // Manejar edición de elemento
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  // Manejar eliminación de elemento
  const handleDeleteItem = (item) => {
    setShowDeleteConfirm(item);
  };

  const confirmDeleteItem = async () => {
    if (!showDeleteConfirm) return;

    try {
      await menuItemAPI.delete(showDeleteConfirm.id);
      toast.success('Elemento eliminado exitosamente');
      queryClient.invalidateQueries('menuItems');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  // Manejar toggle de disponibilidad
  const handleToggleAvailability = async (itemId) => {
    try {
      await menuItemAPI.toggleAvailability(itemId);
      toast.success('Disponibilidad actualizada');
      queryClient.invalidateQueries('menuItems');
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Error al actualizar la disponibilidad');
    }
  };

  // Manejar guardado de elemento
  const handleSaveItem = (savedItem) => {
    queryClient.invalidateQueries('menuItems');
    queryClient.invalidateQueries('categories');
  };

  // Manejar guardado de categoría
  const handleSaveCategory = (savedCategory) => {
    queryClient.invalidateQueries('categories');
    queryClient.invalidateQueries('menuItems');
  };

  // Manejar creación de categoría
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  // Manejar edición de categoría
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  // Manejar eliminación de categoría
  const handleDeleteCategory = async (category) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      try {
        await categoryAPI.delete(category.id);
        toast.success('Categoría eliminada exitosamente');
        queryClient.invalidateQueries('categories');
        queryClient.invalidateQueries('menuItems');
        
        // Si la categoría eliminada estaba seleccionada, deseleccionar
        if (selectedCategory?.id === category.id) {
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const getPageTitle = () => {
    if (selectedCategory) {
      return `${selectedCategory.name} (${menuItems.length})`;
    }
    return `Todos los elementos (${menuItems.length})`;
  };

  return (
    <div className="menu-manager">
      {/* Header */}
      <div className="menu-header">
        <div className="header-content">
          <h1>Gestión de Menú</h1>
          <p>Administra los elementos y categorías de tu menú</p>
        </div>
        
        <div className="header-actions">
          <button
            className="preview-button"
            onClick={() => toast.info('Vista previa en desarrollo...')}
          >
            <Eye size={16} />
            Vista Previa
          </button>
          
          <button
            className="add-item-button"
            onClick={handleCreateItem}
          >
            <Plus size={16} />
            Nuevo Elemento
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="menu-content">
        {/* Sidebar con categorías */}
        <div className="menu-sidebar">
          <CategoryList
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onCategoryCreate={handleCreateCategory}
            onCategoryEdit={handleEditCategory}
            onCategoryDelete={handleDeleteCategory}
          />
        </div>

        {/* Main content */}
        <div className="menu-main">
          {/* Filters and Search */}
          <div className="menu-filters">
            <div className="search-section">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar elementos del menú..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  />
                  <span>Solo disponibles</span>
                </label>
              </div>

              <div className="view-toggle">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista de cuadrícula"
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid/List */}
          <div className="menu-items-section">
            <div className="section-header">
              <h2>{getPageTitle()}</h2>
              {searchQuery && (
                <span className="search-info">
                  Resultados para "{searchQuery}"
                </span>
              )}
            </div>

            {loadingItems ? (
              <div className={`menu-items-grid ${viewMode}`}>
                {[...Array(6)].map((_, index) => (
                  <MenuItemCard key={index} loading />
                ))}
              </div>
            ) : menuItems.length > 0 ? (
              <div className={`menu-items-grid ${viewMode}`}>
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-items">
                <div className="empty-icon">
                  <Filter size={48} />
                </div>
                <h3>
                  {searchQuery 
                    ? 'No se encontraron elementos' 
                    : selectedCategory 
                      ? 'No hay elementos en esta categoría'
                      : 'No hay elementos en el menú'
                  }
                </h3>
                <p>
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea tu primer elemento para comenzar'
                  }
                </p>
                {!searchQuery && (
                  <button
                    className="create-first-item"
                    onClick={handleCreateItem}
                  >
                    <Plus size={16} />
                    Crear elemento
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showItemForm && (
        <MenuItemForm
          item={editingItem}
          isOpen={showItemForm}
          onClose={() => setShowItemForm(false)}
          onSave={handleSaveItem}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          isOpen={showCategoryForm}
          onClose={() => setShowCategoryForm(false)}
          onSave={handleSaveCategory}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h3>Confirmar eliminación</h3>
            </div>
            
            <div className="delete-confirm-content">
              <p>
                ¿Estás seguro de que quieres eliminar <strong>"{showDeleteConfirm.name}"</strong>?
              </p>
              <p className="warning-text">
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="delete-confirm-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={confirmDeleteItem}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;