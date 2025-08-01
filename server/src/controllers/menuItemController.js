const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Obtener todos los elementos del menú
const getMenuItems = asyncHandler(async (req, res) => {
  const { category_id, available, search, limit = 50, offset = 0 } = req.query;

  const options = {
    limit: parseInt(limit),
    offset: parseInt(offset)
  };

  if (category_id) options.category_id = parseInt(category_id);
  if (available !== undefined) options.available = available === 'true';

  let menuItems;

  if (search) {
    menuItems = await MenuItem.search(req.restaurant_id, search);
  } else {
    menuItems = await MenuItem.findByRestaurant(req.restaurant_id, options);
  }

  res.json({
    success: true,
    data: menuItems.map(item => item.toJSON()),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: menuItems.length
    }
  });
});

// Obtener elemento del menú por ID
const getMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  
  if (!menuItem) {
    throw createError.notFound('Elemento del menú no encontrado');
  }

  // Verificar que el elemento pertenece al restaurante del usuario
  if (menuItem.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este elemento del menú');
  }

  res.json({
    success: true,
    data: menuItem.toJSON()
  });
});

// Crear nuevo elemento del menú
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category_id, image_url, available = true } = req.body;

  // Validar datos
  const validationErrors = MenuItem.validate({
    name,
    description,
    price,
    restaurant_id: req.restaurant_id,
    image_url
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '), 'VALIDATION_ERROR');
  }

  // Si se especifica una categoría, verificar que existe y pertenece al restaurante
  if (category_id) {
    const category = await Category.findById(category_id);
    if (!category || category.restaurant_id !== req.restaurant_id) {
      throw createError.badRequest('Categoría inválida o no pertenece a tu restaurante');
    }
  }

  // Verificar que no existe un elemento con el mismo nombre en el restaurante
  const existingItems = await MenuItem.findByRestaurant(req.restaurant_id);
  const nameExists = existingItems.some(item => 
    item.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    throw createError.conflict('Ya existe un elemento del menú con este nombre');
  }

  // Si hay un archivo subido, usar su URL
  const finalImageUrl = req.file ? req.file.url : image_url;

  // Crear elemento del menú
  const menuItem = await MenuItem.create({
    restaurant_id: req.restaurant_id,
    category_id: category_id || null,
    name,
    description,
    price: parseFloat(price),
    image_url: finalImageUrl,
    available
  });

  res.status(201).json({
    success: true,
    data: menuItem.toJSON(),
    message: 'Elemento del menú creado exitosamente'
  });
});

// Actualizar elemento del menú
const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url, available } = req.body;

  const menuItem = await MenuItem.findById(id);
  
  if (!menuItem) {
    throw createError.notFound('Elemento del menú no encontrado');
  }

  // Verificar que el elemento pertenece al restaurante del usuario
  if (menuItem.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este elemento del menú');
  }

  // Preparar datos de actualización
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (category_id !== undefined) updateData.category_id = category_id;
  if (available !== undefined) updateData.available = available;
  
  // Si hay un archivo subido, usar su URL
  if (req.file) {
    updateData.image_url = req.file.url;
  } else if (image_url !== undefined) {
    updateData.image_url = image_url;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError.badRequest('No hay datos para actualizar');
  }

  // Validar datos
  const validationErrors = MenuItem.validate({
    ...updateData,
    restaurant_id: req.restaurant_id
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '), 'VALIDATION_ERROR');
  }

  // Si se está actualizando la categoría, verificar que existe y pertenece al restaurante
  if (updateData.category_id) {
    const category = await Category.findById(updateData.category_id);
    if (!category || category.restaurant_id !== req.restaurant_id) {
      throw createError.badRequest('Categoría inválida o no pertenece a tu restaurante');
    }
  }

  // Si se está actualizando el nombre, verificar que no exista
  if (name && name !== menuItem.name) {
    const existingItems = await MenuItem.findByRestaurant(req.restaurant_id);
    const nameExists = existingItems.some(item => 
      item.id !== menuItem.id && item.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      throw createError.conflict('Ya existe un elemento del menú con este nombre');
    }
  }

  // Actualizar elemento del menú
  await menuItem.update(updateData);

  res.json({
    success: true,
    data: menuItem.toJSON(),
    message: 'Elemento del menú actualizado exitosamente'
  });
});

