# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versión siguiendo [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.2] - 2025-10-27
### Añadido
- Nueva imagen de perfil `src/assets/img/gabriel.jpeg`.
- Documentación interna para IA en `.github/copilot-instructions.md` (no afecta al runtime).

### Cambiado
- Actualizaciones de contenido en `src/data/services.json` y `src/data/plans.json`.
- Mejoras y ajustes en secciones: `About.astro`, `Banner.astro`, `Contact.astro`, `Plans.astro`, `Services.astro`, `Workflow.astro`.
- Ajustes de componentes: `Modal.astro`, `ServiceCard.astro` y `shared/Header.astro`.
- Refinamientos de estilos en `styles/components/header.scss` y variables/transiciones en `styles/foundation/_root.scss`.

### Nota
- Se mantiene la arquitectura SCSS de 5 capas y el sistema unificado de animaciones mediante `IntersectionObserver`.

## [1.0.1] - 2025-08-29
### Cambiado
- Ajustes en `Banner.astro` y mejoras en estilos base (`_tokens.scss`, `_root.scss`).

### Eliminado
- Limpieza de iconos y SVG no utilizados en `src/assets/img`.

### Nota
- Realineación de versionado: se continúa desde `1.0.0` definido en `package.json`.

## [0.1.0] - 2025-08-11
### Añadido
- Nuevo breakpoint `xxs (400px)` para mejorar tipografía y escalado en móviles muy pequeños.
- Variables CSS para alturas de header y `scroll-padding-top` (mejor experiencia de anclaje interno).

### Cambiado
- Refactor responsivo general: ajustes de grids (Servicios pasa a 1→2→4 columnas, reorganización de Workflow y otras secciones).
- Breakpoint `md` ajustado a `820px` (optimización para tablets verticales modernas).
- Padding del contenedor incrementado (`container: 1.5rem`) para lograr consistencia visual.
- Reescritura de gran parte de `Workflow.astro` (80%) para un layout de grid más flexible.
- Normalización de comentarios y uso de mixins `respond-to` en componentes.

### Mejorado
- Cohesión de design tokens y mapas (`_tokens.scss`) para futura extensibilidad (i18n, dark mode avanzado, accesibilidad).
- Estructura de variables contextuales en `_root.scss` preparada para mejoras de accesibilidad (focus management en modales y skip links futuros).

### Próximos pasos (no incluidos en esta versión)
- SEO (meta OG/Twitter, sitemap, JSON-LD servicios y planes).
- Accesibilidad de modales (focus trap / aria-describedby / retorno de foco).
- Sanitización de iconos (remplazar `set:html` por componente seguro SVG).
- Refactor JS modular (centralizar lógica de modales y toggles de UI).

---

[1.0.1]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v1.0.1
[1.0.2]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v1.0.2
[0.1.0]: https://github.com/GabrielZavando/WebAgenciaAstro/releases/tag/v0.1.0
