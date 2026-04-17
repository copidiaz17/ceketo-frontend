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
            <label class="block font-body text-sm text-gray-500 mb-2">💵 Efectivo en caja ($)</label>
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
            <label class="block font-body text-sm text-gray-500 mb-2">📲 Saldo billetera virtual ($)</label>
            <input
              v-model.number="apertura.saldo_billetera_inicial"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                     focus:outline-none focus:border-teal transition-colors"
            />
            <p class="font-body text-xs text-gray-400 mt-1">Saldo actual en Mercado Pago / cuenta bancaria</p>
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

      <!-- Botones exportar -->
      <div class="flex gap-2 justify-end">
        <button @click="descargarPDF" class="flex items-center gap-2 px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors">📄 PDF</button>
        <button @click="descargarExcel" class="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-body text-sm font-medium hover:bg-green-700 transition-colors">📊 Excel</button>
      </div>

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
                <p class="font-body text-xs text-gray-400">{{ m.tipo }} · {{ m.medio === 'billetera' ? '📲 Billetera' : '💵 Efectivo' }} · {{ formatHora(m.createdAt) }}</p>
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

      <!-- Saldos teóricos: efectivo + billetera -->
      <div class="grid md:grid-cols-2 gap-4">

        <!-- Efectivo -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-base font-semibold text-gray-900 mb-4">💵 Efectivo teórico</h2>
          <div class="space-y-2 font-body text-sm">
            <div class="flex justify-between text-gray-500">
              <span>Saldo inicial</span>
              <span>${{ parseFloat(cajaActual.caja.saldo_inicial).toLocaleString('es-AR') }}</span>
            </div>
            <div class="flex justify-between text-teal">
              <span>Ventas en efectivo</span>
              <span>+${{ (cajaActual.ventasPorMetodo['efectivo'] || 0).toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="(cajaActual.gastosPorMetodo['efectivo'] || 0) > 0" class="flex justify-between text-red-400">
              <span>Gastos en efectivo</span>
              <span>-${{ cajaActual.gastosPorMetodo['efectivo'].toLocaleString('es-AR') }}</span>
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

        <!-- Billetera virtual -->
        <div class="bg-white border border-blue-100 rounded-2xl p-6">
          <h2 class="font-display text-base font-semibold text-gray-900 mb-1">📲 Billetera virtual</h2>
          <p class="font-body text-xs text-gray-400 mb-4">Transferencia · QR · Débito · Crédito</p>
          <div class="space-y-2 font-body text-sm">
            <div class="flex justify-between text-gray-500">
              <span>Saldo inicial</span>
              <span>${{ parseFloat(cajaActual.caja.saldo_billetera_inicial).toLocaleString('es-AR') }}</span>
            </div>
            <div class="flex justify-between text-teal">
              <span>Cobros digitales</span>
              <span>+${{ (cajaActual.billeteraVentas || 0).toLocaleString('es-AR') }}</span>
            </div>
            <!-- Desglose por método -->
            <div v-for="m in ['transferencia','qr','debito','credito']" :key="m"
              v-if="(cajaActual.ventasPorMetodo[m] || 0) > 0"
              class="flex justify-between text-gray-400 text-xs pl-4"
            >
              <span>{{ metodoLabel(m) }}</span>
              <span>${{ cajaActual.ventasPorMetodo[m].toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="(cajaActual.billeteraGastos || 0) > 0" class="flex justify-between text-red-400">
              <span>Gastos digitales</span>
              <span>-${{ cajaActual.billeteraGastos.toLocaleString('es-AR') }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-3 mt-2">
              <span>Saldo final</span>
              <span class="text-blue-600">${{ cajaActual.saldoBilleteraFinal.toLocaleString('es-AR') }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Historial visible también cuando hay caja abierta -->
      <div v-if="historial.length" class="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-3">Turnos anteriores</h2>
        <div class="space-y-2">
          <div
            v-for="c in historial"
            :key="c.id"
            class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 flex justify-between items-center cursor-pointer hover:border-teal transition-colors"
            @click="verHistorialDetalle(c)"
          >
            <div>
              <p class="font-body text-sm text-gray-900">{{ formatFechaHora(c.fecha_apertura) }}</p>
              <p class="font-body text-xs text-gray-400">{{ c.usuario || 'Sin responsable' }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-body bg-gray-100 text-gray-500">ver detalle</span>
          </div>
        </div>
      </div>

      <!-- Arqueo y cierre -->
      <div class="bg-white border border-red-100 rounded-2xl p-6">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-4">Arqueo y cierre de caja</h2>
        <div class="space-y-4">

          <div class="grid md:grid-cols-2 gap-4">
            <!-- Arqueo efectivo -->
            <div>
              <label class="block font-body text-sm text-gray-500 mb-2">💵 Efectivo contado en caja ($)</label>
              <input
                v-model.number="arqueo.efectivo"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                       focus:outline-none focus:border-teal transition-colors"
              />
              <!-- Diferencia efectivo -->
              <div v-if="arqueo.efectivo !== null && arqueo.efectivo !== ''" class="bg-gray-50 rounded-xl px-4 py-2 mt-2">
                <div class="flex justify-between font-body text-sm">
                  <span class="text-gray-500">Diferencia</span>
                  <span :class="diferenciaEfectivo === 0 ? 'text-gray-500' : diferenciaEfectivo > 0 ? 'text-teal' : 'text-red-400'" class="font-bold">
                    {{ diferenciaEfectivo >= 0 ? '+' : '' }}${{ diferenciaEfectivo.toLocaleString('es-AR') }}
                  </span>
                </div>
                <p v-if="diferenciaEfectivo > 0" class="font-body text-xs text-teal">Sobrante</p>
                <p v-else-if="diferenciaEfectivo < 0" class="font-body text-xs text-red-400">Faltante</p>
                <p v-else class="font-body text-xs text-gray-400">Cuadrada ✓</p>
              </div>
            </div>

            <!-- Arqueo billetera -->
            <div>
              <label class="block font-body text-sm text-gray-500 mb-2">📲 Saldo billetera real ($)</label>
              <input
                v-model.number="arqueo.billetera"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body
                       focus:outline-none focus:border-teal transition-colors"
              />
              <!-- Diferencia billetera -->
              <div v-if="arqueo.billetera !== null && arqueo.billetera !== ''" class="bg-gray-50 rounded-xl px-4 py-2 mt-2">
                <div class="flex justify-between font-body text-sm">
                  <span class="text-gray-500">Diferencia</span>
                  <span :class="diferenciaBilletera === 0 ? 'text-gray-500' : diferenciaBilletera > 0 ? 'text-teal' : 'text-red-400'" class="font-bold">
                    {{ diferenciaBilletera >= 0 ? '+' : '' }}${{ diferenciaBilletera.toLocaleString('es-AR') }}
                  </span>
                </div>
                <p v-if="diferenciaBilletera > 0" class="font-body text-xs text-teal">Sobrante</p>
                <p v-else-if="diferenciaBilletera < 0" class="font-body text-xs text-red-400">Faltante</p>
                <p v-else class="font-body text-xs text-gray-400">Cuadrada ✓</p>
              </div>
            </div>
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

        <!-- Medio -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            @click="nuevoMov.medio = 'efectivo'"
            class="py-2.5 rounded-xl border-2 font-body text-sm transition-all"
            :class="nuevoMov.medio === 'efectivo' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'border-gray-200 text-gray-500'"
          >💵 Efectivo</button>
          <button
            @click="nuevoMov.medio = 'billetera'"
            class="py-2.5 rounded-xl border-2 font-body text-sm transition-all"
            :class="nuevoMov.medio === 'billetera' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500'"
          >📲 Billetera</button>
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

    <!-- Modal historial detalle -->
    <div v-if="historialDetalle" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="font-display text-xl font-bold text-gray-900">
                Caja #{{ historialDetalle.caja?.id }}
                <span v-if="cargandoDetalle" class="text-sm font-body text-gray-400"> Cargando...</span>
              </h2>
              <p v-if="historialDetalle.caja?.fecha_apertura" class="font-body text-sm text-gray-400 mt-0.5">
                {{ formatFechaHora(historialDetalle.caja.fecha_apertura) }}
                <template v-if="historialDetalle.caja.fecha_cierre"> → {{ formatFechaHora(historialDetalle.caja.fecha_cierre) }}</template>
                <span v-if="historialDetalle.caja.usuario"> · {{ historialDetalle.caja.usuario }}</span>
              </p>
            </div>
            <button @click="historialDetalle = null" class="text-gray-400 hover:text-gray-700 text-xl ml-4">✕</button>
          </div>

          <template v-if="!cargandoDetalle && historialDetalle.ventasPorMetodo">
            <!-- Ventas por método -->
            <h3 class="font-display text-sm font-semibold text-gray-700 mb-2">Ventas por método</h3>
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div
                v-for="(total, metodo) in historialDetalle.ventasPorMetodo"
                :key="metodo"
                class="bg-gray-50 rounded-xl px-3 py-2"
              >
                <p class="font-body text-xs text-gray-400">{{ metodoLabel(metodo) }}</p>
                <p class="font-display font-bold text-teal text-sm">${{ total.toLocaleString('es-AR') }}</p>
              </div>
              <div class="bg-teal/10 rounded-xl px-3 py-2 col-span-2">
                <p class="font-body text-xs text-gray-500">Total ventas</p>
                <p class="font-display font-bold text-teal">${{ (historialDetalle.totalVentas || 0).toLocaleString('es-AR') }}</p>
              </div>
            </div>

            <!-- Saldos -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-gray-50 rounded-xl px-4 py-3 text-sm font-body space-y-1">
                <p class="font-semibold text-gray-700 text-xs mb-2">💵 Efectivo</p>
                <div class="flex justify-between"><span class="text-gray-500">Saldo inicial</span><span>${{ parseFloat(historialDetalle.caja.saldo_inicial).toLocaleString('es-AR') }}</span></div>
                <div class="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>Teórico</span><span class="text-teal">${{ (historialDetalle.saldoTeorico || 0).toLocaleString('es-AR') }}</span></div>
                <div v-if="historialDetalle.caja.arqueo_efectivo != null" class="flex justify-between"><span class="text-gray-500">Contado</span><span>${{ parseFloat(historialDetalle.caja.arqueo_efectivo).toLocaleString('es-AR') }}</span></div>
              </div>
              <div class="bg-blue-50 rounded-xl px-4 py-3 text-sm font-body space-y-1">
                <p class="font-semibold text-gray-700 text-xs mb-2">📲 Billetera</p>
                <div class="flex justify-between"><span class="text-gray-500">Cobros digitales</span><span>${{ (historialDetalle.billeteraVentas || 0).toLocaleString('es-AR') }}</span></div>
                <div class="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1"><span>Saldo final</span><span class="text-blue-600">${{ (historialDetalle.saldoBilleteraFinal || 0).toLocaleString('es-AR') }}</span></div>
                <div v-if="historialDetalle.caja.arqueo_billetera != null" class="flex justify-between"><span class="text-gray-500">Real</span><span>${{ parseFloat(historialDetalle.caja.arqueo_billetera).toLocaleString('es-AR') }}</span></div>
              </div>
            </div>

            <!-- Movimientos -->
            <div v-if="historialDetalle.movimientos?.length" class="mb-4">
              <h3 class="font-display text-sm font-semibold text-gray-700 mb-2">Movimientos manuales</h3>
              <div class="space-y-1">
                <div
                  v-for="m in historialDetalle.movimientos"
                  :key="m.id"
                  class="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2 text-sm font-body"
                >
                  <div>
                    <span class="text-gray-900">{{ m.concepto }}</span>
                    <span class="text-xs text-gray-400 ml-2">{{ m.medio === 'billetera' ? '📲' : '💵' }} {{ formatHora(m.createdAt) }}</span>
                  </div>
                  <span :class="m.tipo === 'ingreso' ? 'text-teal' : 'text-red-400'" class="font-bold">
                    {{ m.tipo === 'ingreso' ? '+' : '-' }}${{ parseFloat(m.monto).toLocaleString('es-AR') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Nota cierre -->
            <p v-if="historialDetalle.caja.nota_cierre" class="font-body text-sm text-gray-500 italic mb-4">
              Nota: {{ historialDetalle.caja.nota_cierre }}
            </p>

            <!-- Exportar -->
            <div class="flex gap-3 pt-2 border-t border-gray-100">
              <button @click="descargarPDFHistorialDetalle" class="flex-1 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors">📄 PDF</button>
              <button @click="descargarExcelHistorialDetalle" class="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-body text-sm font-medium hover:bg-green-700 transition-colors">📊 Excel</button>
              <button @click="historialDetalle = null" class="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:border-gray-400 transition-colors">Cerrar</button>
            </div>
          </template>

          <div v-else-if="cargandoDetalle" class="text-center py-8 text-gray-400 font-body text-sm">Cargando resumen...</div>
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

          <!-- Efectivo -->
          <div class="border-t border-gray-200 pt-2">
            <p class="text-xs text-gray-400 mb-1">💵 Efectivo</p>
            <div class="flex justify-between text-gray-600">
              <span>Teórico</span>
              <span class="font-bold">${{ resumenCierre.saldoTeorico.toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="resumenCierre.arqueo_efectivo !== null" class="flex justify-between text-gray-600">
              <span>Contado</span>
              <span class="font-bold">${{ parseFloat(resumenCierre.arqueo_efectivo).toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="resumenCierre.diferenciaEfectivo !== 0" class="flex justify-between"
              :class="resumenCierre.diferenciaEfectivo > 0 ? 'text-teal' : 'text-red-400'"
            >
              <span>{{ resumenCierre.diferenciaEfectivo > 0 ? 'Sobrante' : 'Faltante' }}</span>
              <span class="font-bold">${{ Math.abs(resumenCierre.diferenciaEfectivo).toLocaleString('es-AR') }}</span>
            </div>
            <div v-else class="text-teal text-xs">Cuadrada ✓</div>
          </div>

          <!-- Billetera -->
          <div class="border-t border-gray-200 pt-2">
            <p class="text-xs text-gray-400 mb-1">📲 Billetera virtual</p>
            <div class="flex justify-between text-gray-600">
              <span>Teórico</span>
              <span class="font-bold">${{ resumenCierre.saldoBilleteraFinal.toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="resumenCierre.arqueo_billetera !== null" class="flex justify-between text-gray-600">
              <span>Real</span>
              <span class="font-bold">${{ parseFloat(resumenCierre.arqueo_billetera).toLocaleString('es-AR') }}</span>
            </div>
            <div v-if="resumenCierre.diferenciaBilletera !== 0" class="flex justify-between"
              :class="resumenCierre.diferenciaBilletera > 0 ? 'text-teal' : 'text-red-400'"
            >
              <span>{{ resumenCierre.diferenciaBilletera > 0 ? 'Sobrante' : 'Faltante' }}</span>
              <span class="font-bold">${{ Math.abs(resumenCierre.diferenciaBilletera).toLocaleString('es-AR') }}</span>
            </div>
            <div v-else class="text-teal text-xs">Cuadrada ✓</div>
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
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'

const cargando        = ref(true)
const cajaActual      = ref(null)
const historial       = ref([])
const abriendo        = ref(false)
const cerrando        = ref(false)
const errorApertura   = ref('')
const errorCierre     = ref('')
const modalMov        = ref(false)
const guardandoMov    = ref(false)
const resumenCierre   = ref(null)
const historialDetalle = ref(null)
const cargandoDetalle  = ref(false)

const apertura = ref({ saldo_inicial: 0, saldo_billetera_inicial: 0, usuario: '' })
const arqueo   = ref({ efectivo: null, billetera: null, nota: '' })
const nuevoMov = ref({ tipo: 'ingreso', concepto: '', monto: null, medio: 'efectivo' })

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

const diferenciaEfectivo = computed(() => {
  if (arqueo.value.efectivo === null || arqueo.value.efectivo === '') return 0
  return (Number(arqueo.value.efectivo) || 0) - (cajaActual.value?.saldoTeorico || 0)
})

const diferenciaBilletera = computed(() => {
  if (arqueo.value.billetera === null || arqueo.value.billetera === '') return 0
  return (Number(arqueo.value.billetera) || 0) - (cajaActual.value?.saldoBilleteraFinal || 0)
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
  nuevoMov.value = { tipo: 'ingreso', concepto: '', monto: null, medio: 'efectivo' }
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
    arqueo.value = { efectivo: null, billetera: null, nota: '' }
  } catch {}
  cargando.value = false
}

async function abrirCaja() {
  abriendo.value     = true
  errorApertura.value = ''
  try {
    await axios.post('/api/caja/abrir', {
      saldo_inicial:           apertura.value.saldo_inicial || 0,
      saldo_billetera_inicial: apertura.value.saldo_billetera_inicial || 0,
      usuario:                 apertura.value.usuario || undefined,
    })
    apertura.value = { saldo_inicial: 0, saldo_billetera_inicial: 0, usuario: '' }
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
      medio:    nuevoMov.value.medio,
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
      arqueo_efectivo:  arqueo.value.efectivo !== null ? arqueo.value.efectivo : undefined,
      arqueo_billetera: arqueo.value.billetera !== null ? arqueo.value.billetera : undefined,
      nota_cierre:      arqueo.value.nota || undefined,
    })
    resumenCierre.value = {
      totalVentas:       data.resumen.totalVentas,
      saldoTeorico:      data.resumen.saldoTeorico,
      saldoBilleteraFinal: data.resumen.saldoBilleteraFinal,
      arqueo_efectivo:   arqueo.value.efectivo,
      arqueo_billetera:  arqueo.value.billetera,
      diferenciaEfectivo: arqueo.value.efectivo !== null
        ? (Number(arqueo.value.efectivo) - data.resumen.saldoTeorico) : 0,
      diferenciaBilletera: arqueo.value.billetera !== null
        ? (Number(arqueo.value.billetera) - data.resumen.saldoBilleteraFinal) : 0,
    }
    cajaActual.value = null
  } catch (err) {
    errorCierre.value = err.response?.data?.error || 'Error al cerrar la caja'
  } finally {
    cerrando.value = false
  }
}

async function verHistorialDetalle(c) {
  cargandoDetalle.value = true
  historialDetalle.value = { caja: c, cargando: true }
  try {
    const { data } = await axios.get(`/api/caja/${c.id}`)
    historialDetalle.value = data
  } catch {
    historialDetalle.value = null
  } finally {
    cargandoDetalle.value = false
  }
}

function descargarPDFHistorialDetalle() {
  const c = historialDetalle.value
  if (!c) return
  const fechaApertura = formatFechaHora(c.caja.fecha_apertura)
  const fechaCierre   = c.caja.fecha_cierre ? formatFechaHora(c.caja.fecha_cierre) : 'Abierta'
  const ahora = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const ventasMetodo = METODOS_ORDEN.filter(m => (c.ventasPorMetodo[m] || 0) > 0)
    .map(m => ({ metodo: metodoLabel(m), total: c.ventasPorMetodo[m] || 0 }))
  const filasVentas = ventasMetodo.map(v =>
    `<tr><td style="padding:5px 10px;border-bottom:1px solid #e5e7eb">${v.metodo}</td><td style="padding:5px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;color:#2a9d8f">$${v.total.toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const movIngresos = (c.movimientos || []).filter(m => m.tipo === 'ingreso')
  const movEgresos  = (c.movimientos || []).filter(m => m.tipo === 'egreso')
  const filasMovIngresos = movIngresos.map(m => `<tr><td style="padding:4px 10px;color:#555">${m.concepto} (${m.medio || 'efectivo'})</td><td style="padding:4px 10px;text-align:right;color:#2a9d8f">+$${parseFloat(m.monto).toLocaleString('es-AR')}</td></tr>`).join('')
  const filasMovEgresos  = movEgresos.map(m =>  `<tr><td style="padding:4px 10px;color:#555">${m.concepto} (${m.medio || 'efectivo'})</td><td style="padding:4px 10px;text-align:right;color:#ef4444">-$${parseFloat(m.monto).toLocaleString('es-AR')}</td></tr>`).join('')

  const el = document.createElement('div')
  el.style.cssText = 'font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px;width:190mm'
  el.innerHTML = `
    <h1 style="font-size:20px;font-weight:bold;margin-bottom:2px">CEKETO — Resumen de Caja #${c.caja.id}</h1>
    <p style="font-size:11px;color:#666;margin-bottom:2px">Apertura: ${fechaApertura}${c.caja.usuario ? ' · ' + c.caja.usuario : ''} · Cierre: ${fechaCierre}</p>
    <p style="font-size:10px;color:#999;margin-bottom:16px">Generado: ${ahora}</p>
    <h2 style="font-size:13px;font-weight:bold;margin-bottom:6px;color:#2a9d8f">Ventas por método</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
      <thead><tr style="background:#2a9d8f;color:white"><th style="padding:7px 10px;text-align:left">Método</th><th style="padding:7px 10px;text-align:right">Total</th></tr></thead>
      <tbody>${filasVentas}</tbody>
      <tfoot><tr style="background:#f0fdf9;font-weight:bold"><td style="padding:7px 10px;border-top:2px solid #2a9d8f">TOTAL VENTAS</td><td style="padding:7px 10px;border-top:2px solid #2a9d8f;text-align:right;color:#2a9d8f">$${(c.totalVentas || 0).toLocaleString('es-AR')}</td></tr></tfoot>
    </table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div style="background:#f9fafb;border-radius:8px;padding:12px">
        <p style="font-size:12px;font-weight:bold;margin-bottom:8px">💵 Efectivo</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Saldo inicial</span><span>$${parseFloat(c.caja.saldo_inicial).toLocaleString('es-AR')}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Ventas efectivo</span><span style="color:#2a9d8f">+$${(c.ventasPorMetodo?.efectivo || 0).toLocaleString('es-AR')}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px"><span>Saldo teórico</span><span style="color:#2a9d8f">$${(c.saldoTeorico || 0).toLocaleString('es-AR')}</span></div>
        ${c.caja.arqueo_efectivo != null ? `<div style="display:flex;justify-content:space-between;margin-top:4px"><span>Contado</span><span>$${parseFloat(c.caja.arqueo_efectivo).toLocaleString('es-AR')}</span></div>` : ''}
      </div>
      <div style="background:#f0f7ff;border-radius:8px;padding:12px">
        <p style="font-size:12px;font-weight:bold;margin-bottom:8px">📲 Billetera virtual</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Cobros digitales</span><span style="color:#2a9d8f">+$${(c.billeteraVentas || 0).toLocaleString('es-AR')}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px solid #dbeafe;padding-top:6px;margin-top:4px"><span>Saldo final</span><span style="color:#2563eb">$${(c.saldoBilleteraFinal || 0).toLocaleString('es-AR')}</span></div>
        ${c.caja.arqueo_billetera != null ? `<div style="display:flex;justify-content:space-between;margin-top:4px"><span>Real</span><span>$${parseFloat(c.caja.arqueo_billetera).toLocaleString('es-AR')}</span></div>` : ''}
      </div>
    </div>
    ${(movIngresos.length || movEgresos.length) ? `
    <h2 style="font-size:13px;font-weight:bold;margin-bottom:6px;color:#555">Movimientos manuales</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
      <thead><tr style="background:#f9fafb"><th style="padding:6px 10px;text-align:left;color:#555">Concepto</th><th style="padding:6px 10px;text-align:right;color:#555">Monto</th></tr></thead>
      <tbody>${filasMovIngresos}${filasMovEgresos}</tbody>
    </table>` : ''}
    ${c.caja.nota_cierre ? `<p style="font-size:11px;color:#555;font-style:italic">Nota: ${c.caja.nota_cierre}</p>` : ''}
    <p style="font-size:10px;color:#999;text-align:right;margin-top:12px">CEKETO · Independencia 663, Santiago del Estero</p>
  `
  document.body.appendChild(el)
  const fecha = new Date(c.caja.fecha_apertura).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  html2pdf().set({
    margin: [8, 8, 8, 8],
    filename: `caja-${c.caja.id}-ceketo-${fecha}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save().then(() => document.body.removeChild(el))
}

function descargarExcelHistorialDetalle() {
  const c = historialDetalle.value
  if (!c) return
  const wb = XLSX.utils.book_new()

  const ventasFilas = METODOS_ORDEN
    .filter(m => (c.ventasPorMetodo[m] || 0) > 0)
    .map(m => ({ 'Método': metodoLabel(m), 'Total ($)': c.ventasPorMetodo[m] || 0 }))
  ventasFilas.push({ 'Método': 'TOTAL VENTAS', 'Total ($)': c.totalVentas || 0 })
  ventasFilas.push({ 'Método': '', 'Total ($)': '' })
  ventasFilas.push({ 'Método': 'Saldo teórico efectivo', 'Total ($)': c.saldoTeorico || 0 })
  ventasFilas.push({ 'Método': 'Saldo final billetera',  'Total ($)': c.saldoBilleteraFinal || 0 })
  if (c.caja.arqueo_efectivo != null) ventasFilas.push({ 'Método': 'Contado efectivo', 'Total ($)': parseFloat(c.caja.arqueo_efectivo) })
  if (c.caja.arqueo_billetera != null) ventasFilas.push({ 'Método': 'Real billetera',    'Total ($)': parseFloat(c.caja.arqueo_billetera) })
  const wsResumen = XLSX.utils.json_to_sheet(ventasFilas)
  wsResumen['!cols'] = [{ wch: 28 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  if (c.movimientos?.length) {
    const movFilas = c.movimientos.map(m => ({
      'Tipo': m.tipo, 'Concepto': m.concepto,
      'Medio': m.medio || 'efectivo',
      'Monto ($)': m.tipo === 'ingreso' ? parseFloat(m.monto) : -parseFloat(m.monto),
    }))
    const wsMov = XLSX.utils.json_to_sheet(movFilas)
    wsMov['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, wsMov, 'Movimientos')
  }

  const fecha = new Date(c.caja.fecha_apertura).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  XLSX.writeFile(wb, `caja-${c.caja.id}-ceketo-${fecha}.xlsx`)
}

const METODOS_ORDEN = ['efectivo', 'transferencia', 'qr', 'debito', 'credito', 'cuenta_corriente', 'sin_metodo']

function buildDatosCaja() {
  const c = cajaActual.value
  const fechaApertura = formatFechaHora(c.caja.fecha_apertura)
  const ahora = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })

  // Ventas por método en orden
  const ventasMetodo = METODOS_ORDEN
    .filter(m => (c.ventasPorMetodo[m] || 0) > 0)
    .map(m => ({ metodo: metodoLabel(m), total: c.ventasPorMetodo[m] || 0 }))

  // Movimientos manuales
  const movIngresos = c.movimientos.filter(m => m.tipo === 'ingreso')
  const movEgresos  = c.movimientos.filter(m => m.tipo === 'egreso')

  return { c, fechaApertura, ahora, ventasMetodo, movIngresos, movEgresos }
}

function descargarPDF() {
  const { c, fechaApertura, ahora, ventasMetodo, movIngresos, movEgresos } = buildDatosCaja()

  const filasVentas = ventasMetodo.map(v =>
    `<tr><td style="padding:5px 10px;border-bottom:1px solid #e5e7eb">${v.metodo}</td><td style="padding:5px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;color:#2a9d8f">$${v.total.toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const filasMovIngresos = movIngresos.map(m =>
    `<tr><td style="padding:4px 10px;border-bottom:1px solid #f3f4f6;color:#555">${m.concepto}</td><td style="padding:4px 10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#2a9d8f">+$${parseFloat(m.monto).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const filasMovEgresos = movEgresos.map(m =>
    `<tr><td style="padding:4px 10px;border-bottom:1px solid #f3f4f6;color:#555">${m.concepto}</td><td style="padding:4px 10px;border-bottom:1px solid #f3f4f6;text-align:right;color:#ef4444">-$${parseFloat(m.monto).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const el = document.createElement('div')
  el.style.cssText = 'font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px;width:190mm'
  el.innerHTML = `
    <h1 style="font-size:20px;font-weight:bold;margin-bottom:2px">CEKETO — Informe de Caja</h1>
    <p style="font-size:11px;color:#666;margin-bottom:2px">Apertura: ${fechaApertura}${c.caja.usuario ? ' · ' + c.caja.usuario : ''}</p>
    <p style="font-size:10px;color:#999;margin-bottom:16px">Generado: ${ahora}</p>

    <h2 style="font-size:13px;font-weight:bold;margin-bottom:6px;color:#2a9d8f">Ventas por método de pago</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
      <thead><tr style="background:#2a9d8f;color:white">
        <th style="padding:7px 10px;text-align:left">Concepto</th>
        <th style="padding:7px 10px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${filasVentas}</tbody>
      <tfoot><tr style="background:#f0fdf9;font-weight:bold">
        <td style="padding:7px 10px;border-top:2px solid #2a9d8f">TOTAL VENTAS</td>
        <td style="padding:7px 10px;border-top:2px solid #2a9d8f;text-align:right;color:#2a9d8f">$${c.totalVentas.toLocaleString('es-AR')}</td>
      </tr></tfoot>
    </table>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div style="background:#f9fafb;border-radius:8px;padding:12px">
        <p style="font-size:12px;font-weight:bold;margin-bottom:8px">💵 Efectivo</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Saldo inicial</span><span>$${parseFloat(c.caja.saldo_inicial).toLocaleString('es-AR')}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Ventas efectivo</span><span style="color:#2a9d8f">+$${(c.ventasPorMetodo['efectivo'] || 0).toLocaleString('es-AR')}</span></div>
        ${c.totalIngresos > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Ingresos manuales</span><span style="color:#2a9d8f">+$${c.totalIngresos.toLocaleString('es-AR')}</span></div>` : ''}
        ${c.totalEgresos > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Egresos manuales</span><span style="color:#ef4444">-$${c.totalEgresos.toLocaleString('es-AR')}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px"><span>Saldo teórico</span><span style="color:#2a9d8f">$${c.saldoTeorico.toLocaleString('es-AR')}</span></div>
      </div>
      <div style="background:#f0f7ff;border-radius:8px;padding:12px">
        <p style="font-size:12px;font-weight:bold;margin-bottom:8px">📲 Billetera virtual</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Saldo inicial</span><span>$${parseFloat(c.caja.saldo_billetera_inicial).toLocaleString('es-AR')}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#555">Cobros digitales</span><span style="color:#2a9d8f">+$${(c.billeteraVentas || 0).toLocaleString('es-AR')}</span></div>
        ${['transferencia','qr','debito','credito'].filter(m => (c.ventasPorMetodo[m]||0)>0).map(m =>
          `<div style="display:flex;justify-content:space-between;margin-bottom:2px;padding-left:12px;font-size:10px;color:#888"><span>${metodoLabel(m)}</span><span>$${(c.ventasPorMetodo[m]||0).toLocaleString('es-AR')}</span></div>`
        ).join('')}
        <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px solid #dbeafe;padding-top:6px;margin-top:4px"><span>Saldo final</span><span style="color:#2563eb">$${c.saldoBilleteraFinal.toLocaleString('es-AR')}</span></div>
      </div>
    </div>

    ${(movIngresos.length || movEgresos.length) ? `
    <h2 style="font-size:13px;font-weight:bold;margin-bottom:6px;color:#555">Movimientos manuales</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
      <thead><tr style="background:#f9fafb"><th style="padding:6px 10px;text-align:left;color:#555">Concepto</th><th style="padding:6px 10px;text-align:right;color:#555">Monto</th></tr></thead>
      <tbody>${filasMovIngresos}${filasMovEgresos}</tbody>
    </table>` : ''}

    <p style="font-size:10px;color:#999;text-align:right">CEKETO · Independencia 663, Santiago del Estero</p>
  `

  document.body.appendChild(el)
  const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  html2pdf().set({
    margin: [8, 8, 8, 8],
    filename: `caja-ceketo-${fecha}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save().then(() => document.body.removeChild(el))
}

function descargarExcel() {
  const { c, fechaApertura, ventasMetodo, movIngresos, movEgresos } = buildDatosCaja()
  const wb = XLSX.utils.book_new()

  // Hoja 1: Resumen
  const resumenFilas = [
    { 'Concepto': 'VENTAS POR MÉTODO DE PAGO', 'Monto ($)': '' },
    ...ventasMetodo.map(v => ({ 'Concepto': v.metodo, 'Monto ($)': v.total })),
    { 'Concepto': 'TOTAL VENTAS', 'Monto ($)': c.totalVentas },
    { 'Concepto': '', 'Monto ($)': '' },
    { 'Concepto': 'EFECTIVO', 'Monto ($)': '' },
    { 'Concepto': 'Saldo inicial', 'Monto ($)': parseFloat(c.caja.saldo_inicial) },
    { 'Concepto': 'Ventas efectivo', 'Monto ($)': c.ventasPorMetodo['efectivo'] || 0 },
    ...(c.totalIngresos > 0 ? [{ 'Concepto': 'Ingresos manuales', 'Monto ($)': c.totalIngresos }] : []),
    ...(c.totalEgresos > 0  ? [{ 'Concepto': 'Egresos manuales', 'Monto ($)': -c.totalEgresos }] : []),
    { 'Concepto': 'Saldo teórico efectivo', 'Monto ($)': c.saldoTeorico },
    { 'Concepto': '', 'Monto ($)': '' },
    { 'Concepto': 'BILLETERA VIRTUAL', 'Monto ($)': '' },
    { 'Concepto': 'Saldo inicial billetera', 'Monto ($)': parseFloat(c.caja.saldo_billetera_inicial) },
    { 'Concepto': 'Cobros digitales', 'Monto ($)': c.billeteraVentas || 0 },
    { 'Concepto': 'Saldo final billetera', 'Monto ($)': c.saldoBilleteraFinal },
  ]
  const wsResumen = XLSX.utils.json_to_sheet(resumenFilas)
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // Hoja 2: Movimientos manuales
  if (c.movimientos.length) {
    const movFilas = c.movimientos.map(m => ({
      'Tipo':     m.tipo,
      'Concepto': m.concepto,
      'Monto ($)': m.tipo === 'ingreso' ? parseFloat(m.monto) : -parseFloat(m.monto),
    }))
    const wsMov = XLSX.utils.json_to_sheet(movFilas)
    wsMov['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, wsMov, 'Movimientos')
  }

  const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  XLSX.writeFile(wb, `caja-ceketo-${fecha}.xlsx`)
}

onMounted(cargar)
</script>
