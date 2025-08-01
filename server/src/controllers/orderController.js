const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Obtener todos los pedidos del restaurante
const getOrders = asyncHandler(async (req, res) => {
  const { 
    status, 
    payment_status, 
    limit = 50, 
    offset = 0, 
    date_from, 
    date_to 
  } = req.query;

  const options = {
    limit: parseInt(limit),
    offset: parseInt(offset)
  };

  if (status) options.status = status;
  if (payment_status) options.payment_status = payment_status;
  if (date_from) options.date_from = new Date(date_from);
  if (date_to) options.date_to = new Date(date_to);

  const orders = await Order.findByRestaurant(req.restaurant_id, options);

  res.json({
    success: true,
    data: orders.map(order => order.toJSON()),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: orders.length
    }
  });
});

// Obtener pedido por ID
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  res.json({
    success: true,
    data: order.toJSON()
  });
});

// Crear nuevo pedido (público - para clientes)
const createOrder = asyncHandler(async (req, res) => {
  const { 
    restaurant_id, 
    customer_name, 
    customer_phone, 
    items, 
    total_amount 
  } = req.body;

  // Validar datos básicos
  const validationErrors = Order.validate({
    restaurant_id,
    customer_name,
    customer_phone,
    items,
    total_amount
  });

  if (validationErrors.length > 0) {
    throw createError.badRequest(validationErrors.join(', '), 'VALIDATION_ERROR');
  }

  // Crear pedido temporal para validar items
  const tempOrder = new Order({
    restaurant_id,
    customer_name,
    customer_phone,
    items,
    total_amount
  });

  // Validar que los elementos del menú existen y están disponibles
  await tempOrder.validateItems();

  // Verificar que el total calculado coincide con el enviado
  const calculatedTotal = tempOrder.calculateTotal();
  if (Math.abs(calculatedTotal - parseFloat(total_amount)) > 0.01) {
    throw createError.badRequest(
      `Total incorrecto. Calculado: ${calculatedTotal.toFixed(2)}, Enviado: ${parseFloat(total_amount).toFixed(2)}`
    );
  }

  // Crear pedido
  const order = await Order.create({
    restaurant_id,
    customer_name,
    customer_phone,
    items,
    total_amount: calculatedTotal
  });

  res.status(201).json({
    success: true,
    data: order.toJSON(),
    message: 'Pedido creado exitosamente'
  });
});

// Actualizar estado del pedido
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Actualizar estado
  await order.updateStatus(status);

  res.json({
    success: true,
    data: order.toJSON(),
    message: `Estado del pedido actualizado a: ${status}`
  });
});

// Actualizar estado de pago del pedido
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Actualizar estado de pago
  await order.updatePaymentStatus(payment_status);

  res.json({
    success: true,
    data: order.toJSON(),
    message: `Estado de pago actualizado a: ${payment_status}`
  });
});

// Obtener pedidos pendientes
const getPendingOrders = asyncHandler(async (req, res) => {
  const pendingOrders = await Order.findPending(req.restaurant_id);

  res.json({
    success: true,
    data: pendingOrders.map(order => order.toJSON()),
    total: pendingOrders.length
  });
});

// Actualizar pedido completo (solo para administradores)
const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Verificar permisos (solo admin y manager pueden actualizar pedidos completos)
  if (!['admin', 'manager'].includes(req.user.role)) {
    throw createError.forbidden('No tienes permisos para actualizar pedidos completos');
  }

  // Si se están actualizando los items, validar
  if (updateData.items) {
    const tempOrder = new Order({
      ...order,
      items: updateData.items
    });
    await tempOrder.validateItems();
    
    // Recalcular total si se cambian los items
    updateData.total_amount = tempOrder.calculateTotal();
  }

  // Actualizar pedido
  await order.update(updateData);

  res.json({
    success: true,
    data: order.toJSON(),
    message: 'Pedido actualizado exitosamente'
  });
});

// Cancelar pedido
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Verificar que el pedido se puede cancelar
  if (['delivered', 'cancelled'].includes(order.status)) {
    throw createError.badRequest('No se puede cancelar un pedido que ya fue entregado o cancelado');
  }

  // Cancelar pedido
  await order.updateStatus('cancelled');

  // Si el pago ya se procesó, actualizar a reembolso pendiente
  if (order.payment_status === 'paid') {
    await order.updatePaymentStatus('refunded');
  }

  res.json({
    success: true,
    data: order.toJSON(),
    message: 'Pedido cancelado exitosamente'
  });
});

// Obtener estadísticas de pedidos
const getOrderStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  // Por defecto, estadísticas del último mes
  const dateFrom = date_from ? new Date(date_from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = date_to ? new Date(date_to) : new Date();

  const stats = await Order.getStats(req.restaurant_id, dateFrom, dateTo);

  res.json({
    success: true,
    data: {
      ...stats,
      period: {
        from: dateFrom,
        to: dateTo
      }
    }
  });
});

// Obtener resumen diario de pedidos
const getDailySummary = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [todayOrders, pendingOrders] = await Promise.all([
    Order.findByRestaurant(req.restaurant_id, {
      date_from: startOfDay,
      date_to: endOfDay
    }),
    Order.findPending(req.restaurant_id)
  ]);

  const summary = {
    today: {
      total_orders: todayOrders.length,
      completed_orders: todayOrders.filter(o => o.status === 'delivered').length,
      cancelled_orders: todayOrders.filter(o => o.status === 'cancelled').length,
      total_revenue: todayOrders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0)
    },
    pending: {
      total_pending: pendingOrders.length,
      by_status: {
        pending: pendingOrders.filter(o => o.status === 'pending').length,
        confirmed: pendingOrders.filter(o => o.status === 'confirmed').length,
        preparing: pendingOrders.filter(o => o.status === 'preparing').length,
        ready: pendingOrders.filter(o => o.status === 'ready').length
      }
    }
  };

  res.json({
    success: true,
    data: summary
  });
});

// Buscar pedidos
const searchOrders = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 20 } = req.query;

  if (!searchTerm) {
    throw createError.badRequest('Término de búsqueda requerido');
  }

  // Buscar por nombre de cliente o teléfono
  const orders = await Order.findByRestaurant(req.restaurant_id, { limit: 100 });
  
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_phone && order.customer_phone.includes(searchTerm)) ||
    order.id.toString() === searchTerm
  ).slice(0, parseInt(limit));

  res.json({
    success: true,
    data: filteredOrders.map(order => order.toJSON()),
    search_term: searchTerm,
    total: filteredOrders.length
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getPendingOrders,
  updateOrder,
  cancelOrder,
  getOrderStats,
  getDailySummary,
  searchOrders
};