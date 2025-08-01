const { query } = require('../config/database');

class MenuItem {
  constructor(data) {
    this.id = data.id;
    this.restaurant_id = data.restaurant_id;
    this.category_id = data.category_id;
    this.name = data.name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.image_url = data.image_url;
    this.available = data.available;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear nuevo elemento del menú
  static async create(itemData) {
    const { restaurant_id, category_id, name, description, price, image_url, available = true } = itemData;
    
    const result = await query(
      `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [restaurant_id, category_id, name, description, price, image_url, available]
    );

    return new MenuItem(result.rows[0]);
  }

  // Buscar elemento por ID
  static async findById(id) {
    const result = await query(
      `SELECT mi.*, c.name as category_name
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       WHERE mi.id = $1`,
      [id]
    );
    
    if (result.rows.length > 0) {
      const item = new MenuItem(result.rows[0]);
      item.category_name = result.rows[0].category_name;
      return item;
    }
    
    return null;
  }

  // Obtener elementos por restaurante
  static async findByRestaurant(restaurant_id, options = {}) {
    const { available, category_id, limit, offset } = options;
    
    let whereClause = 'WHERE mi.restaurant_id = $1';
    const params = [restaurant_id];
    let paramCount = 2;

    if (available !== undefined) {
      whereClause += ` AND mi.available = $${paramCount}`;
      params.push(available);
      paramCount++;
    }

    if (category_id) {
      whereClause += ` AND mi.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    let limitClause = '';
    if (limit) {
      limitClause += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
      
      if (offset) {
        limitClause += ` OFFSET $${paramCount}`;
        params.push(offset);
      }
    }

    const result = await query(
      `SELECT mi.*, c.name as category_name
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       ${whereClause}
       ORDER BY c.display_order ASC, mi.name ASC
       ${limitClause}`,
      params
    );
    
    return result.rows.map(row => {
      const item = new MenuItem(row);
      item.category_name = row.category_name;
      return item;
    });
  }

  // Obtener elementos por categoría
  static async findByCategory(category_id) {
    const result = await query(
      'SELECT * FROM menu_items WHERE category_id = $1 ORDER BY name ASC',
      [category_id]
    );
    
    return result.rows.map(row => new MenuItem(row));
  }

  // Buscar elementos por nombre
  static async search(restaurant_id, searchTerm) {
    const result = await query(
      `SELECT mi.*, c.name as category_name
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       WHERE mi.restaurant_id = $1 
       AND (mi.name ILIKE $2 OR mi.description ILIKE $2)
       ORDER BY mi.name ASC`,
      [restaurant_id, `%${searchTerm}%`]
    );
    
    return result.rows.map(row => {
      const item = new MenuItem(row);
      item.category_name = row.category_name;
      return item;
    });
  }

  // Actualizar elemento
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'restaurant_id') {
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
      `UPDATE menu_items SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Cambiar disponibilidad
  async toggleAvailability() {
    const result = await query(
      'UPDATE menu_items SET available = NOT available, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [this.id]
    );

    this.available = result.rows[0].available;
    return this;
  }

  // Eliminar elemento
  async delete() {
    await query('DELETE FROM menu_items WHERE id = $1', [this.id]);
    return true;
  }

  // Obtener estadísticas de elementos
  static async getStats(restaurant_id) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE available = true) as available_items,
        COUNT(*) FILTER (WHERE available = false) as unavailable_items,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
       FROM menu_items 
       WHERE restaurant_id = $1`,
      [restaurant_id]
    );

    return {
      total_items: parseInt(result.rows[0].total_items),
      available_items: parseInt(result.rows[0].available_items),
      unavailable_items: parseInt(result.rows[0].unavailable_items),
      average_price: parseFloat(result.rows[0].average_price) || 0,
      min_price: parseFloat(result.rows[0].min_price) || 0,
      max_price: parseFloat(result.rows[0].max_price) || 0
    };
  }

  // Validar datos del elemento
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre del elemento es requerido');
    }

    if (!data.restaurant_id) {
      errors.push('ID del restaurante es requerido');
    }

    if (!data.price || isNaN(data.price) || parseFloat(data.price) < 0) {
      errors.push('Precio válido es requerido');
    }

    if (data.image_url && !isValidUrl(data.image_url)) {
      errors.push('URL de imagen inválida');
    }

    return errors;
  }

  // Convertir a JSON
  toJSON() {
    return {
      id: this.id,
      restaurant_id: this.restaurant_id,
      category_id: this.category_id,
      name: this.name,
      description: this.description,
      price: this.price,
      image_url: this.image_url,
      available: this.available,
      created_at: this.created_at,
      updated_at: this.updated_at,
      category_name: this.category_name
    };
  }
}

// Función auxiliar para validar URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = MenuItem;