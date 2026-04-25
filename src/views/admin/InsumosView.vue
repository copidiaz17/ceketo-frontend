<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Insumos</h1>
        <p class="font-body text-gray-500 mt-1">Catálogo de insumos utilizados en producción</p>
      </div>
      <button
        @click="abrirModal()"
        class="flex items-center gap-2 bg-keto-orange text-gray-900 px-5 py-2.5 rounded-xl font-body font-medium text-sm hover:bg-keto-orange/80 transition-colors"
      >+ Nuevo insumo</button>
    </div>

    <!-- Lista -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="cargando" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!insumos.length" class="text-center py-16 text-gray-400 font-body">
        No hay insumos cargados todavía.
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Nombre</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Unidad</th>
            <th class="text-right px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Costo unitario</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Estado</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ins in insumos"
            :key="ins.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            :class="!ins.activo ? 'opacity-50' : ''"
          >
            <td class="px-6 py-4 font-body text-sm font-semibold text-gray-900">{{ ins.nombre }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-600">{{ ins.unidad }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-900 text-right font-mono">
              ${{ formatNum(ins.costo_unitario) }}
            </td>
            <td class="px-6 py-4 text-center">
              <span
                class="text-xs font-body font-semibold px-2 py-1 rounded-full"
                :class="ins.activo ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-400'"
              >{{ ins.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModal(ins)"
                  class="text-gray-400 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-gray-100"
                >✏️</button>
                <button
                  @click="toggleActivo(ins)"
                  class="text-gray-400 hover:text-amber-500 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-amber-50"
                  :title="ins.activo ? 'Desactivar' : 'Activar'"
                >{{ ins.activo ? '🔒' : '🔓' }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal nuevo/editar -->
  <div v-if="modal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-5">
        <h2 class="font-display text-lg font-bold text-gray-900">
          {{ editando ? 'Editar insumo' : 'Nuevo insumo' }}
        </h2>
        <button @click="cerrarModal" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block font-body text-sm text-gray-500 mb-1">Nombre *</label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej: Harina de almendras"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-body text-sm text-gray-500 mb-1">Unidad</label>
            <input
              v-model="form.unidad"
              type="text"
              placeholder="kg, litro, unidad..."
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label class="block font-body text-sm text-gray-500 mb-1">Costo unitario ($)</label>
            <input
              v-model.number="form.costo_unitario"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
            />
          </div>
        </div>
      </div>

      <p v-if="error" class="text-red-400 text-sm font-body mt-3">{{ error }}</p>

      <div class="flex gap-3 mt-6">
        <button
          @click="cerrarModal"
          class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
        >Cancelar</button>
        <button
          @click="guardar"
          :disabled="guardando"
          class="flex-1 py-3 bg-keto-orange text-gray-900 font-body text-sm font-semibold rounded-xl hover:bg-keto-orange/80 transition-colors disabled:opacity-50"
        >{{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const insumos  = ref([])
const cargando = ref(false)
const modal    = ref(false)
const editando = ref(null)
const guardando = ref(false)
const error    = ref('')

const form = ref({ nombre: '', unidad: 'kg', costo_unitario: 0 })

function formatNum(n) {
  return Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function headers() {
  return { Authorization: `Bearer ${localStorage.getItem('ceketo_token')}` }
}

async function cargar() {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/insumos/todos', { headers: headers() })
    insumos.value = data
  } finally {
    cargando.value = false
  }
}

function abrirModal(ins = null) {
  editando.value = ins
  error.value = ''
  form.value = ins
    ? { nombre: ins.nombre, unidad: ins.unidad, costo_unitario: Number(ins.costo_unitario) }
    : { nombre: '', unidad: 'kg', costo_unitario: 0 }
  modal.value = true
}

function cerrarModal() {
  modal.value = false
  editando.value = null
}

async function guardar() {
  error.value = ''
  if (!form.value.nombre.trim()) { error.value = 'El nombre es obligatorio'; return }
  guardando.value = true
  try {
    if (editando.value) {
      await axios.put(`/api/insumos/${editando.value.id}`, form.value, { headers: headers() })
    } else {
      await axios.post('/api/insumos', form.value, { headers: headers() })
    }
    cerrarModal()
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    guardando.value = false
  }
}

async function toggleActivo(ins) {
  try {
    await axios.put(`/api/insumos/${ins.id}`, { activo: !ins.activo }, { headers: headers() })
    await cargar()
  } catch { /* ignore */ }
}

onMounted(cargar)
</script>
