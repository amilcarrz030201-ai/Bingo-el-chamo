import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

function webViewClassicSingleFilePlugin(): Plugin {
  return {
    name: 'webview-classic-singlefile',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        for (const fileName of Object.keys(bundle)) {
          if (!fileName.endsWith('.html')) continue;
          const asset = bundle[fileName];
          if (asset.type !== 'asset' || typeof asset.source !== 'string') continue;

          let html = asset.source;
          // Remove crossorigin from inlined <style> / <link> tags so file:// WebViews never block them
          html = html.replace(/<(style|link)\b([^>]*?)\scrossorigin(?:="[^"]*"|='[^']*')?([^>]*)>/gi, '<$1$2$3>');

          // Convert <script type="module" ...>...</script> to a classic <script> before </body>
          const moduleScriptRegex = /<script\b[^>]*\btype=["']module["'][^>]*>([\s\S]*?)<\/script>/i;
          const match = html.match(moduleScriptRegex);
          if (match && match[1]) {
            const scriptBody = match[1];
            html = html.replace(moduleScriptRegex, () => '');
            html = html.replace(/<\/body>/i, () => `    <script>${scriptBody}</script>\n  </body>`);
          }

          asset.source = html;
        }
      },
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/Bingo-el-chamo/',
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile({ removeViteModuleLoader: true }),
      webViewClassicSingleFilePlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2019', 'chrome80'],
      cssTarget: 'chrome80',
      assetsInlineLimit: 100000000,
      rollupOptions: {
        output: {
          format: 'iife' as const,
          inlineDynamicImports: true,
        },
      },
    },
    server: {
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
