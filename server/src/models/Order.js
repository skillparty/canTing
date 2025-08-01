const { query } = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.restaurant_id = data.restaurant_id;
    this.customer_name = data.customer_name;
    this.customer_phone = data.customer_phone;
    this.items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]');
    this.total_amount = parseFloat(data.total_amount);
    this.status = data.status;
    this.payment_status = data.payment_status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear nuevo pedido
  static async create(orderData) {
    const { 
      restaurant_id, 
      customer_name, 
      customer_phone, 
      items, 
      total_amount, 
      status = 'pending',
      payment_status = 'pending'
    } = orderData;
    
    const result = await query(
      `INSERT INTO orders (restaurant_id, customer_name, customer_phone, items, total_amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [restaurant_id, customer_name, customer_phone, JSON.stringify(items), total_amount, status, payment_status]
    );

    return new Order(result.rows[0]);
  }

  // Buscar pedido por ID
  static async findById(id) {
    const result = await query(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (result.rows.length > 0) {
      const order = new Order(result.rows[0]);
      order.restaurant_name = result.rows[0].restaurant_name;
      return order;
    }
    
    return null;
  }

  // Obtener pedidos por restaurante
  static async findByRestaurant(restaurant_id, options = {}) {
    const { status, payment_status, limit = 50, offset = 0, date_from, date_to } = options;
    
    let whereClause = 'WHERE o.restaurant_id = $1';
    const params = [restaurant_id];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      whereClause += ` AND o.payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    if (date_from) {
      whereClause += ` AND o.created_at >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      whereClause += ` AND o.created_at <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    params.push(limit, offset);

    const result = await query(
      `SELECT o.*, r.name as restaurant_name
       FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    
    return result.rows.map(row => {
      const order = new Order(row);
      order.restaurant_name = row.restaurant_name;
      return order;
    });
  }

  // Obtener pedidos pendientes
  static async findPending(restaurant_id) {
    const result = await query(
      `SELECT * FROM orders 
       WHERE restaurant_id = $1 
       AND status IN ('pending', 'confirmed', 'preparing')
       ORDER BY created_at ASC`,
      [restaurant_id]
    );
    
    return result.rows.map(row => new Order(row));
  }

  // Actualizar estado del pedido
  async updateStatus(newStatus) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado de pedido inválido');
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, this.id]
    );

    this.status = result.rows[0].status;
    this.updated_at = result.rows[0].updated_at;
    return this;
  }

  // Actualizar estado de pago
  async updatePaymentStatus(newPaymentStatus) {
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!validPaymentStatuses.includes(newPaymentStatus)) {
      throw new Error('Estado de pago inválido');
    }

    const result = await query(
      'UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newPaymentStatus, this.id]
    );

    this.payment_status = result.rows[0].payment_status;
    this.updated_at = result.rows[0].updated_at;
    return this;
  }

  // Actualizar pedido completo
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'restaurant_id') {
        if (key === 'items') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(this.id);
    
    const result = await query(
      `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
      this.items = JSON.parse(result.rows[0].items);
    }

    return this;
  }

  // Calcular total del pedido
  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (parseFloat(item.unit_price) * parseInt(item.quantity));
    }, 0);
  }

  // Validar items del pedido
  async validateItems() {
    const menuItemIds = this.items.map(item => item.menu_item_id);
    
    if (menuItemIds.length === 0) {
      throw new Error('El pedido debe tener al menos un elemento');
    }

    const result = await query(
      'SELECT id, name, price, available FROM menu_items WHERE id = ANY($1) AND restaurant_id = $2',
      [menuItemIds, this.restaurant_id]
    );

    const availableItems = result.rows;
    const errors = [];

    this.items.forEach(orderItem => {
      const menuItem = availableItems.find(item => item.id === orderItem.menu_item_id);
      
      if (!menuItem) {
        errors.push(`Elemento con ID ${orderItem.menu_item_id} no encontrado`);
      } else if (!menuItem.available) {
        errors.push(`${menuItem.name} no está disponible`);
      } else if (parseFloat(menuItem.price) !== parseFloat(orderItem.unit_price)) {
        errors.push(`Precio incorrecto para ${menuItem.name}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  }

  // Obtener estadísticas de pedidos
  static async getStats(restaurant_id, dateFrom, dateTo) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
        SUM(total_amount) FILTER (WHERE payment_status = 'paid') as total_revenue,
        AVG(total_amount) FILTER (WHERE payment_status = 'paid') as average_order_value
       FROM orders 
       WHERE restaurant_id = $1
       AND created_at >= $2 
       AND created_at <= $3`,
      [restaurant_id, dateFrom, dateTo]
    );

    return {
      total_orders: parseInt(result.rows[0].total_orders),
      completed_orders: parseInt(result.rows[0].completed_orders),
      cancelled_orders: parseInt(result.rows[0].cancelled_orders),
      paid_orders: parseInt(result.rows[0].paid_orders),
      total_revenue: parseFloat(result.rows[0].total_revenue) || 0,
      average_order_value: parseFloat(result.rows[0].average_order_value) || 0
    };
  }

  // Validar datos del pedido
  static validate(data) {
    const errors = [];

    if (!data.customer_name || data.customer_name.trim().length === 0) {
      errors.push('Nombre del cliente es requerido');
    }

    if (!data.restaurant_id) {
      errors.push('ID del restaurante es requerido');
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('El pedido debe tener al menos un elemento');
    }

    if (!data.total_amount || isNaN(data.total_amount) || parseFloat(data.total_amount) <= 0) {
      errors.push('Total del pedido debe ser mayor a 0');
    }

    if (data.customer_phone && !/^\+?[\d\s\-\(\)]+$/.test(data.customer_phone)) {
      errors.push('Formato de teléfono inválido');
    }

    return errors;
  }

  // Convertir a JSON
  toJSON() {
    return {
      id: this.id,
      restaurant_id: this.restaurant_id,
      customer_name: this.customer_name,
      customer_phone: this.customer_phone,
      items: this.items,
      total_amount: this.total_amount,
      status: this.status,
      payment_status: this.payment_status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      restaurant_name: this.restaurant_name
    };
  }
}

module.exports = Order;