<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Pedidos Online</h1>
      <p class="font-body text-gray-500 mt-1">Gestión de pedidos del ecommerce</p>
    </div>

    <!-- Filtro por estado -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="e in estados"
        :key="e.val"
        @click="filtroEstado = e.val"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="filtroEstado === e.val ? 'bg-teal border-teal text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal'"
      >{{ e.label }}</button>
    </div>

    <!-- Lista de pedidos -->
    <div class="space-y-4">
      <div v-if="pedidosFiltrados.length === 0" class="text-center py-16 text-gray-400 font-body">
        Sin pedidos {{ filtroEstado !== 'todos' ? 'con estado "' + filtroEstado + '"' : '' }}
      </div>

      <div
        v-for="p in pedidosFiltrados"
        :key="p.id"
        class="bg-white border border-gray-200 rounded-2xl p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="font-display text-gray-900 font-semibold">Pedido #{{ p.id }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-body"
                :class="colorEstado(p.estado)"
              >{{ p.estado }}</span>
            </div>
            <p class="font-body text-sm text-gray-500">
              {{ p.nombre }} · {{ p.telefono }}
              <span v-if="p.email"> · {{ p.email }}</span>
            </p>
            <p v-if="p.direccion" class="font-body text-xs text-gray-400 mt-0.5">
              {{ p.direccion }}, {{ p.localidad }}
            </p>
            <p class="font-body text-xs text-gray-400 mt-0.5">{{ formatFecha(p.fecha) }} · {{ p.metodo_pago }}</p>
          </div>
          <div class="text-right">
            <p class="font-display text-2xl font-bold text-teal">${{ parseFloat(p.total).toLocaleString('es-AR') }}</p>
            <!-- Cambiar estado -->
            <select
              :value="p.estado"
              @change="cambiarEstado(p, $event.target.value)"
              class="mt-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 font-body text-xs focus:outline-none focus:border-teal"
            >
              <option v-for="e in estadosSelect" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t border-gray-200 pt-3 flex flex-wrap gap-2">
          <span
            v-for="item in p.items"
            :key="item.id"
            class="bg-gray-50 rounded-lg px-3 py-1.5 font-body text-xs text-gray-500"
          >
            {{ item.producto?.nombre }} ×{{ item.cantidad }}
          </span>
        </div>

        <p v-if="p.nota" class="font-body text-xs text-gray-400 mt-3 italic">Nota: {{ p.nota }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const pedidos      = ref([])
const filtroEstado = ref('todos')

const estados = [
  { val: 'todos',         label: 'Todos' },
  { val: 'pendiente',     label: 'Pendiente' },
  { val: 'en_preparacion',label: 'En preparación' },
  { val: 'listo',         label: 'Listo' },
  { val: 'enviado',       label: 'Enviado' },
  { val: 'entregado',     label: 'Entregado' },
  { val: 'cancelado',     label: 'Cancelado' },
]
const estadosSelect = ['pendiente', 'en_preparacion', 'listo', 'enviado', 'entregado', 'cancelado']

const pedidosFiltrados = computed(() =>
  filtroEstado.value === 'todos'
    ? pedidos.value
    : pedidos.value.filter(p => p.estado === filtroEstado.value)
)

function colorEstado(estado) {
  const map = {
    pendiente:      'bg-yellow-500/20 text-yellow-300',
    en_preparacion: 'bg-blue-500/20 text-blue-300',
    listo:          'bg-teal/20 text-teal',
    enviado:        'bg-purple-500/20 text-purple-300',
    entregado:      'bg-green-600/20 text-green-400',
    cancelado:      'bg-red-500/20 text-red-400',
  }
  return map[estado] || 'bg-gray-100 text-gray-500'
}

function formatFecha(f) {
  return new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function cambiarEstado(pedido, nuevoEstado) {
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.patch(`/api/pedidos/${pedido.id}/estado`, { estado: nuevoEstado }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    pedido.estado = nuevoEstado
  } catch { alert('Error al actualizar estado') }
}

onMounted(async () => {
  const { data } = await axios.get('/api/pedidos')
  pedidos.value = data
})
</script>
