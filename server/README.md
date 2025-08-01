# Restaurant Platform API

API REST completa para la plataforma de gestión de restaurantes construida con Node.js, Express y PostgreSQL.

## Características

- 🔐 **Autenticación JWT** con refresh tokens
- 🏪 **Gestión completa de restaurantes**
- 📋 **CRUD de menús y categorías**
- 📦 **Sistema de pedidos en tiempo real**
- 💳 **Generación de códigos QR para pagos**
- 📁 **Upload de imágenes** (logos, menús, QRs)
- 🛡️ **Validación de datos** con express-validator
- 🚨 **Manejo centralizado de errores**
- 📊 **Estadísticas y reportes**
- 🔒 **Seguridad** con helmet, rate limiting y CORS

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Multer** - Upload de archivos
- **QRCode** - Generación de códigos QR
- **bcryptjs** - Encriptación de contraseñas

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd restaurant-platform/server
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb restaurant_platform

# Ejecutar migraciones
npm run migrate

# Cargar datos de ejemplo (opcional)
npm run migrate:seeds
```

5. **Iniciar servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Variables de Entorno

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_platform
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Estructura del Proyecto

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL
│   ├── controllers/             # Controladores de rutas
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── categoryController.js
│   │   ├── menuItemController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/              # Middleware personalizado
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/                  # Modelos de datos
│   │   ├── Restaurant.js
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Payment.js
│   ├── routes/                  # Definición de rutas
│   │   ├── auth.js
│   │   ├── restaurants.js
│   │   ├── categories.js
│   │   ├── menu-items.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   └── index.js
│   └── server.js               # Servidor principal
├── uploads/                    # Archivos subidos
├── package.json
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Login de usuario
- `POST /api/v1/auth/register` - Registro de restaurante
- `POST /api/v1/auth/refresh-token` - Renovar token
- `GET /api/v1/auth/verify` - Verificar token
- `POST /api/v1/auth/logout` - Logout

### Restaurantes
- `GET /api/v1/restaurants/current` - Obtener restaurante actual
- `PUT /api/v1/restaurants/:id` - Actualizar restaurante
- `POST /api/v1/restaurants/:id/logo` - Subir logo
- `GET /api/v1/restaurants/:id/hours` - Obtener horarios
- `PUT /api/v1/restaurants/:id/hours` - Actualizar horarios

### Categorías
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría
- `PUT /api/v1/categories/:id` - Actualizar categoría
- `DELETE /api/v1/categories/:id` - Eliminar categoría
- `POST /api/v1/categories/reorder` - Reordenar categorías

### Elementos del Menú
- `GET /api/v1/menu-items` - Listar elementos
- `POST /api/v1/menu-items` - Crear elemento
- `PUT /api/v1/menu-items/:id` - Actualizar elemento
- `DELETE /api/v1/menu-items/:id` - Eliminar elemento
- `PATCH /api/v1/menu-items/:id/toggle-availability` - Cambiar disponibilidad

### Pedidos
- `GET /api/v1/orders` - Listar pedidos
- `POST /api/v1/orders/public` - Crear pedido (público)
- `GET /api/v1/orders/pending` - Pedidos pendientes
- `PATCH /api/v1/orders/:id/status` - Actualizar estado
- `POST /api/v1/orders/:id/cancel` - Cancelar pedido

### Pagos
- `POST /api/v1/payments/generate-qr` - Generar código QR
- `POST /api/v1/payments/upload-qr` - Subir QR manual
- `GET /api/v1/payments` - Listar pagos
- `PATCH /api/v1/payments/:id/status` - Actualizar estado

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## Roles de Usuario

- **admin** - Acceso completo
- **manager** - Gestión de menú y pedidos
- **staff** - Solo visualización y cambio de disponibilidad

## Validación de Datos

Todos los endpoints validan datos de entrada usando express-validator. Los errores se devuelven en formato estándar:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email válido es requerido",
        "value": "invalid-email"
      }
    ]
  }
}
```

## Upload de Archivos

La API soporta upload de imágenes para:
- Logos de restaurantes
- Imágenes de elementos del menú
- Códigos QR de pagos

Límites:
- Tamaño máximo: 5MB
- Formatos: JPEG, PNG, GIF, WebP

## Manejo de Errores

Todos los errores se manejan de forma centralizada y devuelven respuestas consistentes:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

## Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run migrate` - Ejecutar migraciones de BD
- `npm run migrate:seeds` - Cargar datos de ejemplo
- `npm run migrate:down` - Rollback de migraciones

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.