// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    devToolbar:{
        enabled: false
    },
    vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "src/styles/abstracts/index" as *;`
        }
      }
    }
  }
});