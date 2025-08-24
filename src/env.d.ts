/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_BASE_URL?: string; // Base URL del backend (NestJS) para el formulario de contacto
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}