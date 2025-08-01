# Restaurant Platform - Frontend

Frontend React.js para la plataforma de gestión de restaurantes.

## Características

- 🎨 **Dashboard Moderno** con métricas en tiempo real
- 📱 **Diseño Responsive** compatible con móviles, tablets y desktop
- 🔐 **Autenticación JWT** con Context API
- 📊 **Gráficos Interactivos** con Recharts
- 🍔 **Gestión de Menús** con drag-and-drop
- 📦 **Gestión de Pedidos** en tiempo real
- 💳 **Módulo de Pagos** con visualización de QRs
- 🔔 **Notificaciones Toast** para feedback del usuario
- 📋 **Tablas con Paginación** y filtros
- 🎯 **Componentes Reutilizables**

## Tecnologías

- **React 18** - Biblioteca de UI
- **React Router v6** - Navegación
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos y visualizaciones
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **CSS3** - Estilos con Grid/Flexbox

## Estructura del Proyecto

```
client/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Layout/          # Layout principal (Sidebar, Header)
│   │   └── Dashboard/       # Componentes del dashboard
│   ├── contexts/            # Context API
│   │   └── AuthContext.js   # Contexto de autenticación
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard/       # Dashboard principal
│   │   └── Login/           # Página de login
│   ├── services/            # Servicios API
│   │   └── api.js           # Configuración de Axios
│   ├── App.js               # Componente principal
│   ├── App.css              # Estilos globales
│   └── index.js             # Punto de entrada
└── package.json
```

## Instalación

1. **Instalar dependencias**
```bash
cd client
npm install
```

2. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del cliente
REACT_APP_API_URL=http://localhost:3001/api/v1
```

3. **Iniciar servidor de desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run build` - Crear build de producción
- `npm test` - Ejecutar tests
- `npm run eject` - Eject de Create React App

## Componentes Principales

### Layout
- **Sidebar** - Navegación lateral colapsible
- **Header** - Barra superior con notificaciones y menú de usuario
- **Layout** - Contenedor principal responsive

### Dashboard
- **MetricsCard** - Tarjetas de métricas con indicadores de cambio
- **OrdersChart** - Gráficos de pedidos (línea y barras)
- **RecentOrders** - Lista de pedidos recientes
- **TopItems** - Elementos más vendidos con rankings

### Autenticación
- **AuthContext** - Manejo global del estado de autenticación
- **ProtectedRoute** - Componente para rutas protegidas
- **Login** - Página de inicio de sesión

## Características del Dashboard

### Métricas en Tiempo Real
- Pedidos del día con porcentaje de cambio
- Ingresos diarios con tendencias
- Pedidos pendientes que requieren atención
- Estadísticas del menú (elementos totales/disponibles)

### Visualizaciones
- Gráfico de pedidos por día de la semana
- Estados de pedidos en tiempo real
- Ranking de elementos más vendidos
- Lista de pedidos recientes con filtros

### Responsive Design
- **Desktop**: Layout completo con sidebar expandido
- **Tablet**: Sidebar colapsado, métricas en grid
- **Móvil**: Sidebar como overlay, métricas apiladas

## Gestión de Estado

### Context API
```javascript
// AuthContext maneja:
- Usuario autenticado
- Información del restaurante
- Tokens JWT
- Estados de carga
- Funciones de login/logout
```

### React Query
```javascript
// Gestiona:
- Cache de datos del servidor
- Refetch automático
- Estados de loading/error
- Invalidación de cache
```

## Servicios API

### Configuración
```javascript
// api.js incluye:
- Configuración base de Axios
- Interceptors para tokens
- Manejo automático de refresh tokens
- Servicios organizados por entidad
```

### Servicios Disponibles
- `authAPI` - Autenticación y perfil
- `restaurantAPI` - Gestión de restaurantes
- `categoryAPI` - Categorías del menú
- `menuItemAPI` - Elementos del menú
- `orderAPI` - Gestión de pedidos
- `paymentAPI` - Procesamiento de pagos

## Estilos y Diseño

### Sistema de Colores
```css
- Primario: #3b82f6 (Azul)
- Éxito: #10b981 (Verde)
- Advertencia: #f59e0b (Amarillo)
- Error: #ef4444 (Rojo)
- Neutro: #64748b (Gris)
```

### Responsive Breakpoints
```css
- Móvil: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
```

### Componentes CSS
- Grid system flexible
- Utilidades de espaciado
- Animaciones suaves
- Estados hover/focus
- Scrollbars personalizados

## Funcionalidades Implementadas

### ✅ Completadas
- [x] Estructura del proyecto React
- [x] Sistema de autenticación con JWT
- [x] Layout responsive con sidebar/header
- [x] Dashboard con métricas en tiempo real
- [x] Gráficos interactivos
- [x] Lista de pedidos recientes
- [x] Ranking de elementos más vendidos
- [x] Notificaciones toast
- [x] Manejo de estados de carga
- [x] Routing protegido

### 🚧 En Desarrollo
- [ ] Gestión completa de menús con drag-and-drop
- [ ] Vista detallada de pedidos
- [ ] Módulo de pagos con QR
- [ ] Gestión de usuarios
- [ ] Configuración del restaurante
- [ ] Analíticas avanzadas

## Credenciales de Demo

Para probar la aplicación:
- **Email**: admin@labellaitallia.com
- **Contraseña**: password123

## Deployment

### Build de Producción
```bash
npm run build
```

### Variables de Entorno de Producción
```bash
REACT_APP_API_URL=https://tu-api.com/api/v1
```

### Hosting Recomendado
- **Netlify** - Deploy automático desde Git
- **Vercel** - Optimizado para React
- **AWS S3 + CloudFront** - Escalable y rápido

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.