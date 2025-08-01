const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const restaurantRoutes = require('./restaurants');
const categoryRoutes = require('./categories');
const menuItemRoutes = require('./menu-items');
const orderRoutes = require('./orders');
const paymentRoutes = require('./payments');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// Ruta de salud del API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información del API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      restaurants: '/api/v1/restaurants',
      categories: '/api/v1/categories',
      menu_items: '/api/v1/menu-items',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments'
    },
    documentation: '/api/v1/docs'
  });
});

module.exports = router;