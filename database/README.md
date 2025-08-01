# Base de Datos - Plataforma de Restaurantes

Este directorio contiene todos los archivos relacionados con la base de datos PostgreSQL para la plataforma de gestión de restaurantes.

## Estructura de Archivos

- `schema.sql` - Esquema completo de la base de datos con todas las tablas, índices y constraints
- `seeds.sql` - Datos de ejemplo para desarrollo y testing
- `migrate.js` - Script de migración para automatizar la creación/eliminación de la base de datos
- `README.md` - Este archivo de documentación

## Esquema de Base de Datos

### Tablas Principales

1. **restaurants** - Información básica de los restaurantes
2. **users** - Usuarios del sistema con diferentes roles
3. **categories** - Categorías para organizar el menú
4. **menu_items** - Elementos individuales del menú
5. **orders** - Pedidos realizados por los clientes
6. **payments** - Información de pagos y códigos QR

### Relaciones

```
restaurants (1) ←→ (N) users
restaurants (1) ←→ (N) categories
restaurants (1) ←→ (N) menu_items
restaurants (1) ←→ (N) orders
categories (1) ←→ (N) menu_items
orders (1) ←→ (1) payments
```

## Configuración

### Requisitos Previos

1. PostgreSQL 12+ instalado
2. Node.js (para el script de migración)
3. Dependencia `pg` instalada: `npm install pg`

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=restaurant_platform
DB_PASSWORD=tu_password
DB_PORT=5432
```

### Crear Base de Datos

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE restaurant_platform;

# Crear usuario (opcional)
CREATE USER restaurant_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_platform TO restaurant_user;
```

## Uso del Script de Migración

### Ejecutar Migración

```bash
# Solo crear el esquema
node migrate.js up

# Crear esquema y cargar datos de ejemplo
node migrate.js up --seeds
```

### Rollback

```bash
# Eliminar todas las tablas
node migrate.js down
```

### Probar Conexión

```bash
# Verificar que la conexión funciona
node migrate.js test
```

## Uso Manual

### Crear Esquema

```bash
psql -U postgres -d restaurant_platform -f schema.sql
```

### Cargar Datos de Ejemplo

```bash
psql -U postgres -d restaurant_platform -f seeds.sql
```

## Características del Esquema

### Seguridad

- **Constraints de validación** en campos críticos (emails, precios, estados)
- **Foreign keys** con acciones CASCADE apropiadas
- **Checks** para valores válidos en enums
- **Unique constraints** para evitar duplicados

### Performance

- **Índices optimizados** para consultas frecuentes
- **Índices compuestos** para consultas multi-columna
- **Índices en foreign keys** para joins eficientes

### Funcionalidades

- **Timestamps automáticos** con triggers
- **Validación de emails** con regex
- **Horarios en formato JSON** para flexibilidad
- **Items de pedidos en JSON** para estructura flexible

## Consultas de Ejemplo

### Obtener menú completo de un restaurante

```sql
SELECT 
    c.name as category_name,
    c.display_order,
    mi.name as item_name,
    mi.description,
    mi.price,
    mi.available
FROM categories c
LEFT JOIN menu_items mi ON c.id = mi.category_id
WHERE c.restaurant_id = 1
ORDER BY c.display_order, mi.name;
```

### Obtener pedidos pendientes

```sql
SELECT 
    o.id,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.status,
    o.created_at,
    r.name as restaurant_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
WHERE o.status IN ('pending', 'confirmed', 'preparing')
ORDER BY o.created_at DESC;
```

### Estadísticas de ventas por restaurante

```sql
SELECT 
    r.name as restaurant_name,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as average_order
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
WHERE o.payment_status = 'paid'
GROUP BY r.id, r.name
ORDER BY total_revenue DESC;
```

## Mantenimiento

### Backup

```bash
# Backup completo
pg_dump -U postgres restaurant_platform > backup.sql

# Backup solo datos
pg_dump -U postgres --data-only restaurant_platform > data_backup.sql
```

### Restore

```bash
# Restore completo
psql -U postgres restaurant_platform < backup.sql

# Restore solo datos
psql -U postgres restaurant_platform < data_backup.sql
```

### Optimización

```sql
-- Analizar estadísticas de tablas
ANALYZE;

-- Reindexar si es necesario
REINDEX DATABASE restaurant_platform;

-- Verificar uso de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión**: Verificar que PostgreSQL esté ejecutándose y las credenciales sean correctas
2. **Permisos**: Asegurar que el usuario tenga permisos suficientes en la base de datos
3. **Foreign key violations**: Verificar el orden de inserción de datos
4. **Encoding**: Usar UTF-8 para caracteres especiales

### Logs

```sql
-- Ver configuración de logs
SHOW log_statement;
SHOW log_min_duration_statement;

-- Habilitar logging de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 segundo
SELECT pg_reload_conf();
```