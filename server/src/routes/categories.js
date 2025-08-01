const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { validateCategory, validateId } = require('../middleware/validation');

// Rutas públicas
router.get('/public/:restaurant_id', categoryController.getPublicCategories);

// Rutas protegidas
router.use(authenticateToken);

// CRUD de categorías
router.get('/', categoryController.getCategories);
router.post('/', requireRole(['admin', 'manager']), validateCategory, categoryController.createCategory);
router.get('/:id', validateId, categoryController.getCategory);
router.put('/:id', validateId, requireRole(['admin', 'manager']), validateCategory, categoryController.updateCategory);
router.delete('/:id', validateId, requireRole(['admin', 'manager']), categoryController.deleteCategory);

// Reordenar categorías
router.post('/reorder', requireRole(['admin', 'manager']), categoryController.reorderCategories);

module.exports = router;