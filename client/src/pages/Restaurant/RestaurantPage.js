import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart as CartIcon, 
  Clock, 
  MapPin, 
  Phone,
  AlertCircle,
  Wifi,
  Star
} from 'lucide-react';
import MenuDisplay from '../../components/Restaurant/MenuDisplay';
import ShoppingCart from '../../components/Restaurant/ShoppingCart';
import RestaurantInfo from '../../components/Restaurant/RestaurantInfo';
import OrderForm from '../../components/Restaurant/OrderForm';
import { useCart } from '../../contexts/CartContext';
import { restaurantAPI, categoryAPI, menuItemAPI } from '../../services/api';
import './RestaurantPage.css';

const RestaurantPage = () => {
  const { slug } = useParams();
  const { getItemCount, restaurant, setRestaurant } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Cargar datos del restaurante
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        setError(null);

        // En una implementación real, buscarías por slug
        // Por ahora usamos el restaurante actual
        const restaurantResponse = await restaurantAPI.getCurrent();
        const restaurant = restaurantResponse.data;
        
        setRestaurantData(restaurant);
        setRestaurant(restaurant);

        // Cargar categorías
        const categoriesResponse = await categoryAPI.getPublic(restaurant.id);
        setCategories(categoriesResponse.data || []);

        // Cargar elementos del menú
        const menuResponse = await menuItemAPI.getPublic(restaurant.id);
        setMenuItems(menuResponse.data || []);

        // Verificar si está abierto
        checkIfOpen(restaurant.opening_hours);

      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setError('Error al cargar la información del restaurante');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadRestaurantData();
    }
  }, [slug, setRestaurant]); 
 // Verificar horarios de atención
  const checkIfOpen = (openingHours) => {
    if (!openingHours) {
      setIsOpen(true);
      return;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();

    try {
      const hours = typeof openingHours === 'string' 
        ? JSON.parse(openingHours) 
        : openingHours;

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayHours = hours[dayNames[currentDay]];

      if (!todayHours || !todayHours.open || !todayHours.close) {
        setIsOpen(false);
        return;
      }

      const [openHour, openMin] = todayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
      
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      setIsOpen(currentTime >= openTime && currentTime <= closeTime);
    } catch (error) {
      console.error('Error parsing opening hours:', error);
      setIsOpen(true);
    }
  };

  // Filtrar elementos del menú
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      item.category_id === selectedCategory;

    const isAvailable = item.is_available !== false;

    return matchesSearch && matchesCategory && isAvailable;
  });

  if (loading) {
    return (
      <div className="restaurant-page loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-page error">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Error al cargar el restaurante</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="restaurant-page not-found">
        <div className="not-found-container">
          <h2>Restaurante no encontrado</h2>
          <p>El restaurante que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {/* Header del restaurante */}
      <header className="restaurant-header">
        <div className="header-background">
          {restaurantData.logo_url && (
            <img 
              src={restaurantData.logo_url} 
              alt={restaurantData.name}
              className="header-logo"
            />
          )}
        </div>
        
        <div className="header-content">
          <div className="restaurant-title">
            <h1>{restaurantData.name}</h1>
            {restaurantData.description && (
              <p className="restaurant-description">{restaurantData.description}</p>
            )}
          </div>

          <div className="restaurant-status">
            <div className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
              <Clock size={16} />
              <span>{isOpen ? 'Abierto' : 'Cerrado'}</span>
            </div>
            
            {restaurantData.rating && (
              <div className="rating">
                <Star size={16} fill="currentColor" />
                <span>{restaurantData.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botón del carrito flotante */}
        {getItemCount() > 0 && (
          <button
            className="floating-cart-button"
            onClick={() => setShowCart(true)}
          >
            <CartIcon size={24} />
            <span className="cart-count">{getItemCount()}</span>
          </button>
        )}
      </header>

      {/* Navegación y búsqueda */}
      <div className="restaurant-nav">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar en el menú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <main className="restaurant-main">
        <div className="content-container">
          {/* Información del restaurante */}
          <RestaurantInfo 
            restaurant={restaurantData}
            isOpen={isOpen}
          />

          {/* Menú */}
          <MenuDisplay
            categories={categories}
            menuItems={filteredItems}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchTerm={searchTerm}
            isRestaurantOpen={isOpen}
          />
        </div>
      </main>

      {/* Carrito de compras */}
      <ShoppingCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowOrderForm(true);
        }}
      />

      {/* Formulario de pedido */}
      <OrderForm
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        restaurant={restaurantData}
      />

      {/* Mensaje de restaurante cerrado */}
      {!isOpen && (
        <div className="closed-overlay">
          <div className="closed-message">
            <Clock size={24} />
            <h3>Restaurante cerrado</h3>
            <p>Actualmente no estamos recibiendo pedidos. Vuelve durante nuestros horarios de atención.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;