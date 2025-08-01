import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Wifi,
  CreditCard,
  Car,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './RestaurantInfo.css';

const RestaurantInfo = ({ restaurant, isOpen }) => {
  const [showFullHours, setShowFullHours] = useState(false);

  if (!restaurant) return null;

  // Parsear horarios de apertura
  const parseOpeningHours = (hours) => {
    if (!hours) return null;
    
    try {
      const parsedHours = typeof hours === 'string' ? JSON.parse(hours) : hours;
      const dayNames = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo'
      };

      return Object.entries(parsedHours).map(([day, schedule]) => ({
        day: dayNames[day] || day,
        ...schedule
      }));
    } catch (error) {
      console.error('Error parsing opening hours:', error);
      return null;
    }
  };

  const openingHours = parseOpeningHours(restaurant.opening_hours);
  const currentDay = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = dayNames[currentDay];

  // Obtener horario de hoy
  const getTodayHours = () => {
    if (!openingHours) return null;
    return openingHours.find(schedule => 
      schedule.day.toLowerCase() === todayKey || 
      schedule.day.toLowerCase().includes(todayKey.substring(0, 3))
    );
  };

  const todayHours = getTodayHours();

  return (
    <div className="restaurant-info">
      {/* Status Card */}
      <div className="info-card status-card">
        <div className="card-header">
          <div className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
            <Clock size={16} />
            <span>{isOpen ? 'Abierto ahora' : 'Cerrado'}</span>
          </div>
          {restaurant.rating && (
            <div className="rating">
              <Star size={14} fill="currentColor" />
              <span>{restaurant.rating}</span>
            </div>
          )}
        </div>

        {todayHours && (
          <div className="today-hours">
            <span className="hours-label">Hoy:</span>
            <span className="hours-time">
              {todayHours.open && todayHours.close 
                ? `${todayHours.open} - ${todayHours.close}`
                : 'Cerrado'
              }
            </span>
          </div>
        )}

        {openingHours && (
          <button
            className="show-hours-button"
            onClick={() => setShowFullHours(!showFullHours)}
          >
            <span>Ver todos los horarios</span>
            {showFullHours ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {showFullHours && openingHours && (
          <div className="full-hours">
            {openingHours.map((schedule, index) => (
              <div key={index} className="hours-row">
                <span className="day-name">{schedule.day}</span>
                <span className="day-hours">
                  {schedule.open && schedule.close 
                    ? `${schedule.open} - ${schedule.close}`
                    : 'Cerrado'
                  }
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="info-card contact-card">
        <h3 className="card-title">Contacto</h3>
        
        <div className="contact-list">
          {restaurant.address && (
            <div className="contact-item">
              <MapPin size={16} />
              <div className="contact-content">
                <span className="contact-label">Dirección</span>
                <span className="contact-value">{restaurant.address}</span>
              </div>
            </div>
          )}

          {restaurant.phone && (
            <div className="contact-item">
              <Phone size={16} />
              <div className="contact-content">
                <span className="contact-label">Teléfono</span>
                <a 
                  href={`tel:${restaurant.phone}`}
                  className="contact-value link"
                >
                  {restaurant.phone}
                </a>
              </div>
            </div>
          )}

          {restaurant.email && (
            <div className="contact-item">
              <Mail size={16} />
              <div className="contact-content">
                <span className="contact-label">Email</span>
                <a 
                  href={`mailto:${restaurant.email}`}
                  className="contact-value link"
                >
                  {restaurant.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services & Features */}
      <div className="info-card features-card">
        <h3 className="card-title">Servicios</h3>
        
        <div className="features-grid">
          <div className="feature-item">
            <Wifi size={16} />
            <span>WiFi Gratis</span>
          </div>
          
          <div className="feature-item">
            <CreditCard size={16} />
            <span>Tarjetas</span>
          </div>
          
          <div className="feature-item">
            <Car size={16} />
            <span>Delivery</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {restaurant.description && (
        <div className="info-card description-card">
          <h3 className="card-title">Acerca de nosotros</h3>
          <p className="description-text">{restaurant.description}</p>
        </div>
      )}

      {/* Policies */}
      <div className="info-card policies-card">
        <h3 className="card-title">Políticas</h3>
        
        <div className="policies-list">
          <div className="policy-item">
            <strong>Tiempo de preparación:</strong>
            <span>15-30 minutos aproximadamente</span>
          </div>
          
          <div className="policy-item">
            <strong>Método de pago:</strong>
            <span>Efectivo, tarjetas, transferencias</span>
          </div>
          
          <div className="policy-item">
            <strong>Pedido mínimo:</strong>
            <span>$10.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;