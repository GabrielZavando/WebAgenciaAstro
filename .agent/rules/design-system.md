---
trigger: always_on
---

# Regla del Sistema de Diseño y Página de Estilos

## Objetivo
Garantizar la consistencia absoluta de la interfaz de usuario (UI), asegurando que la aplicación y la página de estilos estén siempre alineadas y utilicen el mismo sistema de diseño centralizado.

## Reglas de Oro
1. **Página de Estilos como Referencia Visual (`estilos.astro`)**: La página de estilos sirve para reflejar y ver rápidamente cómo se debe ver toda la UI de la aplicación. Es la fuente de verdad a la hora de estructurar componentes en el HTML. Si notas que un elemento en la aplicación se ve estructural o visualmente diferente a `estilos.astro`, debes corregir el HTML de la aplicación para que consuma las mismas clases de la misma manera.
2. **Sistema de Diseño SCSS como Motor Técnico (`src/styles`)**: La verdadera fuente de estilos no es la página `estilos.astro`, sino el código SCSS. La página de estilos funciona como una referencia precisamente porque sus elementos utilizan exclusivamente las clases CSS del sistema de diseño global ubicado en `Landing/src/styles`.
3. **Propagación Universal de Cambios**: Si se hace un cambio en alguna clase CSS dentro de `src/styles`, ese cambio impactará y se verá reflejado automáticamente **en todos los elementos que usen dicha clase** en toda la aplicación, incluyendo dinámicamente el catálogo en la propia página `estilos.astro`.
4. **Uso Exclusivo de Clases Globales**: Para que este ecosistema funcione, **se prohíbe terminantemente** el uso de estilos inline (`style="..."`) o clases CSS definidas localmente dentro de un componente Astro (bloque `<style>`). Toda la UI debe gobernarse por las clases BEM globales definidas en `src/styles/components/`.

## Flujo de Trabajo
- **Para aplicar estilos a un componente de la aplicación**: Observa cómo está implementado el elemento en `estilos.astro` y utiliza exactamente su misma estructura HTML y clases BEM.
- **Para cambiar el aspecto de un componente**: Modifica el archivo SCSS correspondiente en `src/styles`. El cambio se propagará a la página de estilos y a la aplicación simultáneamente, ya que ambos consumen la misma fuente centralizada de CSS.
- **Validación Rápida**: Usa `estilos.astro` en todo momento como catálogo para validar, de un solo vistazo, el impacto de los cambios CSS en los componentes del sistema, sin necesidad de navegar por toda la aplicación.
