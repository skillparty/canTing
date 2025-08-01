# Módulo de Gestión de Menús

Módulo completo para la gestión de menús de restaurantes con funcionalidades avanzadas de CRUD, drag-and-drop, y upload de imágenes.

## Componentes

### MenuManager (Componente Principal)
- **Ubicación**: `src/pages/Menu/MenuManager.js`
- **Funcionalidad**: Componente principal que orquesta toda la gestión del menú
- **Características**:
  - Vista de categorías y elementos del menú
  - Búsqueda y filtrado en tiempo real
  - Cambio entre vista de cuadrícula y lista
  - Gestión de estados de carga y error

### CategoryList
- **Ubicación**: `src/components/Menu/CategoryList.js`
- **Funcionalidad**: Lista de categorías con drag-and-drop para reordenar
- **Características**:
  - Reordenamiento con react-beautiful-dnd
  - Selección de categoría activa
  - Acciones de editar/eliminar
  - Estado vacío cuando no hay categorías

### MenuItemCard
- **Ubicación**: `src/components/Menu/MenuItemCard.js`
- **Funcionalidad**: Tarjeta individual para cada elemento del menú
- **Características**:
  - Imagen del producto con placeholder
  - Badge de disponibilidad
  - Menú de acciones (editar, toggle disponibilidad, eliminar)
  - Información completa del producto

### MenuItemForm
- **Ubicación**: `src/components/Menu/MenuItemForm.js`
- **Funcionalidad**: Formulario modal para crear/editar elementos del menú
- **Características**:
  - Validación en tiempo real con react-hook-form
  - Upload de imágenes integrado
  - Selección de categoría
  - Estados de carga durante el guardado

### CategoryForm
- **Ubicación**: `src/components/Menu/CategoryForm.js`
- **Funcionalidad**: Formulario modal para crear/editar categorías
- **Características**:
  - Formulario simple con validación
  - Creación y edición de categorías
  - Manejo de errores

### ImageUploader
- **Ubicación**: `src/components/Menu/ImageUploader.js`
- **Funcionalidad**: Componente para upload de imágenes con drag-and-drop
- **Características**:
  - Drag and drop de archivos
  - Validación de tipo y tamaño
  - Preview de imagen
  - Eliminación de imagen

## Funcionalidades Implementadas

### ✅ CRUD Completo
- **Categorías**: Crear, leer, actualizar, eliminar
- **Elementos del Menú**: Crear, leer, actualizar, eliminar
- **Validación**: Formularios con validación en tiempo real
- **Estados de Error**: Manejo completo de errores de API

### ✅ Drag and Drop
- **Reordenamiento**: Categorías con drag-and-drop
- **Feedback Visual**: Indicadores durante el arrastre
- **Persistencia**: Orden guardado en el servidor
- **Optimistic Updates**: Actualización inmediata en UI

### ✅ Upload de Imágenes
- **Drag and Drop**: Arrastrar archivos para subir
- **Validación**: Tipo de archivo y tamaño máximo
- **Preview**: Vista previa de la imagen
- **Eliminación**: Remover imagen existente

### ✅ Búsqueda y Filtrado
- **Búsqueda en Tiempo Real**: Por nombre y descripción
- **Filtro por Disponibilidad**: Solo elementos disponibles
- **Filtro por Categoría**: Elementos de categoría específica
- **Estados Vacíos**: Mensajes cuando no hay resultados

### ✅ Toggle de Disponibilidad
- **Cambio Rápido**: Toggle desde la tarjeta del elemento
- **Feedback Visual**: Badge de estado en la tarjeta
- **Actualización Inmediata**: Cambio reflejado al instante

### ✅ Vistas Múltiples
- **Vista de Cuadrícula**: Layout en grid para mejor visualización
- **Vista de Lista**: Layout lineal para más información
- **Responsive**: Adaptación automática a diferentes pantallas

### ✅ Confirmaciones
- **Eliminación**: Modal de confirmación antes de eliminar
- **Información Clara**: Muestra qué se va a eliminar
- **Acciones Reversibles**: Posibilidad de cancelar

## Uso

### Navegación
1. Acceder desde el sidebar: "Gestión de Menú"
2. Seleccionar categoría o ver todos los elementos
3. Usar búsqueda para encontrar elementos específicos

### Gestión de Categorías
1. **Crear**: Botón "Agregar" en la lista de categorías
2. **Reordenar**: Arrastrar categorías para cambiar orden
3. **Editar**: Botón de editar en cada categoría
4. **Eliminar**: Botón de eliminar con confirmación

### Gestión de Elementos
1. **Crear**: Botón "Nuevo Elemento" en el header
2. **Editar**: Menú de acciones en cada tarjeta
3. **Toggle Disponibilidad**: Botón en el menú de acciones
4. **Eliminar**: Opción en menú con confirmación

### Upload de Imágenes
1. **Arrastrar**: Arrastrar imagen al área de upload
2. **Seleccionar**: Click para abrir selector de archivos
3. **Preview**: Ver imagen antes de guardar
4. **Cambiar**: Botón para cambiar imagen existente

## Tecnologías Utilizadas

- **React 18**: Componentes funcionales con hooks
- **React Hook Form**: Manejo de formularios y validación
- **React Query**: Gestión de estado del servidor y cache
- **React Beautiful DnD**: Drag and drop para reordenamiento
- **Axios**: Cliente HTTP para API calls
- **React Hot Toast**: Notificaciones de feedback
- **Lucide React**: Iconos consistentes

## Estructura de Archivos

```
src/components/Menu/
├── CategoryForm.js          # Formulario de categorías
├── CategoryForm.css
├── CategoryList.js          # Lista de categorías con DnD
├── CategoryList.css
├── ImageUploader.js         # Upload de imágenes
├── ImageUploader.css
├── MenuItemCard.js          # Tarjeta de elemento
├── MenuItemCard.css
├── MenuItemForm.js          # Formulario de elementos
├── MenuItemForm.css
└── README.md               # Esta documentación

src/pages/Menu/
├── MenuManager.js          # Componente principal
├── MenuManager.css
```

## Estados de Carga

- **Skeletons**: Placeholders animados durante carga
- **Loading States**: Indicadores en botones y formularios
- **Error States**: Mensajes de error claros
- **Empty States**: Mensajes cuando no hay contenido

## Responsive Design

- **Desktop**: Layout completo con sidebar y grid
- **Tablet**: Sidebar colapsado, grid adaptado
- **Móvil**: Sidebar como overlay, vista de lista optimizada

## Próximas Mejoras

- [ ] Vista previa del menú público
- [ ] Importación/exportación de menús
- [ ] Duplicación de elementos
- [ ] Historial de cambios
- [ ] Análisis de popularidad de elementos