<template>
  <div class="p-8">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-gray-900">Control de Caja</h1>
      <p class="font-body text-gray-500 mt-1">Apertura, movimientos y arqueo del turno</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="text-gray-400 font-body text-sm">Cargando...</div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- SIN CAJA ABIERTA — formulario apertura -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div v-else-if="!cajaActual" class="max-w-md mx-auto mt-12">
      <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div class="text-5xl mb-4">🏧</div>
        <h2 class="font-display text-2xl font-bold text-gray-900 mb-2">No hay caja abierta</h2>
        <p class="font-body text-gray-500 mb-8">Ingresá el efectivo inicial para comenzar el turno</p>

        <div class="text-left space-y-4">
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Saldo inicial en caja ($)</label>
            <input
              v-model.number="apertura.saldo_inicial"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Responsable (opcional)</label>
            <input
              v-model="apertura.usuario"
              type="text"
              placeholder="Nombre del operador"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <button
            @click="abrirCaja"
            :disabled="abriendo"
            class="w-full py-4 bg-brand-green text-white font-body font-semibold rounded-xl
                   hover:bg-brand-green/80 transition-colors disabled:opacity-50"
          >{{ abriendo ? 'Abriendo...' : 'Abrir caja' }}</button>
          <p v-if="errorApertura" class="text-red-400 text-sm font-body text-center">{{ errorApertura }}</p>
        </div>
      </div>

      <!-- Historial de cajas -->
      <div v-if="historial.length" class="mt-8">
        <h3 class="font-display text-lg font-semibold text-gray-900 mb-3">Turnos anteriores</h3>
        <div class="space-y-2">
          <div
            v-for="c in historial"
            :key="c.id"
            class="bg-white border border-gray-200 rounded-xl px-5 py-3 flex justify-between items-center cursor-pointer hover:border-teal transition-colors"
            @click="verHistorialDetalle(c)"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ formatFechaHora(c.fecha_apertura) }}</p>
              <p class="font-body text-xs text-gray-400">{{ c.usuario || 'Sin responsable' }}</p>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full text-xs font-body"
                :class="c.estado === 'abierta' ? 'bg-teal/20 text-teal' : 'bg-gray-100 text-gray-500'"
              >{{ c.estado }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- CAJA ABIERTA — panel principal -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div v-else class="space-y-6">

      <!-- Banner de caja abierta -->
      <div class="bg-teal/10 border border-teal/30 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="font-body text-sm text-gray-500">Caja abierta desde</p>
          <p class="font-display text-lg font-bold text-gray-900">{{ formatFechaHora(cajaActual.caja.fecha_apertura) }}</p>
          <p v-if="cajaActual.caja.usuario" class="font-body text-xs text-gray-400">{{ cajaActual.caja.usuario }}</p>
        </div>
        <div class="text-right">
          <p class="font-body text-xs text-gray-400 mb-0.5">Saldo inicial</p>
          <p class="font-display text-2xl font-bold text-teal">${{ parseFloat(cajaActual.caja.saldo_inicial).toLocaleString('es-AR') }}</p>
        </div>
      </div>

      <!-- Resumen de ventas del turno -->
      <div>
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-3">Ventas del turno</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="(total, metodo) in cajaActual.ventasPorMetodo"
            :key="metodo"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <p class="font-body text-xs text-gray-400 mb-1">{{ metodoLabel(metodo) }}</p>
            <p class="font-display font-bold text-teal text-base">${{ total.toLocaleString('es-AR') }}</p>
          </div>
          <div class="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
            <p class="font-body text-xs text-gray-500 mb-1">Total ventas</p>
            <p class="font-display font-bold text-teal text-base">${{ cajaActual.totalVentas.toLocaleString('es-AR') }}</p>
          </div>
        </div>
      </div>

      <!-- Movimientos manuales -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-semibold text-gray-900">Movimientos manuales</h2>
          <button
            @click="modalMov = true"
            class="px-4 py-2 bg-teal/10 text-teal border border-teal/30 rounded-xl font-body text-sm hover:bg-teal/20 transition-colors"
          >+ Agregar</button>
        </div>

        <div v-if="!cajaActual.movimientos.length" class="text-gray-400 font-body text-sm">Sin movimientos manuales</div>
        <div v-else class="space-y-2">
          <div
            v-for="m in cajaActual.movimientos"
            :key="m.id"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <span :class="m.tipo === 'ingreso' ? 'text-teal' : 'text-red-400'" class="text-lg">
                {{ m.tipo === 'ingreso' ? '↑' : '↓' }}
              </span>
              <div>
                <p class="font-body text-sm text-gray-900">{{ m.concepto }}</p>
                <p class="font-body text-xs text-gray-400">{{ m.tipo }} · {{ formatHora(m.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="m.tipo === 'ingreso' ? 'text-teal' : 'text-red-400'" class="font-body font-bold text-sm">
                {{ m.tipo === 'ingreso' ? '+' : '-' }}${{ parseFloat(m.monto).toLocaleString('es-AR') }}
              </span>
              <button @click="eliminarMovimiento(m)" class="text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
            </div>
          </div>
        </div>

        <!-- Resumen movimientos -->
        <div v-if="cajaActual.movimientos.length" class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm font-body">
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Ingresos manuales</p>
            <p class="font-bold text-teal">+${{ cajaActual.totalIngresos.toLocaleString('es-AR') }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Egresos manuales</p>
            <p class="font-bold text-red-400">-${{ cajaActual.totalEgresos.toLocaleString('es-AR') }}</p>
          </div>
        </div>
      </div>

      <!-- Saldo teórico -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-4">Saldo teórico en efectivo</h2>
        <div class="space-y-2 font-body text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Saldo inicial</span>
            <span>${{ parseFloat(cajaActual.caja.saldo_inicial).toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between text-teal">
            <span>Ventas en efectivo</span>
            <span>+${{ (cajaActual.ventasPorMetodo['efectivo'] || 0).toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="cajaActual.totalIngresos > 0" class="flex justify-between text-teal">
            <span>Ingresos manuales</span>
            <span>+${{ cajaActual.totalIngresos.toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="cajaActual.totalEgresos > 0" class="flex justify-between text-red-400">
            <span>Egresos manuales</span>
            <span>-${{ cajaActual.totalEgresos.toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-3 mt-2">
            <span>Debería haber</span>
            <span class="text-teal">${{ cajaActual.saldoTeorico.toLocaleString('es-AR') }}</span>
          </div>
        </div>
      </div>

      <!-- Arqueo y cierre -->
      <div class="bg-white border border-red-100 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-4">Arqueo y cierre de caja</h2>
        <div class="space-y-4">
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Efectivo contado en caja ($)</label>
            <input
              v-model.number="arqueo.efectivo"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <!-- Diferencia -->
          <div v-if="arqueo.efectivo !== null && arqueo.efectivo !== ''" class="bg-gray-50 rounded-xl px-4 py-3">
            <div class="flex justify-between font-body text-sm">
              <span class="text-gray-500">Diferencia</span>
              <span :class="diferencia === 0 ? 'text-teal' : diferencia > 0 ? 'text-teal' : 'text-red-400'" class="font-bold">
                {{ diferencia >= 0 ? '+' : '' }}${{ diferencia.toLocaleString('es-AR') }}
              </span>
            </div>
            <p v-if="diferencia > 0" class="font-body text-xs text-teal mt-1">Sobrante de caja</p>
            <p v-else-if="diferencia < 0" class="font-body text-xs text-red-400 mt-1">Faltante de caja</p>
            <p v-else class="font-body text-xs text-gray-400 mt-1">Caja cuadrada ✓</p>
          </div>
          <div>
            <label class="block font-body text-sm text-gray-500 mb-2">Nota de cierre (opcional)</label>
            <textarea
              v-model="arqueo.nota"
              rows="2"
              placeholder="Observaciones del turno..."
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm
                     focus:outline-none focus:border-teal transition-colors resize-none"
            ></textarea>
          </div>
          <button
            @click="cerrarCaja"
            :disabled="cerrando"
            class="w-full py-4 bg-red-500 text-white font-body font-semibold rounded-xl
                   hover:bg-red-600 transition-colors disabled:opacity-50"
          >{{ cerrando ? 'Cerrando...' : 'Cerrar caja' }}</button>
          <p v-if="errorCierre" class="text-red-400 text-sm font-body text-center">{{ errorCierre }}</p>
        </div>
      </div>
    </div>

    <!-- Modal movimiento manual -->
    <div v-if="modalMov" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
        <h2 class="font-display text-lg font-bold text-gray-900 mb-5">Nuevo movimiento</h2>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            @click="nuevoMov.tipo = 'ingreso'"
            class="py-3 rounded-xl border-2 font-body text-sm transition-all"
            :class="nuevoMov.tipo === 'ingreso' ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500'"
          >↑ Ingreso</button>
          <button
            @click="nuevoMov.tipo = 'egreso'"
            class="py-3 rounded-xl border-2 font-body text-sm transition-all"
            :class="nuevoMov.tipo === 'egreso' ? 'bg-red-100 border-red-400 text-red-600' : 'border-gray-200 text-gray-500'"
          >↓ Egreso</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-body text-sm text-gray-500 mb-1">Concepto</label>
            <input
              v-model="nuevoMov.concepto"
              type="text"
              placeholder="Ej: Retiro para gastos, Fondo de cambio..."
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label class="block font-body text-sm text-gray-500 mb-1">Monto ($)</label>
            <input
              v-model.number="nuevoMov.monto"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button
            @click="modalMov = false; resetNuevoMov()"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="agregarMovimiento"
            :disabled="!nuevoMov.concepto || !nuevoMov.monto || guardandoMov"
            class="flex-1 py-3 bg-teal text-gray-900 font-body text-sm font-semibold rounded-xl
                   hover:bg-teal/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ guardandoMov ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal resumen de cierre -->
    <div v-if="resumenCierre" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
        <div class="text-center mb-5">
          <div class="text-4xl mb-2">✅</div>
          <h2 class="font-display text-xl font-bold text-gray-900">Caja cerrada</h2>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 space-y-2 font-body text-sm mb-5">
          <div class="flex justify-between text-gray-600">
            <span>Total ventas</span>
            <span class="font-bold">${{ resumenCierre.totalVentas.toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Saldo teórico</span>
            <span class="font-bold">${{ resumenCierre.saldoTeorico.toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="resumenCierre.arqueo_efectivo !== null" class="flex justify-between text-gray-600">
            <span>Arqueo efectivo</span>
            <span class="font-bold">${{ parseFloat(resumenCierre.arqueo_efectivo).toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="resumenCierre.diferencia !== 0" class="flex justify-between border-t border-gray-200 pt-2"
            :class="resumenCierre.diferencia > 0 ? 'text-teal' : 'text-red-400'"
          >
            <span>{{ resumenCierre.diferencia > 0 ? 'Sobrante' : 'Faltante' }}</span>
            <span class="font-bold">${{ Math.abs(resumenCierre.diferencia).toLocaleString('es-AR') }}</span>
          </div>
          <div v-else class="flex justify-between border-t border-gray-200 pt-2 text-teal">
            <span>Resultado</span>
            <span class="font-bold">Caja cuadrada ✓</span>
          </div>
        </div>

        <button
          @click="resumenCierre = null; cargar()"
          class="w-full py-3 bg-brand-green text-white font-body font-semibold rounded-xl hover:bg-brand-green/80 transition-colors"
        >Aceptar</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const cargando      = ref(true)
const cajaActual    = ref(null)
const historial     = ref([])
const abriendo      = ref(false)
const cerrando      = ref(false)
const errorApertura = ref('')
const errorCierre   = ref('')
const modalMov      = ref(false)
const guardandoMov  = ref(false)
const resumenCierre = ref(null)

const apertura = ref({ saldo_inicial: 0, usuario: '' })
const arqueo   = ref({ efectivo: null, nota: '' })
const nuevoMov = ref({ tipo: 'ingreso', concepto: '', monto: null })

const metodoLabels = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  debito:        'Débito',
  credito:       'Crédito',
  qr:            'QR',
  cuenta_corriente: 'Cta. Corriente',
  sin_metodo:    'Sin método',
}

function metodoLabel(m) {
  return metodoLabels[m] || m
}

const diferencia = computed(() => {
  if (arqueo.value.efectivo === null || arqueo.value.efectivo === '') return 0
  return (Number(arqueo.value.efectivo) || 0) - (cajaActual.value?.saldoTeorico || 0)
})

function formatFechaHora(fecha) {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function resetNuevoMov() {
  nuevoMov.value = { tipo: 'ingreso', concepto: '', monto: null }
}

async function cargar() {
  cargando.value = true
  try {
    const [{ data: actual }, { data: hist }] = await Promise.all([
      axios.get('/api/caja/actual'),
      axios.get('/api/caja/historial'),
    ])
    cajaActual.value = actual
    historial.value  = hist.filter(c => c.estado === 'cerrada').slice(0, 10)
    arqueo.value = { efectivo: null, nota: '' }
  } catch {}
  cargando.value = false
}

async function abrirCaja() {
  abriendo.value     = true
  errorApertura.value = ''
  try {
    await axios.post('/api/caja/abrir', {
      saldo_inicial: apertura.value.saldo_inicial || 0,
      usuario:       apertura.value.usuario || undefined,
    })
    apertura.value = { saldo_inicial: 0, usuario: '' }
    await cargar()
  } catch (err) {
    errorApertura.value = err.response?.data?.error || 'Error al abrir la caja'
  } finally {
    abriendo.value = false
  }
}

async function agregarMovimiento() {
  if (!nuevoMov.value.concepto || !nuevoMov.value.monto) return
  guardandoMov.value = true
  try {
    await axios.post(`/api/caja/${cajaActual.value.caja.id}/movimiento`, {
      tipo:     nuevoMov.value.tipo,
      concepto: nuevoMov.value.concepto,
      monto:    nuevoMov.value.monto,
    })
    modalMov.value = false
    resetNuevoMov()
    await cargar()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al guardar movimiento')
  } finally {
    guardandoMov.value = false
  }
}

async function eliminarMovimiento(mov) {
  if (!confirm(`¿Eliminar movimiento "${mov.concepto}"?`)) return
  try {
    await axios.delete(`/api/caja/${cajaActual.value.caja.id}/movimiento/${mov.id}`)
    await cargar()
  } catch {}
}

async function cerrarCaja() {
  cerrando.value    = true
  errorCierre.value = ''
  try {
    const { data } = await axios.post(`/api/caja/${cajaActual.value.caja.id}/cerrar`, {
      arqueo_efectivo: arqueo.value.efectivo !== null ? arqueo.value.efectivo : undefined,
      nota_cierre:     arqueo.value.nota || undefined,
    })
    resumenCierre.value = {
      totalVentas:    data.resumen.totalVentas,
      saldoTeorico:   data.resumen.saldoTeorico,
      arqueo_efectivo: arqueo.value.efectivo,
      diferencia:     arqueo.value.efectivo !== null
        ? (Number(arqueo.value.efectivo) - data.resumen.saldoTeorico)
        : 0,
    }
    cajaActual.value = null
  } catch (err) {
    errorCierre.value = err.response?.data?.error || 'Error al cerrar la caja'
  } finally {
    cerrando.value = false
  }
}

function verHistorialDetalle(c) {
  // Por ahora solo muestra la caja en un alert básico, se puede expandir
}

onMounted(cargar)
</script>
