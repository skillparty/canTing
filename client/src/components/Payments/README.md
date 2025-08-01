# Sistema de Gestión de Pagos con QR Codes

Este módulo implementa un sistema completo de gestión de pagos con códigos QR para restaurantes, permitiendo el seguimiento de pagos desde la generación hasta la confirmación.

## Componentes

### PaymentManager
Componente principal que gestiona la vista general de pagos con pestañas.

**Características:**
- Vista de tarjetas con todos los pagos
- Filtros por estado, método de pago y fecha
- Búsqueda por ID, pedido, cliente o referencia
- Estadísticas en tiempo real (ingresos del día, montos pendientes, etc.)
- Pestañas para Pagos, Historial y Reportes
- Interfaz responsive

### PaymentCard
Componente de tarjeta individual para cada pago.

**Características:**
- Información resumida del pago
- Estado visual con colores distintivos
- Preview del QR subido (si existe)
- Acciones rápidas (confirmar, rechazar, subir QR)
- Información del cliente y pedido
- Tiempo transcurrido desde la creación

### QRUploader
Modal para subir códigos QR de pago.

**Características:**
- Drag & drop para subir imágenes
- Validación de formato y tamaño
- Preview de la imagen antes de subir
- Soporte para JPG, PNG, WebP (máx. 5MB)
- Instrucciones claras para el usuario
- Información del pago asociado

### PaymentHistory
Componente para mostrar el historial completo de pagos.

**Características:**
- Tabla con todos los pagos históricos
- Filtros por estado, fecha y búsqueda
- Ordenamiento por múltiples campos
- Filas expandibles con detalles completos
- Exportación a CSV
- Resumen de resultados y totales

### PaymentReports
Componente de reportes y estadísticas avanzadas.

**Características:**
- Gráficos de barras por período
- Distribución por métodos de pago
- Estadísticas por estado de pago
- Períodos configurables (semana, mes, trimestre, año)
- Métricas seleccionables (ingresos, cantidad, éxito)
- Exportación de reportes en JSON

## Estados de Pagos

El sistema maneja los siguientes estados:

1. **pending** (Pendiente) - Pago generado, esperando QR
2. **qr_uploaded** (QR Subido) - Cliente subió comprobante QR
3. **verified** (Verificado) - QR verificado por el sistema
4. **paid** (Pagado) - Pago confirmado por el restaurante
5. **failed** (Fallido) - Pago rechazado o fallido

## Flujo de Estados

```
pending → qr_uploaded → verified → paid
    ↓           ↓          ↓
  failed     failed    failed
```

## Funcionalidades

### Gestión de Estados
- Cambio de estados con validaciones
- Confirmación y rechazo de pagos
- Motivos de rechazo registrados
- Historial de cambios

### Upload de QR
- Validación de formato de imagen
- Preview antes de confirmar
- Drag & drop intuitivo
- Compresión automática si es necesario

### Búsqueda y Filtros
- Búsqueda por múltiples campos
- Filtros por estado, método y fecha
- Combinación de filtros
- Limpieza rápida de filtros

### Reportes y Estadísticas
- Gráficos interactivos
- Múltiples períodos de análisis
- Métricas configurables
- Exportación de datos

### Historial Completo
- Tabla con ordenamiento
- Detalles expandibles
- Exportación a CSV
- Filtros avanzados

## Métodos de Pago Soportados

- **qr_transfer** - Transferencia QR
- **bank_transfer** - Transferencia Bancaria
- **cash** - Efectivo
- **card** - Tarjeta de Crédito/Débito

## Uso

```jsx
import PaymentManager from './pages/Payments/PaymentManager';

// En tu router
<Route path="/payments" element={<PaymentManager />} />
```

## API Endpoints Utilizados

- `GET /api/v1/payments` - Obtener todos los pagos
- `POST /api/v1/payments/upload-qr` - Subir código QR
- `PATCH /api/v1/payments/:id/status` - Actualizar estado
- `POST /api/v1/payments/:id/confirm` - Confirmar pago
- `POST /api/v1/payments/:id/reject` - Rechazar pago
- `GET /api/v1/payments/stats` - Obtener estadísticas

## Estilos

Cada componente tiene su archivo CSS correspondiente:
- `PaymentManager.css` - Estilos del gestor principal
- `PaymentCard.css` - Estilos de las tarjetas
- `QRUploader.css` - Estilos del modal de upload
- `PaymentHistory.css` - Estilos del historial
- `PaymentReports.css` - Estilos de reportes

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

## Validaciones de QR

### Formatos Soportados
- JPEG/JPG
- PNG
- WebP

### Restricciones
- Tamaño máximo: 5MB
- Dimensiones mínimas: 100x100px
- Calidad mínima para lectura del QR

### Validaciones del Cliente
- Verificación de tipo MIME
- Validación de tamaño
- Preview antes de subir
- Mensajes de error descriptivos

## Características de Seguridad

### Validación de Archivos
- Verificación de tipo de archivo
- Límites de tamaño estrictos
- Sanitización de nombres de archivo

### Estados de Pago
- Transiciones de estado validadas
- Registro de cambios con timestamp
- Motivos de rechazo obligatorios

### Permisos
- Solo administradores pueden confirmar/rechazar
- Logs de todas las acciones
- Trazabilidad completa

## Notas de Implementación

1. **Estado Local**: Se mantiene una copia local de los pagos para actualizaciones optimistas
2. **Error Handling**: Manejo robusto de errores con mensajes informativos
3. **Loading States**: Estados de carga para mejor UX
4. **Optimistic Updates**: Actualizaciones inmediatas en la UI antes de confirmar en el servidor
5. **Accessibility**: Componentes accesibles con ARIA labels y navegación por teclado
6. **Performance**: Lazy loading de imágenes y componentes pesados