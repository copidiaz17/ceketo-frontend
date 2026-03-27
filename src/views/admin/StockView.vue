<template>
  <div class="p-8">
    <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Stock actual</h1>
        <p class="font-body text-gray-500 mt-1">Inventario de todos los productos</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="imprimir"
          class="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-body text-sm font-medium hover:bg-gray-200 transition-colors"
        >🖨️ Imprimir</button>
        <button
          @click="descargarPDF"
          class="flex items-center gap-2 px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors"
        >📄 Descargar PDF</button>
      </div>
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
              <th class="text-center px-6 py-4">Ajuste</th>
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
              <td class="px-6 py-3 text-center">
                <button
                  @click="abrirAjuste(p)"
                  class="px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-teal hover:text-white transition-colors font-medium"
                >✏️ Editar</button>
                <button
                  @click="abrirHistorial(p)"
                  class="ml-1 px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors font-medium"
                >📋 Historial</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal Ajuste de Stock -->
  <div v-if="modalAjuste" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <h2 class="font-display text-xl font-bold text-gray-900 mb-1">Ajuste de Stock</h2>
      <p class="text-sm text-gray-500 mb-6 font-body">{{ productoAjuste?.nombre }}</p>

      <div class="space-y-4">
        <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
          <div class="text-center flex-1">
            <div class="text-xs text-gray-400 mb-1">Stock actual</div>
            <div class="text-2xl font-bold text-gray-700">{{ productoAjuste?.stock }}</div>
          </div>
          <div class="text-gray-300 text-2xl">→</div>
          <div class="text-center flex-1">
            <div class="text-xs text-gray-400 mb-1">Stock nuevo</div>
            <div class="text-2xl font-bold"
              :class="ajusteForm.stock_nuevo === '' ? 'text-gray-300' :
                Number(ajusteForm.stock_nuevo) === productoAjuste?.stock ? 'text-gray-500' :
                Number(ajusteForm.stock_nuevo) > productoAjuste?.stock ? 'text-teal' : 'text-red-400'">
              {{ ajusteForm.stock_nuevo === '' ? '—' : ajusteForm.stock_nuevo }}
            </div>
          </div>
          <div v-if="ajusteForm.stock_nuevo !== '' && Number(ajusteForm.stock_nuevo) !== productoAjuste?.stock"
            class="text-center flex-1">
            <div class="text-xs text-gray-400 mb-1">Diferencia</div>
            <div class="text-2xl font-bold"
              :class="Number(ajusteForm.stock_nuevo) > productoAjuste?.stock ? 'text-teal' : 'text-red-400'">
              {{ Number(ajusteForm.stock_nuevo) > productoAjuste?.stock ? '+' : '' }}{{ Number(ajusteForm.stock_nuevo) - productoAjuste?.stock }}
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 font-body">Nuevo stock *</label>
          <input
            v-model="ajusteForm.stock_nuevo"
            type="number"
            min="0"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 font-body text-sm focus:outline-none focus:border-teal"
            placeholder="Ingresá el nuevo stock"
            @keydown.enter="guardarAjuste"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 font-body">Observación (opcional)</label>
          <textarea
            v-model="ajusteForm.observacion"
            rows="2"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 font-body text-sm focus:outline-none focus:border-teal resize-none"
            placeholder="Ej: conteo físico, devolución, etc."
          ></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="modalAjuste = false"
          class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-body text-sm hover:bg-gray-50 transition-colors"
        >Cancelar</button>
        <button
          @click="guardarAjuste"
          :disabled="ajusteForm.stock_nuevo === '' || guardandoAjuste"
          class="flex-1 px-4 py-2.5 rounded-xl bg-teal text-white font-body text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-40"
        >{{ guardandoAjuste ? 'Guardando...' : 'Guardar ajuste' }}</button>
      </div>
    </div>
  </div>

  <!-- Modal Historial de Ajustes -->
  <div v-if="modalHistorial" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-display text-xl font-bold text-gray-900">Historial de ajustes</h2>
          <p class="text-sm text-gray-500 font-body">{{ productoHistorial?.nombre }}</p>
        </div>
        <button @click="modalHistorial = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
      </div>

      <div class="overflow-y-auto flex-1">
        <div v-if="cargandoHistorial" class="text-center text-gray-400 py-8 font-body">Cargando...</div>
        <div v-else-if="historialAjustes.length === 0" class="text-center text-gray-400 py-8 font-body">
          Sin ajustes registrados
        </div>
        <table v-else class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-100 text-xs">
              <th class="text-left py-2 px-3">Fecha</th>
              <th class="text-center py-2 px-3">Anterior</th>
              <th class="text-center py-2 px-3">Nuevo</th>
              <th class="text-center py-2 px-3">Dif.</th>
              <th class="text-left py-2 px-3">Obs.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in historialAjustes" :key="a.id" class="border-b border-gray-50">
              <td class="py-2 px-3 text-gray-400 text-xs whitespace-nowrap">{{ formatFecha(a.createdAt) }}</td>
              <td class="py-2 px-3 text-center text-gray-600">{{ a.stock_anterior }}</td>
              <td class="py-2 px-3 text-center font-bold text-gray-900">{{ a.stock_nuevo }}</td>
              <td class="py-2 px-3 text-center font-bold text-xs"
                :class="a.diferencia > 0 ? 'text-teal' : a.diferencia < 0 ? 'text-red-400' : 'text-gray-400'">
                {{ a.diferencia > 0 ? '+' : '' }}{{ a.diferencia }}
              </td>
              <td class="py-2 px-3 text-gray-500 text-xs">{{ a.observacion || '—' }}</td>
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
import html2pdf from 'html2pdf.js'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const productos        = ref([])
const filtroCategoria  = ref('')
const busqueda         = ref('')

