<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Carga de Producción</h1>
      <p class="font-body text-gray-500 mt-1">Registrá los productos que llegan de fábrica al negocio</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Formulario de carga -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Agregar ítem</h2>

        <!-- Selector de producto -->
        <div class="mb-4">
          <label class="block font-body text-sm text-gray-500 mb-2">Producto</label>
          <ProductSelect
            v-model="selectedId"
            :grupos="categoriasConProductos"
          />
        </div>

        <!-- Cantidad -->
        <div class="mb-4">
          <label class="block font-body text-sm text-gray-500 mb-2">Cantidad</label>
          <input
            v-model.number="cantidad"
            type="number"
            min="1"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                   focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <button
          @click="agregarItem"
          :disabled="!selectedId || !cantidad"
          class="w-full py-3 bg-teal text-gray-800 font-body font-medium rounded-xl
                 hover:bg-teal/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Agregar al lote
        </button>
      </div>

      <!-- Lote actual -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">
          Lote del día
          <span class="ml-2 text-sm font-body text-gray-400">{{ hoy }}</span>
        </h2>

        <div v-if="lote.length === 0" class="text-center py-10 text-gray-400 font-body">
          Sin productos agregados todavía
        </div>

        <div v-else class="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="(item, i) in lote"
            :key="i"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ item.nombre }}</p>
              <p class="font-body text-xs text-gray-400">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-display text-xl font-bold text-teal">×{{ item.cantidad }}</span>
              <button
                @click="lote.splice(i, 1)"
                class="text-gray-400 hover:text-red-400 transition-colors text-lg"
              >✕</button>
            </div>
          </div>
        </div>

        <div v-if="lote.length > 0">
          <!-- Nota opcional -->
          <textarea
            v-model="nota"
            rows="2"
            placeholder="Nota opcional..."
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm
                   focus:outline-none focus:border-teal transition-colors mb-4 resize-none placeholder-gray-400"
          ></textarea>

          <button
            @click="confirmarProduccion"
            :disabled="enviando"
            class="w-full py-3 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviando ? 'Guardando...' : '✓ Confirmar producción' }}
          </button>

          <div class="flex gap-2 mt-3">
            <button
              @click="exportarPDF"
              class="flex-1 py-3 border border-gray-200 text-gray-600 font-body text-sm font-medium rounded-xl
                     hover:border-gray-400 hover:text-gray-900 transition-colors"
            >🖨️ Imprimir</button>
            <button
              @click="descargarPDF"
              class="flex-1 py-3 border border-brand-green text-brand-green font-body text-sm font-medium rounded-xl
                     hover:bg-brand-green hover:text-white transition-colors"
            >⬇️ Descargar PDF</button>
          </div>

          <p v-if="mensajeOk" class="text-teal text-sm text-center mt-3 font-body">{{ mensajeOk }}</p>
          <p v-if="mensajeErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ mensajeErr }}</p>
        </div>
      </div>
    </div>

    <!-- Historial de lotes -->
    <div class="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Historial de lotes</h2>
      <div v-if="lotes.length === 0" class="text-gray-400 font-body text-sm">Sin registros</div>
      <div v-else class="space-y-3">
        <div
          v-for="lote in lotes"
          :key="lote.lote_id"
          class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
        >
          <div>
            <p class="font-body text-sm font-semibold text-gray-900">
              Producción del {{ formatFecha(lote.fecha) }}
            </p>
            <p class="font-body text-xs text-gray-400">
              {{ lote.items.length }} producto(s) · {{ lote.total_unidades }} unidades totales
              <span v-if="lote.nota"> · {{ lote.nota }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="abrirDetalleLote(lote)"
              class="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-body hover:border-teal hover:text-teal transition-colors"
            >Ver</button>
            <button
              @click="confirmarEliminarLote(lote)"
              class="px-3 py-1 rounded-lg border border-red-200 text-red-400 text-xs font-body hover:bg-red-50 transition-colors"
            >Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal detalle de lote -->
  <div v-if="loteDetalle" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="font-display text-xl font-bold text-gray-900">Producción {{ formatFecha(loteDetalle.fecha) }}</h2>
          <p class="font-body text-sm text-gray-400">{{ loteDetalle.items.length }} productos · {{ loteDetalle.total_unidades }} unidades</p>
        </div>
        <button @click="loteDetalle = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>

      <div class="space-y-2 mb-4">
        <div
          v-for="item in loteDetalle.items"
          :key="item.id"
          class="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2"
        >
          <div>
            <p class="font-body text-sm text-gray-900">{{ item.producto?.nombre }}</p>
            <p class="font-body text-xs text-gray-400 font-mono">{{ item.producto?.codigo }}</p>
          </div>
          <span class="font-display text-lg font-bold text-teal">×{{ item.cantidad }}</span>
        </div>
      </div>

      <div class="flex gap-2 mt-4">
        <button
          @click="descargarPDFLote(loteDetalle)"
          class="flex-1 py-2 border border-brand-green text-brand-green font-body text-sm rounded-xl hover:bg-brand-green hover:text-white transition-colors"
        >⬇️ Descargar PDF</button>
        <button
          @click="confirmarEliminarLote(loteDetalle); loteDetalle = null"
          class="flex-1 py-2 border border-red-200 text-red-400 font-body text-sm rounded-xl hover:bg-red-50 transition-colors"
        >Eliminar lote</button>
      </div>
    </div>
  </div>

  <!-- Modal confirmar eliminación de lote -->
  <div v-if="loteAEliminar" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
      <h2 class="font-display text-lg font-bold text-gray-900 mb-2">Eliminar lote</h2>
      <p class="font-body text-sm text-gray-600 mb-1">Producción del <strong>{{ formatFecha(loteAEliminar.fecha) }}</strong></p>
      <p class="font-body text-sm text-red-400 mb-6">
        Se revertirán <strong>{{ loteAEliminar.total_unidades }}</strong> unidades del stock de {{ loteAEliminar.items.length }} producto(s). Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button @click="loteAEliminar = null" class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors">Cancelar</button>
        <button @click="eliminarLote" :disabled="eliminando" class="flex-1 py-3 bg-red-500 text-white font-body text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
          {{ eliminando ? 'Eliminando...' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import ProductSelect from '@/components/admin/ProductSelect.vue'

const productos        = ref([])
const selectedId       = ref('')
const cantidad         = ref(1)
const nota             = ref('')
const lote             = ref([])
const lotes            = ref([])
const enviando         = ref(false)
const mensajeOk        = ref('')
const mensajeErr       = ref('')
const loteDetalle      = ref(null)
const loteAEliminar    = ref(null)
const eliminando       = ref(false)

const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

function formatFecha(f) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Agrupar por categoría para el select
const categoriasConProductos = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    const key = p.categoria?.codigo || 'SIN'
    if (!mapa[key]) mapa[key] = { codigo: key, nombre: p.categoria?.nombre || 'Sin categoría', productos: [] }
    mapa[key].productos.push(p)
  }
  return Object.values(mapa)
})

