const Category = require('../models/Category');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Obtener todas las categorías del restaurante
const getCategories = asyncHandler(async (req, res) => {
  const { include_items } = req.query;
  
  let categories;
  
  if (include_items === 'true') {
    categories = await Category.findByRestaurantWithItems(req.restaurant_id);
  } else {
    categories = await Category.findByRestaurant(req.restaurant_id);
  }

  res.json({
    success: true,
    data: categories.map(category => category.toJSON ? category.toJSON() : category)
  });
});

// Obtener categoría por ID
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  
  if (!category) {
    throw createError.notFound('Categoría no encontrada');
  }

  // Verificar que la categoría pertenece al restaurante del usuario
  if (category.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a esta categoría');
  }

  res.json({
    success: true,
    data: category.toJSON()
  });
});

// Crear nueva categoría
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, display_order } = req.body;

  // Validar datos
  const validationErrors = Category.validate({
    name,
    description,
    display_order,
    restaurant_id: req.restaurant_id
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '), 'VALIDATION_ERROR');
  }

  // Verificar que no existe una categoría con el mismo nombre en el restaurante
  const existingCategories = await Category.findByRestaurant(req.restaurant_id);
  const nameExists = existingCategories.some(cat => 
    cat.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    throw createError.conflict('Ya existe una categoría con este nombre');
  }

  // Si no se especifica display_order, usar el siguiente disponible
  let finalDisplayOrder = display_order;
  if (finalDisplayOrder === undefined) {
    const maxOrder = existingCategories.reduce((max, cat) => 
      Math.max(max, cat.display_order || 0), 0
    );
    finalDisplayOrder = maxOrder + 1;
  }

  // Crear categoría
  const category = await Category.create({
    restaurant_id: req.restaurant_id,
    name,
    description,
    display_order: finalDisplayOrder
  });

  res.status(201).json({
    success: true,
    data: category.toJSON(),
    message: 'Categoría creada exitosamente'
  });
});

// Actualizar categoría
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, display_order } = req.body;

  const category = await Category.findById(id);
  
  if (!category) {
    throw createError.notFound('Categoría no encontrada');
  }

  // Verificar que la categoría pertenece al restaurante del usuario
  if (category.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a esta categoría');
  }

  // Preparar datos de actualización
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (display_order !== undefined) updateData.display_order = display_order;

  if (Object.keys(updateData).length === 0) {
    throw createError.badRequest('No hay datos para actualizar');
  }

  // Validar datos
  const validationErrors = Category.validate({
    ...updateData,
    restaurant_id: req.restaurant_id
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '), 'VALIDATION_ERROR');
  }

  // Si se está actualizando el nombre, verificar que no exista
  if (name && name !== category.name) {
    const existingCategories = await Category.findByRestaurant(req.restaurant_id);
    const nameExists = existingCategories.some(cat => 
      cat.id !== category.id && cat.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      throw createError.conflict('Ya existe una categoría con este nombre');
    }
  }

  // Actualizar categoría
  await category.update(updateData);

  res.json({
    success: true,
    data: category.toJSON(),
    message: 'Categoría actualizada exitosamente'
  });
});

// Eliminar categoría
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  
  if (!category) {
    throw createError.notFound('Categoría no encontrada');
  }

  // Verificar que la categoría pertenece al restaurante del usuario
  if (category.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a esta categoría');
  }

  // Eliminar categoría (los elementos del menú quedarán sin categoría)
  await category.delete();

  res.json({
    success: true,
    message: 'Categoría eliminada exitosamente'
  });
});

// Reordenar categorías
const reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;

  if (!Array.isArray(categories)) {
    throw createError.badRequest('Se requiere un array de categorías');
  }

  // Validar que todas las categorías pertenecen al restaurante
  const restaurantCategories = await Category.findByRestaurant(req.restaurant_id);
  const restaurantCategoryIds = restaurantCategories.map(cat => cat.id);

  const invalidCategories = categories.filter(cat => 
    !restaurantCategoryIds.includes(cat.id)
  );

  if (invalidCategories.length > 0) {
    throw createError.forbidden('Algunas categorías no pertenecen a tu restaurante');
  }

  // Validar estructura de datos
  const validationErrors = [];
  categories.forEach((cat, index) => {
    if (!cat.id || typeof cat.display_order !== 'number') {
      validationErrors.push(`Categoría en posición ${index} tiene formato inválido`);
    }
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '));
  }

  // Reordenar categorías
  await Category.reorder(req.restaurant_id, categories);

  // Obtener categorías actualizadas
  const updatedCategories = await Category.findByRestaurant(req.restaurant_id);

  res.json({
    success: true,
    data: updatedCategories.map(category => category.toJSON()),
    message: 'Categorías reordenadas exitosamente'
  });
});

// Obtener categorías públicas (para clientes)
const getPublicCategories = asyncHandler(async (req, res) => {
  const { restaurant_id } = req.params;

  if (!restaurant_id) {
    throw createError.badRequest('ID del restaurante requerido');
  }

  const categories = await Category.findByRestaurantWithItems(parseInt(restaurant_id));

  // Filtrar solo elementos disponibles para el público
  const publicCategories = categories.map(category => ({
    ...category,
    menu_items: category.menu_items ? category.menu_items.filter(item => item.available) : []
  })).filter(category => category.menu_items.length > 0); // Solo mostrar categorías con elementos disponibles

  res.json({
    success: true,
    data: publicCategories
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getPublicCategories
};