const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de acceso requerido'
        }
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        }
      });
    }

    // Agregar información del usuario a la request
    req.user = user;
    req.restaurant_id = user.restaurant_id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expirado'
        }
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Error interno de autenticación'
      }
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Usuario no autenticado'
        }
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Permisos insuficientes para esta acción'
        }
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario pertenece al restaurante
const requireRestaurantAccess = (req, res, next) => {
  const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurant_id;
  
  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_RESTAURANT_ID',
        message: 'ID del restaurante requerido'
      }
    });
  }

  if (parseInt(restaurantId) !== req.user.restaurant_id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'RESTAURANT_ACCESS_DENIED',
        message: 'Acceso denegado a este restaurante'
      }
    });
  }

  next();
};

// Generar token JWT
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    restaurantId: user.restaurant_id,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Generar refresh token
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' // Refresh token válido por 7 días
  });
};

// Verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.restaurant_id = user.restaurant_id;
      }
    }
    
    next();
  } catch (error) {
    // En autenticación opcional, continuamos sin usuario
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireRestaurantAccess,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  optionalAuth
};