function agregarItem() {
  if (!selectedId.value || !cantidad.value) return
  const prod = productos.value.find(p => p.id === selectedId.value)
  if (!prod) return
  const existente = lote.value.find(i => i.producto_id === selectedId.value)
  if (existente) {
    existente.cantidad += cantidad.value
  } else {
    lote.value.push({
      producto_id: selectedId.value,
      nombre:      prod.nombre,
      codigo:      prod.codigo,
      cantidad:    cantidad.value,
    })
  }
  selectedId.value = ''
  cantidad.value   = 1
}

async function confirmarProduccion() {
  if (!lote.value.length) return
  enviando.value  = true
  mensajeOk.value = ''
  mensajeErr.value = ''
  try {
    const token   = localStorage.getItem('ceketo_token')
    const lote_id = crypto.randomUUID()
    await axios.post('/api/produccion', {
      lote_id,
      items: lote.value.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      nota: nota.value || undefined,
    }, { headers: { Authorization: `Bearer ${token}` } })
    mensajeOk.value = `✓ ${lote.value.length} producto(s) registrado(s) correctamente`
    lote.value  = []
    nota.value  = ''
    cargarLotes()
    cargarProductos()
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    enviando.value = false
    setTimeout(() => { mensajeOk.value = ''; mensajeErr.value = '' }, 5000)
  }
}

