import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Menu, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Store,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, restaurant } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      roles: ['admin', 'manager', 'staff']
    },
    {
      path: '/menu',
      icon: Menu,
      label: 'Gestión de Menú',
      roles: ['admin', 'manager']
    },
    {
      path: '/orders',
      icon: ShoppingBag,
      label: 'Pedidos',
      roles: ['admin', 'manager', 'staff']
    },
    {
      path: '/payments',
      icon: CreditCard,
      label: 'Pagos',
      roles: ['admin', 'manager']
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analíticas',
      roles: ['admin', 'manager']
    },
    {
      path: '/restaurant',
      icon: Store,
      label: 'Mi Restaurante',
      roles: ['admin', 'manager']
    },
    {
      path: '/users',
      icon: Users,
      label: 'Usuarios',
      roles: ['admin']
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configuración',
      roles: ['admin', 'manager']
    }
  ];

  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {restaurant?.logo_url ? (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name}
              className="logo-image"
            />
          ) : (
            <div className="logo-placeholder">
              <Store size={24} />
            </div>
          )}
          {!isCollapsed && (
            <div className="logo-text">
              <h3>{restaurant?.name || 'Mi Restaurante'}</h3>
              <span className="role-badge">{user?.role}</span>
            </div>
          )}
        </div>
        
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="restaurant-status">
            <div className="status-indicator">
              <Clock size={16} />
              <span className="status-text">Abierto</span>
            </div>
            <div className="status-hours">
              Cierra a las 22:00
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;