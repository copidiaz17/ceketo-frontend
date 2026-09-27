import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// `npm run demo` (modo "demo"): usa los datos REALES del backend de producción solo para
// leer (productos, categorías). main.js bloquea cualquier escritura en ese modo.
export default defineConfig(({ mode }) => {
  const backend = mode === 'demo' ? 'https://ceketo-backend.onrender.com' : 'http://localhost:3000'
  const proxy = {
    target: backend,
    changeOrigin: true,
    secure: true,
    configure: (p) => p.on('proxyReq', req => req.removeHeader('origin')),
  }
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: {
      include: ['exceljs']
    },
    server: {
      port: 5173,
      host: mode === 'demo' ? true : undefined,   // demo: accesible desde el celular en la misma red
      proxy: {
        '/api': proxy,
        '/uploads': proxy,
      }
    }
  }
})
