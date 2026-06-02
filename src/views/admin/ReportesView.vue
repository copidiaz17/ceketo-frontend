<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Reportes</h1>
        <p class="font-body text-gray-500 mt-1">Análisis integral del negocio</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportarExcel" :disabled="exportando"
          class="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl font-body text-sm hover:bg-green-100 transition-colors disabled:opacity-50">
          {{ exportando ? 'Generando...' : '⬇ Excel' }}
        </button>
        <button @click="exportarPDF"
          class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-body text-sm hover:bg-red-100 transition-colors">
          ⬇ PDF
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Desde</label>
          <input type="date" v-model="filtroDesde"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Hasta</label>
          <input type="date" v-model="filtroHasta"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal" />
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Categoría</label>
          <select v-model="filtroCategoriaId" @change="filtroProductoId = null"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal">
            <option :value="null">— Todas —</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block font-body text-xs text-gray-400 mb-1.5">Producto</label>
          <select v-model="filtroProductoId"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm focus:outline-none focus:border-teal">
            <option :value="null">— Todos —</option>
            <option v-for="p in productosFiltrados" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="cargar" :disabled="loading"
          class="px-5 py-2 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors disabled:opacity-50">
          {{ loading ? 'Cargando...' : 'Filtrar' }}
        </button>
        <button @click="limpiar"
          class="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl font-body text-sm hover:bg-gray-100 transition-colors">
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-gray-400 font-body">Cargando reporte...</div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Total ingresos</p>
          <p class="font-display text-2xl font-bold text-teal">${{ fmt(kpis.total) }}</p>
          <p v-if="kpis.total_envios > 0" class="font-body text-xs text-blue-500 mt-1">incl. ${{ fmt(kpis.total_envios) }} envíos</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Total gastos</p>
          <p class="font-display text-2xl font-bold text-red-500">${{ fmt(totalGastos) }}</p>
          <p class="font-body text-xs text-gray-400 mt-1">{{ gastos.length }} comprobante{{ gastos.length !== 1 ? 's' : '' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Resultado neto</p>
          <p class="font-display text-2xl font-bold" :class="resultadoNeto >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ resultadoNeto >= 0 ? '+' : '' }}${{ fmt(resultadoNeto) }}
          </p>
          <p class="font-body text-xs mt-1" :class="resultadoNeto >= 0 ? 'text-green-500' : 'text-red-400'">
            {{ resultadoNeto >= 0 ? '▲ Ganancia' : '▼ Pérdida' }}
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <p class="font-body text-xs text-gray-400 mb-1">Operaciones</p>
          <p class="font-display text-2xl font-bold text-gray-900">{{ kpis.n_operaciones }}</p>
          <p class="font-body text-xs text-gray-400 mt-1">Ticket prom: ${{ fmt(kpis.ticket_promedio) }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button v-for="t in tabs" :key="t.id" @click="cambiarTab(t.id)"
            class="px-5 py-4 font-body text-sm whitespace-nowrap border-b-2 transition-all"
            :class="tabActivo === t.id ? 'border-teal text-teal font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'">
            {{ t.label }}
          </button>
        </div>

        <!-- ═══ TAB: VENTAS ══════════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'ventas'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">#</th>
                <th class="text-left px-4 py-3">Fecha</th>
                <th class="text-left px-4 py-3">Origen</th>
                <th class="text-left px-4 py-3">Cliente</th>
                <th class="text-left px-4 py-3">Pago</th>
                <th class="text-left px-4 py-3">Entrega</th>
                <th class="text-left px-4 py-3">Observación</th>
                <th class="text-right px-4 py-3">Desc.</th>
                <th class="text-right px-4 py-3">Envío</th>
                <th class="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="operaciones.length === 0"><td colspan="10" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="op in operaciones" :key="op.id" class="border-b border-gray-100 hover:bg-gray-50"
                :class="op.descuento > 0 ? 'bg-orange-50/30' : ''">
                <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ op.id }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">{{ formatFecha(op.fecha) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="op.origen === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
                    {{ op.origen }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ op.cliente }}</td>
                <td class="px-4 py-3 text-xs text-gray-500 capitalize">{{ op.metodo_pago }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="op.entrega === 'Delivery' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'">
                    {{ op.entrega }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{{ op.nota || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <span v-if="op.descuento > 0" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">-{{ op.descuento }}%</span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3 text-right text-xs text-blue-500">
                  <span v-if="op.costo_envio > 0">${{ fmt(op.costo_envio) }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-4 py-3 text-right font-bold text-teal">${{ fmt(op.total) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="operaciones.length > 0">
              <tr class="bg-teal/10 border-t-2 border-teal/30">
                <td colspan="9" class="px-4 py-3 font-semibold text-gray-700 text-sm">TOTAL</td>
                <td class="px-4 py-3 text-right font-display font-bold text-teal text-base">${{ fmt(kpis.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ═══ TAB: RESULTADO ═══════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'resultado'" class="p-6">
          <!-- Resumen grande -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div class="bg-teal/10 border border-teal/30 rounded-2xl p-6 text-center">
              <p class="font-body text-sm text-gray-500 mb-1">↑ Ingresos totales</p>
              <p class="font-display text-3xl font-bold text-teal">${{ fmt(kpis.total) }}</p>
              <p class="font-body text-xs text-gray-400 mt-2">{{ kpis.n_operaciones }} operaciones</p>
            </div>
            <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p class="font-body text-sm text-gray-500 mb-1">↓ Gastos totales</p>
              <p class="font-display text-3xl font-bold text-red-500">${{ fmt(totalGastos) }}</p>
              <p class="font-body text-xs text-gray-400 mt-2">{{ gastos.length }} comprobantes</p>
            </div>
            <div :class="resultadoNeto >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'"
              class="border-2 rounded-2xl p-6 text-center">
              <p class="font-body text-sm text-gray-500 mb-1">= Resultado neto</p>
              <p class="font-display text-3xl font-bold" :class="resultadoNeto >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ resultadoNeto >= 0 ? '+' : '' }}${{ fmt(resultadoNeto) }}
              </p>
              <p class="font-body text-xs mt-2" :class="resultadoNeto >= 0 ? 'text-green-600' : 'text-red-500'">
                {{ resultadoNeto >= 0 ? '▲ Ganancia del período' : '▼ Pérdida del período' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Ingresos por método de pago -->
            <div>
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">Ingresos por método de pago</h3>
              <div class="space-y-2">
                <div v-for="(monto, metodo) in ventasPorMetodo" :key="metodo"
                  class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ iconMetodo(metodo) }}</span>
                    <span class="font-body text-sm text-gray-700 capitalize">{{ labelMetodo(metodo) }}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-body font-bold text-teal">${{ fmt(monto) }}</span>
                    <span class="font-body text-xs text-gray-400 ml-2">({{ kpis.total > 0 ? Math.round(monto/kpis.total*100) : 0 }}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gastos por categoría -->
            <div>
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">Gastos por categoría</h3>
              <div class="space-y-2">
                <div v-for="(data, cat) in gastosPorCategoria" :key="cat"
                  class="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                  <span class="font-body text-sm text-gray-700">{{ cat }}</span>
                  <div class="text-right">
                    <span class="font-body font-bold text-red-500">${{ fmt(data.total) }}</span>
                    <span class="font-body text-xs text-gray-400 ml-2">({{ totalGastos > 0 ? Math.round(data.total/totalGastos*100) : 0 }}%)</span>
                  </div>
                </div>
                <div v-if="!Object.keys(gastosPorCategoria).length" class="text-center text-gray-400 py-4 font-body text-sm">Sin gastos en el período</div>
              </div>
              <div v-if="ivaTotal > 0" class="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex justify-between">
                <span class="font-body text-xs text-orange-700 font-semibold">IVA discriminado (crédito fiscal)</span>
                <span class="font-body text-sm font-bold text-orange-700">${{ fmt(ivaTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ TAB: MÉTODOS DE PAGO ═════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'metodos'" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-4">Ingresos por método</h3>
              <div class="space-y-3">
                <div v-for="(monto, metodo) in ventasPorMetodo" :key="metodo"
                  class="bg-gray-50 rounded-xl px-5 py-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">{{ iconMetodo(metodo) }}</span>
                      <span class="font-body font-semibold text-gray-800 capitalize">{{ labelMetodo(metodo) }}</span>
                    </div>
                    <span class="font-display font-bold text-teal text-lg">${{ fmt(monto) }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-teal h-2 rounded-full transition-all" :style="{ width: Math.min(kpis.total > 0 ? monto/kpis.total*100 : 0, 100) + '%' }"></div>
                  </div>
                  <p class="font-body text-xs text-gray-400 mt-1 text-right">
                    {{ kpis.total > 0 ? (monto/kpis.total*100).toFixed(1) : 0 }}% del total
                  </p>
                </div>
                <div v-if="!Object.keys(ventasPorMetodo).length" class="text-center text-gray-400 py-8 font-body text-sm">Sin datos</div>
              </div>
            </div>

            <div>
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-4">Resumen del período</h3>
              <div class="space-y-3">
                <div class="bg-teal/10 rounded-xl px-5 py-4 flex justify-between">
                  <span class="font-body text-sm text-gray-600">Total operaciones</span>
                  <span class="font-body font-bold text-teal">{{ kpis.n_operaciones }}</span>
                </div>
                <div class="bg-gray-50 rounded-xl px-5 py-4 flex justify-between">
                  <span class="font-body text-sm text-gray-600">Ticket promedio</span>
                  <span class="font-body font-bold text-gray-800">${{ fmt(kpis.ticket_promedio) }}</span>
                </div>
                <div class="bg-gray-50 rounded-xl px-5 py-4 flex justify-between">
                  <span class="font-body text-sm text-gray-600">Unidades vendidas</span>
                  <span class="font-body font-bold text-gray-800">{{ kpis.unidades }}</span>
                </div>
                <div v-if="kpis.total_envios > 0" class="bg-blue-50 rounded-xl px-5 py-4 flex justify-between">
                  <span class="font-body text-sm text-blue-600">Total costos de envío</span>
                  <span class="font-body font-bold text-blue-700">${{ fmt(kpis.total_envios) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ TAB: GASTOS ══════════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'gastos'" ref="tablaRef" class="overflow-x-auto">
          <div class="p-4 flex flex-wrap gap-3 border-b border-gray-100">
            <div v-for="(data, cat) in gastosPorCategoria" :key="cat"
              class="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center min-w-[110px]">
              <p class="font-body text-xs text-gray-500">{{ cat }}</p>
              <p class="font-body font-bold text-red-600">${{ fmt(data.total) }}</p>
            </div>
            <div class="bg-red-100 border border-red-200 rounded-xl px-4 py-2 text-center min-w-[110px]">
              <p class="font-body text-xs text-gray-600 font-semibold">TOTAL</p>
              <p class="font-body font-bold text-red-700 text-lg">${{ fmt(totalGastos) }}</p>
            </div>
          </div>
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">Fecha</th>
                <th class="text-left px-4 py-3">Categoría</th>
                <th class="text-left px-4 py-3">Descripción</th>
                <th class="text-left px-4 py-3">Proveedor</th>
                <th class="text-left px-4 py-3">Método</th>
                <th class="text-center px-4 py-3">Factura</th>
                <th class="text-right px-4 py-3">IVA</th>
                <th class="text-right px-4 py-3">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="gastos.length === 0"><td colspan="8" class="text-center py-12 text-gray-400">Sin gastos en el período</td></tr>
              <tr v-for="(g, i) in gastos" :key="g.id" class="border-b border-gray-100 hover:bg-gray-50"
                :class="i % 2 === 1 ? 'bg-gray-50/50' : ''">
                <td class="px-4 py-3 text-xs text-gray-500">{{ g.fecha }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{{ g.categoria }}</span>
                </td>
                <td class="px-4 py-3 text-gray-800 max-w-[200px] truncate">{{ g.descripcion }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ g.proveedor || '—' }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs capitalize">{{ g.metodo_pago || '—' }}</td>
                <td class="px-4 py-3 text-center">
                  <span v-if="g.es_factura" class="text-green-600 text-xs font-semibold">✓ A{{ g.alicuota_iva }}%</span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3 text-right text-xs text-orange-600">
                  <span v-if="g.iva_monto > 0">${{ fmt(g.iva_monto) }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-4 py-3 text-right font-bold text-red-500">${{ fmt(g.monto) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="gastos.length > 0">
              <tr class="bg-red-50 border-t-2 border-red-200">
                <td colspan="7" class="px-4 py-3 font-semibold text-gray-700 text-sm">TOTAL GASTOS</td>
                <td class="px-4 py-3 text-right font-display font-bold text-red-600 text-base">${{ fmt(totalGastos) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ═══ TAB: PRODUCCIÓN ══════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'produccion'" ref="tablaRef">
          <div class="p-4 border-b border-gray-100 flex items-center gap-6">
            <div class="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3 text-center">
              <p class="font-body text-xs text-gray-500">Lotes producidos</p>
              <p class="font-display font-bold text-purple-700 text-xl">{{ lotes.length }}</p>
            </div>
            <div class="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3 text-center">
              <p class="font-body text-xs text-gray-500">Unidades totales</p>
              <p class="font-display font-bold text-purple-700 text-xl">{{ totalUnidadesProducidas }}</p>
            </div>
          </div>

          <!-- Resumen por producto -->
          <div class="p-4 border-b border-gray-100">
            <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">Productos más producidos</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div v-for="p in produccionPorProducto.slice(0, 8)" :key="p.producto"
                class="bg-gray-50 rounded-xl px-4 py-3">
                <p class="font-body text-xs text-gray-500 truncate">{{ p.producto }}</p>
                <p class="font-body text-sm font-bold text-gray-800">{{ p.cantidad }} u.</p>
                <p class="font-body text-xs text-purple-500">{{ p.categoria }}</p>
              </div>
            </div>
          </div>

          <!-- Lotes detalle -->
          <div class="overflow-x-auto">
            <table class="w-full font-body text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                  <th class="text-left px-4 py-3">Fecha</th>
                  <th class="text-left px-4 py-3">Lote ID</th>
                  <th class="text-left px-4 py-3">Productos</th>
                  <th class="text-right px-4 py-3">Total unidades</th>
                  <th class="text-left px-4 py-3">Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="lotes.length === 0"><td colspan="5" class="text-center py-12 text-gray-400">Sin producción en el período</td></tr>
                <tr v-for="(lote, i) in lotes" :key="lote.lote_id" class="border-b border-gray-100 hover:bg-gray-50"
                  :class="i % 2 === 1 ? 'bg-gray-50/50' : ''">
                  <td class="px-4 py-3 text-xs text-gray-500">{{ lote.fecha }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-purple-600">{{ lote.lote_id?.slice(0, 8) || '—' }}</td>
                  <td class="px-4 py-3 text-xs text-gray-700">
                    <span v-for="item in lote.items" :key="item.producto" class="mr-2">
                      {{ item.producto }} ({{ item.cantidad }})
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right font-bold text-purple-700">{{ lote.total_unidades }}</td>
                  <td class="px-4 py-3 text-xs text-gray-400">{{ lote.nota || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ TAB: STOCK ════════════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'stock'" ref="tablaRef">
          <div class="p-4 border-b border-gray-100 flex flex-wrap gap-4">
            <div class="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-center">
              <p class="font-body text-xs text-gray-500">Valor al costo</p>
              <p class="font-display font-bold text-blue-700 text-xl">${{ fmt(stockValorCosto) }}</p>
            </div>
            <div class="bg-teal/10 border border-teal/30 rounded-xl px-5 py-3 text-center">
              <p class="font-body text-xs text-gray-500">Valor de venta</p>
              <p class="font-display font-bold text-teal text-xl">${{ fmt(stockValorVenta) }}</p>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-center">
              <p class="font-body text-xs text-gray-500">Margen potencial</p>
              <p class="font-display font-bold text-green-700 text-xl">${{ fmt(stockValorVenta - stockValorCosto) }}</p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full font-body text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                  <th class="text-left px-4 py-3">Categoría</th>
                  <th class="text-left px-4 py-3">Producto</th>
                  <th class="text-left px-4 py-3">Código</th>
                  <th class="text-right px-4 py-3">Stock</th>
                  <th class="text-right px-4 py-3">P. Costo</th>
                  <th class="text-right px-4 py-3">P. Venta</th>
                  <th class="text-right px-4 py-3">Val. Costo</th>
                  <th class="text-right px-4 py-3">Val. Venta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="stock.length === 0"><td colspan="8" class="text-center py-12 text-gray-400">Sin productos</td></tr>
                <tr v-for="(p, i) in stock" :key="p.id" class="border-b border-gray-100 hover:bg-gray-50"
                  :class="i % 2 === 1 ? 'bg-gray-50/50' : ''">
                  <td class="px-4 py-2.5 text-xs text-gray-500">{{ p.categoria?.nombre || '—' }}</td>
                  <td class="px-4 py-2.5 text-gray-800 font-medium">{{ p.nombre }}</td>
                  <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ p.codigo }}</td>
                  <td class="px-4 py-2.5 text-right font-bold" :class="p.stock <= 0 ? 'text-red-500' : 'text-gray-800'">{{ p.stock }}</td>
                  <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(p.precio_costo || 0) }}</td>
                  <td class="px-4 py-2.5 text-right text-gray-600">${{ fmt(p.precio) }}</td>
                  <td class="px-4 py-2.5 text-right text-blue-600 font-medium">${{ fmt(Number(p.stock) * Number(p.precio_costo || 0)) }}</td>
                  <td class="px-4 py-2.5 text-right text-teal font-bold">${{ fmt(Number(p.stock) * Number(p.precio)) }}</td>
                </tr>
              </tbody>
              <tfoot v-if="stock.length > 0">
                <tr class="bg-teal/10 border-t-2 border-teal/30">
                  <td colspan="6" class="px-4 py-3 font-semibold text-gray-700 text-sm">TOTAL STOCK VALORIZADO</td>
                  <td class="px-4 py-3 text-right font-bold text-blue-700">${{ fmt(stockValorCosto) }}</td>
                  <td class="px-4 py-3 text-right font-bold text-teal">${{ fmt(stockValorVenta) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ═══ TAB: CAJA ═════════════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'caja'" class="p-6 space-y-6">

          <!-- Resumen del período -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Ventas por método -->
            <div class="bg-gray-50 rounded-2xl p-5">
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-4">💰 Ventas por método de pago</h3>
              <div class="space-y-2">
                <div v-for="(monto, metodo) in ventasPorMetodo" :key="metodo"
                  class="flex justify-between font-body text-sm">
                  <span class="text-gray-600 capitalize">{{ labelMetodo(metodo) }}</span>
                  <span class="font-bold text-teal">${{ fmt(monto) }}</span>
                </div>
                <div class="flex justify-between font-body text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                  <span class="text-gray-700">Total ventas</span>
                  <span class="text-teal text-base">${{ fmt(kpis.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Gastos por método -->
            <div class="bg-red-50 rounded-2xl p-5">
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-4">💸 Gastos por método de pago</h3>
              <div class="space-y-2">
                <div v-for="(data, cat) in gastosPorCategoria" :key="cat"
                  class="flex justify-between font-body text-sm">
                  <span class="text-gray-600">{{ cat }}</span>
                  <span class="font-bold text-red-500">-${{ fmt(data.total) }}</span>
                </div>
                <div class="space-y-1 pt-2 border-t border-red-100">
                  <div class="flex justify-between font-body text-xs text-gray-500">
                    <span>💵 Gastos en efectivo</span>
                    <span>-${{ fmt(gastosPorMedio.efectivo) }}</span>
                  </div>
                  <div v-if="gastosPorMedio.digital > 0" class="flex justify-between font-body text-xs text-gray-500">
                    <span>📲 Gastos digitales</span>
                    <span>-${{ fmt(gastosPorMedio.digital) }}</span>
                  </div>
                </div>
                <div class="flex justify-between font-body text-sm font-bold border-t border-red-200 pt-2">
                  <span class="text-gray-700">Total gastos</span>
                  <span class="text-red-600 text-base">-${{ fmt(totalGastos) }}</span>
                </div>
              </div>
            </div>

            <!-- Movimientos manuales -->
            <div class="bg-blue-50 rounded-2xl p-5">
              <h3 class="font-body text-sm font-semibold text-gray-700 mb-4">🔄 Movimientos manuales</h3>
              <div class="space-y-3">
                <!-- Efectivo -->
                <div class="bg-white/70 rounded-xl px-4 py-3">
                  <p class="font-body text-xs text-gray-500 font-semibold mb-2">💵 Efectivo</p>
                  <div class="flex justify-between font-body text-sm mb-1">
                    <span class="text-gray-600">Ingresos</span>
                    <span class="font-bold text-teal">+${{ fmt(resumenMovimientos.ingresos_efectivo) }}</span>
                  </div>
                  <div class="flex justify-between font-body text-sm">
                    <span class="text-gray-600">Egresos</span>
                    <span class="font-bold text-red-500">-${{ fmt(resumenMovimientos.egresos_efectivo) }}</span>
                  </div>
                </div>
                <!-- Billetera -->
                <div class="bg-white/70 rounded-xl px-4 py-3">
                  <p class="font-body text-xs text-gray-500 font-semibold mb-2">📲 Billetera</p>
                  <div class="flex justify-between font-body text-sm mb-1">
                    <span class="text-gray-600">Ingresos</span>
                    <span class="font-bold text-teal">+${{ fmt(resumenMovimientos.ingresos_billetera) }}</span>
                  </div>
                  <div class="flex justify-between font-body text-sm">
                    <span class="text-gray-600">Egresos</span>
                    <span class="font-bold text-red-500">-${{ fmt(resumenMovimientos.egresos_billetera) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detalle de movimientos manuales del período -->
          <div v-if="resumenMovimientos.detalle?.length">
            <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">Detalle movimientos manuales</h3>
            <div class="overflow-x-auto" ref="tablaRef">
              <table class="w-full font-body text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                    <th class="text-left px-4 py-3">Fecha/Hora</th>
                    <th class="text-left px-4 py-3">Caja #</th>
                    <th class="text-left px-4 py-3">Concepto</th>
                    <th class="text-left px-4 py-3">Medio</th>
                    <th class="text-left px-4 py-3">Tipo</th>
                    <th class="text-right px-4 py-3">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(m, i) in resumenMovimientos.detalle" :key="m.id"
                    class="border-b border-gray-100 hover:bg-gray-50"
                    :class="i % 2 === 1 ? 'bg-gray-50/50' : ''">
                    <td class="px-4 py-2.5 text-xs text-gray-500">{{ formatFecha(m.fecha) }}</td>
                    <td class="px-4 py-2.5 text-xs text-gray-400">#{{ m.caja_id }}</td>
                    <td class="px-4 py-2.5 text-gray-800">{{ m.concepto }}</td>
                    <td class="px-4 py-2.5 text-xs">
                      <span class="px-2 py-0.5 rounded-full"
                        :class="m.medio === 'billetera' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
                        {{ m.medio === 'billetera' ? '📲 Billetera' : '💵 Efectivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-2.5">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="m.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ m.tipo }}
                      </span>
                    </td>
                    <td class="px-4 py-2.5 text-right font-bold"
                      :class="m.tipo === 'ingreso' ? 'text-teal' : 'text-red-500'">
                      {{ m.tipo === 'ingreso' ? '+' : '-' }}${{ fmt(m.monto) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Lista de cajas del período -->
          <div>
            <h3 class="font-body text-sm font-semibold text-gray-700 mb-3">Cajas del período ({{ cajas.length }})</h3>
            <div class="overflow-x-auto">
              <table class="w-full font-body text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                    <th class="text-left px-4 py-3">#</th>
                    <th class="text-left px-4 py-3">Apertura</th>
                    <th class="text-left px-4 py-3">Cierre</th>
                    <th class="text-left px-4 py-3">Usuario</th>
                    <th class="text-right px-4 py-3">Saldo inicial</th>
                    <th class="text-right px-4 py-3">Arqueo efectivo</th>
                    <th class="text-right px-4 py-3">Arqueo billetera</th>
                    <th class="text-center px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="cajas.length === 0"><td colspan="8" class="text-center py-8 text-gray-400">Sin cajas en el período</td></tr>
                  <tr v-for="(c, i) in cajas" :key="c.id" class="border-b border-gray-100 hover:bg-gray-50"
                    :class="i % 2 === 1 ? 'bg-gray-50/50' : ''">
                    <td class="px-4 py-3 text-xs text-gray-400">{{ c.id }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">{{ formatFechaCorta(c.fecha_apertura) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">{{ c.fecha_cierre ? formatFechaCorta(c.fecha_cierre) : '—' }}</td>
                    <td class="px-4 py-3 text-gray-700">{{ c.usuario || '—' }}</td>
                    <td class="px-4 py-3 text-right">${{ fmt(c.saldo_inicial) }}</td>
                    <td class="px-4 py-3 text-right font-medium text-teal">
                      <span v-if="c.arqueo_efectivo !== null">${{ fmt(c.arqueo_efectivo) }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-blue-600">
                      <span v-if="c.arqueo_billetera !== null">${{ fmt(c.arqueo_billetera) }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="c.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                        {{ c.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ TAB: DETALLE PRODUCTOS ═══════════════════════════════════════════ -->
        <div v-if="tabActivo === 'detalle'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">Operación</th>
                <th class="text-left px-4 py-3">Fecha</th>
                <th class="text-left px-4 py-3">Categoría</th>
                <th class="text-left px-4 py-3">Producto</th>
                <th class="text-left px-4 py-3">Código</th>
                <th class="text-right px-4 py-3">Cant.</th>
                <th class="text-right px-4 py-3">P. Unit.</th>
                <th class="text-right px-4 py-3">Desc.</th>
                <th class="text-right px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="detalle.length === 0"><td colspan="9" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="(d, i) in detalle" :key="i" class="border-b border-gray-100 hover:bg-gray-50"
                :class="d.descuento_pct > 0 ? 'bg-orange-50/30' : ''">
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.operacion_id }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ formatFecha(d.fecha) }}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ d.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800">{{ d.producto }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ d.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ d.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(d.precio_unit) }}</td>
                <td class="px-4 py-2.5 text-right">
                  <span v-if="d.descuento_pct > 0" class="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-600">-{{ d.descuento_pct }}%</span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(d.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ TAB: RESUMEN PRODUCTO ════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'resumen'" ref="tablaRef" class="overflow-x-auto">
          <table class="w-full font-body text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-400 text-xs border-b border-gray-200">
                <th class="text-left px-4 py-3">Categoría</th>
                <th class="text-left px-4 py-3">Producto</th>
                <th class="text-left px-4 py-3">Código</th>
                <th class="text-right px-4 py-3">Unidades</th>
                <th class="text-right px-4 py-3">P. Unit.</th>
                <th class="text-right px-4 py-3">Total</th>
                <th class="text-right px-4 py-3 w-40">% Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="resumen.length === 0"><td colspan="7" class="text-center py-12 text-gray-400">Sin datos</td></tr>
              <tr v-for="(r, i) in resumen" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-2.5 text-xs text-gray-500">{{ r.categoria }}</td>
                <td class="px-4 py-2.5 text-gray-800 font-medium">{{ r.producto }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ r.codigo }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-700">{{ r.cantidad }}</td>
                <td class="px-4 py-2.5 text-right text-gray-500">${{ fmt(r.precio_unit) }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-teal">${{ fmt(r.total) }}</td>
                <td class="px-4 py-2.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-20 bg-gray-100 rounded-full h-1.5">
                      <div class="bg-teal h-1.5 rounded-full" :style="{ width: Math.min(r.pct, 100) + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-10 text-right">{{ r.pct }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ TAB: GRÁFICOS ════════════════════════════════════════════════════ -->
        <div v-if="tabActivo === 'graficos'" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Ingresos vs Gastos por día</h3>
              <div class="relative" style="height:260px"><canvas ref="chartBarRef"></canvas></div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Distribución ingresos por categoría</h3>
              <div class="relative" style="height:260px"><canvas ref="chartDoughnutRef"></canvas></div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Top 10 productos</h3>
              <div class="relative" style="height:300px"><canvas ref="chartTopRef"></canvas></div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4">
              <h3 class="font-body text-sm font-semibold text-gray-600 mb-4">Gastos por categoría</h3>
              <div class="relative" style="height:300px"><canvas ref="chartGastosRef"></canvas></div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import ExcelJS from 'exceljs'
import html2pdf from 'html2pdf.js'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ── Estado ─────────────────────────────────────────────────────────────────
const loading           = ref(false)
const exportando        = ref(false)
const categorias        = ref([])
const productos         = ref([])
const filtroDesde       = ref('')
const filtroHasta       = ref('')
const filtroCategoriaId = ref(null)
const filtroProductoId  = ref(null)
const tabActivo         = ref('ventas')
const tablaRef          = ref(null)

// Ventas
const kpis           = ref({ total: 0, total_con_envios: 0, total_envios: 0, n_operaciones: 0, ticket_promedio: 0, unidades: 0 })
const operaciones    = ref([])
const detalle        = ref([])
const resumen        = ref([])
const por_categoria  = ref([])
const por_dia        = ref([])
const ventasPorMetodo = ref({})

// Extras
const gastos                = ref([])
const gastosPorCategoria    = ref({})
const gastosPorDia          = ref([])
const totalGastos           = ref(0)
const ivaTotal              = ref(0)
const lotes                 = ref([])
const produccionPorProducto = ref([])
const totalUnidadesProducidas = ref(0)
const stock                 = ref([])
const stockValorCosto       = ref(0)
const stockValorVenta       = ref(0)
const cajas                 = ref([])
const resumenMovimientos    = ref({ ingresos_efectivo: 0, egresos_efectivo: 0, ingresos_billetera: 0, egresos_billetera: 0, detalle: [] })
const gastosPorMedio        = ref({ efectivo: 0, digital: 0, sin_metodo: 0 })

// Charts
const chartBarRef      = ref(null)
const chartDoughnutRef = ref(null)
const chartTopRef      = ref(null)
const chartGastosRef   = ref(null)
let chartBar = null, chartDoughnut = null, chartTop = null, chartGastos = null

const tabs = [
  { id: 'ventas',     label: '📋 Ventas' },
  { id: 'resultado',  label: '📊 Resultado' },
  { id: 'metodos',    label: '💳 Métodos de pago' },
  { id: 'gastos',     label: '💸 Gastos' },
  { id: 'produccion', label: '🏭 Producción' },
  { id: 'stock',      label: '📦 Stock' },
  { id: 'caja',       label: '💵 Caja' },
  { id: 'detalle',    label: '🔍 Detalle productos' },
  { id: 'resumen',    label: '📈 Resumen producto' },
  { id: 'graficos',   label: '📉 Gráficos' },
]

const COLORES = ['2DD4BF','F97316','6366F1','EC4899','EAB308','10B981','3B82F6','A855F7','EF4444','14B8A6']

// ── Computeds ──────────────────────────────────────────────────────────────
const productosFiltrados = computed(() =>
  filtroCategoriaId.value
    ? productos.value.filter(p => p.categoria?.id === filtroCategoriaId.value)
    : productos.value
)

const resultadoNeto = computed(() => (kpis.value.total || 0) - (totalGastos.value || 0))

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = n => Math.round(n || 0).toLocaleString('es-AR')

const METODOS_LABEL = {
  efectivo: 'Efectivo', transferencia: 'Transferencia', debito: 'Débito',
  credito: 'Crédito', qr: 'QR', cuenta_corriente: 'Cta. Corriente', sin_metodo: 'Sin método',
}
const METODOS_ICON = {
  efectivo: '💵', transferencia: '🏦', debito: '💳', credito: '💳',
  qr: '📱', cuenta_corriente: '🤝', sin_metodo: '❓',
}
const labelMetodo = m => METODOS_LABEL[m] || m
const iconMetodo  = m => METODOS_ICON[m]  || '💰'

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}
function formatFechaCorta(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

// ── Carga ──────────────────────────────────────────────────────────────────
async function cargar() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroDesde.value)       params.set('fecha_desde',  filtroDesde.value)
    if (filtroHasta.value)       params.set('fecha_hasta',  filtroHasta.value)
    if (filtroCategoriaId.value) params.set('categoria_id', filtroCategoriaId.value)
    if (filtroProductoId.value)  params.set('producto_id',  filtroProductoId.value)

    const [ventasResult, extrasResult] = await Promise.allSettled([
      axios.get(`/api/admin/reportes?${params}`),
      axios.get(`/api/admin/reportes/extras?${params}`),
    ])

    // Ventas — independiente de extras
    if (ventasResult.status === 'fulfilled') {
      const v = ventasResult.value.data
      kpis.value            = v.kpis
      operaciones.value     = v.operaciones
      detalle.value         = v.detalle
      resumen.value         = v.resumen
      por_categoria.value   = v.por_categoria
      por_dia.value         = v.por_dia
      ventasPorMetodo.value = v.ventasPorMetodo || {}
    } else {
      console.error('reportes/ventas:', ventasResult.reason?.message)
    }

    // Extras — independiente de ventas
    if (extrasResult.status === 'fulfilled') {
      const e = extrasResult.value.data
      gastos.value                  = e.gastos || []
      gastosPorCategoria.value      = e.gastosPorCategoria || {}
      gastosPorDia.value            = e.gastosPorDia || []
      totalGastos.value             = e.totalGastos || 0
      ivaTotal.value                = e.ivaTotal || 0
      lotes.value                   = e.lotes || []
      produccionPorProducto.value   = e.produccionPorProducto || []
      totalUnidadesProducidas.value  = e.totalUnidadesProducidas || 0
      stock.value                   = e.stock || []
      stockValorCosto.value         = e.stockValorCosto || 0
      stockValorVenta.value         = e.stockValorVenta || 0
      cajas.value                   = e.cajas || []
      resumenMovimientos.value      = e.resumenMovimientos || { ingresos_efectivo: 0, egresos_efectivo: 0, ingresos_billetera: 0, egresos_billetera: 0, detalle: [] }
      gastosPorMedio.value          = e.gastosPorMedio || { efectivo: 0, digital: 0, sin_metodo: 0 }
    } else {
      console.error('reportes/extras:', extrasResult.reason?.message)
    }

    if (tabActivo.value === 'graficos') setTimeout(crearGraficos, 100)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function limpiar() {
  filtroDesde.value = ''; filtroHasta.value = ''
  filtroCategoriaId.value = null; filtroProductoId.value = null
  cargar()
}

function cambiarTab(id) {
  tabActivo.value = id
  if (id === 'graficos') setTimeout(crearGraficos, 150)
}

// ── Gráficos ───────────────────────────────────────────────────────────────
function crearGraficos() {
  // Barras ingresos vs gastos por día
  if (chartBarRef.value) {
    if (chartBar) chartBar.destroy()

    // Merge días de ventas y gastos
    const diasSet = new Set([...por_dia.value.map(d => d.dia), ...gastosPorDia.value.map(d => d.dia)])
    const dias = Array.from(diasSet).sort()
    const ventasDia = dias.map(d => por_dia.value.find(x => x.dia === d)?.total || 0)
    const gastosDia = dias.map(d => gastosPorDia.value.find(x => x.dia === d)?.total || 0)

    chartBar = new Chart(chartBarRef.value, {
      type: 'bar',
      data: {
        labels: dias.map(d => { const [,m,day] = d.split('-'); return `${day}/${m}` }),
        datasets: [
          { label: 'Ingresos', data: ventasDia, backgroundColor: '#2DD4BF', borderRadius: 4 },
          { label: 'Gastos',   data: gastosDia, backgroundColor: '#F87171', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          y: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' }, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } },
        },
      },
    })
  }

  // Torta categorías de venta
  if (chartDoughnutRef.value) {
    if (chartDoughnut) chartDoughnut.destroy()
    chartDoughnut = new Chart(chartDoughnutRef.value, {
      type: 'doughnut',
      data: {
        labels: por_categoria.value.map(c => c.categoria),
        datasets: [{ data: por_categoria.value.map(c => c.total), backgroundColor: COLORES.map(c => '#' + c), borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` $${Math.round(ctx.raw).toLocaleString('es-AR')} (${por_categoria.value[ctx.dataIndex]?.pct}%)` } },
        },
      },
    })
  }

  // Top 10 productos
  if (chartTopRef.value) {
    if (chartTop) chartTop.destroy()
    const top10 = resumen.value.slice(0, 10)
    chartTop = new Chart(chartTopRef.value, {
      type: 'bar',
      data: {
        labels: top10.map(r => r.producto.length > 32 ? r.producto.slice(0, 32) + '…' : r.producto),
        datasets: [{ label: 'Total $', data: top10.map(r => r.total), backgroundColor: COLORES.map(c => '#' + c), borderRadius: 6 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' }, grid: { color: '#F3F4F6' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    })
  }

  // Torta gastos por categoría
  if (chartGastosRef.value) {
    if (chartGastos) chartGastos.destroy()
    const cats   = Object.keys(gastosPorCategoria.value)
    const totals = cats.map(c => gastosPorCategoria.value[c].total)
    chartGastos = new Chart(chartGastosRef.value, {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{ data: totals, backgroundColor: ['#F87171','#FB923C','#FBBF24','#A3E635','#34D399','#22D3EE','#818CF8','#F472B6'], borderWidth: 2, borderColor: '#fff' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` $${Math.round(ctx.raw).toLocaleString('es-AR')}` } },
        },
      },
    })
  }
}

function renderChartImage(type, labels, datasets, options = {}, w = 900, h = 400) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.style.cssText = 'position:absolute;left:-9999px'
    document.body.appendChild(canvas)
    const ch = new Chart(canvas, { type, data: { labels, datasets }, options: { ...options, animation: false, responsive: false } })
    setTimeout(() => {
      const img = canvas.toDataURL('image/png').split(',')[1]
      ch.destroy(); document.body.removeChild(canvas)
      resolve(img)
    }, 200)
  })
}

// ── Exportar Excel ─────────────────────────────────────────────────────────
async function exportarExcel() {
  exportando.value = true
  try {
    const wb = new ExcelJS.Workbook()
    wb.creator = 'Ceketo'; wb.created = new Date()

    const VERDE_OSC   = '1A5F5A'
    const VERDE_TEAL  = '2DD4BF'
    const VERDE_LIGHT = 'E6FFFE'
    const ROJO_OSC    = '991B1B'
    const ROJO_LIGHT  = 'FEF2F2'
    const BORDE = { style: 'thin', color: { argb: 'FFE5E7EB' } }
    const BORDE_H_V = { style: 'medium', color: { argb: 'FF' + VERDE_TEAL } }
    const BORDE_H_R = { style: 'medium', color: { argb: 'FFEF4444' } }

    const rango    = [filtroDesde.value, filtroHasta.value].filter(Boolean).join(' al ') || 'Período completo'
    const fechaGen = new Date().toLocaleDateString('es-AR')

    function addTitle(ws, titulo, ncols, color = VERDE_OSC, light = VERDE_LIGHT) {
      ws.mergeCells(1, 1, 1, ncols)
      const t = ws.getRow(1).getCell(1)
      t.value = titulo
      t.font  = { bold: true, size: 15, color: { argb: 'FF' + color } }
      t.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + light } }
      t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
      ws.getRow(1).height = 36
      ws.mergeCells(2, 1, 2, ncols)
      const s = ws.getRow(2).getCell(1)
      s.value = `Período: ${rango}   |   Generado: ${fechaGen}`
      s.font  = { size: 9, color: { argb: 'FF6B7280' }, italic: true }
      s.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
      s.alignment = { vertical: 'middle', indent: 1 }
      ws.getRow(2).height = 18
    }

    function styleHeader(row, ncols, color = VERDE_OSC, borde = BORDE_H_V) {
      for (let c = 1; c <= ncols; c++) {
        const cell = row.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = { top: borde, bottom: borde, left: BORDE, right: BORDE }
      }
      row.height = 28
    }

    function styleData(row, ncols, alt = false, total = false, lightColor = null) {
      const bg = total ? 'FF' + (lightColor || VERDE_LIGHT) : alt ? 'FFF9FAFB' : 'FFFFFFFF'
      for (let c = 1; c <= ncols; c++) {
        const cell = row.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.font = { size: 10, bold: total }
        cell.alignment = { vertical: 'middle' }
        cell.border = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE }
      }
      row.height = total ? 24 : 20
    }

    function numFmt(row, cols, format = '"$"#,##0') {
      cols.forEach(c => { row.getCell(c).numFmt = format; row.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' } })
    }

    // ── Hoja 1: Resumen ejecutivo ──────────────────────────────────────────
    const ws0 = wb.addWorksheet('Resumen ejecutivo')
    ws0.columns = [{ key: 'concepto', width: 34 }, { key: 'monto', width: 20 }, { key: 'pct', width: 14 }]
    addTitle(ws0, 'RESUMEN EJECUTIVO', 3)
    const hr0 = ws0.getRow(3)
    hr0.values = ['Concepto', 'Monto', '%']
    styleHeader(hr0, 3)

    const filas0 = [
      ['Total Ingresos (ventas + pedidos)', kpis.value.total, 100],
      ['  — del cual: envíos cobrados', kpis.value.total_envios, kpis.value.total > 0 ? kpis.value.total_envios/kpis.value.total*100 : 0],
      ['Total Gastos', totalGastos.value, kpis.value.total > 0 ? totalGastos.value/kpis.value.total*100 : 0],
      ['  — IVA discriminado', ivaTotal.value, null],
      ['Resultado Neto', resultadoNeto.value, null],
      ['', null, null],
      ['Operaciones', kpis.value.n_operaciones, null],
      ['Ticket promedio', kpis.value.ticket_promedio, null],
      ['Unidades vendidas', kpis.value.unidades, null],
    ]
    filas0.forEach((f, i) => {
      const r = ws0.addRow(f)
      const isTotal = f[0] === 'Resultado Neto' || f[0] === 'Total Ingresos (ventas + pedidos)'
      styleData(r, 3, i % 2 === 1, isTotal)
      if (f[1] !== null) numFmt(r, [2])
      if (f[2] !== null) { r.getCell(3).numFmt = '0.0"%"'; r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' } }
      if (f[0] === 'Resultado Neto') {
        r.getCell(2).font = { bold: true, size: 12, color: { argb: resultadoNeto.value >= 0 ? 'FF166534' : 'FF991B1B' } }
      }
    })

    // ── Hoja 2: Ventas ─────────────────────────────────────────────────────
    const ws1 = wb.addWorksheet('Ventas', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws1.columns = [
      { key: 'id', width: 10 }, { key: 'fecha', width: 18 }, { key: 'origen', width: 10 },
      { key: 'cliente', width: 24 }, { key: 'metodo', width: 16 }, { key: 'entrega', width: 12 },
      { key: 'nota', width: 24 }, { key: 'desc', width: 10 }, { key: 'envio', width: 12 }, { key: 'total', width: 16 },
    ]
    addTitle(ws1, 'VENTAS', 10)
    const h1 = ws1.getRow(3)
    h1.values = ['#', 'Fecha', 'Origen', 'Cliente', 'Método pago', 'Entrega', 'Observación', 'Desc.%', 'Envío', 'Total']
    styleHeader(h1, 10)
    operaciones.value.forEach((op, i) => {
      const r = ws1.addRow([op.id, formatFechaCorta(op.fecha), op.origen, op.cliente, op.metodo_pago, op.entrega, op.nota || '', op.descuento > 0 ? `-${op.descuento}%` : '', op.costo_envio || 0, op.total])
      styleData(r, 10, i % 2 === 1)
      numFmt(r, [9, 10])
    })
    const tot1 = ws1.addRow(['', '', '', '', '', '', '', '', 'TOTAL', kpis.value.total])
    styleData(tot1, 10, false, true)
    numFmt(tot1, [10])

    // ── Hoja 3: Gastos ─────────────────────────────────────────────────────
    const ws2 = wb.addWorksheet('Gastos', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws2.columns = [
      { key: 'fecha', width: 12 }, { key: 'cat', width: 18 }, { key: 'desc', width: 36 },
      { key: 'proveedor', width: 22 }, { key: 'metodo', width: 16 },
      { key: 'factura', width: 12 }, { key: 'iva', width: 14 }, { key: 'monto', width: 16 },
    ]
    addTitle(ws2, 'GASTOS', 8, ROJO_OSC, ROJO_LIGHT)
    const h2 = ws2.getRow(3)
    h2.values = ['Fecha', 'Categoría', 'Descripción', 'Proveedor', 'Método', 'Factura', 'IVA', 'Monto']
    styleHeader(h2, 8, ROJO_OSC, BORDE_H_R)
    gastos.value.forEach((g, i) => {
      const r = ws2.addRow([g.fecha, g.categoria, g.descripcion, g.proveedor || '', g.metodo_pago || '', g.es_factura ? `A ${g.alicuota_iva}%` : '', g.iva_monto || 0, Number(g.monto)])
      styleData(r, 8, i % 2 === 1)
      numFmt(r, [7, 8])
    })
    const tot2 = ws2.addRow(['', '', '', '', '', '', 'TOTAL IVA', totalGastos.value])
    styleData(tot2, 8, false, true, ROJO_LIGHT)
    numFmt(tot2, [8])
    tot2.getCell(8).font = { bold: true, color: { argb: 'FF' + ROJO_OSC } }

    // ── Hoja 4: Resultado ──────────────────────────────────────────────────
    const ws3 = wb.addWorksheet('Resultado P&L')
    ws3.columns = [{ key: 'cat', width: 36 }, { key: 'monto', width: 20 }, { key: 'pct', width: 14 }]
    addTitle(ws3, 'RESULTADO (P&L)', 3)
    const h3 = ws3.getRow(3)
    h3.values = ['Categoría', 'Monto', '% Ingresos']
    styleHeader(h3, 3)
    const filasR = [
      ...Object.entries(gastosPorCategoria.value).map(([cat, d]) => [cat, d.total, kpis.value.total > 0 ? d.total/kpis.value.total : 0]),
    ]
    filasR.forEach((f, i) => {
      const r = ws3.addRow(f)
      styleData(r, 3, i % 2 === 1)
      numFmt(r, [2]); r.getCell(3).numFmt = '0.0%'; r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }
    })
    const totR = ws3.addRow(['TOTAL GASTOS', totalGastos.value, kpis.value.total > 0 ? totalGastos.value/kpis.value.total : 0])
    styleData(totR, 3, false, true, ROJO_LIGHT)
    numFmt(totR, [2]); totR.getCell(3).numFmt = '0.0%'
    ws3.addRow([])
    const resR = ws3.addRow(['RESULTADO NETO', resultadoNeto.value, null])
    styleData(resR, 3, false, true, resultadoNeto.value >= 0 ? 'DCFCE7' : ROJO_LIGHT)
    numFmt(resR, [2])
    resR.getCell(2).font = { bold: true, size: 13, color: { argb: resultadoNeto.value >= 0 ? 'FF166534' : 'FF991B1B' } }

    // ── Hoja 5: Resumen por producto ───────────────────────────────────────
    const ws4 = wb.addWorksheet('Resumen por producto', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws4.columns = [
      { key: 'cat', width: 24 }, { key: 'prod', width: 34 }, { key: 'cod', width: 11 },
      { key: 'cant', width: 10 }, { key: 'precio', width: 14 }, { key: 'total', width: 16 }, { key: 'pct', width: 11 },
    ]
    addTitle(ws4, 'RESUMEN POR PRODUCTO', 7)
    const h4 = ws4.getRow(3)
    h4.values = ['Categoría', 'Producto', 'Código', 'Unidades', 'P. Unit.', 'Total', '% Total']
    styleHeader(h4, 7)
    resumen.value.forEach((r, i) => {
      const row = ws4.addRow([r.categoria, r.producto, r.codigo, r.cantidad, r.precio_unit, r.total, r.pct / 100])
      styleData(row, 7, i % 2 === 1)
      numFmt(row, [5, 6]); row.getCell(7).numFmt = '0.0%'; row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
    })

    // ── Hoja 6: Stock ──────────────────────────────────────────────────────
    const ws5 = wb.addWorksheet('Stock valorizado', { views: [{ state: 'frozen', ySplit: 3 }] })
    ws5.columns = [
      { key: 'cat', width: 22 }, { key: 'nombre', width: 34 }, { key: 'codigo', width: 12 },
      { key: 'stock', width: 10 }, { key: 'costo', width: 14 }, { key: 'venta', width: 14 },
      { key: 'val_costo', width: 16 }, { key: 'val_venta', width: 16 },
    ]
    addTitle(ws5, 'STOCK VALORIZADO', 8)
    const h5 = ws5.getRow(3)
    h5.values = ['Categoría', 'Producto', 'Código', 'Stock', 'P. Costo', 'P. Venta', 'Val. Costo', 'Val. Venta']
    styleHeader(h5, 8)
    stock.value.forEach((p, i) => {
      const vc = Number(p.stock) * Number(p.precio_costo || 0)
      const vv = Number(p.stock) * Number(p.precio)
      const row = ws5.addRow([p.categoria?.nombre || '—', p.nombre, p.codigo, p.stock, Number(p.precio_costo || 0), Number(p.precio), vc, vv])
      styleData(row, 8, i % 2 === 1)
      numFmt(row, [5, 6, 7, 8]); row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
    })
    const tot5 = ws5.addRow(['', 'TOTAL', '', '', '', '', stockValorCosto.value, stockValorVenta.value])
    styleData(tot5, 8, false, true); numFmt(tot5, [7, 8])

    // ── Gráficos como imágenes ─────────────────────────────────────────────
    const imgBar = await renderChartImage(
      'bar',
      por_dia.value.map(d => { const [,m,day] = d.dia.split('-'); return `${day}/${m}` }),
      [{ label: 'Ingresos', data: por_dia.value.map(d => d.total), backgroundColor: '#2DD4BF', borderRadius: 4 },
       { label: 'Gastos',   data: gastosPorDia.value.map(d => d.total), backgroundColor: '#F87171', borderRadius: 4 }],
      { plugins: { legend: { position: 'top' } }, scales: { y: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' } } } }
    )
    ws1.addImage(wb.addImage({ base64: imgBar, extension: 'png' }), { tl: { col: 10, row: 2 }, ext: { width: 700, height: 320 } })

    const imgDonut = await renderChartImage(
      'doughnut',
      por_categoria.value.map(c => c.categoria),
      [{ data: por_categoria.value.map(c => c.total), backgroundColor: COLORES.map(c => '#' + c), borderWidth: 2, borderColor: '#fff' }],
      { plugins: { legend: { position: 'right' } } }
    )
    ws4.addImage(wb.addImage({ base64: imgDonut, extension: 'png' }), { tl: { col: 8, row: 2 }, ext: { width: 480, height: 300 } })

    const top10 = resumen.value.slice(0, 10)
    const imgTop = await renderChartImage(
      'bar',
      top10.map(r => r.producto.length > 30 ? r.producto.slice(0, 30) + '…' : r.producto),
      [{ data: top10.map(r => r.total), backgroundColor: COLORES.map(c => '#' + c), borderRadius: 4 }],
      { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => '$' + Math.round(v/1000) + 'K' } } } },
      900, 440
    )
    ws4.addImage(wb.addImage({ base64: imgTop, extension: 'png' }), { tl: { col: 8, row: 20 }, ext: { width: 700, height: 380 } })

    if (Object.keys(gastosPorCategoria.value).length) {
      const cats  = Object.keys(gastosPorCategoria.value)
      const tots  = cats.map(c => gastosPorCategoria.value[c].total)
      const imgGastos = await renderChartImage(
        'doughnut', cats,
        [{ data: tots, backgroundColor: ['#F87171','#FB923C','#FBBF24','#A3E635','#34D399','#22D3EE','#818CF8','#F472B6'], borderWidth: 2, borderColor: '#fff' }],
        { plugins: { legend: { position: 'right' } } }
      )
      ws3.addImage(wb.addImage({ base64: imgGastos, extension: 'png' }), { tl: { col: 4, row: 2 }, ext: { width: 500, height: 300 } })
    }

    // ── Descargar ──────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer()
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href = url; a.download = `ceketo_reporte_${fechaGen.replace(/\//g, '-')}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert('Error al generar Excel: ' + err.message)
  } finally {
    exportando.value = false
  }
}

// ── Exportar PDF ───────────────────────────────────────────────────────────
function exportarPDF() {
  const hoy       = new Date().toLocaleDateString('es-AR')
  const nombreTab = tabs.find(t => t.id === tabActivo.value)?.label || tabActivo.value
  if (!tablaRef.value) return alert('Cambiá a una pestaña de tabla para exportar PDF')
  const clone = tablaRef.value.cloneNode(true)
  const wrap  = document.createElement('div')
  wrap.style.cssText = 'font-family:sans-serif;font-size:10px'
  const titulo = document.createElement('h2')
  titulo.textContent = `Reporte CEKETO — ${nombreTab} — ${hoy}`
  titulo.style.cssText = 'font-size:13px;margin-bottom:8px;color:#1A5F5A'
  wrap.appendChild(titulo); wrap.appendChild(clone)
  html2pdf().set({
    margin: [10, 8, 10, 8], filename: `ceketo_reporte_${hoy.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }).from(wrap).save()
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [catRes, prodRes] = await Promise.all([
    axios.get('/api/categorias'),
    axios.get('/api/productos?limit=500'),
  ])
  categorias.value = catRes.data
  productos.value  = prodRes.data
  await cargar()
})
</script>
