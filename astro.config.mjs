import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false
    },
    adapter: node({
        mode: 'standalone'
    }),
    output: 'server',
    server: {
        // En local usa el puerto 4321; en Cloud Run usa el PORT de la variable de entorno
        port: parseInt(process.env.PORT || '4321'),
        host: '0.0.0.0'
    }
});