// Ajuste de stock
const modalAjuste     = ref(false)
const productoAjuste  = ref(null)
const guardandoAjuste = ref(false)
const ajusteForm      = ref({ stock_nuevo: '', observacion: '' })

// Historial
const modalHistorial    = ref(false)
const productoHistorial = ref(null)
const historialAjustes  = ref([])
const cargandoHistorial = ref(false)

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
      if ((a.stock > 0) === (b.stock > 0)) return a.nombre.localeCompare(b.nombre)
      return b.stock > 0 ? 1 : -1
    })
})

function abrirAjuste(p) {
  productoAjuste.value = { ...p }
  ajusteForm.value = { stock_nuevo: p.stock, observacion: '' }
  modalAjuste.value = true
}

async function guardarAjuste() {
  if (ajusteForm.value.stock_nuevo === '' || guardandoAjuste.value) return
  guardandoAjuste.value = true
  try {
    const { data } = await axios.put(`/api/productos/${productoAjuste.value.id}/ajuste-stock`, {
      stock_nuevo: Number(ajusteForm.value.stock_nuevo),
      observacion: ajusteForm.value.observacion || null,
      usuario: auth.user?.nombre || auth.user?.email || null,
    })
    // Actualizar stock en lista local
    const idx = productos.value.findIndex(p => p.id === productoAjuste.value.id)
    if (idx !== -1) productos.value[idx].stock = data.stock
    modalAjuste.value = false
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar ajuste')
  } finally {
    guardandoAjuste.value = false
  }
}

