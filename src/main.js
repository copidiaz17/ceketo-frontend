import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// En producción se define VITE_API_BASE_URL apuntando al backend de Render
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
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
app.mount('#app')
