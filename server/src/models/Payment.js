const { query } = require('../config/database');
const QRCode = require('qrcode');

class Payment {
  constructor(data) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.qr_image_url = data.qr_image_url;
    this.payment_method = data.payment_method;
    this.amount = parseFloat(data.amount);
    this.status = data.status;
    this.uploaded_at = data.uploaded_at;
  }

  // Crear nuevo pago
  static async create(paymentData) {
    const { 
      order_id, 
      qr_image_url, 
      payment_method = 'QR_CODE', 
      amount, 
      status = 'pending' 
    } = paymentData;
    
    const result = await query(
      `INSERT INTO payments (order_id, qr_image_url, payment_method, amount, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, qr_image_url, payment_method, amount, status]
    );

    return new Payment(result.rows[0]);
  }

  // Buscar pago por ID
  static async findById(id) {
    const result = await query(
      `SELECT p.*, o.customer_name, o.total_amount as order_total, r.name as restaurant_name
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length > 0) {
      const payment = new Payment(result.rows[0]);
      payment.customer_name = result.rows[0].customer_name;
      payment.order_total = parseFloat(result.rows[0].order_total);
      payment.restaurant_name = result.rows[0].restaurant_name;
      return payment;
    }
    
    return null;
  }

  // Buscar pago por pedido
  static async findByOrder(order_id) {
    const result = await query(
      'SELECT * FROM payments WHERE order_id = $1',
      [order_id]
    );
    
    return result.rows.length > 0 ? new Payment(result.rows[0]) : null;
  }

  // Obtener pagos por restaurante
  static async findByRestaurant(restaurant_id, options = {}) {
    const { status, limit = 50, offset = 0, date_from, date_to } = options;
    
    let whereClause = 'WHERE o.restaurant_id = $1';
    const params = [restaurant_id];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date_from) {
      whereClause += ` AND p.uploaded_at >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      whereClause += ` AND p.uploaded_at <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `SELECT p.*, o.customer_name, o.total_amount as order_total, r.name as restaurant_name
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       ${whereClause}
       ORDER BY p.uploaded_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    
    return result.rows.map(row => {
      const payment = new Payment(row);
      payment.customer_name = row.customer_name;
      payment.order_total = parseFloat(row.order_total);
      payment.restaurant_name = row.restaurant_name;
      return payment;
    });
  }

  // Generar código QR para pago
  static async generateQRCode(order_id, paymentUrl) {
    try {
      // Generar QR code como data URL
      const qrCodeDataURL = await QRCode.toDataURL(paymentUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Error generando código QR: ' + error.message);
    }
  }

  // Generar URL de pago
  static generatePaymentUrl(order_id, baseUrl = 'https://payment.example.com') {
    return `${baseUrl}/pay/${order_id}?timestamp=${Date.now()}`;
  }

  // Actualizar estado del pago
  async updateStatus(newStatus) {
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado de pago inválido');
    }

    const result = await query(
      'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, this.id]
    );

    this.status = result.rows[0].status;

    // Si el pago se completa, actualizar el estado del pedido
    if (newStatus === 'completed') {
      await query(
        'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['paid', this.order_id]
      );
    } else if (newStatus === 'failed') {
      await query(
        'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['failed', this.order_id]
      );
    }

    return this;
  }

  // Actualizar pago
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'order_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(this.id);
    
    const result = await query(
      `UPDATE payments SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Procesar pago completo (crear pago y generar QR)
  static async processPayment(order_id, baseUrl) {
    try {
      // Obtener información del pedido
      const orderResult = await query(
        'SELECT * FROM orders WHERE id = $1',
        [order_id]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Pedido no encontrado');
      }

      const order = orderResult.rows[0];

      // Generar URL de pago
      const paymentUrl = this.generatePaymentUrl(order_id, baseUrl);

      // Generar código QR
      const qrCodeDataURL = await this.generateQRCode(order_id, paymentUrl);

      // Crear registro de pago
      const payment = await this.create({
        order_id: order_id,
        qr_image_url: qrCodeDataURL,
        payment_method: 'QR_CODE',
        amount: order.total_amount,
        status: 'pending'
      });

      return {
        payment,
        qr_code: qrCodeDataURL,
        payment_url: paymentUrl
      };
    } catch (error) {
      throw new Error('Error procesando pago: ' + error.message);
    }
  }

  // Obtener estadísticas de pagos
  static async getStats(restaurant_id, dateFrom, dateTo) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_payments,
        COUNT(*) FILTER (WHERE p.status = 'completed') as completed_payments,
        COUNT(*) FILTER (WHERE p.status = 'failed') as failed_payments,
        COUNT(*) FILTER (WHERE p.status = 'pending') as pending_payments,
        SUM(p.amount) FILTER (WHERE p.status = 'completed') as total_amount,
        AVG(p.amount) FILTER (WHERE p.status = 'completed') as average_amount
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE o.restaurant_id = $1
       AND p.uploaded_at >= $2 
       AND p.uploaded_at <= $3`,
      [restaurant_id, dateFrom, dateTo]
    );

    return {
      total_payments: parseInt(result.rows[0].total_payments),
      completed_payments: parseInt(result.rows[0].completed_payments),
      failed_payments: parseInt(result.rows[0].failed_payments),
      pending_payments: parseInt(result.rows[0].pending_payments),
      total_amount: parseFloat(result.rows[0].total_amount) || 0,
      average_amount: parseFloat(result.rows[0].average_amount) || 0
    };
  }

  // Validar datos del pago
  static validate(data) {
    const errors = [];

    if (!data.order_id) {
      errors.push('ID del pedido es requerido');
    }

    if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
      errors.push('Monto del pago debe ser mayor a 0');
    }

    if (data.payment_method && !['QR_CODE', 'CASH', 'CARD', 'TRANSFER'].includes(data.payment_method)) {
      errors.push('Método de pago inválido');
    }

    return errors;
  }

  // Convertir a JSON
  toJSON() {
    return {
      id: this.id,
      order_id: this.order_id,
      qr_image_url: this.qr_image_url,
      payment_method: this.payment_method,
      amount: this.amount,
      status: this.status,
      uploaded_at: this.uploaded_at,
      customer_name: this.customer_name,
      order_total: this.order_total,
      restaurant_name: this.restaurant_name
    };
  }
}

module.exports = Payment;