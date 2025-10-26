import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Safely parse webhook URLs. In production, these may be undefined; we only
  // construct dev proxies when valid absolute URLs are provided.
  const parseUrl = (raw?: string) => {
    try {
      if (!raw) return null;
      if (!/^https?:\/\//i.test(raw)) return null;
      return new URL(raw);
    } catch {
      return null;
    }
  };

  const longUrl = parseUrl(env.VITE_N8N_LONGEVITY_WEBHOOK_URL || env.VITE_N8N_WEBHOOK_URL);
  const cardiacUrl = parseUrl(env.VITE_N8N_CARDIAC_WEBHOOK_URL || env.VITE_N8N_WEBHOOK_URL);

  const server: any = {};
  if (longUrl || cardiacUrl) {
    server.proxy = {} as Record<string, any>;
    if (longUrl) {
      server.proxy['/proxy/long'] = {
        target: longUrl.origin,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/proxy\/long/, longUrl.pathname),
      };
    }
    if (cardiacUrl) {
      server.proxy['/proxy/cardiac'] = {
        target: cardiacUrl.origin,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/proxy\/cardiac/, cardiacUrl.pathname),
      };
    }
    // In development, forward API requests to the Firebase Functions emulator
    server.proxy['/api'] = {
      target: 'http://localhost:5001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/longevity-practitioners/us-central1/api'),
    };
  }

  return {
    plugins: [react(), vercel()],
    vercel: {
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html',
        },
      ],
    },
    ...(server.proxy ? { server } : {}),
  };
});
