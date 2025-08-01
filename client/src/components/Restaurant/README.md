# Interfaz Pública del Restaurante

Este módulo implementa la interfaz pública donde los clientes pueden ver el menú del restaurante, agregar productos al carrito y realizar pedidos.

## Componentes

### RestaurantPage
Componente principal de la página pública del restaurante.

**Características:**
- Header atractivo con información del restaurante
- Verificación de horarios de atención
- Búsqueda de productos en tiempo real
- Botón flotante del carrito de compras
- Diseño responsive mobile-first
- URL única por restaurante (/restaurant/[slug])

### MenuDisplay
Componente para mostrar el menú completo del restaurante.

**Características:**
- Vista en cuadrícula o lista
- Agrupación por categorías
- Filtrado por categoría seleccionada
- Búsqueda integrada
- Contador de productos por categoría
- Estado de restaurante cerrado

### CategoryTabs
Navegación por categorías con scroll horizontal.

**Características:**
- Tabs scrollables con botones de navegación
- Contador de productos por categoría
- Categoría "Todos" para ver todo el menú
- Información expandible de la categoría activa
- Responsive con scroll táctil en móviles

### ProductCard
Tarjeta individual para cada producto del menú.

**Características:**
- Imagen del producto con placeholder
- Información completa (nombre, precio, descripción)
- Selector de cantidad
- Campo de notas especiales
- Botón "Agregar al carrito" con feedback
- Estados de disponibilidad
- Cálculo de total por item

### ShoppingCart
Modal del carrito de compras.

**Características:**
- Lista de productos agregados
- Control de cantidades
- Eliminación de productos
- Resumen de totales (subtotal, impuestos, total)
- Botón para proceder al checkout
- Persistencia en localStorage

### RestaurantInfo
Panel lateral con información del restaurante.

**Características:**
- Estado de apertura/cierre
- Horarios de atención completos
- Información de contacto (dirección, teléfono, email)
- Servicios disponibles (WiFi, tarjetas, delivery)
- Políticas del restaurante
- Rating y descripción

### OrderForm
Formulario multi-paso para completar el pedido.

**Características:**
- Paso 1: Información del cliente
- Paso 2: Método de pago
- Paso 3: Confirmación exitosa
- Validación de campos requeridos
- Resumen del pedido
- Integración con API de pedidos

## Contexto del Carrito (CartContext)

### Funcionalidades
- **Gestión de Items**: Agregar, eliminar, actualizar cantidades
- **Persistencia**: Guardado automático en localStorage
- **Cálculos**: Subtotal, impuestos, total automáticos
- **Validaciones**: Verificación de disponibilidad
- **Estado Global**: Accesible desde cualquier componente

### Métodos Disponibles
```javascript
const {
  // Estado
  items,
  restaurant,
  
  // Acciones
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setRestaurant,
  
  // Utilidades
  getItemCount,
  getSubtotal,
  getTax,
  getTotal,
  isEmpty
} = useCart();
```

## Flujo de Usuario

1. **Acceso**: Cliente accede via URL única del restaurante
2. **Exploración**: Navega por categorías y busca productos
3. **Selección**: Agrega productos al carrito con cantidades y notas
4. **Revisión**: Ve el carrito y modifica si es necesario
5. **Checkout**: Completa información personal y método de pago
6. **Confirmación**: Recibe confirmación del pedido

## Estados de Disponibilidad

### Restaurante
- **Abierto**: Permite realizar pedidos
- **Cerrado**: Muestra overlay informativo, bloquea pedidos

### Productos
- **Disponible**: Se puede agregar al carrito
- **No disponible**: Marcado visualmente, no se puede agregar

## Métodos de Pago Soportados

- **Transferencia QR**: Pago con código QR bancario
- **Efectivo**: Pago en efectivo al recibir
- **Tarjeta**: Pago con tarjeta (futuro)
- **Transferencia Bancaria**: Transferencia directa (futuro)

## Validaciones

### Horarios de Atención
- Verificación automática del día y hora actual
- Comparación con horarios configurados
- Bloqueo de pedidos fuera de horario

### Formulario de Pedido
- Campos requeridos: nombre, teléfono
- Validación de formato de email
- Verificación de carrito no vacío
- Límites de caracteres en notas

### Carrito de Compras
- Cantidades mínimas y máximas
- Verificación de disponibilidad
- Cálculos automáticos de totales

## Responsive Design

### Mobile First
- Diseño optimizado para móviles
- Navegación táctil intuitiva
- Botones de tamaño adecuado para dedos
- Formularios adaptados a pantallas pequeñas

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Adaptaciones Móviles
- Header compacto
- Navegación por categorías scrollable
- Carrito como modal full-screen
- Formularios en pasos separados

## Optimizaciones

### Performance
- Lazy loading de imágenes
- Componentes memoizados
- Debounce en búsqueda
- Carga diferida de datos

### UX/UI
- Feedback visual inmediato
- Estados de carga
- Animaciones suaves
- Mensajes informativos

### SEO
- Meta tags dinámicos
- URLs amigables
- Estructura semántica
- Imágenes optimizadas

## Integración con API

### Endpoints Utilizados
- `GET /api/v1/restaurants/current` - Información del restaurante
- `GET /api/v1/categories/public/:id` - Categorías públicas
- `GET /api/v1/menu-items/public/:id` - Productos públicos
- `POST /api/v1/orders/public` - Crear pedido público

### Manejo de Errores
- Fallbacks para datos no disponibles
- Mensajes de error informativos
- Retry automático en fallos de red
- Estados de carga apropiados

## Uso

```jsx
// Configurar en el router principal
import RestaurantPage from './pages/Restaurant/RestaurantPage';
import { CartProvider } from './contexts/CartContext';

// Envolver la app con CartProvider
<CartProvider>
  <Routes>
    <Route path="/restaurant/:slug" element={<RestaurantPage />} />
  </Routes>
</CartProvider>
```

## Estilos

Cada componente tiene su archivo CSS correspondiente:
- `RestaurantPage.css` - Página principal
- `MenuDisplay.css` - Visualización del menú
- `CategoryTabs.css` - Navegación por categorías
- `ProductCard.css` - Tarjetas de productos
- `ShoppingCart.css` - Carrito de compras
- `RestaurantInfo.css` - Información del restaurante
- `OrderForm.css` - Formulario de pedido

## Características de Accesibilidad

- **Navegación por teclado**: Todos los elementos interactivos
- **ARIA labels**: Botones y controles descriptivos
- **Contraste**: Colores que cumplen WCAG 2.1
- **Texto alternativo**: Imágenes con alt descriptivo
- **Estructura semántica**: HTML semánticamente correcto

## Notas de Implementación

1. **Estado Persistente**: El carrito se mantiene entre sesiones
2. **Validación en Tiempo Real**: Verificaciones inmediatas
3. **Optimistic Updates**: UI actualizada antes de confirmar servidor
4. **Error Boundaries**: Manejo robusto de errores
5. **Progressive Enhancement**: Funciona sin JavaScript básico