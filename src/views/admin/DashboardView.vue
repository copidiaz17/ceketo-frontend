<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="font-body text-gray-500 mt-1">{{ fechaHoy }}</p>
    </div>

    <!-- Métricas principales -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="m in metricas"
        :key="m.label"
        class="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col gap-2"
      >
        <span class="text-2xl">{{ m.icon }}</span>
        <p class="font-body text-xs text-gray-400 uppercase tracking-wider">{{ m.label }}</p>
        <p class="font-display text-2xl font-bold" :class="m.color">{{ m.valor }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Gráfico ventas 7 días -->
      <div class="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Ventas últimos 7 días</h2>
        <div class="relative h-48">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Top productos -->
      <div class="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Más vendidos</h2>
        <div v-if="!data" class="text-gray-400 text-sm font-body">Cargando...</div>
        <div v-else class="space-y-3">
          <div
            v-for="(p, i) in data.topProductos"
            :key="i"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <span class="font-display text-sm text-gray-300 w-4">{{ i + 1 }}</span>
              <p class="font-body text-sm text-gray-700 leading-tight">{{ p.nombre }}</p>
            </div>
            <span class="font-body text-xs text-teal font-bold flex-shrink-0 ml-2">{{ p.total_vendido }} u.</span>
          </div>
          <p v-if="!data.topProductos?.length" class="text-gray-400 text-sm font-body">Sin ventas aún</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Stock bajo -->
      <div class="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <span>⚠️</span> Stock bajo
          <span v-if="data?.stockBajo?.length" class="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-body">
            {{ data.stockBajo.length }} producto(s)
          </span>
        </h2>
        <div v-if="!data?.stockBajo?.length" class="text-teal text-sm font-body">✓ Todo el stock está OK</div>
        <div v-else class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="p in data.stockBajo"
            :key="p.id"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ p.nombre }}</p>
              <p class="font-body text-xs text-gray-400 font-mono">{{ p.codigo }}</p>
            </div>
            <span
              class="font-display text-lg font-bold"
              :class="p.stock === 0 ? 'text-red-400' : 'text-yellow-400'"
            >{{ p.stock }}</span>
          </div>
        </div>
      </div>

      <!-- Gastos del mes -->
      <div class="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <span>💸</span> Gastos del mes
          <RouterLink to="/admin/gastos" class="ml-auto text-xs text-teal/60 hover:text-teal font-body transition-colors">
            Ver todos →
          </RouterLink>
        </h2>
        <div v-if="!gastosResumen" class="text-gray-400 text-sm font-body">Cargando...</div>
        <div v-else class="space-y-3">
          <div
            v-for="(total, cat) in gastosResumen.totales"
            :key="cat"
            class="flex items-center justify-between"
          >
            <p class="font-body text-sm text-gray-600">{{ cat }}</p>
            <span class="font-body text-sm font-bold text-gray-700">${{ total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div v-if="!Object.keys(gastosResumen.totales || {}).length" class="text-gray-400 text-sm font-body">
            Sin gastos registrados este mes
          </div>
          <div class="border-t border-gray-200 pt-3 flex items-center justify-between">
            <p class="font-body text-xs text-gray-400 uppercase tracking-wider">Total</p>
            <span class="font-display text-lg font-bold text-red-400">${{ (gastosResumen.totalMes || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>
      </div>

      <!-- Últimas ventas -->
      <div class="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Últimas ventas</h2>
        <div v-if="!data?.ultimasVentas?.length" class="text-gray-400 text-sm font-body">Sin ventas registradas</div>
        <div v-else class="space-y-3">
          <div
            v-for="v in data.ultimasVentas"
            :key="v.id"
            class="flex items-center justify-between border-b border-gray-100 pb-3"
          >
            <div>
              <p class="font-body text-sm text-gray-900">
                Venta #{{ v.id }}
                <span class="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  :class="v.tipo === 'online' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal/20 text-teal'">
                  {{ v.tipo }}
                </span>
              </p>
              <p class="font-body text-xs text-gray-400">{{ formatFecha(v.fecha) }} · {{ v.items?.length }} item(s)</p>
            </div>
            <span class="font-display font-bold text-teal">${{ parseFloat(v.total).toLocaleString('es-AR') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Tooltip } from 'chart.js'
import axios from 'axios'

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip)

const data          = ref(null)
const gastosResumen = ref(null)
const chartCanvas   = ref(null)
let chartInstance   = null

const fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const metricas = computed(() => {
  if (!data.value) return [
    { icon: '💰', label: 'Ventas hoy', valor: '—', color: 'text-teal' },
    { icon: '🛒', label: 'Transacciones', valor: '—', color: 'text-gray-900' },
    { icon: '📦', label: 'Pedidos online', valor: '—', color: 'text-purple-400' },
    { icon: '⚠️', label: 'Stock bajo', valor: '—', color: 'text-yellow-400' },
  ]
  return [
    { icon: '💰', label: 'Ventas hoy',     valor: `$${data.value.hoy.total.toLocaleString('es-AR')}`, color: 'text-teal' },
    { icon: '🛒', label: 'Transacciones',  valor: data.value.hoy.cantidad, color: 'text-gray-900' },
    { icon: '📦', label: 'Pedidos online', valor: data.value.pedidosPendientes, color: 'text-purple-400' },
    { icon: '⚠️', label: 'Stock bajo',     valor: data.value.stockBajo.length, color: data.value.stockBajo.length > 0 ? 'text-yellow-400' : 'text-teal' },
  ]
})

function formatFecha(f) {
  return new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function buildChart(ventasSemana) {
  // Últimos 7 días en zona Argentina (UTC-3)
  const ARG_OFFSET_MS = 3 * 60 * 60 * 1000
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - ARG_OFFSET_MS - i * 24 * 60 * 60 * 1000)
    dias.push(d.toISOString().slice(0, 10))
  }
  const labels  = dias.map(d => { const [, m, day] = d.split('-'); return `${day}/${m}` })
  const totales = dias.map(dia => {
    const found = ventasSemana.find(v => v.dia === dia)
    return found ? parseFloat(found.total) : 0
  })

  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: totales,
        backgroundColor: 'rgba(42,157,143,0.5)',
        borderColor: 'rgba(42,157,143,1)',
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => `$${ctx.raw.toLocaleString('es-AR')}` },
      }},
      scales: {
        x: { ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 11 }, callback: v => `$${v.toLocaleString('es-AR')}` }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  })
}

onMounted(async () => {
  try {
    const [dashRes, gastosRes] = await Promise.all([
      axios.get('/api/admin/dashboard'),
      axios.get('/api/gastos/resumen'),
    ])
    data.value = dashRes.data
    gastosResumen.value = gastosRes.data
    buildChart(dashRes.data.ventasSemana)
  } catch (err) {
    console.error(err)
  }
})
</script>
