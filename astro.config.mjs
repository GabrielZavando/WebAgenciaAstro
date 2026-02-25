import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false
    },
    adapter: node({
        mode: 'standalone'
    }),
    integrations: [
        react()
    ],
    output: 'server'
});

