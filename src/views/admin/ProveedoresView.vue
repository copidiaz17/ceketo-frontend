<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Proveedores</h1>
        <p class="font-body text-gray-500 mt-1">Gestión de proveedores de materias primas e insumos</p>
      </div>
      <button
        @click="abrirModal()"
        class="flex items-center gap-2 bg-keto-orange text-gray-900 px-5 py-2.5 rounded-xl font-body font-medium text-sm hover:bg-keto-orange/80 transition-colors"
      >+ Nuevo proveedor</button>
    </div>

    <!-- Lista -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="cargando" class="text-center py-16 text-gray-400 font-body">Cargando...</div>
      <div v-else-if="!proveedores.length" class="text-center py-16 text-gray-400 font-body">
        No hay proveedores cargados todavía.
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Nombre</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden sm:table-cell">Rubro</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden md:table-cell">CUIT</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden lg:table-cell">Teléfono</th>
            <th class="text-left px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider hidden lg:table-cell">Email</th>
            <th class="text-center px-6 py-4 font-body text-xs text-gray-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in proveedores"
            :key="p.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4">
              <p class="font-body text-sm font-semibold text-gray-900">{{ p.nombre }}</p>
              <p v-if="p.nota" class="font-body text-xs text-gray-400 mt-0.5 truncate max-w-xs">{{ p.nota }}</p>
            </td>
            <td class="px-6 py-4 font-body text-sm text-gray-600 hidden sm:table-cell">{{ p.rubro || '—' }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-600 hidden md:table-cell">{{ p.cuit || '—' }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-600 hidden lg:table-cell">{{ p.telefono || '—' }}</td>
            <td class="px-6 py-4 font-body text-sm text-gray-600 hidden lg:table-cell">{{ p.email || '—' }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModal(p)"
                  class="text-gray-400 hover:text-gray-900 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-gray-100"
                  title="Editar"
                >✏️</button>
                <button
                  @click="eliminar(p)"
                  class="text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-red-50"
                  title="Eliminar"
                >🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div
        v-if="modal.visible"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
          <h2 class="font-display text-xl font-bold text-gray-900 mb-6">
            {{ modal.id ? 'Editar proveedor' : 'Nuevo proveedor' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Nombre *</label>
              <input
                v-model="modal.nombre"
                type="text"
                placeholder="Razón social o nombre comercial"
                class="input-field w-full"
                autofocus
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Rubro</label>
                <input v-model="modal.rubro" type="text" placeholder="Ej: Harinas, Lácteos..." class="input-field w-full" />
              </div>
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">CUIT</label>
                <input v-model="modal.cuit" type="text" placeholder="20-12345678-9" class="input-field w-full" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                <input v-model="modal.telefono" type="text" placeholder="Ej: 385-4123456" class="input-field w-full" />
              </div>
              <div>
                <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input v-model="modal.email" type="email" placeholder="Opcional" class="input-field w-full" />
              </div>
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Nota</label>
              <textarea
                v-model="modal.nota"
                rows="2"
                placeholder="Observaciones, condiciones de pago, etc."
                class="input-field w-full resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button
              @click="guardar"
              :disabled="modal.guardando || !modal.nombre.trim()"
              class="flex-1 bg-teal text-gray-900 py-3 rounded-xl font-body font-medium text-sm hover:bg-teal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >{{ modal.guardando ? 'Guardando...' : (modal.id ? 'Guardar cambios' : 'Crear proveedor') }}</button>
            <button
              @click="cerrarModal"
              class="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-body text-sm transition-colors"
            >Cancelar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const proveedores = ref([])
const cargando    = ref(true)

const modal = ref({
  visible: false, id: null, guardando: false,
  nombre: '', rubro: '', cuit: '', telefono: '', email: '', nota: '',
})

async function cargar() {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/proveedores')
    proveedores.value = data
  } catch {}
  cargando.value = false
}

function abrirModal(p = null) {
  if (p) {
    modal.value = {
      visible: true, id: p.id, guardando: false,
      nombre: p.nombre || '', rubro: p.rubro || '', cuit: p.cuit || '',
      telefono: p.telefono || '', email: p.email || '', nota: p.nota || '',
    }
  } else {
    modal.value = {
      visible: true, id: null, guardando: false,
      nombre: '', rubro: '', cuit: '', telefono: '', email: '', nota: '',
    }
  }
}

function cerrarModal() { modal.value.visible = false }

async function guardar() {
  const m = modal.value
  if (!m.nombre.trim()) return
  m.guardando = true
  try {
    const body = { nombre: m.nombre.trim(), rubro: m.rubro, cuit: m.cuit, telefono: m.telefono, email: m.email, nota: m.nota }
    if (m.id) {
      await axios.put(`/api/proveedores/${m.id}`, body)
    } else {
      await axios.post('/api/proveedores', body)
    }
    cerrarModal()
    await cargar()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar')
  } finally { m.guardando = false }
}

async function eliminar(p) {
  if (!confirm(`¿Eliminar el proveedor "${p.nombre}"?`)) return
  try {
    await axios.delete(`/api/proveedores/${p.id}`)
    await cargar()
  } catch {
    alert('Error al eliminar')
  }
}

onMounted(cargar)
</script>

<style scoped>
.input-field {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  color: #111827;
  font-size: 0.875rem;
  font-family: Inter, sans-serif;
  transition: border-color 0.2s;
}
.input-field:focus { outline: none; border-color: #2A9D8F; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
