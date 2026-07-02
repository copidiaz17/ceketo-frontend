<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Registrar Venta</h1>
        <p class="font-body text-gray-500 mt-1">Venta en el local mediante código de barras o selector</p>
      </div>
      <!-- Estado impresora -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 font-body text-sm">
          <span :class="impresoraConectada ? 'bg-teal' : 'bg-gray-300'" class="w-2.5 h-2.5 rounded-full"></span>
          <span :class="impresoraConectada ? 'text-teal' : 'text-gray-400'">
            {{ impresoraConectada ? 'Impresora conectada' : 'Impresora desconectada' }}
          </span>
        </div>
        <button
          v-if="!impresoraConectada"
          @click="conectar"
          class="px-4 py-2 bg-brand-green text-white font-body text-sm rounded-xl hover:bg-brand-green/80 transition-colors"
        >Conectar impresora</button>
      </div>
      <p v-if="impresoraError" class="w-full text-red-400 text-xs font-body">{{ impresoraError }}</p>
    </div>

    <!-- Pedidos online pendientes -->
    <div v-if="pedidosPendientes.length" class="mb-6 bg-white border-2 border-keto-orange/40 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
          🛎️ Pedidos online pendientes
          <span class="bg-keto-orange text-gray-900 text-sm font-bold rounded-full px-2.5 py-0.5">{{ pedidosPendientes.length }}</span>
        </h2>
        <button @click="cargarPedidosPendientes" class="text-gray-400 hover:text-teal text-sm font-body">↻ Actualizar</button>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="p in pedidosPendientes"
          :key="p.id"
          class="border rounded-xl p-4 flex flex-col"
          :class="pedidoActivo?.id === p.id ? 'border-teal bg-teal/5' : 'border-gray-200'"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <p class="font-body font-semibold text-gray-900 leading-tight">{{ p.nombre }}</p>
              <p class="font-body text-xs text-gray-400">#{{ p.id }} · {{ formatHora(p.fecha) }}</p>
            </div>
            <span class="font-display font-bold text-teal text-sm whitespace-nowrap">${{ parseFloat(p.total).toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ p.tipo_entrega === 'envio' ? '🛵 Envío' : '🏪 Retiro' }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {{ metodosPago.find(m => m.value === p.metodo_pago)?.label || p.metodo_pago }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{{ p.items?.length || 0 }} item(s)</span>
          </div>
          <div class="mb-3 space-y-1 text-xs">
            <a
              v-if="p.telefono"
              :href="waLink(p.telefono)"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 text-[#128C7E] hover:underline font-medium"
              title="Escribir por WhatsApp"
            >💬 {{ p.telefono }}</a>
            <p v-if="p.tipo_entrega === 'envio' && p.direccion" class="text-gray-500">
              📍 {{ p.direccion }}{{ p.localidad ? ', ' + p.localidad : '' }}
            </p>
          </div>
          <div class="mt-auto flex gap-2">
            <button
              @click="cargarPedidoEnPOS(p)"
              class="flex-1 py-2 bg-teal text-gray-900 rounded-lg font-body text-sm font-medium hover:bg-teal/80 transition-colors"
            >{{ pedidoActivo?.id === p.id ? '✓ Cargado' : 'Cargar' }}</button>
            <button
              @click="pedidoARechazar = p"
              class="px-3 py-2 border border-red-200 text-red-400 rounded-lg font-body text-sm hover:bg-red-50 transition-colors"
            >Rechazar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Panel izquierdo: agregar producto -->
      <div class="space-y-4">

        <!-- Scanner de código de barras -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔫</span> Lector de código de barras
          </h2>
          <p class="font-body text-xs text-gray-400 mb-3">
            Hacé click en el campo y pasá el producto por el lector
          </p>
          <div class="flex gap-3">
            <input
              ref="barcodeInput"
              v-model="barcodeRaw"
              @input="onBarcodeInput"
              @keydown.enter.prevent="buscarPorBarcode"
              type="text"
              placeholder="*BYM-001*"
              class="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-mono text-sm
                     focus:outline-none focus:border-teal transition-colors"
              autofocus
            />
            <button
              @click="buscarPorBarcode"
              class="px-5 py-3 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-colors"
            >Buscar</button>
          </div>
          <p v-if="barcodeError" class="text-red-400 text-xs mt-2 font-body">{{ barcodeError }}</p>

          <!-- Producto encontrado por barcode -->
          <div v-if="productoEscaneado" class="mt-4 bg-teal/10 border border-teal/30 rounded-xl p-4">
            <p class="font-body text-sm font-semibold text-gray-900 mb-1">{{ productoEscaneado.nombre }}</p>
            <p class="font-body text-xs text-gray-400 mb-3">{{ productoEscaneado.codigo }} · ${{ parseFloat(productoEscaneado.precio).toLocaleString('es-AR') }}</p>
            <div class="flex gap-3 items-center">
              <div class="flex-1">
                <label class="block font-body text-xs text-gray-400 mb-1">Cantidad</label>
                <input
                  ref="cantidadBarcodeInput"
                  v-model.number="cantidadBarcode"
                  type="number"
                  min="1"
                  @keydown.enter.prevent="agregarDesdeBarcode"
                  class="w-full px-4 py-2 rounded-xl bg-white border border-teal/40 text-gray-800 font-body
                         focus:outline-none focus:border-teal transition-colors"
                />
              </div>
              <button
                @click="agregarDesdeBarcode"
                class="px-5 py-2 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors mt-5"
              >+ Agregar</button>
              <button
                @click="productoEscaneado = null; barcodeInput?.focus()"
                class="px-3 py-2 text-gray-400 hover:text-red-400 transition-colors mt-5 text-lg"
              >✕</button>
            </div>
          </div>
        </div>

        <!-- Selector por categoría + grid de productos -->
        <div class="bg-white border border-gray-200 rounded-2xl p-4">
          <!-- Tabs de categorías -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="cat in categoriasConProductos"
              :key="cat.codigo"
              @click="categoriaActiva = cat.codigo"
              class="px-3 py-1.5 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="categoriaActiva === cat.codigo
                ? 'bg-teal border-teal text-gray-900 font-semibold'
                : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >{{ cat.nombre }}</button>
          </div>

          <!-- Grid de productos -->
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
            <button
              v-for="prod in productosFiltrados"
              :key="prod.id"
              @click="agregarAlCarrito(prod, 1)"
              class="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200
                     hover:border-teal hover:bg-teal/5 active:scale-95 transition-all duration-150 text-center"
            >
              <div class="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  v-if="prod.imagen"
                  :src="prod.imagen"
                  :alt="prod.nombre"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛒</div>
              </div>
              <p class="font-body text-xs text-gray-800 leading-tight line-clamp-2 w-full">{{ prod.nombre }}</p>
              <p class="font-body text-xs font-bold text-teal">${{ parseFloat(prod.precio).toLocaleString('es-AR') }}</p>
            </button>
          </div>
        </div>

        <!-- Tipo de venta -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 class="font-display text-base font-semibold text-gray-900 mb-3">Tipo de venta</h2>
          <div class="flex gap-3">
            <button
              @click="tipoVenta = 'local'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'local' ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >Local</button>
            <button
              @click="tipoVenta = 'online'"
              class="flex-1 py-2 rounded-xl font-body text-sm border-2 transition-all duration-200"
              :class="tipoVenta === 'online' ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >Online</button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: carrito de venta -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
        <h2 class="font-display text-lg font-semibold text-gray-900 mb-5">Ticket de venta</h2>

        <!-- Banner del pedido online cargado -->
        <div v-if="pedidoActivo" class="mb-4 bg-teal/5 border border-teal/30 rounded-xl p-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-body text-sm font-semibold text-gray-900">🛎️ Pedido online #{{ pedidoActivo.id }} — {{ pedidoActivo.nombre }}</p>
              <p class="font-body text-xs text-gray-500 mt-0.5">
                {{ pedidoActivo.tipo_entrega === 'envio' ? '🛵 Envío a domicilio' : '🏪 Retiro en el local' }}
                <template v-if="pedidoActivo.telefono">
                  · <a :href="waLink(pedidoActivo.telefono)" target="_blank" rel="noopener"
                       class="text-[#128C7E] font-semibold hover:underline" title="Escribir por WhatsApp">💬 {{ pedidoActivo.telefono }}</a>
                </template>
              </p>
              <p v-if="pedidoActivo.tipo_entrega === 'envio' && pedidoActivo.direccion" class="font-body text-xs text-gray-500">
                📍 {{ pedidoActivo.direccion }}{{ pedidoActivo.localidad ? ', ' + pedidoActivo.localidad : '' }}
              </p>
              <p v-if="pedidoActivo.nota" class="font-body text-xs text-gray-500">📝 {{ pedidoActivo.nota }}</p>
            </div>
            <button @click="cancelarCargaPedido" class="text-gray-400 hover:text-red-400 text-sm" title="Quitar pedido">✕</button>
          </div>
        </div>

        <div v-if="carrito.length === 0" class="flex-1 flex items-center justify-center text-gray-400 font-body text-sm">
          Sin productos en la venta
        </div>

        <div v-else class="flex-1 space-y-3 overflow-y-auto pr-1 max-h-80 mb-6">
          <div
            v-for="(item, i) in carrito"
            :key="i"
            class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div class="flex-1">
              <p class="font-body text-sm text-gray-900 leading-tight">{{ item.nombre }}</p>
              <p class="font-body text-xs text-gray-400 font-mono">{{ item.codigo }}</p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button @click="item.cantidad > 1 ? item.cantidad-- : carrito.splice(i,1)"
                class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">−</button>
              <span class="font-body text-gray-900 w-6 text-center">{{ item.cantidad }}</span>
              <button @click="item.cantidad++"
                class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">+</button>
              <span class="font-body text-teal text-sm font-bold w-20 text-right">
                ${{ (item.precio * item.cantidad).toLocaleString('es-AR') }}
              </span>
              <button @click="carrito.splice(i,1)" class="text-gray-300 hover:text-red-400 transition-colors ml-1">✕</button>
            </div>
          </div>
        </div>

        <div v-if="carrito.length > 0" class="border-t border-gray-200 pt-4">
          <div class="flex justify-between items-center mb-4">
            <span class="font-body text-gray-500">Total</span>
            <span class="font-display text-2xl font-bold text-teal">
              ${{ totalCarrito.toLocaleString('es-AR') }}
            </span>
          </div>

          <button
            @click="abrirModalPago"
            :disabled="enviandoVenta"
            class="w-full py-4 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl
                   hover:bg-keto-orange/80 transition-all duration-300 text-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ enviandoVenta ? 'Procesando...' : '✓ Confirmar venta' }}
          </button>

          <p v-if="ventaErr" class="text-red-400 text-sm text-center mt-3 font-body">{{ ventaErr }}</p>
        </div>

        <!-- Botón imprimir — fuera del bloque carrito para que persista tras la venta -->
        <div v-if="ultimaVenta" class="border-t border-gray-200 pt-4 mt-2">
          <p v-if="ventaOk" class="text-teal text-sm text-center mb-2 font-body">{{ ventaOk }}</p>
          <button
            @click="imprimirTicket"
            class="w-full py-3 border border-gray-300 text-gray-700 font-body text-sm font-medium rounded-xl
                   hover:border-teal hover:text-teal transition-colors"
          >🖨️ Imprimir ticket #{{ ultimaVenta.id }}</button>
        </div>
      </div>
    </div>

    <!-- Modal método de pago -->
    <div v-if="modalPago" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-5 space-y-3 overflow-y-scroll" style="max-height:min(560px,90vh);scrollbar-width:thin;scrollbar-color:#2a9d8f #f3f4f6">

        <h2 class="font-display text-lg font-bold text-gray-900">Método de pago</h2>

        <!-- Primer método -->
        <div>
          <label class="block font-body text-xs text-gray-500 mb-1.5">{{ pagoDoble ? '1° método' : 'Método' }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="metodo in metodosPago"
              :key="metodo.value"
              @click="metodoPagoSeleccionado = metodo.value"
              class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 font-body text-xs transition-all duration-200"
              :class="metodoPagoSeleccionado === metodo.value
                ? 'bg-teal border-teal text-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >
              <span class="text-lg">{{ metodo.icon }}</span>
              {{ metodo.label }}
            </button>
          </div>
        </div>

        <!-- Cliente (solo cta corriente en primer método) -->
        <div v-if="metodoPagoSeleccionado === 'cuenta_corriente'">
          <label class="block font-body text-xs text-gray-500 mb-1">Cliente *</label>
          <select
            v-model="cuentaSeleccionada"
            class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
          >
            <option value="">Seleccionar cliente...</option>
            <option v-for="c in clientesCta" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>

        <!-- Toggle pago dividido -->
        <button
          v-if="metodoPagoSeleccionado && metodoPagoSeleccionado !== 'cuenta_corriente'"
          @click="pagoDoble = !pagoDoble; metodoPago2 = ''; montoPago2 = ''"
          class="w-full py-2 rounded-xl border-2 font-body text-sm transition-all duration-200"
          :class="pagoDoble ? 'border-teal bg-teal/10 text-teal font-semibold' : 'border-dashed border-gray-300 text-gray-400 hover:border-gray-400'"
        >
          {{ pagoDoble ? '✓ Pago dividido activado' : '＋ Dividir en dos formas de pago' }}
        </button>

        <!-- Segundo método -->
        <div v-if="pagoDoble" class="space-y-2 bg-teal/5 border border-teal/20 rounded-xl p-3">
          <label class="block font-body text-xs text-gray-500">2° método</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="metodo in metodosPago.filter(m => m.value !== 'cuenta_corriente' && m.value !== metodoPagoSeleccionado)"
              :key="metodo.value"
              @click="metodoPago2 = metodo.value"
              class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 font-body text-xs transition-all duration-200"
              :class="metodoPago2 === metodo.value
                ? 'bg-teal border-teal text-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >
              <span class="text-lg">{{ metodo.icon }}</span>
              {{ metodo.label }}
            </button>
          </div>
          <div v-if="metodoPago2">
            <label class="block font-body text-xs text-gray-500 mb-1">Monto con {{ metodosPago.find(m=>m.value===metodoPago2)?.label }}</label>
            <input
              v-model.number="montoPago2"
              type="number" min="1" :max="totalFinal - 1" placeholder="0"
              class="w-full px-3 py-2 rounded-xl bg-white border border-teal/30 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
            />
            <p v-if="montoPago2 > 0" class="font-body text-xs text-gray-400 mt-1">
              {{ metodosPago.find(m=>m.value===metodoPagoSeleccionado)?.label }}: ${{ (totalFinal - montoPago2).toLocaleString('es-AR') }} ·
              {{ metodosPago.find(m=>m.value===metodoPago2)?.label }}: ${{ Number(montoPago2).toLocaleString('es-AR') }}
            </p>
          </div>
        </div>

        <!-- Fecha, Descuento y Envío -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Fecha</label>
            <input
              v-model="fechaVenta"
              type="date"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Descuento (%)</label>
            <input
              v-model.number="descuentoPct"
              type="number" min="0" max="100" placeholder="0"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
            />
          </div>
        </div>

        <!-- Costo de envío -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <label class="block font-body text-xs text-blue-600 font-semibold mb-1">🚚 Costo de envío (a cargo del cliente)</label>
          <input
            v-model.number="costoEnvio"
            type="number" min="0" placeholder="0"
            class="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
          />
          <p class="font-body text-xs text-blue-400 mt-1">Se suma al total del ticket. No afecta el stock.</p>
        </div>

        <!-- Desglose y Total -->
        <div class="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
          <div v-if="descuentoPct > 0" class="flex justify-between font-body text-xs text-red-400">
            <span>Descuento ({{ descuentoPct }}%)</span>
            <span>- ${{ montoDescuento.toLocaleString('es-AR') }}</span>
          </div>
          <div v-if="costoEnvio > 0" class="flex justify-between font-body text-xs text-blue-500">
            <span>🚚 Envío</span>
            <span>+ ${{ (parseFloat(costoEnvio) || 0).toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between items-center pt-1 border-t border-gray-200">
            <span class="font-body text-sm text-gray-500">Total a cobrar</span>
            <span class="font-display text-xl font-bold text-teal">${{ totalFinal.toLocaleString('es-AR') }}</span>
          </div>
        </div>

        <!-- Vuelto (solo efectivo, pago simple) -->
        <div v-if="metodoPagoSeleccionado === 'efectivo' && !pagoDoble" class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">💵 Dinero recibido ($)</label>
            <input
              v-model.number="dineroRecibido"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <div v-if="dineroRecibido !== null && dineroRecibido !== ''" class="flex justify-between items-center">
            <span class="font-body text-sm text-gray-600">Vuelto</span>
            <span
              class="font-display text-xl font-bold"
              :class="vuelto >= 0 ? 'text-teal' : 'text-red-500'"
            >
              ${{ (vuelto || 0).toLocaleString('es-AR') }}
            </span>
          </div>
          <p v-if="vuelto !== null && vuelto < 0" class="font-body text-xs text-red-500">El monto recibido es menor al total</p>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button
            @click="modalPago = false"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="confirmarVenta"
            :disabled="!metodoPagoSeleccionado || enviandoVenta
              || (metodoPagoSeleccionado === 'cuenta_corriente' && !cuentaSeleccionada)
              || (pagoDoble && (!metodoPago2 || !montoPago2 || montoPago2 <= 0 || montoPago2 >= totalFinal))"
            class="flex-1 py-2.5 bg-keto-orange text-gray-800 font-body font-semibold rounded-xl hover:bg-keto-orange/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ enviandoVenta ? 'Procesando...' : 'Confirmar' }}</button>
        </div>

      </div>
    </div>

    <!-- Historial de ventas -->
    <div class="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
      <div class="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 class="font-display text-lg font-semibold text-gray-900">
          Ventas — {{ filtroFechaLabel }}
          <span class="text-sm font-body text-gray-400 ml-2">({{ historialVentas.length }})</span>
        </h2>
        <div class="flex items-center gap-2">
          <input
            v-model="filtroFecha"
            type="date"
            class="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors"
            @change="cargarHistorial"
          />
          <button
            v-if="filtroFecha !== hoyISO"
            @click="filtroFecha = hoyISO; cargarHistorial()"
            class="px-3 py-2 rounded-xl bg-teal/10 text-teal font-body text-sm hover:bg-teal/20 transition-colors"
          >Hoy</button>
          <button
            v-if="historialVentas.length"
            @click="descargarPDFVentas"
            class="px-4 py-2 bg-teal text-gray-900 rounded-xl font-body text-sm font-medium hover:bg-teal/80 transition-colors"
          >📄 PDF</button>
          <button
            v-if="historialVentas.length"
            @click="descargarExcelVentas"
            class="px-4 py-2 bg-green-600 text-white rounded-xl font-body text-sm font-medium hover:bg-green-700 transition-colors"
          >📊 Excel</button>
        </div>
      </div>
      <!-- Resumen rápido del día filtrado -->
      <div v-if="historialVentas.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div v-for="resumen in resumenMetodos" :key="resumen.metodo" class="bg-gray-50 rounded-xl px-4 py-3">
          <p class="font-body text-xs text-gray-400 mb-1">{{ resumen.label }}</p>
          <p class="font-display font-bold text-teal text-base">${{ resumen.total.toLocaleString('es-AR') }}</p>
        </div>
        <div class="bg-teal/10 rounded-xl px-4 py-3">
          <p class="font-body text-xs text-gray-500 mb-1">Total del día</p>
          <p class="font-display font-bold text-teal text-base">${{ totalDia.toLocaleString('es-AR') }}</p>
        </div>
      </div>
      <div v-if="historialVentas.length === 0" class="text-gray-400 font-body text-sm">Sin ventas para esta fecha</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full font-body text-sm">
          <thead>
            <tr class="text-gray-400 border-b border-gray-200">
              <th class="text-left pb-3 pr-4">#</th>
              <th class="text-left pb-3 pr-4">Hora</th>
              <th class="text-left pb-3 pr-4">Tipo</th>
              <th class="text-left pb-3 pr-4">Items</th>
              <th class="text-left pb-3 pr-4">Pago</th>
              <th class="text-right pb-3">Total</th>
              <th class="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="v in historialVentas"
              :key="v.id"
              class="border-b border-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <td class="py-3 pr-4 text-gray-400">#{{ v.id }}</td>
              <td class="py-3 pr-4">{{ formatHora(v.fecha) }}</td>
              <td class="py-3 pr-4">
                <span class="px-2 py-0.5 rounded-full text-xs"
                  :class="v.tipo === 'online' ? 'bg-purple-500/20 text-purple-300' : 'bg-teal/20 text-teal'">
                  {{ v.tipo }}
                </span>
              </td>
              <td class="py-3 pr-4">{{ v.items?.length || 0 }} item(s)</td>
              <td class="py-3 pr-4">
                <span v-if="v.metodo_pago" class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {{ metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago }}
                </span>
                <span v-if="v.metodo_pago2" class="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal/10 text-teal">
                  + {{ metodosPago.find(m => m.value === v.metodo_pago2)?.label || v.metodo_pago2 }}
                </span>
                <span v-if="!v.metodo_pago" class="text-gray-300">—</span>
              </td>
              <td class="py-3 text-right font-bold text-teal">${{ parseFloat(v.total).toLocaleString('es-AR') }}</td>
              <td class="py-3 pl-4 text-right">
                <div class="flex gap-2 justify-end">
                  <button
                    @click="abrirDetalleVenta(v)"
                    class="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-body hover:border-teal hover:text-teal transition-colors"
                  >Ver</button>
                  <button
                    @click="confirmarAnulacion(v)"
                    class="px-3 py-1 rounded-lg border border-red-200 text-red-400 text-xs font-body hover:bg-red-50 transition-colors"
                  >Anular</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal detalle de venta -->
    <div v-if="ventaDetalle" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="font-display text-xl font-bold text-gray-900">Venta #{{ ventaDetalle.id }}</h2>
            <p class="font-body text-sm text-gray-400">
              {{ formatHora(ventaDetalle.fecha) }} ·
              {{ metodosPago.find(m => m.value === ventaDetalle.metodo_pago)?.label || '—' }}
              <template v-if="ventaDetalle.metodo_pago2">
                + {{ metodosPago.find(m => m.value === ventaDetalle.metodo_pago2)?.label }}
                (${{ parseFloat(ventaDetalle.monto_pago2).toLocaleString('es-AR') }})
              </template>
            </p>
          </div>
          <button @click="ventaDetalle = null" class="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <!-- Items agrupados por categoría -->
        <div class="space-y-1 mb-4">
          <template v-for="(items, cat) in itemsAgrupados(ventaDetalle.items)" :key="cat">
            <p class="font-body text-xs font-semibold text-gray-400 uppercase mt-3 mb-1">{{ cat }}</p>
            <div
              v-for="item in items"
              :key="item.id"
              class="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2"
            >
              <div>
                <p class="font-body text-sm text-gray-900">{{ item.producto?.nombre }}</p>
                <p class="font-body text-xs text-gray-400">{{ item.cantidad }}x ${{ parseFloat(item.precio_unit).toLocaleString('es-AR') }}</p>
              </div>
              <span class="font-body text-sm font-bold text-teal">${{ parseFloat(item.subtotal).toLocaleString('es-AR') }}</span>
            </div>
          </template>
        </div>

        <div class="border-t border-gray-200 pt-3 space-y-1">
          <div v-if="ventaDetalle.descuento > 0" class="flex justify-between font-body text-sm text-red-400">
            <span>Descuento ({{ ventaDetalle.descuento }}%)</span>
            <span>aplicado</span>
          </div>
          <div v-if="parseFloat(ventaDetalle.costo_envio) > 0" class="flex justify-between font-body text-sm text-blue-500">
            <span>🚚 Envío</span>
            <span>+ ${{ parseFloat(ventaDetalle.costo_envio).toLocaleString('es-AR') }}</span>
          </div>
          <div class="flex justify-between font-body font-bold text-gray-900">
            <span>Total</span>
            <span class="text-teal text-lg">${{ parseFloat(ventaDetalle.total).toLocaleString('es-AR') }}</span>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button
            @click="imprimirTicketHistorial(ventaDetalle)"
            class="flex-1 py-3 border border-gray-300 text-gray-700 font-body text-sm font-medium rounded-xl
                   hover:border-teal hover:text-teal transition-colors"
          >🖨️ Reimprimir</button>
          <button
            @click="abrirEditarPago(ventaDetalle)"
            class="flex-1 py-3 border border-teal/40 text-teal font-body text-sm font-medium rounded-xl
                   hover:bg-teal/5 transition-colors"
          >✏️ Editar pago</button>
          <button
            @click="confirmarAnulacion(ventaDetalle); ventaDetalle = null"
            class="flex-1 py-3 border border-red-200 text-red-400 font-body text-sm font-medium rounded-xl
                   hover:bg-red-50 transition-colors"
          >Anular</button>
        </div>
      </div>
    </div>

    <!-- Modal editar forma de pago -->
    <div v-if="modalEditarPago" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 class="font-display text-lg font-bold text-gray-900">Editar forma de pago</h2>
        <p class="font-body text-xs text-gray-400">Venta #{{ ventaDetalle?.id }} · Total ${{ parseFloat(ventaDetalle?.total || 0).toLocaleString('es-AR') }}</p>

        <div>
          <label class="block font-body text-xs text-gray-500 mb-1.5">Método principal</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="metodo in metodosPago"
              :key="metodo.value"
              @click="editPago.metodo_pago = metodo.value; editPago.metodo_pago2 = ''; editPago.monto_pago2 = ''"
              class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 font-body text-xs transition-all"
              :class="editPago.metodo_pago === metodo.value ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >
              <span class="text-lg">{{ metodo.icon }}</span>{{ metodo.label }}
            </button>
          </div>
        </div>

        <div v-if="editPago.metodo_pago && editPago.metodo_pago !== 'cuenta_corriente'" class="space-y-2">
          <label class="block font-body text-xs text-gray-500">2° método (opcional)</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="metodo in metodosPago.filter(m => m.value !== 'cuenta_corriente' && m.value !== editPago.metodo_pago)"
              :key="metodo.value"
              @click="editPago.metodo_pago2 = editPago.metodo_pago2 === metodo.value ? '' : metodo.value"
              class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 font-body text-xs transition-all"
              :class="editPago.metodo_pago2 === metodo.value ? 'bg-teal border-teal text-gray-900' : 'border-gray-200 text-gray-500 hover:border-teal/50'"
            >
              <span class="text-lg">{{ metodo.icon }}</span>{{ metodo.label }}
            </button>
          </div>
          <input
            v-if="editPago.metodo_pago2"
            v-model.number="editPago.monto_pago2"
            type="number" min="1" placeholder="Monto 2° método ($)"
            class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="modalEditarPago = false"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="guardarEditarPago"
            :disabled="!editPago.metodo_pago || editPago.guardando"
            class="flex-1 py-2.5 bg-teal text-gray-900 font-body text-sm font-semibold rounded-xl hover:bg-teal/80 transition-all disabled:opacity-40"
          >{{ editPago.guardando ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal confirmación anulación -->
    <div v-if="ventaAAnular" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
        <h2 class="font-display text-lg font-bold text-gray-900 mb-2">Anular venta #{{ ventaAAnular.id }}</h2>
        <p class="font-body text-sm text-gray-500 mb-1">
          Total: <span class="font-bold text-gray-900">${{ parseFloat(ventaAAnular.total).toLocaleString('es-AR') }}</span>
        </p>
        <p class="font-body text-sm text-red-400 mb-6">
          Se revertirá el stock de {{ ventaAAnular.items?.length || 0 }} producto(s). Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button
            @click="ventaAAnular = null"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="anularVenta"
            :disabled="anulando"
            class="flex-1 py-3 bg-red-500 text-white font-body text-sm font-semibold rounded-xl
                   hover:bg-red-600 transition-colors disabled:opacity-50"
          >{{ anulando ? 'Anulando...' : 'Confirmar anulación' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal rechazar pedido online -->
    <div v-if="pedidoARechazar" class="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm">
        <h2 class="font-display text-lg font-bold text-gray-900 mb-2">Rechazar pedido #{{ pedidoARechazar.id }}</h2>
        <p class="font-body text-sm text-gray-500 mb-1">
          {{ pedidoARechazar.nombre }} · <span class="font-bold text-gray-900">${{ parseFloat(pedidoARechazar.total).toLocaleString('es-AR') }}</span>
        </p>
        <p class="font-body text-sm text-gray-400 mb-6">El pedido se marcará como cancelado y saldrá de la lista. No afecta el stock.</p>
        <div class="flex gap-3">
          <button
            @click="pedidoARechazar = null"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors"
          >Cancelar</button>
          <button
            @click="rechazarPedido"
            :disabled="rechazando"
            class="flex-1 py-3 bg-red-500 text-white font-body text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >{{ rechazando ? 'Rechazando...' : 'Confirmar rechazo' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'
import ProductSelect from '@/components/admin/ProductSelect.vue'
import { conectarImpresora, imprimirTicketESCPOS } from '@/utils/printer.js'

const productos        = ref([])
const barcodeRaw       = ref('')
const barcodeError     = ref('')
const selectedId       = ref('')
const cantidadVenta    = ref(1)
const tipoVenta        = ref('local')
const carrito          = ref([])
const enviandoVenta    = ref(false)
const ventaOk          = ref('')
const ventaErr         = ref('')
const historialVentas       = ref([])
const barcodeInput          = ref(null)
const barcodeTimer          = ref(null)
const cantidadBarcodeInput  = ref(null)
const productoEscaneado     = ref(null)
const cantidadBarcode       = ref(1)
const modalPago             = ref(false)
const ultimaVenta           = ref(null)
const ventaDetalle          = ref(null)
const impresoraConectada    = ref(false)
const impresoraError        = ref('')
const ventaAAnular          = ref(null)
const anulando              = ref(false)
const metodoPagoSeleccionado = ref('')
const pagoDoble              = ref(false)
const metodoPago2            = ref('')
const montoPago2             = ref('')
const dineroRecibido         = ref(null)
const modalEditarPago        = ref(false)
const editPago               = ref({ metodo_pago: '', metodo_pago2: '', monto_pago2: '', guardando: false })
const descuentoPct           = ref(0)
const costoEnvio             = ref(0)
const fechaVenta             = ref('')
const hoyISO                 = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
const filtroFecha            = ref(hoyISO)
const clientesCta            = ref([])
const cuentaSeleccionada     = ref('')
const categoriaActiva        = ref('')
const pedidosPendientes      = ref([])
const pedidoActivo           = ref(null)
const pedidoARechazar        = ref(null)
const rechazando             = ref(false)
let   pollPedidos            = null

const metodosPago = [
  { value: 'efectivo',          label: 'Efectivo',       icon: '💵' },
  { value: 'transferencia',     label: 'Transferencia',  icon: '🏦' },
  { value: 'debito',            label: 'Débito',         icon: '💳' },
  { value: 'credito',           label: 'Crédito',        icon: '💳' },
  { value: 'qr',                label: 'QR',             icon: '📱' },
  { value: 'cuenta_corriente',  label: 'Cta. Corriente', icon: '🤝' },
]

const categoriasConProductos = computed(() => {
  const mapa = {}
  for (const p of productos.value) {
    const key = p.categoria?.codigo || 'SIN'
    if (!mapa[key]) mapa[key] = { codigo: key, nombre: p.categoria?.nombre || 'Sin categoría', productos: [] }
    mapa[key].productos.push(p)
  }
  return Object.values(mapa)
})

const productosFiltrados = computed(() => {
  const cat = categoriasConProductos.value.find(c => c.codigo === categoriaActiva.value)
  return cat?.productos || []
})

const totalCarrito = computed(() =>
  carrito.value.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
)

const montoDescuento = computed(() =>
  Math.round(totalCarrito.value * (descuentoPct.value || 0) / 100)
)

const totalFinal = computed(() =>
  totalCarrito.value - montoDescuento.value + (parseFloat(costoEnvio.value) || 0)
)

const resumenMetodos = computed(() => {
  const mapa = {}
  const acumular = (metodo, monto) => {
    if (!metodo || monto <= 0) return
    if (!mapa[metodo]) {
      const m = metodosPago.find(x => x.value === metodo)
      mapa[metodo] = { metodo, label: m?.label || metodo, total: 0 }
    }
    mapa[metodo].total += monto
  }
  for (const v of historialVentas.value) {
    // Pago dividido: monto_pago2 va al 2º método; el resto, al 1º (igual que el backend)
    const total  = parseFloat(v.total) || 0
    const monto2 = v.metodo_pago2 && v.monto_pago2 ? parseFloat(v.monto_pago2) : 0
    const monto1 = total - monto2
    acumular(v.metodo_pago || 'sin_metodo', monto1)
    if (monto2 > 0) acumular(v.metodo_pago2, monto2)
  }
  return Object.values(mapa)
})

const totalDia = computed(() =>
  historialVentas.value.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
)

const vuelto = computed(() => {
  if (metodoPagoSeleccionado.value !== 'efectivo' || dineroRecibido.value === null) return null
  return (Number(dineroRecibido.value) || 0) - totalFinal.value
})

const filtroFechaLabel = computed(() => {
  if (filtroFecha.value === hoyISO) return 'Hoy'
  const [y, m, d] = filtroFecha.value.split('-')
  return `${d}/${m}/${y}`
})

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
}

function onBarcodeInput() {
  clearTimeout(barcodeTimer.value)
  if (!barcodeRaw.value.trim()) return
  barcodeTimer.value = setTimeout(() => {
    buscarPorBarcode()
  }, 300)
}

async function buscarPorBarcode() {
  barcodeError.value = ''
  const codigo = barcodeRaw.value.replace(/\*/g, '').trim()
  if (!codigo) return
  try {
    const { data } = await axios.get(`/api/productos/barcode/${codigo}`)
    productoEscaneado.value = data
    cantidadBarcode.value   = 1
    barcodeRaw.value = ''
    await nextTick()
    cantidadBarcodeInput.value?.focus()
    cantidadBarcodeInput.value?.select()
  } catch {
    barcodeError.value = `Código "${codigo}" no encontrado`
    setTimeout(() => { barcodeError.value = '' }, 3000)
  }
}

function agregarDesdeBarcode() {
  if (!productoEscaneado.value || !cantidadBarcode.value) return
  agregarAlCarrito(productoEscaneado.value, cantidadBarcode.value)
  productoEscaneado.value = null
  cantidadBarcode.value   = 1
  barcodeInput.value?.focus()
}

function agregarDesdeSelector() {
  if (!selectedId.value) return
  const prod = productos.value.find(p => p.id === selectedId.value)
  if (!prod) return
  agregarAlCarrito(prod, cantidadVenta.value)
  selectedId.value   = ''
  cantidadVenta.value = 1
}

function agregarAlCarrito(prod, cant) {
  const existente = carrito.value.find(i => i.producto_id === prod.id)
  if (existente) {
    existente.cantidad += cant
  } else {
    carrito.value.push({
      producto_id: prod.id,
      nombre:      prod.nombre,
      codigo:      prod.codigo,
      precio:      parseFloat(prod.precio),
      cantidad:    cant,
      categoria:   prod.categoria?.nombre || 'Otros',
    })
  }
}

// Normaliza un teléfono cargado por el cliente a formato internacional para el link de WhatsApp.
// Mejor esfuerzo: agrega 54 9 (Argentina). El número original igual queda visible.
function normalizarTel(tel) {
  let d = String(tel || '').replace(/\D/g, '')   // solo dígitos
  if (!d) return ''
  d = d.replace(/^0+/, '')                        // saca 0 inicial (0385 → 385)
  if (d.startsWith('54')) return d.startsWith('549') ? d : '549' + d.slice(2)
  return '549' + d                                // número local → 54 9 ...
}
function waLink(tel) {
  const n = normalizarTel(tel)
  return n ? `https://wa.me/${n}` : '#'
}

async function cargarPedidosPendientes() {
  try {
    const token = localStorage.getItem('ceketo_token')
    const { data } = await axios.get('/api/pedidos?estado=pendiente', {
      headers: { Authorization: `Bearer ${token}` },
    })
    pedidosPendientes.value = data
  } catch { pedidosPendientes.value = [] }
}

function cargarPedidoEnPOS(p) {
  carrito.value = (p.items || []).map(it => ({
    producto_id: it.producto_id,
    nombre:      it.producto?.nombre || 'Producto',
    codigo:      it.producto?.codigo || '',
    precio:      parseFloat(it.precio_unit),
    cantidad:    it.cantidad,
    categoria:   it.producto?.categoria?.nombre || 'Otros',
  }))
  pedidoActivo.value = p
  tipoVenta.value    = 'online'
  ventaErr.value     = ''
  ventaOk.value      = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarCargaPedido() {
  pedidoActivo.value = null
  carrito.value = []
  tipoVenta.value = 'local'
}

async function rechazarPedido() {
  if (!pedidoARechazar.value) return
  rechazando.value = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.patch(`/api/pedidos/${pedidoARechazar.value.id}/estado`,
      { estado: 'cancelado' },
      { headers: { Authorization: `Bearer ${token}` } })
    if (pedidoActivo.value?.id === pedidoARechazar.value.id) cancelarCargaPedido()
    pedidoARechazar.value = null
    await cargarPedidosPendientes()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al rechazar el pedido')
  } finally { rechazando.value = false }
}

function abrirModalPago() {
  if (!carrito.value.length) return
  metodoPagoSeleccionado.value = ''
  pagoDoble.value   = false
  metodoPago2.value = ''
  montoPago2.value  = ''
  descuentoPct.value = 0
  costoEnvio.value   = 0
  dineroRecibido.value = null
  fechaVenta.value   = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  cuentaSeleccionada.value = ''
  // Si viene de un pedido online, pre-seleccionamos la forma de pago que eligió el cliente (editable)
  if (pedidoActivo.value && ['efectivo', 'transferencia'].includes(pedidoActivo.value.metodo_pago)) {
    metodoPagoSeleccionado.value = pedidoActivo.value.metodo_pago
  }
  modalPago.value = true
}

async function confirmarVenta() {
  if (!carrito.value.length || !metodoPagoSeleccionado.value) return
  enviandoVenta.value = true
  ventaOk.value  = ''
  ventaErr.value = ''
  try {
    const token = localStorage.getItem('ceketo_token')
    const { data } = await axios.post('/api/ventas', {
      tipo:          tipoVenta.value,
      metodo_pago:   metodoPagoSeleccionado.value,
      metodo_pago2:  pagoDoble.value ? metodoPago2.value : undefined,
      monto_pago2:   pagoDoble.value ? montoPago2.value : undefined,
      descuento:     descuentoPct.value || 0,
      costo_envio:   costoEnvio.value || 0,
      fecha:         fechaVenta.value !== hoyISO ? fechaVenta.value : undefined,
      cuenta_id:     metodoPagoSeleccionado.value === 'cuenta_corriente' ? (cuentaSeleccionada.value || undefined) : undefined,
      items: carrito.value.map(i => ({
        producto_id: i.producto_id,
        cantidad:    i.cantidad,
        precio_unit: i.precio,
      })),
    }, { headers: { Authorization: `Bearer ${token}` } })
    ultimaVenta.value = {
      id:          data.venta_id,
      items:       [...carrito.value],
      total:       data.total,
      descuento:   descuentoPct.value,
      costo_envio: costoEnvio.value || 0,
      metodo_pago: metodoPagoSeleccionado.value,
      fecha:       new Date(),
      // Datos del cliente (solo si la venta viene de un pedido online) → van en el ticket
      cliente:     pedidoActivo.value ? {
        nombre:       pedidoActivo.value.nombre,
        telefono:     pedidoActivo.value.telefono,
        tipo_entrega: pedidoActivo.value.tipo_entrega,
        direccion:    pedidoActivo.value.direccion,
        localidad:    pedidoActivo.value.localidad,
      } : null,
    }
    modalPago.value = false
    ventaOk.value = `✓ Venta #${data.venta_id} registrada — Total $${data.total.toLocaleString('es-AR')}`
    carrito.value = []
    // Si veníamos de un pedido online, lo marcamos como facturado y lo sacamos de pendientes
    if (pedidoActivo.value) {
      try {
        await axios.patch(`/api/pedidos/${pedidoActivo.value.id}/estado`,
          { estado: 'en_preparacion', venta_id: data.venta_id },
          { headers: { Authorization: `Bearer ${token}` } })
      } catch { /* la venta ya se registró; el pedido se puede gestionar desde Pedidos */ }
      pedidoActivo.value = null
      tipoVenta.value = 'local'
      cargarPedidosPendientes()
    }
    cargarHistorial()
    cargarProductos()
    setTimeout(() => { ventaOk.value = '' }, 6000)
  } catch (err) {
    ventaErr.value = err.response?.data?.error || 'Error al registrar venta'
    setTimeout(() => { ventaErr.value = '' }, 5000)
  } finally {
    enviandoVenta.value = false
  }
}

async function conectar() {
  impresoraError.value = ''
  try {
    await conectarImpresora()
    impresoraConectada.value = true
  } catch (e) {
    impresoraError.value = e.message
    impresoraConectada.value = false
  }
}

async function imprimirTicket() {
  const v = ultimaVenta.value
  if (!v) return
  try {
    await imprimirTicketESCPOS({
      id:          v.id,
      items:       v.items,
      total:       v.total,
      descuento:   v.descuento,
      metodo_pago: v.metodo_pago,
      fecha:       v.fecha,
      cliente:     v.cliente,
    })
    impresoraConectada.value = true
  } catch (e) {
    impresoraError.value = e.message
    imprimirTicketFallback(v)
  }
}

async function imprimirTicketHistorial(v) {
  try {
    await imprimirTicketESCPOS({
      id:          v.id,
      items:       v.items?.map(i => ({
        nombre:     i.producto?.nombre,
        categoria:  i.producto?.categoria?.nombre || 'Otros',
        precio_unit: i.precio_unit,
        cantidad:   i.cantidad,
        subtotal:   i.subtotal,
      })),
      total:       v.total,
      descuento:   v.descuento || 0,
      metodo_pago: v.metodo_pago,
      fecha:       v.fecha,
    })
    impresoraConectada.value = true
  } catch (e) {
    impresoraError.value = e.message
    imprimirTicketFallbackHistorial(v)
  }
}

function itemsAgrupados(items) {
  const grupos = {}
  for (const item of (items || [])) {
    const cat = item.producto?.categoria?.nombre || 'Otros'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(item)
  }
  return grupos
}

function abrirDetalleVenta(v) {
  ventaDetalle.value = v
}

function confirmarAnulacion(v) {
  ventaAAnular.value = v
}

function abrirEditarPago(v) {
  editPago.value = {
    metodo_pago:  v.metodo_pago  || '',
    metodo_pago2: v.metodo_pago2 || '',
    monto_pago2:  v.monto_pago2  ? parseFloat(v.monto_pago2) : '',
    guardando: false,
  }
  modalEditarPago.value = true
}

async function guardarEditarPago() {
  if (!editPago.value.metodo_pago || !ventaDetalle.value) return
  editPago.value.guardando = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.patch(`/api/ventas/${ventaDetalle.value.id}`, {
      metodo_pago:  editPago.value.metodo_pago,
      metodo_pago2: editPago.value.metodo_pago2 || undefined,
      monto_pago2:  editPago.value.monto_pago2  || undefined,
    }, { headers: { Authorization: `Bearer ${token}` } })
    // Actualizar venta en el historial localmente
    const idx = historialVentas.value.findIndex(v => v.id === ventaDetalle.value.id)
    if (idx !== -1) {
      historialVentas.value[idx].metodo_pago  = editPago.value.metodo_pago
      historialVentas.value[idx].metodo_pago2 = editPago.value.metodo_pago2 || null
      historialVentas.value[idx].monto_pago2  = editPago.value.monto_pago2  || null
    }
    ventaDetalle.value.metodo_pago  = editPago.value.metodo_pago
    ventaDetalle.value.metodo_pago2 = editPago.value.metodo_pago2 || null
    ventaDetalle.value.monto_pago2  = editPago.value.monto_pago2  || null
    modalEditarPago.value = false
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar')
  } finally { editPago.value.guardando = false }
}

async function anularVenta() {
  if (!ventaAAnular.value) return
  anulando.value = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/ventas/${ventaAAnular.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ventaAAnular.value = null
    await cargarHistorial()
    await cargarProductos()
    ventaOk.value = '✓ Venta anulada y stock revertido'
    setTimeout(() => { ventaOk.value = '' }, 5000)
  } catch (err) {
    ventaErr.value = err.response?.data?.error || 'Error al anular la venta'
    setTimeout(() => { ventaErr.value = '' }, 5000)
  } finally {
    anulando.value = false
  }
}

function imprimirTicketFallbackHistorial(v) {
  const metodoLabel = metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago || '—'
  const clienteHtml = '' // las ventas del historial no guardan datos de cliente
  const fecha = new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const hora  = new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const grupos = itemsAgrupados(v.items)
  let itemsHtml = ''
  for (const [cat, items] of Object.entries(grupos)) {
    itemsHtml += `<tr><td colspan="2" class="cat">${cat.toUpperCase()}</td></tr>`
    for (const item of items) {
      const subtotal = parseFloat(item.subtotal)
      itemsHtml += `
        <tr>
          <td class="prod-nombre">${item.producto?.nombre || '—'}</td>
          <td class="prod-precio">$${subtotal.toLocaleString('es-AR')}</td>
        </tr>
        <tr>
          <td class="prod-detalle">${item.cantidad}x $${parseFloat(item.precio_unit).toLocaleString('es-AR')}</td>
          <td></td>
        </tr>`
    }
  }

  const descuentoHtml = v.descuento > 0 ? `
    <tr class="descuento-row">
      <td>Descuento (${v.descuento}%)</td>
      <td>aplicado</td>
    </tr>` : ''

  const envioHtml = parseFloat(v.costo_envio) > 0 ? `
    <tr class="descuento-row">
      <td>Envio</td>
      <td style="text-align:right">+ $${parseFloat(v.costo_envio).toLocaleString('es-AR')}</td>
    </tr>` : ''

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',monospace; font-size:10px; width:48mm; padding:2mm 1mm; color:#000; }
  .header { text-align:center; margin-bottom:6px; }
  .header .nombre { font-size:16px; font-weight:bold; letter-spacing:1px; }
  .header .dir { font-size:10px; margin-top:2px; }
  .divider { border-top:1px dashed #000; margin:5px 0; }
  .info { font-size:10px; margin-bottom:2px; }
  .info span { font-weight:bold; }
  table { width:100%; border-collapse:collapse; margin-top:4px; }
  td { padding:1px 0; vertical-align:top; }
  .cat { font-weight:bold; font-size:10px; padding-top:6px; padding-bottom:2px; text-decoration:underline; }
  .prod-nombre { font-size:10px; width:65%; }
  .prod-precio { text-align:right; font-size:10px; font-weight:bold; }
  .prod-detalle { font-size:9px; color:#444; padding-left:4px; }
  .descuento-row td { font-size:10px; }
  .descuento-row td:last-child { text-align:right; }
  .total-row td { font-size:13px; font-weight:bold; padding-top:4px; }
  .total-row td:last-child { text-align:right; }
  .footer { text-align:center; font-size:10px; margin-top:8px; }
  @media print { body { width:48mm; } @page { margin:0; size:58mm auto; } }
</style></head><body>
  <div class="header">
    <div class="nombre">CEKETO</div>
    <div class="dir">Independencia 663, Santiago del Estero</div>
    <div class="dir">Santiago del Estero, Argentina</div>
  </div>
  <div class="divider"></div>
  <div class="info">Pedido #${v.id}</div>
  <div class="info">Fecha: ${fecha} - ${hora} hs</div>
  <div class="info">Forma de pago: <span>${metodoLabel}</span></div>
  ${clienteHtml}
  <div class="divider"></div>
  <table>
    ${itemsHtml}
    <tr><td colspan="2"><div class="divider"></div></td></tr>
    ${descuentoHtml}
    ${envioHtml}
    <tr class="total-row"><td>TOTAL</td><td>$${parseFloat(v.total).toLocaleString('es-AR')}</td></tr>
  </table>
  <div class="divider"></div>
  <div class="footer">¡Gracias por tu compra!</div>
</body></html>`

  const win = window.open('', '_blank', 'width=350,height=600')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

function imprimirTicketFallback(v) {
  const metodoLabel = metodosPago.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago
  const fecha = v.fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const hora  = v.fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  // Agrupar items por categoría
  const grupos = {}
  for (const item of (v.items || [])) {
    const cat = item.categoria || 'Otros'
    if (!grupos[cat]) grupos[cat] = []
    grupos[cat].push(item)
  }

  const subtotalOriginal = (v.items || []).reduce((acc, i) => acc + i.precio * i.cantidad, 0)

  let itemsHtml = ''
  for (const [cat, items] of Object.entries(grupos)) {
    itemsHtml += `<tr><td colspan="2" class="cat">${cat.toUpperCase()}</td></tr>`
    for (const item of items) {
      const subtotal = item.precio * item.cantidad
      itemsHtml += `
        <tr>
          <td class="prod-nombre">${item.nombre}</td>
          <td class="prod-precio">$${subtotal.toLocaleString('es-AR')}</td>
        </tr>
        <tr>
          <td class="prod-detalle">${item.cantidad}x $${item.precio.toLocaleString('es-AR')}</td>
          <td></td>
        </tr>`
    }
  }

  const descuentoHtml = v.descuento > 0 ? `
    <tr class="descuento-row">
      <td>Descuento (${v.descuento}%)</td>
      <td>- $${(subtotalOriginal * v.descuento / 100).toLocaleString('es-AR')}</td>
    </tr>` : ''

  const envioHtml2 = parseFloat(v.costo_envio) > 0 ? `
    <tr class="descuento-row">
      <td>Envio</td>
      <td style="text-align:right">+ $${parseFloat(v.costo_envio).toLocaleString('es-AR')}</td>
    </tr>` : ''

  const clienteHtml = v.cliente ? `
  <div class="divider"></div>
  <div class="info">Cliente: <span>${(v.cliente.nombre || '').substring(0, 28)}</span></div>
  ${v.cliente.telefono ? `<div class="info">Tel: <span>${v.cliente.telefono}</span></div>` : ''}
  <div class="info">${v.cliente.tipo_entrega === 'envio'
    ? 'Envio: ' + (v.cliente.direccion || '') + (v.cliente.localidad ? ', ' + v.cliente.localidad : '')
    : 'Retiro en el local'}</div>` : ''

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    width: 48mm;
    padding: 2mm 1mm;
    color: #000;
  }
  .header { text-align: center; margin-bottom: 6px; }
  .header .nombre { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
  .header .dir { font-size: 10px; margin-top: 2px; }
  .divider { border-top: 1px dashed #000; margin: 5px 0; }
  .info { font-size: 10px; margin-bottom: 2px; }
  .info span { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  td { padding: 1px 0; vertical-align: top; }
  .cat { font-weight: bold; font-size: 10px; padding-top: 6px; padding-bottom: 2px; text-decoration: underline; }
  .prod-nombre { font-size: 10px; width: 65%; }
  .prod-precio { text-align: right; font-size: 10px; font-weight: bold; }
  .prod-detalle { font-size: 9px; color: #444; padding-left: 4px; }
  .descuento-row td { font-size: 10px; }
  .descuento-row td:last-child { text-align: right; }
  .total-row td { font-size: 13px; font-weight: bold; padding-top: 4px; }
  .total-row td:last-child { text-align: right; }
  .footer { text-align: center; font-size: 10px; margin-top: 8px; }
  @media print {
    body { width: 48mm; }
    @page { margin: 0; size: 58mm auto; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="nombre">CEKETO</div>
    <div class="dir">Independencia 663, Santiago del Estero</div>
    <div class="dir">Santiago del Estero, Argentina</div>
  </div>
  <div class="divider"></div>
  <div class="info">Pedido #${v.id}</div>
  <div class="info">Fecha: ${fecha} - ${hora} hs</div>
  <div class="info">Forma de pago: <span>${metodoLabel}</span></div>
  ${clienteHtml}
  <div class="divider"></div>
  <table>
    ${itemsHtml}
    <tr><td colspan="2"><div class="divider"></div></td></tr>
    ${descuentoHtml}
    ${envioHtml2}
    <tr class="total-row">
      <td>TOTAL</td>
      <td>$${Number(v.total).toLocaleString('es-AR')}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="footer">¡Gracias por tu compra!</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=350,height=600')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

async function cargarProductos() {
  const { data } = await axios.get('/api/productos?limit=500')
  productos.value = data
  if (!categoriaActiva.value && data.length) {
    const primeraCategoria = data[0]?.categoria?.codigo
    if (primeraCategoria) categoriaActiva.value = primeraCategoria
  }
}

async function cargarClientesCta() {
  try {
    const { data } = await axios.get('/api/cuentas')
    clientesCta.value = data.filter(c => c.tipo === 'cliente')
  } catch {}
}

async function cargarHistorial() {
  try {
    const { data } = await axios.get('/api/ventas', { params: { fecha: filtroFecha.value } })
    historialVentas.value = data
      .sort((a, b) => b.id - a.id)
      .slice(0, 50)
  } catch { historialVentas.value = [] }
}

function descargarPDFVentas() {
  const fechaLabel = filtroFechaLabel.value
  const [y, m, d] = filtroFecha.value.split('-')
  const fechaFormateada = `${d}/${m}/${y}`
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })

  const resumenHTML = resumenMetodos.value.map(r =>
    `<div class="resumen-item"><div class="label">${r.label}</div><div class="valor">$${r.total.toLocaleString('es-AR')}</div></div>`
  ).join('') +
  `<div class="resumen-item total-dia"><div class="label">TOTAL</div><div class="valor">$${totalDia.value.toLocaleString('es-AR')}</div></div>`

  const filasHTML = historialVentas.value.map((v, i) => {
    const hora = formatHora(v.fecha)
    const tipo = v.tipo || 'local'
    const metodo = metodosPago.find(x => x.value === v.metodo_pago)?.label || v.metodo_pago || '—'
    const metodo2 = v.metodo_pago2 ? ` + ${metodosPago.find(x => x.value === v.metodo_pago2)?.label || v.metodo_pago2}` : ''
    const nItems = v.items?.length || 0
    const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb'
    return `<tr style="background:${bg}">
      <td>#${v.id}</td>
      <td>${hora}</td>
      <td>${tipo}</td>
      <td>${nItems} item(s)</td>
      <td>${metodo}${metodo2}</td>
      <td style="text-align:right;font-weight:bold;color:#2a9d8f">$${parseFloat(v.total).toLocaleString('es-AR')}</td>
    </tr>`
  }).join('')

  const el = document.createElement('div')
  el.style.cssText = 'font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px;width:190mm'
  el.innerHTML = `
    <h1 style="font-size:20px;font-weight:bold;margin-bottom:2px">CEKETO — Ventas</h1>
    <p style="font-size:11px;color:#666;margin-bottom:14px">Fecha: ${fechaLabel} · Generado a las ${hora} hs</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;background:#f0fdf9;padding:10px 14px;border-radius:8px;border:1px solid #d1fae5">
      ${resumenHTML}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead>
        <tr style="background:#2a9d8f;color:white">
          <th style="padding:7px 8px;text-align:left">#</th>
          <th style="padding:7px 8px;text-align:left">Hora</th>
          <th style="padding:7px 8px;text-align:left">Tipo</th>
          <th style="padding:7px 8px;text-align:left">Items</th>
          <th style="padding:7px 8px;text-align:left">Método pago</th>
          <th style="padding:7px 8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#999;text-align:right">CEKETO · Independencia 663, Santiago del Estero</p>
  `
  // Estilos inline para el resumen
  el.querySelectorAll('.resumen-item').forEach(el => {
    el.style.cssText = 'min-width:100px'
  })
  el.querySelectorAll('.label').forEach(el => {
    el.style.cssText = 'font-size:10px;color:#555;margin-bottom:2px'
  })
  el.querySelectorAll('.valor').forEach(el => {
    el.style.cssText = 'font-size:14px;font-weight:bold;color:#2a9d8f'
  })
  el.querySelectorAll('.total-dia .valor').forEach(el => {
    el.style.cssText = 'font-size:14px;font-weight:bold;color:#111'
  })

  document.body.appendChild(el)
  html2pdf().set({
    margin: [8, 8, 8, 8],
    filename: `ventas-ceketo-${filtroFecha.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save().then(() => document.body.removeChild(el))
}

function descargarExcelVentas() {
  // Hoja 1: resumen por método de pago
  const resumenFilas = resumenMetodos.value.map(r => ({
    'Método de pago': r.label,
    'Total ($)': r.total,
  }))
  resumenFilas.push({ 'Método de pago': 'TOTAL', 'Total ($)': totalDia.value })
  const wsResumen = XLSX.utils.json_to_sheet(resumenFilas)
  wsResumen['!cols'] = [{ wch: 22 }, { wch: 14 }]

  // Hoja 2: detalle de ventas
  const detalleFilas = historialVentas.value.map(v => ({
    '#':            v.id,
    'Hora':         formatHora(v.fecha),
    'Tipo':         v.tipo || 'local',
    'Items':        v.items?.length || 0,
    'Método pago':  metodosPago.find(x => x.value === v.metodo_pago)?.label || v.metodo_pago || '—',
    'Método pago 2': v.metodo_pago2 ? metodosPago.find(x => x.value === v.metodo_pago2)?.label || v.metodo_pago2 : '',
    'Monto pago 2': v.monto_pago2 ? parseFloat(v.monto_pago2) : '',
    'Descuento (%)': v.descuento || 0,
    'Total ($)':    parseFloat(v.total),
  }))
  const wsDetalle = XLSX.utils.json_to_sheet(detalleFilas)
  wsDetalle['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 8 }, { wch: 6 },
    { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Ventas')

  XLSX.writeFile(wb, `ventas-ceketo-${filtroFecha.value}.xlsx`)
}

onMounted(async () => {
  await cargarProductos()
  await cargarHistorial()
  await cargarClientesCta()
  await cargarPedidosPendientes()
  // Refresca los pedidos online cada 60s para que la dueña vea los nuevos sin recargar
  pollPedidos = setInterval(cargarPedidosPendientes, 60000)
  // Intentar reconectar impresora automáticamente si ya fue autorizada antes
  try {
    const devices = await navigator.usb?.getDevices()
    if (devices?.length) {
      await conectar()
    }
  } catch {}
})

onUnmounted(() => {
  if (pollPedidos) clearInterval(pollPedidos)
})
</script>
