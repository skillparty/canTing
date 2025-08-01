const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'restaurant_platform',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de base de datos...');
    
    // Leer y ejecutar el esquema principal
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Esquema de base de datos creado exitosamente');
    
    // Preguntar si se desean cargar datos de ejemplo
    const loadSeeds = process.argv.includes('--seeds') || process.argv.includes('-s');
    
    if (loadSeeds) {
      console.log('📊 Cargando datos de ejemplo...');
      const seedsSQL = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
      await client.query(seedsSQL);
      console.log('✅ Datos de ejemplo cargados exitosamente');
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function rollback() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando rollback de base de datos...');
    
    // Eliminar todas las tablas en orden inverso para respetar las foreign keys
    const dropTablesSQL = `
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS restaurants CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `;
    
    await client.query(dropTablesSQL);
    console.log('✅ Rollback completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el rollback:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos exitosa:', result.rows[0].now);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    process.exit(1);
  }
}

// Manejo de argumentos de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'up':
    runMigration();
    break;
  case 'down':
    rollback();
    break;
  case 'test':
    checkConnection();
    break;
  default:
    console.log(`
🗃️  Script de Migración de Base de Datos - Plataforma de Restaurantes

Uso:
  node migrate.js up [--seeds]    Ejecutar migración (con --seeds para datos de ejemplo)
  node migrate.js down            Rollback de migración
  node migrate.js test            Probar conexión a la base de datos

Variables de entorno:
  DB_USER     Usuario de PostgreSQL (default: postgres)
  DB_HOST     Host de la base de datos (default: localhost)
  DB_NAME     Nombre de la base de datos (default: restaurant_platform)
  DB_PASSWORD Contraseña de la base de datos (default: password)
  DB_PORT     Puerto de PostgreSQL (default: 5432)

Ejemplos:
  node migrate.js up              # Solo crear esquema
  node migrate.js up --seeds      # Crear esquema y cargar datos de ejemplo
  node migrate.js down            # Eliminar todas las tablas
  node migrate.js test            # Probar conexión
    `);
}