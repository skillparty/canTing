# Sistema de Gestión de Pedidos

Este módulo implementa un sistema completo de gestión de pedidos para restaurantes, permitiendo visualizar, actualizar y gestionar todos los pedidos de manera eficiente.

## Componentes

### OrderManager
Componente principal que gestiona la vista general de pedidos.

**Características:**
- Vista de tarjetas con todos los pedidos
- Filtros por estado (Nuevos, Confirmados, En Preparación, etc.)
- Búsqueda por ID, nombre, teléfono o email
- Estadísticas en tiempo real (ingresos del día, pedidos pendientes, etc.)
- Actualización automática de estados
- Interfaz responsive

### OrderCard
Componente de tarjeta individual para cada pedido.

**Características:**
- Información resumida del pedido
- Estado visual con colores
- Acciones rápidas (cambiar estado, ver detalles, cancelar)
- Información del cliente
- Total del pedido
- Tiempo transcurrido desde la creación

### OrderDetails
Modal con información detallada del pedido.

**Características:**
- Información completa del cliente
- Lista detallada de elementos del pedido
- Historial de estados
- Resumen de costos
- Acciones de gestión (cambiar estado, cancelar)

### CancelOrderModal
Modal de confirmación para cancelar pedidos.

**Características:**
- Motivos predefinidos de cancelación
- Campo personalizado para otros motivos
- Confirmación con advertencias
- Validación de campos requeridos

## Estados de Pedidos

El sistema maneja los siguientes estados:

1. **pending** (Nuevo) - Pedido recién recibido
2. **confirmed** (Confirmado) - Pedido confirmado por el restaurante
3. **preparing** (En Preparación) - Pedido siendo preparado
4. **ready** (Listo) - Pedido listo para entrega
5. **delivered** (Entregado) - Pedido entregado al cliente
6. **cancelled** (Cancelado) - Pedido cancelado

## Flujo de Estados

```
pending → confirmed → preparing → ready → delivered
    ↓
cancelled (desde cualquier estado antes de delivered)
```

## Funcionalidades

### Gestión de Estados
- Cambio secuencial de estados
- Validación de transiciones permitidas
- Actualización en tiempo real
- Historial de cambios

### Búsqueda y Filtros
- Búsqueda por múltiples campos
- Filtros por estado con contadores
- Combinación de filtros
- Limpieza rápida de filtros

### Estadísticas
- Ingresos del día actual
- Conteo por estados
- Pedidos pendientes y en proceso
- Actualización automática

### Cancelación de Pedidos
- Motivos predefinidos
- Motivos personalizados
- Confirmación con advertencias
- Registro del motivo de cancelación

## Uso

```jsx
import OrderManager from './pages/Orders/OrderManager';

// En tu router
<Route path="/orders" element={<OrderManager />} />
```

## API Endpoints Utilizados

- `GET /api/v1/orders` - Obtener todos los pedidos
- `PATCH /api/v1/orders/:id/status` - Actualizar estado
- `POST /api/v1/orders/:id/cancel` - Cancelar pedido
- `GET /api/v1/orders/stats` - Obtener estadísticas

## Estilos

Cada componente tiene su archivo CSS correspondiente:
- `OrderManager.css` - Estilos del gestor principal
- `OrderCard.css` - Estilos de las tarjetas
- `OrderDetails.css` - Estilos del modal de detalles
- `CancelOrderModal.css` - Estilos del modal de cancelación

## Responsive Design

Todos los componentes están optimizados para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Dependencias

- `react` - Framework principal
- `lucide-react` - Iconos
- `date-fns` - Formateo de fechas
- `axios` - Peticiones HTTP

## Notas de Implementación

1. **Estado Local**: Se mantiene una copia local de los pedidos para actualizaciones optimistas
2. **Error Handling**: Manejo robusto de errores con mensajes informativos
3. **Loading States**: Estados de carga para mejor UX
4. **Optimistic Updates**: Actualizaciones inmediatas en la UI antes de confirmar en el servidor
5. **Accessibility**: Componentes accesibles con ARIA labels y navegación por teclado