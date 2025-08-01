const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Restaurant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
    this.logo_url = data.logo_url;
    this.opening_hours = data.opening_hours;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear nuevo restaurante
  static async create(restaurantData) {
    const { name, description, address, phone, email, password, logo_url, opening_hours } = restaurantData;
    
    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO restaurants (name, description, address, phone, email, logo_url, opening_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, address, phone, email, logo_url, opening_hours]
    );

    const restaurant = new Restaurant(result.rows[0]);

    // Crear usuario administrador por defecto
    await query(
      `INSERT INTO users (restaurant_id, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')`,
      [restaurant.id, email.split('@')[0], email, password_hash]
    );

    return restaurant;
  }

  // Buscar restaurante por ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new Restaurant(result.rows[0]) : null;
  }

  // Buscar restaurante por email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM restaurants WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? new Restaurant(result.rows[0]) : null;
  }

  // Obtener todos los restaurantes
  static async findAll(limit = 50, offset = 0) {
    const result = await query(
      'SELECT * FROM restaurants ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return result.rows.map(row => new Restaurant(row));
  }

  // Actualizar restaurante
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinámicamente
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
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
      `UPDATE restaurants SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Eliminar restaurante
  async delete() {
    await query('DELETE FROM restaurants WHERE id = $1', [this.id]);
    return true;
  }

  // Validar datos del restaurante
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre del restaurante es requerido');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email válido es requerido');
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.push('Formato de teléfono inválido');
    }

    return errors;
  }

  // Convertir a JSON (sin datos sensibles)
  toJSON() {
    const { password_hash, ...restaurant } = this;
    return restaurant;
  }
}

module.exports = Restaurant;