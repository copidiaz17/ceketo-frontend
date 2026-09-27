import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import { reveal, tilt } from './directives/efectos'
import './assets/main.css'

// En producción se define VITE_API_BASE_URL apuntando al backend de Render
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
}

// Timeout global: si el servidor no responde en 20s, falla rápido en lugar de colgar
axios.defaults.timeout = 20000

// DEMO de diseño: lee datos reales pero NUNCA escribe (ni pedidos ni nada del admin)
if (import.meta.env.VITE_DEMO) {
  axios.interceptors.request.use(config => {
    if ((config.method || 'get').toLowerCase() !== 'get') {
      return Promise.reject({
        demo: true,
        response: { data: { error: 'Esto es una demo de diseño: el pedido no se envía.' } },
      })
    }
    return config
  })
}

// Inyectar token JWT automáticamente en todas las peticiones cuando existe
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('ceketo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor global: si el token expira (401) redirige al login
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && router.currentRoute.value.path.startsWith('/admin')) {
      localStorage.removeItem('ceketo_token')
      localStorage.removeItem('ceketo_admin')
      localStorage.removeItem('ceketo_rol')
      router.push('/admin/login')
    }
    return Promise.reject(err)
  }
)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('reveal', reveal)
app.directive('tilt', tilt)
app.mount('#app')
