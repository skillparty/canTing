import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu as MenuIcon,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ onMobileMenuToggle, title = 'Dashboard' }) => {
  const { user, restaurant, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementar lógica de búsqueda
      console.log('Buscar:', searchQuery);
    }
  };

  // Notificaciones mock
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Nuevo pedido',
      message: 'Pedido #1234 recibido',
      time: '2 min',
      unread: true
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pago confirmado',
      message: 'Pago de $25.50 procesado',
      time: '5 min',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'Sistema actualizado',
      message: 'Nueva versión disponible',
      time: '1 hora',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Abrir menú"
        >
          <MenuIcon size={24} />
        </button>
        
        <div className="header-title">
          <h1>{title}</h1>
          <div className="breadcrumb">
            <span>{restaurant?.name}</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar pedidos, menús, clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      <div className="header-right">
        {/* Información del restaurante */}
        <div className="restaurant-info">
          <div className="restaurant-status">
            <Clock size={16} />
            <span className="status-text">Abierto</span>
          </div>
          {restaurant?.address && (
            <div className="restaurant-location">
              <MapPin size={14} />
              <span>{restaurant.address}</span>
            </div>
          )}
        </div>

        {/* Notificaciones */}
        <div className="notifications-wrapper" ref={notificationsRef}>
          <button
            className="notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notificaciones</h3>
                <button className="mark-all-read">
                  Marcar todas como leídas
                </button>
              </div>
              
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    {notification.unread && (
                      <div className="notification-dot"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="notifications-footer">
                <button className="view-all-notifications">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Menú de usuario */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button
            className="user-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menú de usuario"
          >
            <div className="user-avatar">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <ChevronDown size={16} className="dropdown-arrow" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar large">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <h4>{user?.username}</h4>
                  <p>{user?.email}</p>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </div>

              <div className="user-dropdown-menu">
                <button className="dropdown-item">
                  <User size={16} />
                  <span>Mi Perfil</span>
                </button>
                <button className="dropdown-item">
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;