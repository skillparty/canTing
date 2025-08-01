const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Generar código QR para pago
const generateQRCode = asyncHandler(async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    throw createError.badRequest('ID del pedido requerido');
  }

  // Verificar que el pedido existe
  const order = await Order.findById(order_id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario (si es una request autenticada)
  if (req.user && order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Verificar que el pedido no esté cancelado
  if (order.status === 'cancelled') {
    throw createError.badRequest('No se puede generar QR para un pedido cancelado');
  }

  // Verificar si ya existe un pago para este pedido
  const existingPayment = await Payment.findByOrder(order_id);
  
  if (existingPayment) {
    return res.json({
      success: true,
      data: {
        payment: existingPayment.toJSON(),
        qr_code: existingPayment.qr_image_url,
        order: order.toJSON()
      },
      message: 'Código QR ya existe para este pedido'
    });
  }

  // Generar URL base para pagos
  const baseUrl = process.env.PAYMENT_BASE_URL || `${req.protocol}://${req.get('host')}/payment`;

  // Procesar pago y generar QR
  const paymentResult = await Payment.processPayment(order_id, baseUrl);

  res.status(201).json({
    success: true,
    data: {
      payment: paymentResult.payment.toJSON(),
      qr_code: paymentResult.qr_code,
      payment_url: paymentResult.payment_url,
      order: order.toJSON()
    },
    message: 'Código QR generado exitosamente'
  });
});

// Subir imagen de QR de pago (para pagos manuales)
const uploadQRImage = asyncHandler(async (req, res) => {
  const { order_id, amount, payment_method = 'QR_CODE' } = req.body;

  if (!req.file) {
    throw createError.badRequest('Imagen de QR requerida');
  }

  if (!order_id) {
    throw createError.badRequest('ID del pedido requerido');
  }

  if (!amount) {
    throw createError.badRequest('Monto del pago requerido');
  }

  // Verificar que el pedido existe
  const order = await Order.findById(order_id);
  
  if (!order) {
    throw createError.notFound('Pedido no encontrado');
  }

  // Verificar que el pedido pertenece al restaurante del usuario
  if (order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pedido');
  }

  // Verificar que el monto coincide con el total del pedido
  if (Math.abs(parseFloat(amount) - order.total_amount) > 0.01) {
    throw createError.badRequest('El monto no coincide con el total del pedido');
  }

  // Verificar si ya existe un pago para este pedido
  const existingPayment = await Payment.findByOrder(order_id);
  
  if (existingPayment) {
    // Actualizar pago existente
    await existingPayment.update({
      qr_image_url: req.file.url,
      payment_method,
      amount: parseFloat(amount)
    });

    return res.json({
      success: true,
      data: existingPayment.toJSON(),
      message: 'Imagen de QR actualizada exitosamente'
    });
  }

  // Crear nuevo pago
  const payment = await Payment.create({
    order_id,
    qr_image_url: req.file.url,
    payment_method,
    amount: parseFloat(amount),
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: payment.toJSON(),
    message: 'Imagen de QR subida exitosamente'
  });
});

// Obtener información de pago por pedido
const getPaymentByOrder = asyncHandler(async (req, res) => {
  const { order_id } = req.params;

  const payment = await Payment.findByOrder(order_id);
  
  if (!payment) {
    throw createError.notFound('Pago no encontrado para este pedido');
  }

  // Si es una request autenticada, verificar permisos
  if (req.user) {
    const order = await Order.findById(order_id);
    if (order && order.restaurant_id !== req.restaurant_id) {
      throw createError.forbidden('No tienes acceso a este pago');
    }
  }

  res.json({
    success: true,
    data: payment.toJSON()
  });
});

