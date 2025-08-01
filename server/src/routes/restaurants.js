const express = require('express');
const router = express.Router();

const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, requireRole, requireRestaurantAccess } = require('../middleware/auth');
const { validateRestaurant, validateId } = require('../middleware/validation');
const { uploadLogo, handleUploadError, validateUpload } = require('../middleware/upload');

// Rutas públicas
router.get('/public', restaurantController.getAllRestaurants);
router.get('/public/:id', validateId, restaurantController.getRestaurant);
router.get('/public/:id/hours', validateId, restaurantController.getOpeningHours);
router.get('/public/:id/status', validateId, restaurantController.checkIfOpen);

// Rutas protegidas
router.use(authenticateToken);

// Obtener restaurante actual
router.get('/current', restaurantController.getCurrentRestaurant);

// Gestión de restaurante específico
router.get('/:id', validateId, requireRestaurantAccess, restaurantController.getRestaurant);
router.put('/:id', validateId, requireRestaurantAccess, validateRestaurant, restaurantController.updateRestaurant);

// Gestión de logo
router.post('/:id/logo', 
  validateId, 
  requireRestaurantAccess, 
  requireRole(['admin', 'manager']),
  uploadLogo, 
  handleUploadError, 
  validateUpload, 
  restaurantController.updateLogo
);

// Gestión de horarios
router.get('/:id/hours', validateId, requireRestaurantAccess, restaurantController.getOpeningHours);
router.put('/:id/hours', validateId, requireRestaurantAccess, requireRole(['admin', 'manager']), restaurantController.updateOpeningHours);

// Verificar estado (abierto/cerrado)
router.get('/:id/status', validateId, requireRestaurantAccess, restaurantController.checkIfOpen);

// Estadísticas
router.get('/:id/stats', validateId, requireRestaurantAccess, requireRole(['admin', 'manager']), restaurantController.getStats);

module.exports = router;