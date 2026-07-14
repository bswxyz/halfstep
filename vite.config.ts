import { defineConfig } from 'vite';

export default defineConfig({
  base: '/halfstep/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
