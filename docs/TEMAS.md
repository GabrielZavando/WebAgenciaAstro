# Sistema de Temas (Claro/Oscuro) para WebAstro Landing

Este documento proporciona una guía para utilizar y ampliar el sistema de temas implementado en nuestro proyecto.

## Estructura del Sistema

El sistema de temas está basado en:

1. **Variables CSS**: Definidas en `src/styles/globals/_themes.scss`
2. **Activación del tema**: Implementada en `src/styles/base/theme-switcher.scss`
3. **Componente selector**: Ubicado en `src/components/shared/ThemeSwitcher.astro`
4. **Prevención de parpadeo**: Script inline en `src/layouts/MainLayout.astro`

## Cómo funciona

- Los temas utilizan el atributo `data-theme` en el elemento `<html>`.
- Los valores posibles son: `"light"` (claro) o `"dark"` (oscuro).
- La preferencia del usuario se guarda en `localStorage`.
- Si no hay preferencia guardada, se utiliza la configuración del sistema.

## Uso de variables en tu CSS

Para asegurar que los estilos responden correctamente al cambio de tema, utiliza siempre las variables CSS definidas:

```scss
// ✅ Correcto
color: var(--color-text);
background-color: var(--color-background);

// ❌ Incorrecto
color: #222222;
background-color: white;
```

## Variables disponibles

### Colores base
- `--color-background`: Color de fondo principal
- `--color-text`: Color de texto principal
- `--color-heading`: Color para encabezados
- `--color-card-bg`: Color de fondo para tarjetas

### Escala de grises
- `--color-gray-100` a `--color-gray-900`

### Colores funcionales (iguales en ambos temas)
- `--color-primary`: Color principal
- `--color-secondary`: Color secundario
- `--color-accent`: Color acento
- `--color-dark`: Color oscuro
- `--color-white`: Color blanco
- `--color-neutral`: Color neutro

### Colores de componentes específicos
- `--color-nav-bg`: Fondo de navegación
- `--color-card-shadow`: Sombra para tarjetas
- `--color-input-bg`: Fondo de inputs
- `--color-input-border`: Borde de inputs
- `--color-input-text`: Texto de inputs
- `--color-button-text`: Texto de botones
- `--color-footer-bg`: Fondo del footer
- `--color-footer-text`: Texto del footer
- `--color-section-alt-bg`: Fondo alternativo para secciones
- `--color-banner-overlay`: Overlay para banners

### Bordes y sombras
- `--color-border`: Color de bordes
- `--shadow-sm`: Sombra pequeña
- `--shadow-md`: Sombra mediana
- `--shadow-lg`: Sombra grande

## Cómo añadir nuevas variables

Si necesitas añadir nuevas variables para tu tema:

1. Define la variable en ambos mixins (`light-theme` y `dark-theme`) en `_themes.scss`
2. Mantén la misma estructura de nombres para facilitar la comprensión
3. Documenta la nueva variable en este archivo

## Comportamiento de transición

Todos los elementos que deben tener una transición suave al cambiar de tema están configurados en `theme-switcher.scss`. 
Si necesitas añadir más elementos, puedes extender la lista.
