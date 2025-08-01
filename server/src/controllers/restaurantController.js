const Restaurant = require('../models/Restaurant');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Obtener información del restaurante
const getRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  res.json({
    success: true,
    data: restaurant.toJSON()
  });
});

// Obtener información del restaurante actual (del usuario autenticado)
const getCurrentRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant_id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  res.json({
    success: true,
    data: restaurant.toJSON()
  });
});

// Actualizar información del restaurante
const updateRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Verificar que el usuario tenga acceso a este restaurante
  if (parseInt(id) !== req.restaurant_id) {
    throw createError.forbidden('No tienes permisos para actualizar este restaurante');
  }

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  // Validar datos de entrada
  const validationErrors = Restaurant.validate(updateData);
  if (validationErrors.length > 0) {
    throw createError.badRequest('Datos inválidos', 'VALIDATION_ERROR');
  }

  // Si se está actualizando el email, verificar que no esté en uso
  if (updateData.email && updateData.email !== restaurant.email) {
    const existingRestaurant = await Restaurant.findByEmail(updateData.email);
    if (existingRestaurant && existingRestaurant.id !== restaurant.id) {
      throw createError.conflict('Email ya está en uso por otro restaurante');
    }
  }

  // Actualizar restaurante
  await restaurant.update(updateData);

  res.json({
    success: true,
    data: restaurant.toJSON(),
    message: 'Restaurante actualizado exitosamente'
  });
});

// Actualizar logo del restaurante
const updateLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el usuario tenga acceso a este restaurante
  if (parseInt(id) !== req.restaurant_id) {
    throw createError.forbidden('No tienes permisos para actualizar este restaurante');
  }

  if (!req.file) {
    throw createError.badRequest('Archivo de logo requerido');
  }

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  // Actualizar URL del logo
  await restaurant.update({ logo_url: req.file.url });

  res.json({
    success: true,
    data: {
      logo_url: req.file.url
    },
    message: 'Logo actualizado exitosamente'
  });
});

// Obtener horarios del restaurante
const getOpeningHours = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  res.json({
    success: true,
    data: {
      opening_hours: restaurant.opening_hours || {}
    }
  });
});

// Actualizar horarios del restaurante
const updateOpeningHours = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { opening_hours } = req.body;

  // Verificar que el usuario tenga acceso a este restaurante
  if (parseInt(id) !== req.restaurant_id) {
    throw createError.forbidden('No tienes permisos para actualizar este restaurante');
  }

  if (!opening_hours || typeof opening_hours !== 'object') {
    throw createError.badRequest('Horarios de apertura requeridos en formato objeto');
  }

  // Validar formato de horarios
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const day of validDays) {
    if (opening_hours[day]) {
      const daySchedule = opening_hours[day];
      
      if (typeof daySchedule !== 'object') {
        throw createError.badRequest(`Formato inválido para ${day}`);
      }

      if (!daySchedule.closed) {
        if (!daySchedule.open || !daySchedule.close) {
          throw createError.badRequest(`Horarios de apertura y cierre requeridos para ${day}`);
        }

        if (!timeRegex.test(daySchedule.open) || !timeRegex.test(daySchedule.close)) {
          throw createError.badRequest(`Formato de hora inválido para ${day}. Use HH:MM`);
        }
      }
    }
  }

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  // Actualizar horarios
  await restaurant.update({ opening_hours });

  res.json({
    success: true,
    data: {
      opening_hours: restaurant.opening_hours
    },
    message: 'Horarios actualizados exitosamente'
  });
});

// Verificar si el restaurante está abierto
const checkIfOpen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  let isOpen = false;
  let nextOpenTime = null;

  if (restaurant.opening_hours && restaurant.opening_hours[currentDay]) {
    const daySchedule = restaurant.opening_hours[currentDay];
    
    if (!daySchedule.closed) {
      const openTime = daySchedule.open;
      const closeTime = daySchedule.close;
      
      // Comparar horarios (simplificado, no maneja casos de medianoche)
      if (currentTime >= openTime && currentTime <= closeTime) {
        isOpen = true;
      }
    }
  }

  // Si está cerrado, buscar próximo horario de apertura
  if (!isOpen && restaurant.opening_hours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const currentDayIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      
      if (restaurant.opening_hours[nextDay] && !restaurant.opening_hours[nextDay].closed) {
        nextOpenTime = {
          day: nextDay,
          time: restaurant.opening_hours[nextDay].open
        };
        break;
      }
    }
  }

  res.json({
    success: true,
    data: {
      is_open: isOpen,
      current_time: currentTime,
      current_day: currentDay,
      next_open_time: nextOpenTime,
      opening_hours: restaurant.opening_hours
    }
  });
});

// Obtener estadísticas básicas del restaurante
const getStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el usuario tenga acceso a este restaurante
  if (parseInt(id) !== req.restaurant_id) {
    throw createError.forbidden('No tienes permisos para ver las estadísticas de este restaurante');
  }

  const restaurant = await Restaurant.findById(id);
  
  if (!restaurant) {
    throw createError.notFound('Restaurante no encontrado');
  }

  // Obtener estadísticas básicas (esto se puede expandir)
  const MenuItem = require('../models/MenuItem');
  const Order = require('../models/Order');
  
  const menuStats = await MenuItem.getStats(id);
  
  // Estadísticas de pedidos del último mes
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const orderStats = await Order.getStats(id, lastMonth, new Date());

  res.json({
    success: true,
    data: {
      restaurant: restaurant.toJSON(),
      menu_stats: menuStats,
      order_stats: orderStats
    }
  });
});

// Listar todos los restaurantes (público, para futuras funcionalidades)
const getAllRestaurants = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const restaurants = await Restaurant.findAll(parseInt(limit), parseInt(offset));

  res.json({
    success: true,
    data: restaurants.map(restaurant => restaurant.toJSON()),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: restaurants.length
    }
  });
});

module.exports = {
  getRestaurant,
  getCurrentRestaurant,
  updateRestaurant,
  updateLogo,
  getOpeningHours,
  updateOpeningHours,
  checkIfOpen,
  getStats,
  getAllRestaurants
};