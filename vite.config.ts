import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

/**
 * Deployed to GitHub Pages under /<repo-name>/. Override with VITE_BASE (e.g. "/" for a custom domain).
 */
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE || '/PhysiStep/';
  const apiOrigin = (() => {
    try {
      return env.VITE_API_URL ? new URL(env.VITE_API_URL).origin : '';
    } catch {
      return '';
    }
  })();

  // GitHub Pages cannot send HTTP headers, so the strongest policy we can ship is a <meta> CSP.
  // (frame-ancestors / report-uri are ignored in meta CSPs — see SECURITY.md.)
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Tailwind/motion inline styles
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${apiOrigin ? ' ' + apiOrigin : ''}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');

  const injectCsp = (): Plugin => ({
    name: 'physistep-inject-csp',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // In dev, Vite's HMR client needs inline script + websockets, so only enforce on build.
        if (ctx.server) return html;
        return html.replace('<!--CSP-->', `<meta http-equiv="Content-Security-Policy" content="${csp}" />`);
      },
    },
  });

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      injectCsp(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false, // registered explicitly in src/main.tsx
        includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-32.png'],
        manifest: {
          id: base,
          name: 'PhysiStep - High School Physics Solver',
          short_name: 'PhysiStep',
          description: 'Bilingual (Bangla & English) step-by-step physics solver, quizzes, simulators and unit converter.',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'any',
          background_color: '#020617',
          theme_color: '#020617',
          lang: 'en',
          dir: 'ltr',
          categories: ['education', 'productivity', 'utilities'],
          icons: [
            {src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
          shortcuts: [
            {name: 'AI Physics Solver', short_name: 'Solver', url: `${base}?tab=ai_solver`, icons: [{src: 'icons/icon-192.png', sizes: '192x192'}]},
            {name: 'Practice Quiz', short_name: 'Quiz', url: `${base}?tab=quiz`, icons: [{src: 'icons/icon-192.png', sizes: '192x192'}]},
            {name: 'Formula Cheatsheet', short_name: 'Formulas', url: `${base}?tab=cheatsheet`, icons: [{src: 'icons/icon-192.png', sizes: '192x192'}]},
          ],
        },
        workbox: {
          // Precache the whole app shell so it works fully offline once installed.
          globPatterns: ['**/*.{js,css,html,png,svg,woff2,woff,webmanifest}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Never cache the AI proxy: answers must be fresh and are not part of the shell.
          runtimeCaching: [],
        },
      }),
    ],
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            pdf: ['jspdf'],
            katex: ['katex'],
          },
        },
      },
    },
    resolve: {
      alias: {'@': path.resolve(__dirname, '.')},
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'worker/**/*.test.ts'],
    },
  };
});
