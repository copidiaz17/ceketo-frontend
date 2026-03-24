<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Stock actual</h1>
      <p class="font-body text-gray-500 mt-1">Inventario de todos los productos</p>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        @click="filtroCategoria = ''"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="filtroCategoria === '' ? 'bg-teal border-teal text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal'"
      >Todas</button>
      <button
        v-for="cat in categorias"
        :key="cat"
        @click="filtroCategoria = cat"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="filtroCategoria === cat ? 'bg-teal border-teal text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal'"
      >{{ cat }}</button>

      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar..."
        class="ml-auto px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-body
               focus:outline-none focus:border-teal transition-colors placeholder-gray-400"
      />
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200 bg-gray-50">
              <th class="text-left px-6 py-4">Código</th>
              <th class="text-left px-6 py-4">Nombre</th>
              <th class="text-left px-6 py-4">Categoría</th>
              <th class="text-right px-6 py-4">Precio</th>
              <th class="text-right px-6 py-4">Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in productosFiltrados"
              :key="p.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-400 font-mono text-xs">{{ p.codigo }}</td>
              <td class="px-6 py-3 text-gray-900">{{ p.nombre }}</td>
              <td class="px-6 py-3 text-gray-500">{{ p.categoria?.nombre }}</td>
              <td class="px-6 py-3 text-right text-gray-600">${{ parseFloat(p.precio).toLocaleString('es-AR') }}</td>
              <td class="px-6 py-3 text-right font-bold"
                :class="p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-teal'">
                {{ p.stock }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const productos        = ref([])
const filtroCategoria  = ref('')
const busqueda         = ref('')

const categorias = computed(() => {
  const set = new Set(productos.value.map(p => p.categoria?.nombre).filter(Boolean))
  return [...set].sort()
})

const productosFiltrados = computed(() => {
  return productos.value.filter(p => {
    const matchCat   = !filtroCategoria.value || p.categoria?.nombre === filtroCategoria.value
    const matchBusq  = !busqueda.value ||
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.value.toLowerCase())
    return matchCat && matchBusq
  })
})

onMounted(async () => {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
})
</script>
