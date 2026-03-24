<template>
  <div class="min-h-screen bg-[#0F1E1B] flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-10">
        <span class="font-display text-4xl font-bold text-white tracking-widest">CEKETO</span>
        <p class="font-body text-teal text-sm mt-1 tracking-wider uppercase">Panel Administrativo</p>
      </div>

      <!-- Card -->
      <div class="bg-[#162421] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h1 class="font-display text-2xl font-semibold text-white mb-6">Iniciar sesión</h1>

        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block font-body text-sm text-white/60 mb-2">Usuario</label>
            <input
              v-model="form.usuario"
              type="text"
              required
              autocomplete="username"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label class="block font-body text-sm text-white/60 mb-2">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm font-body">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-teal text-white font-body font-medium rounded-xl
                   hover:bg-teal/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.post('/api/auth/login', form.value)
    localStorage.setItem('ceketo_token', data.token)
    localStorage.setItem('ceketo_admin', data.usuario)
    localStorage.setItem('ceketo_rol',   data.rol)
    router.push('/admin/produccion')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
