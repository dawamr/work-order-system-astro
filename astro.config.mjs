// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      API_URL: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    define: {
      'process.env.TZ': JSON.stringify('Asia/Jakarta'),
    },
  },
});
