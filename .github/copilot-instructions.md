# Copilot Instructions - Landing Page Agencia Digital

## Project Overview
Astro-based static landing page for a digital agency showcasing services, plans, and contact information. Spanish language site with modern flat design, dual theme support (light/dark), and sophisticated scroll-based animations.

## Architecture & Key Patterns

### Tech Stack
- **Framework**: Astro 5.8.0 (SSG mode, no SSR)
- **Styling**: SCSS with 5-layer architecture (config → foundation → layout → components)
- **Animations**: Vanilla JS with IntersectionObserver
- **No frontend framework dependencies** - Pure Astro components

### SCSS Architecture (Critical)
All styles follow strict 5-layer architecture in `src/styles/`:

1. **Config Layer** (`config/`): Design tokens, functions, mixins
   - `_tokens.scss`: Single source of truth for all design values (colors, spacing, breakpoints, z-index)
   - `_functions.scss`: Token accessor functions (`token()`, `space()`, `container()`)
   - `_mixins.scss`: Reusable patterns (`respond-to()`, `flex()`)

2. **Foundation Layer** (`foundation/`): Global styles, resets, CSS variables
   - `_root.scss`: CSS custom properties generated from `$colors-light` and `$colors-dark` maps
   - `_reset.scss`: Minimal CSS reset
   - `_base.scss`: Typography, body defaults

3. **Layout Layer** (`layout/`): Structure patterns
   - `containers.scss`, `grids.scss`, `sections.scss`

4. **Components Layer** (`components/`): Reusable UI blocks
   - `buttons.scss`, `header.scss`, etc.

5. **Main Entry**: `main.scss` imports all layers with `@use` (no `@import`)

**Never modify design tokens outside `_tokens.scss`**. All color, spacing, and breakpoint changes flow from there.

### Responsive Breakpoints
```scss
xxs: 400px  // Very small mobile
xs: 480px   // Small mobile
sm: 768px   // Tablets/large mobile
md: 820px   // Large tablets (optimized for vertical modern tablets)
lg: 1200px  // Desktop
xl: 1400px  // Large screens
```

Use `@include respond-to(breakpoint)` mixin, never raw media queries.

### Animation System
Single unified fade-in system using IntersectionObserver:

**How it works:**
- Add class `fade-in` to any element you want to animate
- Optionally add `fade-in-delay-N` (N = 1-22) for sequential delays
- IntersectionObserver triggers when element enters viewport (threshold: 0.2)
- CSS transitions handle the actual animation (opacity + translateY)

**Timing:**
- Base animation: 0.8s ease-out
- Delay increments: `fade-in-delay-1` = 0.2s, `fade-in-delay-2` = 0.5s, etc.
- Defined in `src/styles/foundation/_root.scss` lines 203-224

**Example usage:**
```astro
<!-- Simple fade-in -->
<h2 class="fade-in">Title</h2>

<!-- Sequential animations -->
<p class="fade-in fade-in-delay-1">First paragraph</p>
<p class="fade-in fade-in-delay-2">Second paragraph</p>
<p class="fade-in fade-in-delay-3">Third paragraph</p>
```

**Implementation:** Single IntersectionObserver in `MainLayout.astro` (lines 68-86) observes all `.fade-in` elements.

### Data-Driven Content
All content comes from JSON files in `src/data/`:
- `menu.json`: Navigation items, social links
- `services.json`: Service cards + modal content (benefits, implementation steps, CTA)
- `plans.json`: Pricing tiers with features/exclusions

When modifying content structure, update both JSON schema AND consuming `.astro` components.

### Modal Pattern
- `Modal.astro`: Reusable container component
- Opened via `data-modal="modal-{id}"` attribute on trigger buttons
- Script in `Modal.astro` handles: open/close, ESC key, click outside, focus management
- Service modals scroll to contact form section when closed

### Theme System
Dual theme (light/dark) via `data-theme` attribute on `<html>`:
- Theme toggle in `ThemeSwitcher.astro`
- Inline script in `MainLayout.astro` prevents FOUC (flash of unstyled content)
- All colors accessed via CSS custom properties (`var(--color-*)`)
- Token maps: `$colors-light` and `$colors-dark` in `_tokens.scss`

## Development Workflows

### Commands
```bash
npm run dev      # Start dev server with auto-open
npm run build    # Build for production
npm run preview  # Preview production build
```

### File Organization
- **Components**: Reusable UI in `src/components/`
  - `sections/`: Page sections (Banner, Services, About, etc.)
  - `shared/`: Cross-page components (Header, Footer, ThemeSwitcher)
- **Layouts**: `MainLayout.astro` wraps all pages
- **Pages**: `index.astro` (homepage), `404.astro`, `politica-de-privacidad.astro`

### Version Management
Follow SemVer. Update `CHANGELOG.md` BEFORE creating release:
1. Edit CHANGELOG with version and changes
2. Update `package.json` version
3. Create annotated tag: `git tag -a vX.Y.Z -m "Version X.Y.Z: description"`
4. Push with tags: `git push origin main --follow-tags`

## Common Tasks

### Adding a New Service
1. Add entry to `src/data/services.json` (increment `id`)
2. Include: `icon` (Font Awesome HTML), `title`, `description`, `modalContent`
3. No code changes needed - `Services.astro` maps over JSON automatically

### Creating a New Section
1. Create component in `src/components/sections/YourSection.astro`
2. Import and add to `src/pages/index.astro`
3. Add corresponding styles following SCSS architecture
4. Update `menu.json` if section needs navigation link

### Modifying Colors/Spacing
1. Edit ONLY `src/styles/config/_tokens.scss`
2. Update `$colors-light`/`$colors-dark` maps for colors
3. Update `$spacing` map for spacing values
4. Changes propagate automatically via CSS custom properties

### Adding Responsive Behavior
Always use mixins from `_mixins.scss`:
```scss
// Mobile-first approach
.my-component {
  // Base mobile styles
  
  @include respond-to(md) {
    // Tablet styles
  }
  
  @include respond-to(lg) {
    // Desktop styles
  }
}
```

## Important Constraints

### Security
- **NEVER use `set:html` for user input** - current usage with Font Awesome icons from JSON is safe but should be refactored to SVG components
- All form submissions should validate server-side

### Performance
- Images use Astro's `<Image>` component with `loading="lazy"`
- No external runtime dependencies except Font Awesome CDN
- CSS is scoped to components automatically

### Accessibility (In Progress)
Current gaps noted in CHANGELOG v0.1.0:
- Modals need focus trap implementation
- Missing `aria-describedby` on modal content
- No skip links for keyboard navigation
- These are KNOWN ISSUES - don't remove existing ARIA attributes

### SEO (Planned)
Not yet implemented but planned:
- Open Graph / Twitter Card meta tags
- JSON-LD structured data for services/plans
- Sitemap generation

## Code Style

### Astro Components
- Use TypeScript for props: `interface Props { ... }`
- Destructure props with defaults: `const { title = "Default" } = Astro.props;`
- Keep logic in frontmatter (---), markup below

### SCSS
- Use `@use` not `@import`
- Access tokens via functions: `fn.token(breakpoints, md)`
- Utility functions: `fn.space(xl)`, `fn.container(max)`
- BEM-inspired naming: `.component__element--modifier`

### JavaScript
- Vanilla JS only, no framework
- Use TypeScript type comments: `/** @type {HTMLElement} */`
- Prefer `addEventListener` over inline handlers
- Group related DOM queries together

## Integration Points

### External Dependencies
- Font Awesome 6.5.1 (CDN - `brands`, `solid` styles)
- Google Fonts: Montserrat (headings), Open Sans (body)
- No analytics/tracking currently configured

### Form Handling
Contact form in `Contact.astro` - currently frontend only. Backend integration needed for production.

## AI Agent Guidance

When working with this codebase:
1. **Always check `_tokens.scss` first** before adding new colors/spacing
2. **Review existing `.astro` components** in same section before creating new patterns
3. **Use unified animation system** - add `fade-in` class + optional `fade-in-delay-N` for sequences
4. **Follow JSON-driven content** - prefer data file updates over hardcoding
5. **Test responsive behavior** at all breakpoints (especially `md: 820px` for modern tablets)
6. **Preserve Spanish language** in all user-facing text
7. **Check CHANGELOG** for known issues before reporting bugs
