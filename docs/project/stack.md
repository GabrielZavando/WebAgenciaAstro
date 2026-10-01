# Stack técnico

- Lenguajes: TypeScript (frontend Astro), Bash (scripts de validación/deploy)
- Frameworks: Astro 5 (SSR Standalone, adapter `@astrojs/node`), Tailwind CSS 4, Vitest + Playwright (testing)
- Bases de datos: ninguna en el frontend (las gestiona el backend Api)
- Infraestructura: Docker (build multi-stage con pnpm), Coolify (gestión de VPS), GitHub App (webhook de deploy nativo), Let's Encrypt (SSL)
- Gestor de paquetes: pnpm (objetivo pnpm 10; el build usa Corepack sin `packageManager` fijo — drift a pnpm 12 documentado como ticket de mantenimiento en `docs/deploy-standards.md`)
- Convenciones de commits: Conventional Commits
- Lenguaje del código: English
- Lenguaje de documentación cliente: Español
