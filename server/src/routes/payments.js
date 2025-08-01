const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { validatePayment, validateId, validatePagination, validateDateRange } = require('../middleware/validation');
const { uploadQRImage, handleUploadError, validateUpload } = require('../middleware/upload');

// Rutas públicas (para generar QR desde el frontend público)
router.post('/generate-qr', paymentController.generateQRCode);
router.get('/order/:order_id', paymentController.getPaymentByOrder);

// Rutas protegidas
router.use(authenticateToken);

// Gestión de pagos
router.get('/', validatePagination, validateDateRange, paymentController.getPayments);
router.get('/stats', requireRole(['admin', 'manager']), validateDateRange, paymentController.getPaymentStats);

// Subir QR de pago manual
router.post('/upload-qr', 
  requireRole(['admin', 'manager']), 
  uploadQRImage, 
  handleUploadError, 
  validateUpload, 
  paymentController.uploadQRImage
);

// Gestión de estados de pago
router.patch('/:id/status', validateId, requireRole(['admin', 'manager']), paymentController.updatePaymentStatus);
router.post('/:id/confirm', validateId, requireRole(['admin', 'manager']), paymentController.confirmPayment);
router.post('/:id/reject', validateId, requireRole(['admin', 'manager']), paymentController.rejectPayment);

// Regenerar QR
router.post('/:id/regenerate-qr', validateId, requireRole(['admin', 'manager']), paymentController.regenerateQRCode);

// Webhook para confirmación de pagos (ruta especial sin autenticación)
router.post('/webhook/confirm', paymentController.confirmPayment);

module.exports = router;