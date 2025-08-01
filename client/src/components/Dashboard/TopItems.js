import React from 'react';
import { TrendingUp, Star, DollarSign } from 'lucide-react';
import './TopItems.css';

const TopItems = ({ items = [], loading = false, title = "Elementos Más Vendidos" }) => {
  if (loading) {
    return (
      <div className="top-items-container">
        <div className="top-items-header">
          <div className="skeleton skeleton-title"></div>
        </div>
        <div className="top-items-list">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="top-item loading">
              <div className="item-rank">
                <div className="skeleton skeleton-rank"></div>
              </div>
              <div className="item-image">
                <div className="skeleton skeleton-image"></div>
              </div>
              <div className="item-info">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text-small"></div>
              </div>
              <div className="item-stats">
                <div className="skeleton skeleton-text-small"></div>
                <div className="skeleton skeleton-text-small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getRankColor = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return 'default';
  };

  const getRankIcon = (index) => {
    if (index < 3) {
      return <Star size={16} fill="currentColor" />;
    }
    return <TrendingUp size={16} />;
  };

  return (
    <div className="top-items-container">
      <div className="top-items-header">
        <h3 className="top-items-title">{title}</h3>
        <div className="period-selector">
          <select className="period-select">
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
          </select>
        </div>
      </div>

      <div className="top-items-list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={item.id || index} className="top-item">
              <div className={`item-rank ${getRankColor(index)}`}>
                <span className="rank-number">#{index + 1}</span>
                <div className="rank-icon">
                  {getRankIcon(index)}
                </div>
              </div>

              <div className="item-image">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="image-placeholder" style={{ display: item.image_url ? 'none' : 'flex' }}>
                  <span>{item.name?.charAt(0) || '?'}</span>
                </div>
              </div>

              <div className="item-info">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-category">{item.category_name || 'Sin categoría'}</p>
                <div className="item-price">
                  <DollarSign size={14} />
                  <span>${item.price?.toFixed(2)}</span>
                </div>
              </div>

              <div className="item-stats">
                <div className="stat">
                  <span className="stat-value">{item.orders_count || 0}</span>
                  <span className="stat-label">Pedidos</span>
                </div>
                <div className="stat">
                  <span className="stat-value">${(item.total_revenue || 0).toFixed(0)}</span>
                  <span className="stat-label">Ingresos</span>
                </div>
                {item.growth_percentage !== undefined && (
                  <div className={`stat growth ${item.growth_percentage >= 0 ? 'positive' : 'negative'}`}>
                    <span className="stat-value">
                      {item.growth_percentage >= 0 ? '+' : ''}{item.growth_percentage}%
                    </span>
                    <span className="stat-label">vs anterior</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="top-items-empty">
            <div className="empty-icon">
              <TrendingUp size={48} />
            </div>
            <h4>No hay datos disponibles</h4>
            <p>Los elementos más vendidos aparecerán aquí cuando tengas pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopItems;