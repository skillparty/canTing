# Sistema de Diseño - Restaurant Platform

Un sistema de diseño completo y modular para la plataforma de restaurantes, construido con CSS Variables y componentes reutilizables.

## Estructura del Sistema

```
src/styles/
├── index.css           # Punto de entrada principal
├── variables.css       # Variables CSS y tokens de diseño
├── base.css           # Reset, tipografía base y utilidades
├── components/        # Componentes reutilizables
│   ├── buttons.css    # Sistema de botones
│   ├── forms.css      # Componentes de formularios
│   ├── cards.css      # Componentes de tarjetas
│   ├── modals.css     # Modales, tooltips y overlays
│   ├── loading.css    # Spinners, skeletons y estados de carga
│   └── toast.css      # Notificaciones toast
└── README.md          # Esta documentación
```

## Uso

### Importación Principal

```css
/* En tu archivo CSS principal o index.css */
@import './styles/index.css';
```

### Importación Selectiva

```css
/* Solo importar componentes específicos */
@import './styles/variables.css';
@import './styles/base.css';
@import './styles/components/buttons.css';
@import './styles/components/forms.css';
```

## Paleta de Colores

### Colores Primarios (Tema Restaurante)
- **Primary**: Tonos naranjas/rojos (`--color-primary-50` a `--color-primary-950`)
- **Secondary**: Escala de grises (`--color-gray-50` a `--color-gray-950`)

### Colores de Estado
- **Success**: Verde (`--color-success-50` a `--color-success-900`)
- **Error**: Rojo (`--color-error-50` a `--color-error-900`)
- **Warning**: Amarillo (`--color-warning-50` a `--color-warning-900`)
- **Info**: Azul (`--color-info-50` a `--color-info-900`)

### Colores Semánticos
```css
--color-background: var(--color-gray-50);
--color-surface: #ffffff;
--color-text-primary: var(--color-gray-900);
--color-text-secondary: var(--color-gray-600);
--color-border: var(--color-gray-200);
```

## Tipografía

### Familia de Fuentes
- **Sans**: Inter (Google Fonts)
- **Mono**: JetBrains Mono, Fira Code, Monaco

### Escala Tipográfica
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;   /* 60px */
```

### Pesos de Fuente
```css
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

## Sistema de Espaciado

Basado en múltiplos de 4px:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## Componentes

### Botones

```html
<!-- Variantes principales -->
<button class="btn btn-primary">Primario</button>
<button class="btn btn-secondary">Secundario</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>

<!-- Tamaños -->
<button class="btn btn-primary btn-sm">Pequeño</button>
<button class="btn btn-primary btn-base">Base</button>
<button class="btn btn-primary btn-lg">Grande</button>
<button class="btn btn-primary btn-xl">Extra Grande</button>

<!-- Estados -->
<button class="btn btn-success">Éxito</button>
<button class="btn btn-error">Error</button>
<button class="btn btn-warning">Advertencia</button>
<button class="btn btn-info">Información</button>

<!-- Especiales -->
<button class="btn btn-primary btn-loading">Cargando</button>
<button class="btn btn-primary btn-block">Ancho completo</button>
<button class="btn btn-primary btn-icon">🔍</button>
```

### Formularios

```html
<!-- Input básico -->
<div class="form-group">
  <label class="form-label required">Nombre</label>
  <input type="text" class="form-input" placeholder="Tu nombre">
  <div class="form-help">Texto de ayuda</div>
</div>

<!-- Input con error -->
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input form-input-error" placeholder="tu@email.com">
  <div class="form-error">Email requerido</div>
</div>

<!-- Textarea -->
<div class="form-group">
  <label class="form-label">Mensaje</label>
  <textarea class="form-textarea" placeholder="Tu mensaje"></textarea>
</div>

<!-- Select -->
<div class="form-group">
  <label class="form-label">País</label>
  <select class="form-select">
    <option>Selecciona un país</option>
    <option>México</option>
    <option>España</option>
  </select>
</div>

<!-- Checkbox y Radio -->
<div class="form-check">
  <input type="checkbox" class="form-checkbox" id="terms">
  <label class="form-check-label" for="terms">Acepto los términos</label>
</div>
```

### Tarjetas

```html
<!-- Card básica -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título</h3>
    <p class="card-subtitle">Subtítulo</p>
  </div>
  <div class="card-body">
    <p class="card-text">Contenido de la tarjeta</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Acción</button>
  </div>
</div>

<!-- Card con imagen -->
<div class="card">
  <img src="image.jpg" class="card-img-top" alt="Imagen">
  <div class="card-body">
    <h3 class="card-title">Título</h3>
    <p class="card-text">Descripción</p>
  </div>
</div>

<!-- Variantes -->
<div class="card card-elevated">Elevada</div>
<div class="card card-outlined">Con borde</div>
<div class="card card-interactive">Interactiva</div>
```

### Modales

```html
<!-- Modal básico -->
<div class="modal-overlay show">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Título del Modal</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p>Contenido del modal</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancelar</button>
      <button class="btn btn-primary">Confirmar</button>
    </div>
  </div>
</div>

<!-- Tamaños -->
<div class="modal modal-sm">Pequeño</div>
<div class="modal modal-lg">Grande</div>
<div class="modal modal-xl">Extra Grande</div>

<!-- Drawer -->
<div class="modal modal-drawer show">Drawer lateral</div>
```

### Estados de Carga

```html
<!-- Spinners -->
<div class="spinner"></div>
<div class="spinner spinner-lg spinner-primary"></div>
<div class="spinner-dots">
  <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
</div>

<!-- Barras de progreso -->
<div class="progress">
  <div class="progress-bar" style="width: 75%"></div>
</div>
<div class="progress">
  <div class="progress-bar progress-bar-success progress-bar-animated" style="width: 50%"></div>
</div>

<!-- Skeletons -->
<div class="skeleton skeleton-title"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-avatar"></div>
```

### Notificaciones Toast

```html
<!-- Container de toasts -->
<div class="toast-container toast-container-top-right">
  <!-- Toast de éxito -->
  <div class="toast toast-success show">
    <div class="toast-icon">✓</div>
    <div class="toast-content">
      <div class="toast-title">Éxito</div>
      <div class="toast-message">Operación completada correctamente</div>
    </div>
    <button class="toast-close">×</button>
  </div>
  
  <!-- Toast con acciones -->
  <div class="toast toast-info show">
    <div class="toast-icon">ℹ</div>
    <div class="toast-content">
      <div class="toast-title">Nueva actualización</div>
      <div class="toast-message">Hay una nueva versión disponible</div>
      <div class="toast-actions">
        <button class="toast-action toast-action-primary">Actualizar</button>
        <button class="toast-action toast-action-secondary">Más tarde</button>
      </div>
    </div>
  </div>
</div>
```

## Utilidades

### Espaciado
```html
<div class="m-4 p-6">Margin 16px, Padding 24px</div>
<div class="mt-2 mb-4">Margin top 8px, bottom 16px</div>
<div class="px-4 py-2">Padding horizontal 16px, vertical 8px</div>
```

### Flexbox
```html
<div class="flex items-center justify-between">
  <span>Izquierda</span>
  <span>Derecha</span>
</div>
```

### Texto
```html
<p class="text-lg font-semibold text-primary">Texto grande, semi-bold, color primario</p>
<p class="text-sm text-secondary">Texto pequeño, color secundario</p>
```

### Visibilidad Responsive
```html
<div class="hidden-xs visible-md">Solo visible en tablet y desktop</div>
<div class="visible-xs hidden-md">Solo visible en móvil</div>
```

## Breakpoints Responsive

```css
--breakpoint-sm: 640px;   /* Móvil grande */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Desktop grande */
--breakpoint-2xl: 1536px; /* Desktop extra grande */
```

## Tema Oscuro

El sistema incluye soporte para tema oscuro usando el atributo `data-theme`:

```html
<html data-theme="dark">
  <!-- Contenido con tema oscuro -->
</html>
```

## Accesibilidad

- **Focus Ring**: Todos los elementos interactivos tienen indicadores de foco
- **Contraste**: Colores que cumplen WCAG 2.1 AA
- **Reducción de Movimiento**: Respeta `prefers-reduced-motion`
- **Alto Contraste**: Soporte para `prefers-contrast: high`

## Personalización

### Sobrescribir Variables

```css
:root {
  /* Personalizar colores primarios */
  --color-primary-500: #your-brand-color;
  --color-primary-600: #your-brand-color-dark;
  
  /* Personalizar tipografía */
  --font-family-sans: 'Your Font', sans-serif;
  
  /* Personalizar espaciado */
  --space-base: 1.2rem; /* Cambiar base de espaciado */
}
```

### Crear Variantes Personalizadas

```css
/* Botón personalizado */
.btn-brand {
  background-color: var(--your-brand-color);
  border-color: var(--your-brand-color);
  color: white;
}

.btn-brand:hover {
  background-color: var(--your-brand-color-dark);
}

/* Card personalizada */
.card-special {
  border: 2px solid var(--color-primary-500);
  background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100));
}
```

## Mejores Prácticas

1. **Usa Variables CSS**: Siempre usa las variables definidas en lugar de valores hardcoded
2. **Componentes Modulares**: Importa solo los componentes que necesitas
3. **Responsive First**: Diseña primero para móvil, luego escala hacia arriba
4. **Accesibilidad**: Siempre incluye indicadores de foco y texto alternativo
5. **Consistencia**: Usa el sistema de espaciado y colores consistentemente
6. **Performance**: Minimiza el CSS no utilizado en producción

## Contribución

Para agregar nuevos componentes o modificar existentes:

1. Sigue la estructura de archivos existente
2. Usa las variables CSS definidas
3. Incluye variantes responsive
4. Agrega documentación y ejemplos
5. Prueba en diferentes navegadores y dispositivos