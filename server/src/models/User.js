const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.restaurant_id = data.restaurant_id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role;
    this.created_at = data.created_at;
  }

  // Crear nuevo usuario
  static async create(userData) {
    const { restaurant_id, username, email, password, role = 'staff' } = userData;
    
    const password_hash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (restaurant_id, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [restaurant_id, username, email, password_hash, role]
    );

    return new User(result.rows[0]);
  }

  // Buscar usuario por ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Buscar usuario por username
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Obtener usuarios por restaurante
  static async findByRestaurant(restaurant_id) {
    const result = await query(
      'SELECT * FROM users WHERE restaurant_id = $1 ORDER BY created_at DESC',
      [restaurant_id]
    );
    
    return result.rows.map(row => new User(row));
  }

  // Verificar contraseña
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Actualizar contraseña
  async updatePassword(newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
      [password_hash, this.id]
    );

    this.password_hash = result.rows[0].password_hash;
    return this;
  }

  // Actualizar usuario
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinámicamente
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'password') {
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
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length > 0) {
      Object.assign(this, result.rows[0]);
    }

    return this;
  }

  // Eliminar usuario
  async delete() {
    await query('DELETE FROM users WHERE id = $1', [this.id]);
    return true;
  }

  // Validar datos del usuario
  static validate(data) {
    const errors = [];

    if (!data.username || data.username.trim().length < 3) {
      errors.push('Username debe tener al menos 3 caracteres');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email válido es requerido');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Contraseña debe tener al menos 6 caracteres');
    }

    if (data.role && !['admin', 'manager', 'staff'].includes(data.role)) {
      errors.push('Rol inválido');
    }

    return errors;
  }

  // Convertir a JSON (sin contraseña)
  toJSON() {
    const { password_hash, ...user } = this;
    return user;
  }
}

module.exports = User;