function generarRemitoHTML(conScript = false) {
  // Agrupar por categoría
  const grupos = {}
  for (const item of lote.value) {
    const prod = productos.value.find(p => p.id === item.producto_id)
    const cat  = prod?.categoria?.nombre || 'Sin categoría'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(item)
  }

  const totalItems = lote.value.reduce((acc, i) => acc + i.cantidad, 0)

  function copiaHTML(titulo) {
    let rows = ''
    let n = 1
    for (const [cat, items] of Object.entries(grupos)) {
      rows += `<tr class="cat-row"><td colspan="4">${cat.toUpperCase()}</td></tr>`
      for (const item of items) {
        rows += `
          <tr>
            <td class="num">${n++}</td>
            <td class="cod">${item.codigo}</td>
            <td>${item.nombre}</td>
            <td class="cant">${item.cantidad}</td>
          </tr>`
      }
    }

    return `
      <div class="copia">
        <div class="header">
          <div class="left">
            <div class="empresa">CEKETO</div>
            <div class="sub">Independencia 663, Santiago del Estero</div>
          </div>
          <div class="right">
            <div class="titulo">${titulo}</div>
            <div class="fecha">Fecha: ${hoy}</div>
          </div>
        </div>
        <div class="subtitulo">REMITO DE PRODUCCIÓN</div>
        <table>
          <thead>
            <tr>
              <th class="num">#</th>
              <th class="cod">Código</th>
              <th>Producto</th>
              <th class="cant">Cant.</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <div class="total">Total de unidades: <strong>${totalItems}</strong></div>
          <div class="firmas">
            <div class="firma">
              <div class="linea"></div>
              <div>Entregado por</div>
            </div>
            <div class="firma">
              <div class="linea"></div>
              <div>Recibido por</div>
            </div>
          </div>
          ${nota.value ? `<div class="nota">Nota: ${nota.value}</div>` : ''}
        </div>
      </div>`
  }

  const estilos = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
  .copia { padding: 20mm 15mm; min-height: 48vh; display: flex; flex-direction: column; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 2px solid #058D76; padding-bottom: 10px; }
  .empresa { font-size: 26px; font-weight: bold; color: #058D76; letter-spacing: 3px; }
  .sub { font-size: 10px; color: #666; margin-top: 3px; }
  .titulo { font-size: 14px; font-weight: bold; background: #058D76; color: white; padding: 4px 12px; border-radius: 4px; text-align: center; }
  .fecha { font-size: 11px; color: #666; margin-top: 5px; text-align: right; }

  .subtitulo { font-size: 13px; font-weight: bold; text-align: center; margin: 12px 0 10px; letter-spacing: 2px; color: #333; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  th { background: #f5f5f5; border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
  td { border: 1px solid #eee; padding: 5px 8px; font-size: 11px; }
  .cat-row td { background: #E8F5F0; font-weight: bold; font-size: 11px; color: #058D76; padding: 5px 8px; }
  .num { width: 30px; text-align: center; }
  .cod { width: 90px; font-family: monospace; }
  .cant { width: 50px; text-align: center; font-weight: bold; }

  .footer { margin-top: auto; }
  .total { font-size: 12px; font-weight: bold; text-align: right; margin-bottom: 20px; }
  .firmas { display: flex; justify-content: space-around; margin-top: 30px; }
  .firma { text-align: center; font-size: 11px; color: #555; }
  .linea { border-top: 1px solid #000; width: 120px; margin-bottom: 5px; }
  .nota { margin-top: 12px; font-size: 11px; color: #555; border-top: 1px dashed #ccc; padding-top: 8px; }

  .corte { border-top: 2px dashed #ccc; margin: 0 15mm; }

  @media print {
    @page { margin: 0; size: A4; }
    .copia { min-height: 48vh; }
    .corte { border-top: 2px dashed #ccc; }
  }`

  const body = `
  ${copiaHTML('COPIA LOCAL')}
  <div class="corte"></div>
  ${copiaHTML('COPIA FÁBRICA')}`

  return { estilos, body }
}

function exportarPDF() {
  if (!lote.value.length) return
  const { estilos, body } = generarRemitoHTML()
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${estilos}</style></head><body>${body}<script>window.onload=function(){window.print()}<\/script></body></html>`
  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
}

async function descargarPDF() {
  if (!lote.value.length) return
  const { estilos, body } = generarRemitoHTML()
  const el = document.createElement('div')
  el.innerHTML = `<style>${estilos}</style>${body}`
  el.style.width = '210mm'
  document.body.appendChild(el)
  await html2pdf().set({
    margin: 0,
    filename: `remito-produccion-${hoy}.pdf`,
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save()
  document.body.removeChild(el)
}

function abrirDetalleLote(l) { loteDetalle.value = l }
function confirmarEliminarLote(l) { loteAEliminar.value = l }

async function eliminarLote() {
  if (!loteAEliminar.value) return
  eliminando.value = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/produccion/lote/${loteAEliminar.value.lote_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    loteAEliminar.value = null
    await cargarLotes()
    await cargarProductos()
    mensajeOk.value = '✓ Lote eliminado y stock revertido'
    setTimeout(() => { mensajeOk.value = '' }, 4000)
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al eliminar'
    setTimeout(() => { mensajeErr.value = '' }, 4000)
  } finally {
    eliminando.value = false
  }
}

function descargarPDFLote(l) {
  // Simular lote temporal para reutilizar generarRemitoHTML
  const loteBackup = lote.value
  lote.value = l.items.map(i => ({
    producto_id: i.producto_id,
    nombre: i.producto?.nombre,
    codigo: i.producto?.codigo,
    cantidad: i.cantidad,
  }))
  const notaBackup = nota.value
  nota.value = l.nota || ''
  descargarPDF()
  lote.value = loteBackup
  nota.value = notaBackup
}

async function cargarProductos() {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
}

async function cargarLotes() {
  try {
    const { data } = await axios.get('/api/produccion/lotes')
    lotes.value = data
  } catch { lotes.value = [] }
}

onMounted(async () => {
  await cargarProductos()
  await cargarLotes()
})
</script>