// Obtener todos los pagos del restaurante
const getPayments = asyncHandler(async (req, res) => {
  const { 
    status, 
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
  if (date_from) options.date_from = new Date(date_from);
  if (date_to) options.date_to = new Date(date_to);

  const payments = await Payment.findByRestaurant(req.restaurant_id, options);

  res.json({
    success: true,
    data: payments.map(payment => payment.toJSON()),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: payments.length
    }
  });
});

// Actualizar estado de pago
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const payment = await Payment.findById(id);
  
  if (!payment) {
    throw createError.notFound('Pago no encontrado');
  }

  // Verificar permisos
  const order = await Order.findById(payment.order_id);
  if (order && order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pago');
  }

  // Actualizar estado del pago
  await payment.updateStatus(status);

  res.json({
    success: true,
    data: payment.toJSON(),
    message: `Estado del pago actualizado a: ${status}`
  });
});

// Procesar confirmación de pago (webhook o manual)
const confirmPayment = asyncHandler(async (req, res) => {
  const { order_id, transaction_id, payment_method } = req.body;

  if (!order_id) {
    throw createError.badRequest('ID del pedido requerido');
  }

  // Buscar pago
  const payment = await Payment.findByOrder(order_id);
  
  if (!payment) {
    throw createError.notFound('Pago no encontrado');
  }

  // Verificar que el pago está pendiente
  if (payment.status !== 'pending') {
    throw createError.badRequest('El pago ya fue procesado');
  }

  // Actualizar pago como completado
  await payment.updateStatus('completed');

  // Actualizar información adicional si se proporciona
  const updateData = {};
  if (payment_method) updateData.payment_method = payment_method;
  
  if (Object.keys(updateData).length > 0) {
    await payment.update(updateData);
  }

  res.json({
    success: true,
    data: payment.toJSON(),
    message: 'Pago confirmado exitosamente'
  });
});

// Rechazar pago
const rejectPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const payment = await Payment.findById(id);
  
  if (!payment) {
    throw createError.notFound('Pago no encontrado');
  }

  // Verificar permisos
  const order = await Order.findById(payment.order_id);
  if (order && order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pago');
  }

  // Actualizar estado del pago como fallido
  await payment.updateStatus('failed');

  res.json({
    success: true,
    data: payment.toJSON(),
    message: 'Pago rechazado'
  });
});

// Obtener estadísticas de pagos
const getPaymentStats = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  // Por defecto, estadísticas del último mes
  const dateFrom = date_from ? new Date(date_from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = date_to ? new Date(date_to) : new Date();

  const stats = await Payment.getStats(req.restaurant_id, dateFrom, dateTo);

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

// Generar nuevo QR para pago existente
const regenerateQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id);
  
  if (!payment) {
    throw createError.notFound('Pago no encontrado');
  }

  // Verificar permisos
  const order = await Order.findById(payment.order_id);
  if (order && order.restaurant_id !== req.restaurant_id) {
    throw createError.forbidden('No tienes acceso a este pago');
  }

  // Verificar que el pago está pendiente
  if (payment.status !== 'pending') {
    throw createError.badRequest('Solo se puede regenerar QR para pagos pendientes');
  }

  // Generar nueva URL y QR
  const baseUrl = process.env.PAYMENT_BASE_URL || `${req.protocol}://${req.get('host')}/payment`;
  const paymentUrl = Payment.generatePaymentUrl(payment.order_id, baseUrl);
  const qrCodeDataURL = await Payment.generateQRCode(payment.order_id, paymentUrl);

  // Actualizar pago con nuevo QR
  await payment.update({ qr_image_url: qrCodeDataURL });

  res.json({
    success: true,
    data: {
      payment: payment.toJSON(),
      qr_code: qrCodeDataURL,
      payment_url: paymentUrl
    },
    message: 'Código QR regenerado exitosamente'
  });
});

module.exports = {
  generateQRCode,
  uploadQRImage,
  getPaymentByOrder,
  getPayments,
  updatePaymentStatus,
  confirmPayment,
  rejectPayment,
  getPaymentStats,
  regenerateQRCode
};