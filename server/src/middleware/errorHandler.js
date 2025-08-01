// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? { id: req.user.id, email: req.user.email } : null
  });

  // Error de validación de base de datos (PostgreSQL)
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Ya existe un registro con estos datos',
        details: err.detail
      }
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referencia inválida a otro registro',
        details: err.detail
      }
    });
  }

  if (err.code === '23514') { // Check violation
    return res.status(400).json({
      success: false,
      error: {
        code: 'CHECK_VIOLATION',
        message: 'Datos no cumplen con las restricciones',
        details: err.detail
      }
    });
  }

  // Error de conexión a base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Error de conexión a la base de datos'
      }
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de autenticación inválido'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token de autenticación expirado'
      }
    });
  }

  // Error de validación personalizada
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details || []
      }
    });
  }

  // Error de archivo no encontrado
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'Archivo no encontrado'
      }
    });
  }

  // Error de límite de tamaño de archivo (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'El archivo es demasiado grande'
      }
    });
  }

  // Error de tipo de archivo no permitido (multer)
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Tipo de archivo no permitido'
      }
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Formato JSON inválido'
      }
    });
  }

  // Error personalizado de la aplicación
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: {
        code: err.code || 'APPLICATION_ERROR',
        message: err.message
      }
    });
  }

  // Error interno del servidor (por defecto)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message
    }
  });
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`
    }
  });
};

// Clase para errores personalizados de la aplicación
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Función para crear errores comunes
const createError = {
  badRequest: (message, code = 'BAD_REQUEST') => new AppError(message, 400, code),
  unauthorized: (message, code = 'UNAUTHORIZED') => new AppError(message, 401, code),
  forbidden: (message, code = 'FORBIDDEN') => new AppError(message, 403, code),
  notFound: (message, code = 'NOT_FOUND') => new AppError(message, 404, code),
  conflict: (message, code = 'CONFLICT') => new AppError(message, 409, code),
  internal: (message, code = 'INTERNAL_ERROR') => new AppError(message, 500, code)
};

// Wrapper para funciones async que maneja errores automáticamente
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  createError,
  asyncHandler
};