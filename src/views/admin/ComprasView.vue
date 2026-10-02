<template>
  <div class="p-6 lg:p-8">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Compras</h1>
        <p class="font-body text-gray-500 mt-1">Insumos y mercadería para revender. Cada compra suma stock y actualiza costos.</p>
      </div>
      <button @click="abrirNueva"
        class="px-5 py-2.5 bg-teal text-white rounded-xl font-body text-sm font-semibold hover:bg-teal/85 transition-colors">
        + Nueva compra
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label class="lbl">Mes</label>
        <input v-model="filtroMes" type="month" class="campo" @change="cargar" />
      </div>
      <div>
        <label class="lbl">Proveedor</label>
        <select v-model="filtroProveedor" class="campo">
          <option value="">Todos</option>
          <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </div>
      <div>
        <label class="lbl">Qué se compró</label>
        <select v-model="filtroTipo" class="campo">
          <option value="">Todo</option>
          <option value="insumo">Insumos</option>
          <option value="producto">Mercadería (reventa)</option>
        </select>
      </div>
      <div>
        <label class="lbl">Estado</label>
        <select v-model="filtroEstado" class="campo">
          <option value="vigente">Vigentes</option>
          <option value="anulada">Anuladas</option>
          <option value="">Todas</option>
        </select>
      </div>
    </div>

    <!-- Resumen del mes -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="tarjeta">
        <p class="t-etq">Total comprado</p>
        <p class="t-valor text-gray-900">${{ fmt(resumen.total) }}</p>
        <p class="t-det">{{ resumen.cantidad }} compra{{ resumen.cantidad === 1 ? '' : 's' }}</p>
      </div>
      <div class="tarjeta">
        <p class="t-etq">Insumos</p>
        <p class="t-valor text-teal">${{ fmt(resumen.insumos) }}</p>
        <p class="t-det">Materia prima y envases</p>
      </div>
      <div class="tarjeta">
        <p class="t-etq">Mercadería para reventa</p>
        <p class="t-valor text-brand-purple">${{ fmt(resumen.productos) }}</p>
        <p class="t-det">Productos del Market</p>
      </div>
      <div class="tarjeta">
        <p class="t-etq">A cuenta (sin pagar al comprar)</p>
        <p class="t-valor text-keto-orange">${{ fmt(resumen.aCuenta) }}</p>
        <p class="t-det">Al contado: ${{ fmt(resumen.contado) }}</p>
      </div>
    </div>

    <!-- Listado -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div v-if="cargando" class="text-center py-14 text-gray-400 font-body">Cargando compras...</div>
      <div v-else-if="!comprasFiltradas.length" class="text-center py-14 text-gray-400 font-body">
        No hay compras {{ filtroEstado === 'anulada' ? 'anuladas' : '' }} en {{ mesLargo }}.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs border-b border-gray-200">
              <th class="text-left px-4 py-3">Fecha</th>
              <th class="text-left px-4 py-3">N°</th>
              <th class="text-left px-4 py-3">Proveedor</th>
              <th class="text-left px-4 py-3">Qué se compró</th>
              <th class="text-left px-4 py-3">Comprobante</th>
              <th class="text-left px-4 py-3">Pago</th>
              <th class="text-right px-4 py-3">Total</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in comprasFiltradas" :key="c.id" class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              :class="c.estado === 'anulada' ? 'opacity-50' : ''" @click="detalle = c">
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fechaCorta(c.fecha) }}</td>
              <td class="px-4 py-3 text-gray-400">#{{ c.id }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ c.proveedor }}</td>
              <td class="px-4 py-3 text-gray-600 max-w-xs">
                <span :class="c.estado === 'anulada' ? 'line-through' : ''">{{ resumenItems(c) }}</span>
                <span v-if="c.estado === 'anulada'" class="ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">Anulada</span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                {{ comprobanteTxt(c) }}
                <a v-if="c.comprobante" :href="urlArchivo(c.comprobante)" target="_blank" rel="noopener" class="ml-1 text-teal" @click.stop title="Ver comprobante">📎</a>
              </td>
              <td class="px-4 py-3">
                <span v-if="c.condicion === 'cuenta_corriente'" class="pill bg-amber-100 text-amber-800">A cuenta</span>
                <span v-else class="pill bg-teal/10 text-teal">{{ METODOS[c.metodo_pago] }}</span>
              </td>
              <td class="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">${{ fmt(c.total) }}</td>
              <td class="px-4 py-3 text-right"><span class="text-teal text-xs font-semibold">Ver ›</span></td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 border-t-2 border-gray-200">
              <td colspan="6" class="px-4 py-3 font-semibold text-gray-700">TOTAL {{ filtroEstado === 'anulada' ? 'ANULADO' : 'DEL MES' }}</td>
              <td class="px-4 py-3 text-right font-display font-bold text-lg text-gray-900">${{ fmt(comprasFiltradas.reduce((a, c) => a + Number(c.total), 0)) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ═══ Detalle de una compra ═══ -->
    <div v-if="detalle" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="detalle = null">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 class="font-display text-xl font-bold text-gray-900">Compra #{{ detalle.id }} — {{ detalle.proveedor }}</h2>
            <p class="font-body text-sm text-gray-500">
              {{ fechaLarga(detalle.fecha) }} ·
              {{ comprobanteTxt(detalle) }} ·
              {{ detalle.condicion === 'cuenta_corriente' ? 'A cuenta' : 'Contado — ' + METODOS[detalle.metodo_pago] }}
            </p>
            <p v-if="detalle.estado === 'anulada'" class="mt-1 font-body text-sm font-semibold text-red-600">
              Anulada {{ detalle.anulada_por ? 'por ' + detalle.anulada_por : '' }} el {{ fechaHora(detalle.anulada_el) }}
            </p>
          </div>
          <button @click="detalle = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <table class="w-full font-body text-sm mb-4">
          <thead>
            <tr class="text-gray-500 text-xs border-b border-gray-200">
              <th class="text-left py-2">Qué</th>
              <th class="text-right py-2">Cantidad</th>
              <th class="text-right py-2">Costo unit.</th>
              <th class="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in detalle.items" :key="it.id" class="border-b border-gray-100">
              <td class="py-2">
                <span class="pill mr-1" :class="it.tipo === 'insumo' ? 'bg-teal/10 text-teal' : 'bg-brand-purple/10 text-brand-purple'">{{ it.tipo === 'insumo' ? 'Insumo' : 'Reventa' }}</span>
                {{ it.descripcion }}
              </td>
              <td class="py-2 text-right whitespace-nowrap">{{ fmtCant(it.cantidad) }} {{ it.unidad }}</td>
              <td class="py-2 text-right">${{ fmt(it.costo_unitario) }}</td>
              <td class="py-2 text-right font-semibold">${{ fmt(it.subtotal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr v-if="Number(detalle.iva_monto) > 0">
              <td colspan="3" class="pt-2 text-right text-gray-500">IVA {{ Number(detalle.alicuota_iva) }}% incluido</td>
              <td class="pt-2 text-right text-gray-500">${{ fmt(detalle.iva_monto) }}</td>
            </tr>
            <tr>
              <td colspan="3" class="pt-2 text-right font-semibold text-gray-700">Total</td>
              <td class="pt-2 text-right font-display text-xl font-bold text-gray-900">${{ fmt(detalle.total) }}</td>
            </tr>
          </tfoot>
        </table>

        <p v-if="detalle.nota" class="font-body text-sm text-gray-600 mb-2">📝 {{ detalle.nota }}</p>
        <p class="font-body text-xs text-gray-400 mb-4">Cargada por {{ detalle.usuario || '—' }} el {{ fechaHora(detalle.createdAt) }}</p>
        <a v-if="detalle.comprobante" :href="urlArchivo(detalle.comprobante)" target="_blank" rel="noopener"
          class="inline-block mb-4 font-body text-sm text-teal font-semibold hover:underline">📎 Ver comprobante</a>

        <div v-if="detalle.estado === 'vigente'" class="border-t border-gray-100 pt-4">
          <template v-if="!confirmandoAnular">
            <button @click="confirmandoAnular = true"
              class="px-4 py-2 border border-red-200 text-red-500 rounded-xl font-body text-sm hover:bg-red-50">Anular compra</button>
          </template>
          <div v-else class="bg-red-50 border border-red-200 rounded-xl p-4 font-body text-sm text-gray-700">
            <p class="font-semibold text-red-700 mb-1">¿Anular la compra #{{ detalle.id }}?</p>
            <p class="mb-3">
              Se descuenta del stock lo que entró con esta compra, los costos vuelven a los anteriores y se borra
              {{ detalle.condicion === 'contado' ? 'el gasto que generó' : 'el cargo en la cuenta del proveedor' }}.
              La compra queda en el historial como anulada. Si había un error, después la cargás de nuevo bien.
            </p>
            <p v-if="errorAnular" class="text-red-600 mb-2">{{ errorAnular }}</p>
            <div class="flex gap-2">
              <button @click="confirmandoAnular = false" class="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 bg-white">No, volver</button>
              <button @click="anular" :disabled="anulando" class="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50">
                {{ anulando ? 'Anulando...' : 'Sí, anular' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Nueva compra ═══ -->
    <div v-if="form" class="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl w-full max-w-4xl my-6 p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-2xl font-bold text-gray-900">Nueva compra</h2>
          <button @click="form = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <!-- Datos generales -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div>
            <label class="lbl">Fecha</label>
            <input v-model="form.fecha" type="date" class="campo" />
          </div>
          <div class="md:col-span-2">
            <label class="lbl">Proveedor</label>
            <div v-if="!nuevoProv" class="flex gap-2">
              <select v-model="form.cuenta_id" class="campo flex-1">
                <option value="">Elegí el proveedor...</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}{{ p.saldo > 0 ? ` (le debemos $${fmt(p.saldo)})` : '' }}</option>
              </select>
              <button @click="nuevoProv = { nombre: '', telefono: '' }" class="px-3 rounded-xl border border-teal/40 text-teal text-sm whitespace-nowrap">+ Nuevo</button>
            </div>
            <div v-else class="flex gap-2">
              <input v-model="nuevoProv.nombre" class="campo flex-1" placeholder="Nombre del proveedor" />
              <input v-model="nuevoProv.telefono" class="campo w-36" placeholder="Teléfono" />
              <button @click="crearProveedor" class="px-3 rounded-xl bg-teal text-white text-sm">Guardar</button>
              <button @click="nuevoProv = null" class="px-2 text-gray-400">✕</button>
            </div>
          </div>
          <div>
            <label class="lbl">Comprobante</label>
            <select v-model="form.tipo_comprobante" class="campo">
              <option v-for="(txt, k) in COMPROBANTES" :key="k" :value="k">{{ txt }}</option>
            </select>
          </div>
          <div>
            <label class="lbl">N° de comprobante</label>
            <input v-model="form.nro_comprobante" class="campo" placeholder="Ej: 0001-00012345" :disabled="form.tipo_comprobante === 'sin_comprobante'" />
          </div>
          <div v-if="form.tipo_comprobante === 'factura_a'">
            <label class="lbl">IVA (incluido en los precios)</label>
            <select v-model.number="form.alicuota_iva" class="campo">
              <option :value="21">21%</option>
              <option :value="10.5">10,5%</option>
              <option :value="27">27%</option>
            </select>
          </div>
        </div>

        <!-- Renglones -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-body font-semibold text-gray-800">Qué se compró</h3>
            <span class="font-body text-xs text-gray-400">Precios finales por unidad, con IVA</span>
          </div>

          <!-- Buscador para agregar -->
          <div class="relative mb-3">
            <input ref="buscadorRef" v-model="busqueda" class="campo" placeholder="🔍 Buscá un insumo (harina, manteca...) o un producto para revender y tocalo para agregarlo"
              @focus="buscando = true" @input="buscando = true" @blur="cerrarBusqueda" @keydown.esc="buscando = false" />
            <!-- La lista aparece solo mientras se escribe (si quedara abierta tapa los renglones) -->
            <div v-if="buscando && busqueda.trim() && !resultados.length"
              class="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 font-body text-sm text-gray-400">
              No hay insumos ni productos con "{{ busqueda }}". Si es un insumo nuevo, crealo primero en Insumos.
            </div>
            <div v-if="buscando && busqueda.trim() && resultados.length" class="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
              <button v-for="r in resultados" :key="r.clave" type="button" @mousedown.prevent="agregar(r)"
                class="w-full text-left px-4 py-2.5 hover:bg-teal/5 flex items-center justify-between gap-3 border-b border-gray-50 last:border-0">
                <span class="font-body text-sm text-gray-800">
                  <span class="pill mr-1.5" :class="r.tipo === 'insumo' ? 'bg-teal/10 text-teal' : 'bg-brand-purple/10 text-brand-purple'">{{ r.tipo === 'insumo' ? 'Insumo' : r.categoria }}</span>
                  {{ r.nombre }}
                </span>
                <span class="font-body text-xs text-gray-400 whitespace-nowrap">
                  stock {{ fmtCant(r.stock) }} {{ r.unidad }}<template v-if="r.costo"> · último ${{ fmt(r.costo) }}</template>
                </span>
              </button>
            </div>
          </div>

          <div v-if="!form.items.length" class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400">
            Todavía no agregaste nada. Usá el buscador de arriba.
          </div>
          <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
            <div v-for="(it, i) in form.items" :key="it.clave" class="grid grid-cols-12 gap-2 items-center px-3 py-3 border-b border-gray-100 last:border-0"
              :class="i % 2 ? 'bg-gray-50/60' : ''">
              <div class="col-span-12 md:col-span-5">
                <p class="font-body text-sm font-medium text-gray-900">
                  <span class="pill mr-1" :class="it.tipo === 'insumo' ? 'bg-teal/10 text-teal' : 'bg-brand-purple/10 text-brand-purple'">{{ it.tipo === 'insumo' ? 'Insumo' : 'Reventa' }}</span>
                  {{ it.nombre }}
                </p>
                <p class="font-body text-xs text-gray-400 mt-0.5">
                  Stock: {{ fmtCant(it.stock) }} → {{ fmtCant(Number(it.stock) + (Number(it.cantidad) || 0)) }} {{ it.unidad }}
                  <template v-if="it.costo"> · costo anterior ${{ fmt(it.costo) }}</template>
                </p>
                <p v-if="it.tipo === 'producto' && it.precio" class="font-body text-xs mt-0.5" :class="margen(it) < 0.2 ? 'text-red-500' : 'text-gray-500'">
                  Se vende a ${{ fmt(it.precio) }} → margen {{ Math.round(margen(it) * 100) }}%
                  <template v-if="margen(it) < 0.2"> (bajo)</template>
                </p>
              </div>
              <div class="col-span-4 md:col-span-2">
                <label class="lbl">Cantidad ({{ it.unidad }})</label>
                <input v-model.number="it.cantidad" type="number" min="0" :step="it.tipo === 'insumo' ? '0.001' : '1'" class="campo" />
              </div>
              <div class="col-span-4 md:col-span-2">
                <label class="lbl">Costo por {{ it.unidad }}</label>
                <input v-model.number="it.costo_unitario" type="number" min="0" step="0.01" class="campo" />
              </div>
              <div class="col-span-3 md:col-span-2 text-right">
                <label class="lbl">Subtotal</label>
                <p class="font-body font-bold text-gray-900 py-2">${{ fmt(subtotal(it)) }}</p>
              </div>
              <div class="col-span-1 text-right">
                <button @click="form.items.splice(i, 1)" class="text-gray-300 hover:text-red-500 text-lg" title="Quitar">✕</button>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-3 bg-gray-50">
              <span class="font-body text-sm text-gray-600">
                {{ form.items.length }} renglón{{ form.items.length === 1 ? '' : 'es' }}
                <template v-if="form.tipo_comprobante === 'factura_a'"> · IVA {{ form.alicuota_iva }}% incluido: ${{ fmt(totalForm * form.alicuota_iva / (100 + form.alicuota_iva)) }}</template>
              </span>
              <span class="font-display text-2xl font-bold text-gray-900">${{ fmt(totalForm) }}</span>
            </div>
          </div>
        </div>

        <!-- Pago -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="lbl">¿Cómo se paga?</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" @click="form.condicion = 'contado'" class="opcion" :class="form.condicion === 'contado' ? 'opcion-on' : ''">
                💵 Al contado<span class="block text-[11px] font-normal opacity-80">Se paga ahora y sale de la caja</span>
              </button>
              <button type="button" @click="form.condicion = 'cuenta_corriente'" class="opcion" :class="form.condicion === 'cuenta_corriente' ? 'opcion-on' : ''">
                🤝 A cuenta<span class="block text-[11px] font-normal opacity-80">Se le debe al proveedor</span>
              </button>
            </div>
          </div>
          <div v-if="form.condicion === 'contado'">
            <label class="lbl">Pagado con</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="(txt, k) in METODOS" :key="k" type="button" @click="form.metodo_pago = k"
                class="opcion !py-2" :class="form.metodo_pago === k ? 'opcion-on' : ''">{{ txt }}</button>
            </div>
          </div>
          <div v-else class="font-body text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-3 self-end">
            Queda como deuda en <b>Cta. Corriente</b> del proveedor. Cuando le pagues, cargás el pago ahí y recién entonces aparece el gasto y sale de la caja.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="lbl">Nota (opcional)</label>
            <input v-model="form.nota" class="campo" placeholder="Ej: entrega parcial, faltó 1 bolsa..." />
          </div>
          <div>
            <label class="lbl">Foto o PDF del comprobante (opcional)</label>
            <input type="file" accept="image/*,application/pdf" @change="form.archivo = $event.target.files[0]"
              class="block w-full font-body text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-teal/10 file:text-teal" />
          </div>
        </div>

        <p v-if="errorForm" class="font-body text-sm text-red-600 mb-3">{{ errorForm }}</p>
        <div class="flex justify-end gap-3">
          <button @click="form = null" class="px-5 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-gray-600">Cancelar</button>
          <button @click="guardar" :disabled="guardando"
            class="px-6 py-2.5 bg-teal text-white rounded-xl font-body text-sm font-semibold hover:bg-teal/85 disabled:opacity-50">
            {{ guardando ? 'Guardando...' : `Registrar compra · $${fmt(totalForm)}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const TZ = 'America/Argentina/Buenos_Aires'
const hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })
const COMPROBANTES = { factura_a: 'Factura A', factura_b: 'Factura B', factura_c: 'Factura C', ticket: 'Ticket', remito: 'Remito', sin_comprobante: 'Sin comprobante' }
const METODOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', debito: 'Débito', credito: 'Crédito', qr: 'QR' }

const compras = ref([])
const proveedores = ref([])
const catalogo = ref({ insumos: [], productos: [] })
const cargando = ref(false)
const filtroMes = ref(hoy().slice(0, 7))
const filtroProveedor = ref('')
const filtroTipo = ref('')
const filtroEstado = ref('vigente')
const detalle = ref(null)
const confirmandoAnular = ref(false)
const anulando = ref(false)
const errorAnular = ref('')
const form = ref(null)
const nuevoProv = ref(null)
const busqueda = ref('')
const buscadorRef = ref(null)
const buscando = ref(false)
const guardando = ref(false)
const errorForm = ref('')

const fmt = n => Math.round(Number(n) || 0).toLocaleString('es-AR')
const comprobanteTxt = c => COMPROBANTES[c.tipo_comprobante] + (c.nro_comprobante ? ' ' + c.nro_comprobante : '')
const fmtCant = n => (Math.round((Number(n) || 0) * 1000) / 1000).toLocaleString('es-AR')
const fechaCorta = ymd => ymd ? ymd.split('-').reverse().join('/') : ''
const fechaLarga = ymd => new Date(ymd + 'T12:00:00Z').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const fechaHora = f => f ? new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }) : ''
const urlArchivo = p => (axios.defaults.baseURL || '').replace(/\/$/, '') + p
const mesLargo = computed(() => new Date(filtroMes.value + '-15T12:00:00Z').toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))

// ── Listado ──
async function cargar() {
  cargando.value = true
  try {
    const [y, m] = filtroMes.value.split('-').map(Number)
    const ultimo = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const { data } = await axios.get('/api/compras', { params: { desde: `${filtroMes.value}-01`, hasta: `${filtroMes.value}-${String(ultimo).padStart(2, '0')}` } })
    compras.value = data
  } catch (e) {
    alert(e.response?.data?.error || 'No se pudieron cargar las compras')
  } finally { cargando.value = false }
}
async function cargarProveedores() {
  const { data } = await axios.get('/api/cuentas')
  proveedores.value = data.filter(c => c.tipo === 'proveedor')
}

const comprasFiltradas = computed(() => compras.value.filter(c =>
  (!filtroEstado.value || c.estado === filtroEstado.value) &&
  (!filtroProveedor.value || c.cuenta_id === filtroProveedor.value) &&
  (!filtroTipo.value || c.items.some(i => i.tipo === filtroTipo.value))))

const resumen = computed(() => {
  const vig = compras.value.filter(c => c.estado === 'vigente' && (!filtroProveedor.value || c.cuenta_id === filtroProveedor.value))
  const sumaTipo = t => vig.reduce((a, c) => a + c.items.filter(i => i.tipo === t).reduce((b, i) => b + Number(i.subtotal), 0), 0)
  return {
    cantidad: vig.length,
    total: vig.reduce((a, c) => a + Number(c.total), 0),
    insumos: sumaTipo('insumo'),
    productos: sumaTipo('producto'),
    contado: vig.filter(c => c.condicion === 'contado').reduce((a, c) => a + Number(c.total), 0),
    aCuenta: vig.filter(c => c.condicion === 'cuenta_corriente').reduce((a, c) => a + Number(c.total), 0),
  }
})

function resumenItems(c) {
  const t = c.items.slice(0, 2).map(i => `${i.descripcion} (${fmtCant(i.cantidad)} ${i.unidad === 'unidad' ? 'u.' : i.unidad})`).join(', ')
  return c.items.length > 2 ? `${t} y ${c.items.length - 2} más` : t
}

// ── Anular ──
async function anular() {
  anulando.value = true; errorAnular.value = ''
  try {
    await axios.post(`/api/compras/${detalle.value.id}/anular`)
    detalle.value = null; confirmandoAnular.value = false
    await Promise.all([cargar(), cargarProveedores()])
  } catch (e) {
    errorAnular.value = e.response?.data?.error || 'No se pudo anular'
  } finally { anulando.value = false }
}

// ── Nueva compra ──
async function abrirNueva() {
  errorForm.value = ''; busqueda.value = ''; nuevoProv.value = null
  form.value = { fecha: hoy(), cuenta_id: '', tipo_comprobante: 'factura_b', nro_comprobante: '', alicuota_iva: 21, condicion: 'contado', metodo_pago: 'transferencia', nota: '', archivo: null, items: [] }
  try {
    const { data } = await axios.get('/api/compras/catalogo')
    catalogo.value = data
  } catch (e) { errorForm.value = e.response?.data?.error || 'No se pudo cargar el catálogo' }
}

const normalizar = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const opciones = computed(() => [
  ...catalogo.value.insumos.map(i => ({ clave: 'i' + i.id, tipo: 'insumo', id: i.id, nombre: i.nombre, unidad: i.unidad, stock: i.stock, costo: Number(i.costo_unitario) || null, categoria: 'Insumo' })),
  ...catalogo.value.productos.map(p => ({ clave: 'p' + p.id, tipo: 'producto', id: p.id, nombre: p.nombre, unidad: 'unidad', stock: p.stock, costo: Number(p.precio_costo) || null, precio: Number(p.precio), categoria: p.categoria?.nombre || 'Producto', mkt: p.categoria?.codigo === 'MKT' })),
])
const resultados = computed(() => {
  const q = normalizar(busqueda.value).trim()
  const ya = new Set(form.value?.items.map(i => i.clave))
  const lista = opciones.value.filter(o => !ya.has(o.clave) && (!q || normalizar(o.nombre).includes(q) || normalizar(o.categoria).includes(q)))
  // primero insumos y productos del Market (lo que se compra para revender)
  lista.sort((a, b) => (b.tipo === 'insumo') - (a.tipo === 'insumo') || (b.mkt ? 1 : 0) - (a.mkt ? 1 : 0))
  return lista.slice(0, 12)
})
function cerrarBusqueda() { setTimeout(() => { buscando.value = false }, 150) }
function agregar(o) {
  form.value.items.push({ ...o, cantidad: o.tipo === 'insumo' ? null : 1, costo_unitario: o.costo || null })
  busqueda.value = ''
  buscando.value = false
  buscadorRef.value?.blur()
}
const subtotal = it => Math.round((Number(it.cantidad) || 0) * (Number(it.costo_unitario) || 0) * 100) / 100
const totalForm = computed(() => (form.value?.items || []).reduce((a, it) => a + subtotal(it), 0))
const margen = it => it.precio ? (it.precio - (Number(it.costo_unitario) || 0)) / it.precio : 0

async function crearProveedor() {
  if (!nuevoProv.value?.nombre?.trim()) return
  try {
    const { data } = await axios.post('/api/cuentas', { tipo: 'proveedor', nombre: nuevoProv.value.nombre.trim(), telefono: nuevoProv.value.telefono || null })
    await cargarProveedores()
    form.value.cuenta_id = data.id
    nuevoProv.value = null
  } catch (e) { errorForm.value = e.response?.data?.error || 'No se pudo crear el proveedor' }
}

async function guardar() {
  const f = form.value
  errorForm.value = ''
  if (!f.cuenta_id) return (errorForm.value = 'Elegí el proveedor')
  if (!f.items.length) return (errorForm.value = 'Agregá al menos un renglón')
  const malo = f.items.find(it => !(Number(it.cantidad) > 0) || !(Number(it.costo_unitario) >= 0) || it.costo_unitario === null || it.costo_unitario === '')
  if (malo) return (errorForm.value = `Completá cantidad y costo de "${malo.nombre}"`)
  if (f.items.some(it => it.tipo === 'producto' && !Number.isInteger(Number(it.cantidad)))) return (errorForm.value = 'Los productos se compran por unidad (sin decimales)')
  if (f.condicion === 'contado' && !f.metodo_pago) return (errorForm.value = 'Elegí con qué se pagó')
  guardando.value = true
  try {
    const fd = new FormData()
    fd.append('datos', JSON.stringify({
      fecha: f.fecha, cuenta_id: f.cuenta_id, tipo_comprobante: f.tipo_comprobante, nro_comprobante: f.nro_comprobante,
      alicuota_iva: f.tipo_comprobante === 'factura_a' ? f.alicuota_iva : null,
      condicion: f.condicion, metodo_pago: f.condicion === 'contado' ? f.metodo_pago : null, nota: f.nota,
      items: f.items.map(it => ({ tipo: it.tipo, insumo_id: it.tipo === 'insumo' ? it.id : null, producto_id: it.tipo === 'producto' ? it.id : null, cantidad: Number(it.cantidad), costo_unitario: Number(it.costo_unitario) })),
    }))
    if (f.archivo) fd.append('comprobante', f.archivo)
    const { data } = await axios.post('/api/compras', fd)
    form.value = null
    if (data.fecha.slice(0, 7) !== filtroMes.value) filtroMes.value = data.fecha.slice(0, 7)
    filtroEstado.value = 'vigente'
    await Promise.all([cargar(), cargarProveedores()])
  } catch (e) {
    errorForm.value = e.response?.data?.error || 'No se pudo registrar la compra'
  } finally { guardando.value = false }
}

onMounted(() => { cargar(); cargarProveedores() })
</script>

<style scoped>
.lbl { @apply block font-body text-xs text-gray-500 mb-1; }
.campo { @apply w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-800 focus:outline-none focus:border-teal disabled:opacity-50; }
.tarjeta { @apply bg-white border border-gray-200 rounded-2xl p-5; }
.t-etq { @apply font-body text-xs text-gray-500 mb-1; }
.t-valor { @apply font-display text-2xl font-bold; }
.t-det { @apply font-body text-xs text-gray-400 mt-1; }
.pill { @apply inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold align-middle whitespace-nowrap; }
.opcion { @apply w-full px-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 font-body text-sm font-semibold text-gray-600 text-left transition-all; }
.opcion-on { @apply border-teal bg-teal/10 text-teal; }
</style>
