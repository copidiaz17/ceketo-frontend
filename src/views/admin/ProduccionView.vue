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

          <button
            @click="exportarPDF"
            class="w-full mt-3 py-3 border border-gray-200 text-gray-600 font-body text-sm font-medium rounded-xl
                   hover:border-gray-400 hover:text-gray-900 transition-colors"
          >🖨️ Imprimir remito (2 copias)</button>

          <p v-if="mensajeOk" class="text-teal text-sm text-center mt-3 font-body">{{ mensajeOk }}</p>
          <p v-if="mensajeErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ mensajeErr }}</p>
        </div>
      </div>
    </div>

    <!-- Historial reciente -->
    <div class="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Historial reciente</h2>
      <div v-if="historial.length === 0" class="text-gray-400 font-body text-sm">Sin registros</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200">
              <th class="text-left pb-3 pr-4">Fecha</th>
              <th class="text-left pb-3 pr-4">Código</th>
              <th class="text-left pb-3 pr-4">Producto</th>
              <th class="text-right pb-3 pr-4">Cantidad</th>
              <th class="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in historial"
              :key="r.id"
              class="border-b border-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <td class="py-3 pr-4">{{ r.fecha }}</td>
              <td class="py-3 pr-4 text-teal font-mono text-xs">{{ r.producto?.codigo }}</td>
              <td class="py-3 pr-4">{{ r.producto?.nombre }}</td>
              <td class="py-3 pr-4 text-right font-bold text-teal">+{{ r.cantidad }}</td>
              <td class="py-3 text-right">
                <button
                  @click="confirmarEliminar(r)"
                  class="px-3 py-1 rounded-lg border border-red-200 text-red-400 text-xs font-body hover:bg-red-50 transition-colors"
                >Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal confirmar eliminación -->
  <div v-if="registroAEliminar" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
      <h2 class="font-display text-lg font-bold text-gray-900 mb-2">Eliminar registro</h2>
      <p class="font-body text-sm text-gray-600 mb-1">
        <span class="font-semibold">{{ registroAEliminar.producto?.nombre }}</span>
      </p>
      <p class="font-body text-sm text-red-400 mb-6">
        Se revertirán <strong>{{ registroAEliminar.cantidad }}</strong> unidades del stock. Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button
          @click="registroAEliminar = null"
          class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
        >Cancelar</button>
        <button
          @click="eliminarRegistro"
          :disabled="eliminando"
          class="flex-1 py-3 bg-red-500 text-white font-body text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >{{ eliminando ? 'Eliminando...' : 'Confirmar' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import ProductSelect from '@/components/admin/ProductSelect.vue'

const productos        = ref([])
const selectedId       = ref('')
const cantidad         = ref(1)
const nota             = ref('')
const lote             = ref([])
const historial        = ref([])
const enviando         = ref(false)
const mensajeOk          = ref('')
const mensajeErr         = ref('')
const registroAEliminar  = ref(null)
const eliminando         = ref(false)

const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

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
    const token = localStorage.getItem('ceketo_token')
    await axios.post('/api/produccion', {
      items: lote.value.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      nota: nota.value || undefined,
    }, { headers: { Authorization: `Bearer ${token}` } })
    mensajeOk.value = `✓ ${lote.value.length} producto(s) registrado(s) correctamente`
    lote.value  = []
    nota.value  = ''
    cargarHistorial()
    cargarProductos()  // refresca stock
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    enviando.value = false
    setTimeout(() => { mensajeOk.value = ''; mensajeErr.value = '' }, 5000)
  }
}

function exportarPDF() {
  if (!lote.value.length) return

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

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
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
  }
</style>
</head>
<body>
  ${copiaHTML('COPIA LOCAL')}
  <div class="corte"></div>
  ${copiaHTML('COPIA FÁBRICA')}
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
}

function confirmarEliminar(r) {
  registroAEliminar.value = r
}

async function eliminarRegistro() {
  if (!registroAEliminar.value) return
  eliminando.value = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/produccion/${registroAEliminar.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    registroAEliminar.value = null
    await cargarHistorial()
    await cargarProductos()
    mensajeOk.value = '✓ Registro eliminado y stock revertido'
    setTimeout(() => { mensajeOk.value = '' }, 4000)
  } catch (err) {
    mensajeErr.value = err.response?.data?.error || 'Error al eliminar'
    setTimeout(() => { mensajeErr.value = '' }, 4000)
  } finally {
    eliminando.value = false
  }
}

async function cargarProductos() {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
}

async function cargarHistorial() {
  try {
    const { data } = await axios.get('/api/produccion')
    historial.value = data.slice(0, 30)
  } catch { historial.value = [] }
}

onMounted(async () => {
  await cargarProductos()
  await cargarHistorial()
})
</script>
