import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './MetricsCard.css';

const MetricsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'blue',
  loading = false,
  subtitle,
  onClick
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={16} />;
      case 'negative':
        return <TrendingDown size={16} />;
      default:
        return <Minus size={16} />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="metrics-card loading">
        <div className="metrics-card-content">
          <div className="metrics-header">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-icon"></div>
          </div>
          <div className="metrics-value">
            <div className="skeleton skeleton-value"></div>
          </div>
          <div className="metrics-change">
            <div className="skeleton skeleton-change"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`metrics-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="metrics-card-content">
        <div className="metrics-header">
          <h3 className="metrics-title">{title}</h3>
          {Icon && (
            <div className="metrics-icon">
              <Icon size={24} />
            </div>
          )}
        </div>
        
        <div className="metrics-value">
          <span className="value">{value}</span>
          {subtitle && (
            <span className="subtitle">{subtitle}</span>
          )}
        </div>
        
        {change !== undefined && (
          <div className={`metrics-change ${getTrendColor()}`}>
            <span className="change-icon">
              {getTrendIcon()}
            </span>
            <span className="change-text">
              {Math.abs(change)}% vs mes anterior
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;