<template>
  <div class="p-8">
    <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Stock actual</h1>
        <p class="font-body text-gray-500 mt-1">Inventario de todos los productos</p>
      </div>
      <button
        @click="descargarPDF"
        class="flex items-center gap-2 px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors"
      >
        📄 Descargar PDF
      </button>
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
  return productos.value
    .filter(p => {
      const matchCat  = !filtroCategoria.value || p.categoria?.nombre === filtroCategoria.value
      const matchBusq = !busqueda.value ||
        p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.value.toLowerCase())
      return matchCat && matchBusq
    })
    .sort((a, b) => {
      // Con stock primero, sin stock al final; dentro de cada grupo orden alfabético
      if ((a.stock > 0) === (b.stock > 0)) return a.nombre.localeCompare(b.nombre)
      return b.stock > 0 ? 1 : -1
    })
})

function descargarPDF() {
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora  = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const filas = productosFiltrados.value.map(p => {
    const stockColor = p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#eab308' : '#2a9d8f'
    return `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.categoria?.nombre || '—'}</td>
        <td class="right">$${parseFloat(p.precio).toLocaleString('es-AR')}</td>
        <td class="right stock" style="color:${stockColor}">${p.stock}</td>
      </tr>`
  }).join('')

  const conStock    = productosFiltrados.value.filter(p => p.stock > 0).length
  const sinStock    = productosFiltrados.value.filter(p => p.stock === 0).length
  const totalUnidades = productosFiltrados.value.reduce((a, p) => a + p.stock, 0)

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 20px; }
  h1 { font-size: 20px; font-weight: bold; margin-bottom: 2px; }
  .sub { font-size: 11px; color: #666; margin-bottom: 16px; }
  .resumen { display: flex; gap: 24px; margin-bottom: 16px; background: #f9fafb; padding: 10px 14px; border-radius: 8px; }
  .resumen div { font-size: 11px; color: #444; }
  .resumen span { font-weight: bold; font-size: 13px; color: #111; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #2a9d8f; color: white; }
  th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; }
  th.right, td.right { text-align: right; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .stock { font-weight: bold; }
  .sin-stock td { background: #fef2f2 !important; }
  .footer { margin-top: 16px; font-size: 10px; color: #999; text-align: right; }
  @media print { @page { margin: 15mm; size: A4; } }
</style>
</head><body>
  <h1>CEKETO — Stock actual</h1>
  <div class="sub">Generado el ${fecha} a las ${hora} hs${filtroCategoria.value ? ' · Categoría: ' + filtroCategoria.value : ''}</div>
  <div class="resumen">
    <div>Total productos<br><span>${productosFiltrados.value.length}</span></div>
    <div>Con stock<br><span style="color:#2a9d8f">${conStock}</span></div>
    <div>Sin stock<br><span style="color:#ef4444">${sinStock}</span></div>
    <div>Total unidades<br><span>${totalUnidades.toLocaleString('es-AR')}</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th class="right">Precio</th>
        <th class="right">Stock</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="footer">CEKETO · Independencia 663, Santiago del Estero</div>
</body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

onMounted(async () => {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
})
</script>
