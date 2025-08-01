const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      }
    });
  }
  
  next();
};

// Validaciones para autenticación
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email válido es requerido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nombre del restaurante debe tener entre 2 y 255 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email válido es requerido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dirección no puede exceder 500 caracteres'),
  handleValidationErrors
];

// Validaciones para restaurantes
const validateRestaurant = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nombre del restaurante debe tener entre 2 y 255 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email válido es requerido')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dirección no puede exceder 500 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),
  body('logo_url')
    .optional()
    .isURL()
    .withMessage('URL del logo inválida'),
  body('opening_hours')
    .optional()
    .isObject()
    .withMessage('Horarios deben ser un objeto válido'),
  handleValidationErrors
];

// Validaciones para categorías
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre de la categoría es requerido y no puede exceder 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Orden de visualización debe ser un número entero positivo'),
  handleValidationErrors
];

// Validaciones para elementos del menú
const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre del elemento es requerido y no puede exceder 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Precio debe ser un número positivo'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número entero positivo'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('URL de imagen inválida'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Disponibilidad debe ser verdadero o falso'),
  handleValidationErrors
];

// Validaciones para pedidos
const validateOrder = [
  body('customer_name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre del cliente es requerido y no puede exceder 255 caracteres'),
  body('customer_phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('El pedido debe tener al menos un elemento'),
  body('items.*.menu_item_id')
    .isInt({ min: 1 })
    .withMessage('ID del elemento del menú debe ser un número entero positivo'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Cantidad debe ser un número entero positivo'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Precio unitario debe ser un número positivo'),
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total del pedido debe ser un número positivo'),
  handleValidationErrors
];

const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Estado de pedido inválido'),
  handleValidationErrors
];

// Validaciones para pagos
const validatePayment = [
  body('order_id')
    .isInt({ min: 1 })
    .withMessage('ID del pedido debe ser un número entero positivo'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Monto del pago debe ser un número positivo'),
  body('payment_method')
    .optional()
    .isIn(['QR_CODE', 'CASH', 'CARD', 'TRANSFER'])
    .withMessage('Método de pago inválido'),
  handleValidationErrors
];

// Validaciones para parámetros de URL
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  handleValidationErrors
];

// Validaciones para queries de paginación
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para filtros de fecha
const validateDateRange = [
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida (ISO 8601)'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida (ISO 8601)'),
  handleValidationErrors
];

// Validación personalizada para archivos
const validateFileUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_REQUIRED',
          message: `Archivo ${fieldName} es requerido`
        }
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `Tipo de archivo inválido. Tipos permitidos: ${allowedTypes.join(', ')}`
        }
      });
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
        }
      });
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateRestaurant,
  validateCategory,
  validateMenuItem,
  validateOrder,
  validateOrderStatus,
  validatePayment,
  validateId,
  validatePagination,
  validateDateRange,
  validateFileUpload
};