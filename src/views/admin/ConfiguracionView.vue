<template>
  <div class="p-8 max-w-2xl mx-auto space-y-8">

    <div>
      <h1 class="font-display text-3xl font-bold text-gray-900">Configuración</h1>
      <p class="font-body text-gray-500 mt-1">Cuenta y usuarios del sistema</p>
    </div>

    <!-- ── Cambiar contraseña ───────────────────────────────────────── -->
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-gray-900 mb-1">🔑 Cambiar contraseña</h2>
      <p class="font-body text-xs text-gray-400 mb-5">Usuario: <strong>{{ usuarioActual }}</strong> · Rol: {{ rolActual }}</p>

      <div class="space-y-4">
        <div>
          <label class="block font-body text-sm text-gray-500 mb-1.5">Nueva contraseña</label>
          <input
            v-model="pass.nueva"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                   focus:outline-none focus:border-teal transition-colors"
          />
        </div>
        <div>
          <label class="block font-body text-sm text-gray-500 mb-1.5">Confirmar contraseña</label>
          <input
            v-model="pass.confirmar"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                   focus:outline-none focus:border-teal transition-colors"
            @keyup.enter="cambiarPassword"
          />
          <p v-if="pass.nueva && pass.confirmar && pass.nueva !== pass.confirmar"
            class="font-body text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
        </div>

        <p v-if="passError"  class="font-body text-sm text-red-400 bg-red-50 px-4 py-2 rounded-xl">{{ passError }}</p>
        <p v-if="passOk"     class="font-body text-sm text-teal bg-teal/10 px-4 py-2 rounded-xl">{{ passOk }}</p>

        <button
          @click="cambiarPassword"
          :disabled="!pass.nueva || pass.nueva !== pass.confirmar || guardandoPass"
          class="w-full py-3 bg-brand-green text-white font-body font-semibold rounded-xl
                 hover:bg-brand-green/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >{{ guardandoPass ? 'Guardando...' : 'Cambiar contraseña' }}</button>
      </div>
    </div>

    <!-- ── Usuarios del sistema ─────────────────────────────────────── -->
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-display text-lg font-semibold text-gray-900">👥 Usuarios del sistema</h2>
          <p class="font-body text-xs text-gray-400 mt-0.5">Roles: admin · fabrica · ventas</p>
        </div>
        <button
          @click="abrirModalUsuario()"
          class="px-4 py-2 bg-teal/10 text-teal border border-teal/30 rounded-xl font-body text-sm hover:bg-teal/20 transition-colors"
        >+ Nuevo usuario</button>
      </div>

      <div v-if="cargandoUsuarios" class="text-gray-400 font-body text-sm text-center py-4">Cargando...</div>
      <div v-else class="space-y-2">
        <div
          v-for="u in usuarios"
          :key="u.id"
          class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
        >
          <div>
            <p class="font-body text-sm font-semibold text-gray-900">{{ u.usuario }}</p>
            <p class="font-body text-xs text-gray-400">
              <span class="capitalize">{{ u.rol }}</span>
              <span v-if="!u.activo" class="ml-2 text-red-400">· inactivo</span>
            </p>
          </div>
          <button
            @click="abrirModalUsuario(u)"
            class="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 font-body text-xs hover:border-teal hover:text-teal transition-colors"
          >Editar</button>
        </div>
      </div>
    </div>

    <!-- Modal usuario -->
    <div v-if="modalUsuario" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 class="font-display text-lg font-bold text-gray-900">
          {{ editandoUsuario ? 'Editar usuario' : 'Nuevo usuario' }}
        </h2>

        <div>
          <label class="block font-body text-sm text-gray-500 mb-1.5">Usuario</label>
          <input v-model="uForm.usuario" type="text" placeholder="nombre_usuario"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal" />
        </div>

        <div>
          <label class="block font-body text-sm text-gray-500 mb-1.5">
            {{ editandoUsuario ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}
          </label>
          <input v-model="uForm.password" type="password" placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal" />
        </div>

        <div>
          <label class="block font-body text-sm text-gray-500 mb-1.5">Rol</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="r in ['admin','fabrica','ventas']" :key="r"
              @click="uForm.rol = r"
              class="py-2 rounded-xl border-2 font-body text-sm capitalize transition-all"
              :class="uForm.rol === r ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >{{ r }}</button>
          </div>
        </div>

        <div v-if="editandoUsuario" class="flex items-center gap-3">
          <button @click="uForm.activo = !uForm.activo"
            class="w-10 h-6 rounded-full transition-colors flex-shrink-0"
            :class="uForm.activo ? 'bg-teal' : 'bg-gray-300'"
          >
            <div class="w-4 h-4 bg-white rounded-full mx-auto transition-transform"
              :style="{ transform: uForm.activo ? 'translateX(8px)' : 'translateX(-8px)' }"></div>
          </button>
          <span class="font-body text-sm" :class="uForm.activo ? 'text-teal' : 'text-gray-400'">
            {{ uForm.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <p v-if="uError" class="font-body text-sm text-red-400">{{ uError }}</p>

        <div class="flex gap-3 pt-2">
          <button @click="modalUsuario = false"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors">
            Cancelar
          </button>
          <button @click="guardarUsuario" :disabled="guardandoUsuario"
            class="flex-1 py-3 bg-brand-green text-white font-body text-sm font-semibold rounded-xl hover:bg-brand-green/80 transition-colors disabled:opacity-50">
            {{ guardandoUsuario ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const usuarioActual = localStorage.getItem('ceketo_admin') || ''
const rolActual     = localStorage.getItem('ceketo_rol') || 'admin'

// ── Cambiar contraseña ──────────────────────────────────────────
const pass          = ref({ nueva: '', confirmar: '' })
const passError     = ref('')
const passOk        = ref('')
const guardandoPass = ref(false)

async function cambiarPassword() {
  if (!pass.value.nueva || pass.value.nueva !== pass.value.confirmar) return
  guardandoPass.value = true
  passError.value = ''
  passOk.value    = ''
  try {
    // Obtener el ID del usuario actual desde el token
    const { data: me } = await axios.get('/api/auth/me')
    await axios.put(`/api/usuarios/${me.id}`, { password: pass.value.nueva })
    passOk.value   = '✓ Contraseña actualizada correctamente'
    pass.value     = { nueva: '', confirmar: '' }
    setTimeout(() => { passOk.value = '' }, 4000)
  } catch (err) {
    passError.value = err.response?.data?.error || 'Error al cambiar la contraseña'
  } finally {
    guardandoPass.value = false
  }
}

// ── Usuarios ────────────────────────────────────────────────────
const usuarios        = ref([])
const cargandoUsuarios = ref(true)
const modalUsuario    = ref(false)
const editandoUsuario = ref(null)
const guardandoUsuario = ref(false)
const uError          = ref('')
const uForm           = ref({ usuario: '', password: '', rol: 'ventas', activo: true })

async function cargarUsuarios() {
  cargandoUsuarios.value = true
  try {
    const { data } = await axios.get('/api/usuarios')
    usuarios.value = data
  } catch {}
  cargandoUsuarios.value = false
}

function abrirModalUsuario(u = null) {
  editandoUsuario.value = u
  uForm.value = u
    ? { usuario: u.usuario, password: '', rol: u.rol, activo: u.activo }
    : { usuario: '', password: '', rol: 'ventas', activo: true }
  uError.value = ''
  modalUsuario.value = true
}

async function guardarUsuario() {
  if (!uForm.value.usuario) { uError.value = 'El nombre de usuario es obligatorio'; return }
  if (!editandoUsuario.value && !uForm.value.password) { uError.value = 'La contraseña es obligatoria para usuarios nuevos'; return }
  guardandoUsuario.value = true
  uError.value = ''
  try {
    const payload = { usuario: uForm.value.usuario, rol: uForm.value.rol, activo: uForm.value.activo }
    if (uForm.value.password) payload.password = uForm.value.password

    if (editandoUsuario.value) {
      await axios.put(`/api/usuarios/${editandoUsuario.value.id}`, payload)
    } else {
      await axios.post('/api/usuarios', payload)
    }
    modalUsuario.value = false
    cargarUsuarios()
  } catch (err) {
    uError.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    guardandoUsuario.value = false
  }
}

onMounted(cargarUsuarios)
</script>
