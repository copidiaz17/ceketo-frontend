<template>
  <div class="min-h-screen bg-[#FCDFD2] flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-10">
        <span class="font-display text-4xl font-bold text-brand-green tracking-widest">CEKETO</span>
        <p class="font-body text-brand-green/70 text-sm mt-1 tracking-wider uppercase">Panel Administrativo</p>
      </div>

      <!-- Card -->
      <div class="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg">
        <h1 class="font-display text-2xl font-semibold text-gray-900 mb-6">Iniciar sesión</h1>

        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Usuario</label>
            <input
              v-model="form.usuario"
              type="text"
              required
              autocomplete="username"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Contraseña</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="verClave ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                       focus:outline-none focus:border-brand-green transition-colors"
              />
              <button
                type="button"
                @click="verClave = !verClave"
                :title="verClave ? 'Ocultar contraseña' : 'Ver contraseña'"
                :aria-label="verClave ? 'Ocultar contraseña' : 'Ver contraseña'"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <!-- ojo abierto -->
                <svg v-if="!verClave" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- ojo tachado -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
                  <path d="M6.61 6.61A18.15 18.15 0 0 0 2 11s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61"/>
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                  <line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-sm font-body">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-brand-green text-white font-body font-medium rounded-xl
                   hover:bg-brand-green/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = ref({ usuario: '', password: '' })
const verClave = ref(false)   // el ojito del campo de contraseña
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.post('/api/auth/login', {
      usuario: form.value.usuario.trim().toLowerCase(),
      password: form.value.password,
    })
    localStorage.setItem('ceketo_token', data.token)
    localStorage.setItem('ceketo_admin', data.usuario)
    localStorage.setItem('ceketo_rol',   data.rol)
    const destino = {
      ventas: '/admin/ventas',
      fabrica: '/admin/produccion',
      contenido: '/admin/productos',   // si no, entra al dashboard y el router la rebota
    }
    router.push(destino[data.rol] || '/admin/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
