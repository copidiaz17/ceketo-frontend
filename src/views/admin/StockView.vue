<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Stock actual</h1>
      <p class="font-body text-white/50 mt-1">Inventario de todos los productos</p>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        @click="filtroCategoria = ''"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="filtroCategoria === '' ? 'bg-teal border-teal text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-teal'"
      >Todas</button>
      <button
        v-for="cat in categorias"
        :key="cat"
        @click="filtroCategoria = cat"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="filtroCategoria === cat ? 'bg-teal border-teal text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-teal'"
      >{{ cat }}</button>

      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar..."
        class="ml-auto px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-body
               focus:outline-none focus:border-teal transition-colors placeholder-white/30"
      />
    </div>

    <!-- Tabla -->
    <div class="bg-[#162421] border border-white/10 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-white/40 border-b border-white/10 bg-white/5">
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
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-6 py-3 text-white/40 font-mono text-xs">{{ p.codigo }}</td>
              <td class="px-6 py-3 text-white">{{ p.nombre }}</td>
              <td class="px-6 py-3 text-white/50">{{ p.categoria?.nombre }}</td>
              <td class="px-6 py-3 text-right text-white/70">${{ parseFloat(p.precio).toLocaleString('es-AR') }}</td>
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
