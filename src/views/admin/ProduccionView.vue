<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-white">Carga de Producción</h1>
      <p class="font-body text-white/50 mt-1">Registrá los productos que llegan de fábrica al negocio</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Formulario de carga -->
      <div class="bg-[#162421] border border-white/10 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-white mb-5">Agregar ítem</h2>

        <!-- Selector de producto -->
        <div class="mb-4">
          <label class="block font-body text-sm text-white/60 mb-2">Producto</label>
          <ProductSelect
            v-model="selectedId"
            :grupos="categoriasConProductos"
          />
        </div>

        <!-- Cantidad -->
        <div class="mb-4">
          <label class="block font-body text-sm text-white/60 mb-2">Cantidad</label>
          <input
            v-model.number="cantidad"
            type="number"
            min="1"
            placeholder="0"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body
                   focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <button
          @click="agregarItem"
          :disabled="!selectedId || !cantidad"
          class="w-full py-3 bg-teal text-white font-body font-medium rounded-xl
                 hover:bg-teal/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Agregar al lote
        </button>
      </div>

      <!-- Lote actual -->
      <div class="bg-[#162421] border border-white/10 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-white mb-5">
          Lote del día
          <span class="ml-2 text-sm font-body text-white/40">{{ hoy }}</span>
        </h2>

        <div v-if="lote.length === 0" class="text-center py-10 text-white/30 font-body">
          Sin productos agregados todavía
        </div>

        <div v-else class="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="(item, i) in lote"
            :key="i"
            class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
          >
            <div>
              <p class="font-body text-sm text-white">{{ item.nombre }}</p>
              <p class="font-body text-xs text-white/40">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-display text-xl font-bold text-teal">×{{ item.cantidad }}</span>
              <button
                @click="lote.splice(i, 1)"
                class="text-white/30 hover:text-red-400 transition-colors text-lg"
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
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body text-sm
                   focus:outline-none focus:border-teal transition-colors mb-4 resize-none placeholder-white/30"
          ></textarea>

          <button
            @click="confirmarProduccion"
            :disabled="enviando"
            class="w-full py-3 bg-keto-orange text-white font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviando ? 'Guardando...' : '✓ Confirmar producción' }}
          </button>

          <p v-if="mensajeOk" class="text-teal text-sm text-center mt-3 font-body">{{ mensajeOk }}</p>
          <p v-if="mensajeErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ mensajeErr }}</p>
        </div>
      </div>
    </div>

    <!-- Historial reciente -->
    <div class="mt-8 bg-[#162421] border border-white/10 rounded-2xl p-6">
      <h2 class="font-display text-lg font-semibold text-white mb-5">Historial reciente</h2>
      <div v-if="historial.length === 0" class="text-white/30 font-body text-sm">Sin registros</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-white/40 border-b border-white/10">
              <th class="text-left pb-3 pr-4">Fecha</th>
              <th class="text-left pb-3 pr-4">Código</th>
              <th class="text-left pb-3 pr-4">Producto</th>
              <th class="text-right pb-3">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in historial"
              :key="r.id"
              class="border-b border-white/5 text-white/70 hover:text-white transition-colors"
            >
              <td class="py-3 pr-4">{{ r.fecha }}</td>
              <td class="py-3 pr-4 text-teal font-mono text-xs">{{ r.producto?.codigo }}</td>
              <td class="py-3 pr-4">{{ r.producto?.nombre }}</td>
              <td class="py-3 text-right font-bold text-teal">+{{ r.cantidad }}</td>
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
import ProductSelect from '@/components/admin/ProductSelect.vue'

const productos        = ref([])
const selectedId       = ref('')
const cantidad         = ref(1)
const nota             = ref('')
const lote             = ref([])
const historial        = ref([])
const enviando         = ref(false)
const mensajeOk        = ref('')
const mensajeErr       = ref('')

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
