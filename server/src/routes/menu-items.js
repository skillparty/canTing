const express = require('express');
const router = express.Router();

const menuItemController = require('../controllers/menuItemController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateMenuItem, validateId, validatePagination } = require('../middleware/validation');
const { uploadMenuImage, handleUploadError, validateUpload } = require('../middleware/upload');

// Rutas públicas
router.get('/public/:restaurant_id', menuItemController.getPublicMenu);
router.get('/public/:restaurant_id/search', menuItemController.searchPublicMenu);

// Rutas protegidas
router.use(authenticateToken);

// CRUD de elementos del menú
router.get('/', validatePagination, menuItemController.getMenuItems);
router.post('/', 
  requireRole(['admin', 'manager']), 
  uploadMenuImage, 
  handleUploadError, 
  validateMenuItem, 
  menuItemController.createMenuItem
);

router.get('/stats', requireRole(['admin', 'manager']), menuItemController.getMenuStats);
router.get('/category/:category_id', validateId, menuItemController.getItemsByCategory);

router.get('/:id', validateId, menuItemController.getMenuItem);
router.put('/:id', 
  validateId, 
  requireRole(['admin', 'manager']), 
  uploadMenuImage, 
  handleUploadError, 
  validateMenuItem, 
  menuItemController.updateMenuItem
);
router.delete('/:id', validateId, requireRole(['admin', 'manager']), menuItemController.deleteMenuItem);

// Gestión de disponibilidad
router.patch('/:id/toggle-availability', validateId, requireRole(['admin', 'manager', 'staff']), menuItemController.toggleAvailability);

// Gestión de imágenes
router.post('/:id/image', 
  validateId, 
  requireRole(['admin', 'manager']), 
  uploadMenuImage, 
  handleUploadError, 
  validateUpload, 
  menuItemController.updateImage
);

module.exports = router;