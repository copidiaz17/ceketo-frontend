<template>
  <div class="p-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-white">Categorías</h1>
        <p class="font-body text-white/50 mt-1">Agrupaciones de productos</p>
      </div>
      <button
        @click="abrirModalNueva"
        class="flex items-center gap-2 px-5 py-2.5 bg-teal text-white rounded-xl font-body text-sm hover:bg-teal/80 transition-all"
      >
        + Nueva categoría
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-[#162421] border border-white/10 rounded-2xl overflow-hidden">
      <table class="w-full font-body text-sm">
        <thead>
          <tr class="text-white/40 border-b border-white/10 bg-white/5">
            <th class="text-left px-6 py-4">Código</th>
            <th class="text-left px-6 py-4">Nombre</th>
            <th class="text-center px-6 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in categorias"
            :key="c.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="px-6 py-4 text-teal font-mono font-bold">{{ c.codigo }}</td>
            <td class="px-6 py-4 text-white">{{ c.nombre }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModalEditar(c)"
                  title="Editar categoría"
                  class="px-3 py-1 bg-white/5 text-white/60 rounded-lg text-xs hover:bg-teal/20 hover:text-teal transition-colors"
                >✏ Editar</button>
                <button
                  @click="confirmarEliminar(c)"
                  title="Eliminar categoría"
                  class="px-3 py-1 bg-white/5 text-white/60 rounded-lg text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >🗑 Eliminar</button>
              </div>
            </td>
          </tr>
          <tr v-if="categorias.length === 0">
            <td colspan="3" class="px-6 py-10 text-center text-white/30">Sin categorías</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear / editar -->
    <div v-if="modal.abierto" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-[#162421] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h2 class="font-display text-xl font-bold text-white mb-6">
          {{ modal.modo === 'crear' ? 'Nueva categoría' : 'Editar categoría' }}
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block font-body text-xs text-white/50 mb-1">Código <span class="text-red-400">*</span></label>
            <input v-model="modal.form.codigo" type="text" placeholder="BYM"
              class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm uppercase focus:outline-none focus:border-teal transition-colors" />
          </div>
          <div>
            <label class="block font-body text-xs text-white/50 mb-1">Nombre <span class="text-red-400">*</span></label>
            <input v-model="modal.form.nombre" type="text" placeholder="Budines y Muffins"
              class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-teal transition-colors" />
          </div>
          <p v-if="modal.error" class="text-red-400 text-sm font-body">{{ modal.error }}</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="modal.abierto = false"
            class="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-body text-sm hover:border-white/40 transition-colors">
            Cancelar
          </button>
          <button @click="guardarModal" :disabled="modal.guardando"
            class="flex-1 py-3 bg-teal text-white font-body font-semibold rounded-xl hover:bg-teal/80 transition-all disabled:opacity-50">
            {{ modal.guardando ? 'Guardando...' : (modal.modo === 'crear' ? 'Crear' : 'Guardar') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div v-if="eliminarModal.abierto" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-[#162421] border border-red-500/30 rounded-2xl p-8 w-full max-w-sm text-center">
        <p class="text-4xl mb-4">🗑️</p>
        <h2 class="font-display text-xl font-bold text-white mb-2">Eliminar categoría</h2>
        <p class="font-body text-white font-semibold mb-2">{{ eliminarModal.cat?.nombre }}</p>
        <p class="font-body text-yellow-400 text-xs mb-6">No se puede eliminar si tiene productos asociados.</p>
        <div class="flex gap-3">
          <button @click="eliminarModal.abierto = false"
            class="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-body text-sm hover:border-white/40 transition-colors">
            Cancelar
          </button>
          <button @click="eliminarCategoria" :disabled="eliminarModal.cargando"
            class="flex-1 py-3 bg-red-500 text-white font-body font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">
            {{ eliminarModal.cargando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-6 right-6 bg-teal text-white px-5 py-3 rounded-xl font-body text-sm shadow-xl">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const categorias = ref([])
const toast      = ref('')

const FORM_VACIO = () => ({ codigo: '', nombre: '' })
const modal = ref({ abierto: false, modo: 'crear', catId: null, form: FORM_VACIO(), error: '', guardando: false })
const eliminarModal = ref({ abierto: false, cat: null, cargando: false })

function abrirModalNueva() {
  modal.value = { abierto: true, modo: 'crear', catId: null, form: FORM_VACIO(), error: '', guardando: false }
}

function abrirModalEditar(c) {
  modal.value = { abierto: true, modo: 'editar', catId: c.id, form: { codigo: c.codigo, nombre: c.nombre }, error: '', guardando: false }
}

async function guardarModal() {
  modal.value.error = ''
  if (!modal.value.form.codigo.trim() || !modal.value.form.nombre.trim()) {
    modal.value.error = 'Código y nombre son obligatorios'
    return
  }
  modal.value.guardando = true
  try {
    const token = localStorage.getItem('ceketo_token')
    const headers = { Authorization: `Bearer ${token}` }
    if (modal.value.modo === 'crear') {
      const { data } = await axios.post('/api/categorias', modal.value.form, { headers })
      categorias.value.push(data)
      categorias.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
      mostrarToast('✓ Categoría creada')
    } else {
      const { data } = await axios.put(`/api/categorias/${modal.value.catId}`, modal.value.form, { headers })
      const idx = categorias.value.findIndex(c => c.id === modal.value.catId)
      if (idx !== -1) categorias.value[idx] = data
      mostrarToast('✓ Categoría actualizada')
    }
    modal.value.abierto = false
  } catch (err) {
    modal.value.error = err.response?.data?.error || 'Error al guardar'
  } finally {
    modal.value.guardando = false
  }
}

function confirmarEliminar(c) {
  eliminarModal.value = { abierto: true, cat: c, cargando: false }
}

async function eliminarCategoria() {
  eliminarModal.value.cargando = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/categorias/${eliminarModal.value.cat.id}`, { headers: { Authorization: `Bearer ${token}` } })
    categorias.value = categorias.value.filter(c => c.id !== eliminarModal.value.cat.id)
    eliminarModal.value.abierto = false
    mostrarToast('✓ Categoría eliminada')
  } catch (err) {
    mostrarToast('✗ ' + (err.response?.data?.error || 'Error al eliminar'))
    eliminarModal.value.abierto = false
  }
}

function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

onMounted(async () => {
  const { data } = await axios.get('/api/categorias')
  categorias.value = data
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
