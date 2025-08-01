const { Pool } = require('pg');

// Conectar a PostgreSQL sin especificar base de datos para crearla
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Conectar a la base de datos por defecto
});

async function createDatabase() {
  const client = await pool.connect();
  
  try {
    const dbName = process.env.DB_NAME || 'restaurant_platform';
    
    // Verificar si la base de datos ya existe
    const checkResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`✅ La base de datos '${dbName}' ya existe`);
    } else {
      // Crear la base de datos
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    }
    
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createDatabase();