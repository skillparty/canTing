import React, { useState } from 'react';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import { Search, Package } from 'lucide-react';
import './MenuDisplay.css';

const MenuDisplay = ({ 
  categories, 
  menuItems, 
  selectedCategory, 
  onCategoryChange, 
  searchTerm,
  isRestaurantOpen = true 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Agrupar items por categoría
  const itemsByCategory = menuItems.reduce((acc, item) => {
    const categoryId = item.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {});

  // Obtener categorías con items
  const categoriesWithItems = categories.filter(category => 
    itemsByCategory[category.id] && itemsByCategory[category.id].length > 0
  );

  // Agregar categoría "Sin categoría" si hay items sin categoría
  if (itemsByCategory.uncategorized && itemsByCategory.uncategorized.length > 0) {
    categoriesWithItems.push({
      id: 'uncategorized',
      name: 'Otros',
      description: 'Productos sin categoría'
    });
  }

  const renderCategorySection = (category) => {
    const categoryItems = itemsByCategory[category.id] || [];
    
    if (categoryItems.length === 0) return null;

    return (
      <div key={category.id} className="category-section">
        <div className="category-header">
          <h2 className="category-title">{category.name}</h2>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          <div className="category-count">
            {categoryItems.length} producto{categoryItems.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className={`products-grid ${viewMode}`}>
          {categoryItems.map(item => (
            <ProductCard
              key={item.id}
              product={item}
              isRestaurantOpen={isRestaurantOpen}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderAllItems = () => {
    if (menuItems.length === 0) {
      return (
        <div className="empty-menu">
          <Package size={48} />
          <h3>No hay productos disponibles</h3>
          <p>
            {searchTerm 
              ? `No se encontraron productos que coincidan con "${searchTerm}"`
              : 'Este restaurante aún no ha agregado productos a su menú.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="all-items-section">
        <div className="section-header">
          <h2>
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos los productos'}
          </h2>
          <div className="items-count">
            {menuItems.length} producto{menuItems.length !== 1 ? 's' : ''} encontrado{menuItems.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className={`products-grid ${viewMode}`}>
          {menuItems.map(item => (
            <ProductCard
              key={item.id}
              product={item}
              isRestaurantOpen={isRestaurantOpen}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="menu-display">
      {/* Tabs de categorías */}
      <CategoryTabs
        categories={categoriesWithItems}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        itemCounts={itemsByCategory}
      />

      {/* Controles de vista */}
      <div className="menu-controls">
        <div className="view-controls">
          <button
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista en cuadrícula"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista en lista"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2" rx="1"/>
              <rect x="1" y="7" width="14" height="2" rx="1"/>
              <rect x="1" y="12" width="14" height="2" rx="1"/>
            </svg>
          </button>
        </div>
        
        <div className="results-info">
          {searchTerm && (
            <span className="search-results">
              <Search size={14} />
              {menuItems.length} resultado{menuItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Contenido del menú */}
      <div className="menu-content">
        {selectedCategory === 'all' || searchTerm ? (
          renderAllItems()
        ) : (
          (() => {
            const category = categoriesWithItems.find(cat => cat.id === selectedCategory);
            return category ? renderCategorySection(category) : renderAllItems();
          })()
        )}
      </div>

      {/* Mensaje cuando el restaurante está cerrado */}
      {!isRestaurantOpen && (
        <div className="restaurant-closed-notice">
          <div className="notice-content">
            <Package size={20} />
            <span>El restaurante está cerrado. Los pedidos no están disponibles en este momento.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuDisplay;