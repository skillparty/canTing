const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { validateOrder, validateOrderStatus, validateId, validatePagination, validateDateRange } = require('../middleware/validation');

// Rutas públicas (para clientes)
router.post('/public', validateOrder, orderController.createOrder);

// Rutas protegidas
router.use(authenticateToken);

// CRUD de pedidos
router.get('/', validatePagination, validateDateRange, orderController.getOrders);
router.get('/pending', orderController.getPendingOrders);
router.get('/stats', requireRole(['admin', 'manager']), validateDateRange, orderController.getOrderStats);
router.get('/daily-summary', requireRole(['admin', 'manager']), orderController.getDailySummary);
router.get('/search', orderController.searchOrders);

router.get('/:id', validateId, orderController.getOrder);
router.put('/:id', validateId, requireRole(['admin', 'manager']), orderController.updateOrder);

// Gestión de estados
router.patch('/:id/status', validateId, validateOrderStatus, orderController.updateOrderStatus);
router.patch('/:id/payment-status', 
  validateId, 
  requireRole(['admin', 'manager']), 
  orderController.updatePaymentStatus
);

// Cancelar pedido
router.post('/:id/cancel', validateId, requireRole(['admin', 'manager']), orderController.cancelOrder);

module.exports = router;