import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import './CategoryTabs.css';

const CategoryTabs = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  itemCounts = {} 
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Verificar si se puede hacer scroll
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [categories]);

  // Scroll hacia la izquierda
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Scroll hacia la derecha
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Obtener el conteo de items para una categoría
  const getItemCount = (categoryId) => {
    return itemCounts[categoryId]?.length || 0;
  };

  // Todas las categorías incluyendo "Todos"
  const allCategories = [
    {
      id: 'all',
      name: 'Todos',
      description: 'Ver todos los productos'
    },
    ...categories
  ];

  return (
    <div className="category-tabs">
      <div className="tabs-container">
        {/* Botón scroll izquierda */}
        {canScrollLeft && (
          <button
            className="scroll-button left"
            onClick={scrollLeft}
            aria-label="Scroll hacia la izquierda"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Tabs scrollables */}
        <div 
          className="tabs-scroll"
          ref={scrollContainerRef}
          onScroll={checkScrollability}
        >
          <div className="tabs-list">
            {allCategories.map(category => {
              const isActive = selectedCategory === category.id;
              const itemCount = category.id === 'all' 
                ? Object.values(itemCounts).reduce((total, items) => total + items.length, 0)
                : getItemCount(category.id);

              return (
                <button
                  key={category.id}
                  className={`category-tab ${isActive ? 'active' : ''}`}
                  onClick={() => onCategoryChange(category.id)}
                  title={category.description}
                >
                  <div className="tab-content">
                    {category.id === 'all' && <Grid size={16} />}
                    <span className="tab-name">{category.name}</span>
                    {itemCount > 0 && (
                      <span className="tab-count">{itemCount}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón scroll derecha */}
        {canScrollRight && (
          <button
            className="scroll-button right"
            onClick={scrollRight}
            aria-label="Scroll hacia la derecha"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Indicador de categoría activa */}
      {selectedCategory !== 'all' && (
        <div className="active-category-info">
          {(() => {
            const activeCategory = categories.find(cat => cat.id === selectedCategory);
            if (activeCategory) {
              return (
                <div className="category-details">
                  <h3>{activeCategory.name}</h3>
                  {activeCategory.description && (
                    <p>{activeCategory.description}</p>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;