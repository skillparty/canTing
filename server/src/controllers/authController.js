const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Login de usuario
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario por email
  const user = await User.findByEmail(email);
  
  if (!user) {
    throw createError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  // Verificar contraseña
  const isValidPassword = await user.verifyPassword(password);
  
  if (!isValidPassword) {
    throw createError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  // Obtener información del restaurante
  const restaurant = await Restaurant.findById(user.restaurant_id);
  
  if (!restaurant) {
    throw createError.internal('Error interno: restaurante no encontrado');
  }

  // Generar tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      restaurant: restaurant.toJSON(),
      token,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    message: 'Login exitoso'
  });
});

// Registro de nuevo restaurante
const register = asyncHandler(async (req, res) => {
  const { name, description, address, phone, email, password, logo_url, opening_hours } = req.body;

  // Verificar si ya existe un restaurante con este email
  const existingRestaurant = await Restaurant.findByEmail(email);
  
  if (existingRestaurant) {
    throw createError.conflict('Ya existe un restaurante registrado con este email');
  }

  // Verificar si ya existe un usuario con este email
  const existingUser = await User.findByEmail(email);
  
  if (existingUser) {
    throw createError.conflict('Ya existe un usuario registrado con este email');
  }

  // Crear restaurante (esto también crea el usuario administrador)
  const restaurant = await Restaurant.create({
    name,
    description,
    address,
    phone,
    email,
    password,
    logo_url,
    opening_hours
  });

  // Obtener el usuario administrador creado
  const user = await User.findByEmail(email);

  // Generar tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      restaurant: restaurant.toJSON(),
      token,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    message: 'Restaurante registrado exitosamente'
  });
});

// Renovar token usando refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createError.badRequest('Refresh token requerido');
  }

  // Verificar refresh token
  const decoded = verifyRefreshToken(token);
  
  // Buscar usuario
  const user = await User.findById(decoded.userId);
  
  if (!user) {
    throw createError.unauthorized('Usuario no encontrado');
  }

  // Generar nuevo token
  const newToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res.json({
    success: true,
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    message: 'Token renovado exitosamente'
  });
});

// Logout (invalidar token - en una implementación real se mantendría una blacklist)
const logout = asyncHandler(async (req, res) => {
  // En una implementación completa, aquí se agregaría el token a una blacklist
  // Por ahora, simplemente confirmamos el logout
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Verificar token actual
const verifyToken = asyncHandler(async (req, res) => {
  // El middleware de autenticación ya verificó el token y agregó el usuario a req.user
  const restaurant = await Restaurant.findById(req.user.restaurant_id);

  res.json({
    success: true,
    data: {
      user: req.user.toJSON(),
      restaurant: restaurant ? restaurant.toJSON() : null,
      valid: true
    },
    message: 'Token válido'
  });
});

// Cambiar contraseña
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError.badRequest('Contraseña actual y nueva contraseña son requeridas');
  }

  if (newPassword.length < 6) {
    throw createError.badRequest('La nueva contraseña debe tener al menos 6 caracteres');
  }

  // Verificar contraseña actual
  const isValidPassword = await req.user.verifyPassword(currentPassword);
  
  if (!isValidPassword) {
    throw createError.unauthorized('Contraseña actual incorrecta');
  }

  // Actualizar contraseña
  await req.user.updatePassword(newPassword);

  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente'
  });
});

// Obtener perfil del usuario actual
const getProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.restaurant_id);

  res.json({
    success: true,
    data: {
      user: req.user.toJSON(),
      restaurant: restaurant ? restaurant.toJSON() : null
    }
  });
});

// Actualizar perfil del usuario
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const updateData = {};

  if (username && username !== req.user.username) {
    // Verificar que el username no esté en uso
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== req.user.id) {
      throw createError.conflict('Username ya está en uso');
    }
    updateData.username = username;
  }

  if (email && email !== req.user.email) {
    // Verificar que el email no esté en uso
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== req.user.id) {
      throw createError.conflict('Email ya está en uso');
    }
    updateData.email = email;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError.badRequest('No hay datos para actualizar');
  }

  // Actualizar usuario
  await req.user.update(updateData);

  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    },
    message: 'Perfil actualizado exitosamente'
  });
});

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  verifyToken,
  changePassword,
  getProfile,
  updateProfile
};