async function abrirHistorial(p) {
  productoHistorial.value = p
  historialAjustes.value = []
  modalHistorial.value = true
  cargandoHistorial.value = true
  try {
    const { data } = await axios.get(`/api/productos/${p.id}/ajustes`)
    historialAjustes.value = data
  } catch {
    historialAjustes.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

function formatFecha(iso) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

function buildHTMLContent() {
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora  = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const conStock      = productosFiltrados.value.filter(p => p.stock > 0).length
  const sinStock      = productosFiltrados.value.filter(p => p.stock === 0).length
  const totalUnidades = productosFiltrados.value.reduce((a, p) => a + p.stock, 0)

  const filas = productosFiltrados.value.map(p => {
    const stockColor = p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#eab308' : '#2a9d8f'
    return `<tr>
      <td>${p.codigo}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria?.nombre || '—'}</td>
      <td class="right">$${parseFloat(p.precio).toLocaleString('es-AR')}</td>
      <td class="right" style="color:${stockColor};font-weight:bold">${p.stock}</td>
    </tr>`
  }).join('')

  return { fecha, hora, conStock, sinStock, totalUnidades, filas }
}

function buildHTML() {
  const { fecha, hora, conStock, sinStock, totalUnidades, filas } = buildHTMLContent()
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
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
  .footer { margin-top: 16px; font-size: 10px; color: #999; text-align: right; }
  @media print { @page { margin: 15mm; size: A4; } }
</style></head><body>
  <h1>CEKETO — Stock actual</h1>
  <div class="sub">Generado el ${fecha} a las ${hora} hs${filtroCategoria.value ? ' · Categoría: ' + filtroCategoria.value : ''}</div>
  <div class="resumen">
    <div>Total productos<br><span>${productosFiltrados.value.length}</span></div>
    <div>Con stock<br><span style="color:#2a9d8f">${conStock}</span></div>
    <div>Sin stock<br><span style="color:#ef4444">${sinStock}</span></div>
    <div>Total unidades<br><span>${totalUnidades.toLocaleString('es-AR')}</span></div>
  </div>
  <table>
    <thead><tr>
      <th>Código</th><th>Nombre</th><th>Categoría</th>
      <th class="right">Precio</th><th class="right">Stock</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="footer">CEKETO · Independencia 663, Santiago del Estero</div>
</body></html>`
}

function imprimir() {
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(buildHTML())
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

function descargarPDF() {
  const { fecha, hora, conStock, sinStock, totalUnidades, filas } = buildHTMLContent()

  const el = document.createElement('div')
  el.style.cssText = 'font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px;width:190mm'
  el.innerHTML = `
    <h1 style="font-size:20px;font-weight:bold;margin-bottom:2px">CEKETO — Stock actual</h1>
    <p style="font-size:11px;color:#666;margin-bottom:16px">
      Generado el ${fecha} a las ${hora} hs${filtroCategoria.value ? ' · Categoría: ' + filtroCategoria.value : ''}
    </p>
    <div style="display:flex;gap:24px;margin-bottom:16px;background:#f9fafb;padding:10px 14px;border-radius:8px">
      <div>Total productos<br><strong style="font-size:13px">${productosFiltrados.value.length}</strong></div>
      <div>Con stock<br><strong style="font-size:13px;color:#2a9d8f">${conStock}</strong></div>
      <div>Sin stock<br><strong style="font-size:13px;color:#ef4444">${sinStock}</strong></div>
      <div>Total unidades<br><strong style="font-size:13px">${totalUnidades.toLocaleString('es-AR')}</strong></div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead>
        <tr style="background:#2a9d8f;color:white">
          <th style="padding:7px 8px;text-align:left">Código</th>
          <th style="padding:7px 8px;text-align:left">Nombre</th>
          <th style="padding:7px 8px;text-align:left">Categoría</th>
          <th style="padding:7px 8px;text-align:right">Precio</th>
          <th style="padding:7px 8px;text-align:right">Stock</th>
        </tr>
      </thead>
      <tbody>${
        productosFiltrados.value.map((p, i) => {
          const stockColor = p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#eab308' : '#2a9d8f'
          const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb'
          return `<tr style="background:${bg}">
            <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:10px">${p.codigo}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb">${p.nombre}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;color:#555">${p.categoria?.nombre || '—'}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right">$${parseFloat(p.precio).toLocaleString('es-AR')}</td>
            <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;color:${stockColor}">${p.stock}</td>
          </tr>`
        }).join('')
      }</tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#999;text-align:right">CEKETO · Independencia 663, Santiago del Estero</p>
  `

  document.body.appendChild(el)
  html2pdf()
    .set({
      margin:      [8, 8, 8, 8],
      filename:    `stock-ceketo-${fecha.replace(/\//g, '-')}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save()
    .then(() => document.body.removeChild(el))
}

onMounted(async () => {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
})
</script>
