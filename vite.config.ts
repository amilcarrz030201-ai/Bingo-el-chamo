import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    base: '/Bingo-el-chamo/',
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2019', 'chrome80'],
      cssTarget: 'chrome80',
      assetsInlineLimit: 100000000,
    },
    server: {
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // File watching when DISABLE_HMR === 'true'
      watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
    },
  };
});