// Eliminar elemento del menú
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  
  if (!menuItem) {
    throw createError.notFound('Elemento del menú no encontrado');
  }

  // Verificar que el elemento pertenece al restaurante del usuario
  if (menuItem.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este elemento del menú');
  }

  // Eliminar elemento del menú
  await menuItem.delete();

  res.json({
    success: true,
    message: 'Elemento del menú eliminado exitosamente'
  });
});

// Cambiar disponibilidad del elemento
const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id);
  
  if (!menuItem) {
    throw createError.notFound('Elemento del menú no encontrado');
  }

  // Verificar que el elemento pertenece al restaurante del usuario
  if (menuItem.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este elemento del menú');
  }

  // Cambiar disponibilidad
  await menuItem.toggleAvailability();

  res.json({
    success: true,
    data: menuItem.toJSON(),
    message: `Elemento ${menuItem.available ? 'habilitado' : 'deshabilitado'} exitosamente`
  });
});

// Actualizar imagen del elemento
const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw createError.badRequest('Archivo de imagen requerido');
  }

  const menuItem = await MenuItem.findById(id);
  
  if (!menuItem) {
    throw createError.notFound('Elemento del menú no encontrado');
  }

  // Verificar que el elemento pertenece al restaurante del usuario
  if (menuItem.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este elemento del menú');
  }

  // Actualizar URL de la imagen
  await menuItem.update({ image_url: req.file.url });

  res.json({
    success: true,
    data: {
      image_url: req.file.url
    },
    message: 'Imagen actualizada exitosamente'
  });
});

// Obtener elementos por categoría
const getItemsByCategory = asyncHandler(async (req, res) => {
  const { category_id } = req.params;
  const { available } = req.query;

  // Verificar que la categoría pertenece al restaurante del usuario
  const category = await Category.findById(category_id);
  if (!category || category.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a esta categoría');
  }

  let menuItems = await MenuItem.findByCategory(category_id);

  // Filtrar por disponibilidad si se especifica
  if (available !== undefined) {
    const isAvailable = available === 'true';
    menuItems = menuItems.filter(item => item.available === isAvailable);
  }

  res.json({
    success: true,
    data: menuItems.map(item => item.toJSON()),
    category: category.toJSON()
  });
});

// Obtener estadísticas de elementos del menú
const getMenuStats = asyncHandler(async (req, res) => {
  const stats = await MenuItem.getStats(req.restaurant_id);

  res.json({
    success: true,
    data: stats
  });
});

// Obtener menú público (para clientes)
const getPublicMenu = asyncHandler(async (req, res) => {
  const { restaurant_id } = req.params;

  if (!restaurant_id) {
    throw createError.badRequest('ID del restaurante requerido');
  }

  // Obtener solo elementos disponibles
  const menuItems = await MenuItem.findByRestaurant(parseInt(restaurant_id), { 
    available: true 
  });

  // Agrupar por categorías
  const categorizedMenu = {};
  
  menuItems.forEach(item => {
    const categoryName = item.category_name || 'Sin categoría';
    if (!categorizedMenu[categoryName]) {
      categorizedMenu[categoryName] = [];
    }
    categorizedMenu[categoryName].push(item.toJSON());
  });

  res.json({
    success: true,
    data: categorizedMenu
  });
});

// Búsqueda pública de elementos del menú
const searchPublicMenu = asyncHandler(async (req, res) => {
  const { restaurant_id } = req.params;
  const { q: searchTerm } = req.query;

  if (!restaurant_id) {
    throw createError.badRequest('ID del restaurante requerido');
  }

  if (!searchTerm) {
    throw createError.badRequest('Término de búsqueda requerido');
  }

  const menuItems = await MenuItem.search(parseInt(restaurant_id), searchTerm);
  
  // Filtrar solo elementos disponibles
  const availableItems = menuItems.filter(item => item.available);

  res.json({
    success: true,
    data: availableItems.map(item => item.toJSON()),
    search_term: searchTerm
  });
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateImage,
  getItemsByCategory,
  getMenuStats,
  getPublicMenu,
  searchPublicMenu
};