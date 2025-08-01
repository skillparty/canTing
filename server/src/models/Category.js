const { query } = require('../config/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.restaurant_id = data.restaurant_id;
    this.name = data.name;
    this.description = data.description;
    this.display_order = data.display_order;
  }

  // Crear nueva categoría
  static async create(categoryData) {
    const { restaurant_id, name, description, display_order = 0 } = categoryData;
    
    const result = await query(
      `INSERT INTO categories (restaurant_id, name, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [restaurant_id, name, description, display_order]
    );

    return new Category(result.rows[0]);
  }

  // Buscar categoría por ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new Category(result.rows[0]) : null;
  }

  // Obtener categorías por restaurante
  static async findByRestaurant(restaurant_id) {
    const result = await query(
      'SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY display_order ASC, name ASC',
      [restaurant_id]
    );
    
    return result.rows.map(row => new Category(row));
  }

  // Obtener categorías con elementos del menú
  static async findByRestaurantWithItems(restaurant_id) {
    const result = await query(
      `SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', mi.id,
              'name', mi.name,
              'description', mi.description,
              'price', mi.price,
              'image_url', mi.image_url,
              'available', mi.available,
              'created_at', mi.created_at
            ) ORDER BY mi.name
          ) FILTER (WHERE mi.id IS NOT NULL), 
          '[]'
        ) as menu_items
       FROM categories c
       LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.available = true
       WHERE c.restaurant_id = $1
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC`,
      [restaurant_id]
    );
    
    return result.rows.map(row => ({
      ...new Category(row),
      menu_items: row.menu_items
    }));
  }

  // Actualizar categoría
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
      `UPDATE categories SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Eliminar categoría
  async delete() {
    // Primero actualizar menu_items para quitar la referencia
    await query('UPDATE menu_items SET category_id = NULL WHERE category_id = $1', [this.id]);
    
    // Luego eliminar la categoría
    await query('DELETE FROM categories WHERE id = $1', [this.id]);
    return true;
  }

  // Reordenar categorías
  static async reorder(restaurant_id, categoryOrders) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const { id, display_order } of categoryOrders) {
        await client.query(
          'UPDATE categories SET display_order = $1 WHERE id = $2 AND restaurant_id = $3',
          [display_order, id, restaurant_id]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Validar datos de la categoría
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre de la categoría es requerido');
    }

    if (!data.restaurant_id) {
      errors.push('ID del restaurante es requerido');
    }

    if (data.display_order !== undefined && (isNaN(data.display_order) || data.display_order < 0)) {
      errors.push('Orden de visualización debe ser un número positivo');
    }

    return errors;
  }

  // Convertir a JSON
  toJSON() {
    return {
      id: this.id,
      restaurant_id: this.restaurant_id,
      name: this.name,
      description: this.description,
      display_order: this.display_order
    };
  }
}

module.exports = Category;