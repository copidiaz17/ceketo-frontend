<template>
  <div class="p-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <p class="font-body text-gray-500 mt-1">Crear, editar y eliminar productos</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          @click="descargarPDF"
          class="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-body text-sm font-medium hover:bg-gray-200 transition-colors"
        >📄 PDF</button>
        <button
          @click="descargarExcel"
          class="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-body text-sm font-medium hover:bg-green-700 transition-colors"
        >📊 Excel</button>
        <button
          @click="abrirModalNuevo"
          class="flex items-center gap-2 px-5 py-2.5 bg-teal text-gray-900 rounded-xl font-body text-sm hover:bg-teal/80 transition-all"
        >+ Nuevo producto</button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="f in ['Todos', ...categoriasFiltro]"
        :key="f"
        @click="filtroCategoria = f === 'Todos' ? '' : f"
        class="badge py-1.5 px-4 text-xs font-medium border transition-all"
        :class="(filtroCategoria === '' && f === 'Todos') || filtroCategoria === f
          ? 'bg-teal border-teal text-gray-900'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal'"
      >{{ f }}</button>
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
              <th class="text-left px-4 py-4 w-16">Imagen</th>
              <th class="text-left px-4 py-4">Producto</th>
              <th class="text-left px-4 py-4">Categoría</th>
              <th class="text-right px-4 py-4">Precio</th>
              <th class="text-right px-4 py-4">Stock</th>
              <th class="text-center px-4 py-4">Activo</th>
              <th class="text-center px-4 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in productosFiltrados"
              :key="p.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <!-- Imagen -->
              <td class="px-4 py-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img v-if="p.imagen" :src="p.imagen" class="w-full h-full object-cover" :alt="p.nombre" />
                  <span v-else class="text-gray-300 text-lg">📷</span>
                </div>
              </td>
              <!-- Nombre + código -->
              <td class="px-4 py-3">
                <p class="text-gray-900">{{ p.nombre }}</p>
                <p class="text-gray-400 font-mono text-xs">{{ p.codigo }}</p>
                <p v-if="p.codigo_barras" class="text-gray-300 font-mono text-xs">{{ p.codigo_barras }}</p>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ p.categoria?.nombre }}</td>
              <td class="px-4 py-3 text-right text-gray-600">
                ${{ parseFloat(p.precio).toLocaleString('es-AR') }}
              </td>
              <!-- Stock -->
              <td class="px-4 py-3 text-right font-bold"
                :class="p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-teal'">
                {{ p.stock }}
              </td>
              <!-- Toggle activo -->
              <td class="px-4 py-3 text-center">
                <button
                  @click="toggleActivo(p)"
                  class="w-10 h-5 rounded-full transition-all duration-300 relative"
                  :class="p.activo ? 'bg-teal' : 'bg-gray-100'"
                >
                  <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                    :class="p.activo ? 'left-5' : 'left-0.5'"></span>
                </button>
              </td>
              <!-- Acciones -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="abrirModalEditar(p)"
                    title="Editar producto"
                    class="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs hover:bg-teal/20 hover:text-teal transition-colors"
                  >✏ Editar</button>
                  <label title="Cambiar imagen" class="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs hover:bg-gray-100 transition-colors cursor-pointer">
                    📷 Imagen
                    <input type="file" accept="image/*" class="hidden" @change="uploadImagen($event, p)" />
                  </label>
                  <button
                    @click="confirmarEliminar(p)"
                    title="Eliminar producto"
                    class="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >🗑 Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear / editar -->
    <div v-if="modal.abierto" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="font-display text-xl font-bold text-gray-900 mb-6">
          {{ modal.modo === 'crear' ? 'Nuevo producto' : 'Editar producto' }}
        </h2>

        <div class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Nombre <span class="text-red-400">*</span></label>
            <input v-model="modal.form.nombre" type="text" placeholder="Budín de Chocolate"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors" />
          </div>

          <!-- Código + Código de barras -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Código <span class="text-red-400">*</span></label>
              <input v-model="modal.form.codigo" type="text" placeholder="BYM-001"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-mono text-sm focus:outline-none focus:border-teal transition-colors" />
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Código de barras</label>
              <input v-model="modal.form.codigo_barras" type="text" placeholder="*BYM-001*"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-mono text-sm focus:outline-none focus:border-teal transition-colors" />
            </div>
          </div>

          <!-- Categoría -->
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Categoría</label>
            <select v-model="modal.form.categoria_id"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors">
              <option value="">Sin categoría</option>
              <option v-for="c in categoriasLista" :key="c.id" :value="c.id">{{ c.nombre }} ({{ c.codigo }})</option>
            </select>
          </div>

          <!-- Precio + Stock -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Precio ($)</label>
              <input v-model.number="modal.form.precio" type="number" min="0" step="0.01" placeholder="0"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors" />
            </div>
            <div>
              <label class="block font-body text-xs text-gray-500 mb-1">Stock inicial</label>
              <input v-model.number="modal.form.stock" type="number" min="0" placeholder="0"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-body text-sm focus:outline-none focus:border-teal transition-colors" />
            </div>
          </div>

          <!-- Activo -->
          <div class="flex items-center gap-3">
            <button
              @click="modal.form.activo = !modal.form.activo"
              class="w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0"
              :class="modal.form.activo ? 'bg-teal' : 'bg-gray-100'"
            >
              <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                :class="modal.form.activo ? 'left-5' : 'left-0.5'"></span>
            </button>
            <span class="font-body text-sm text-gray-500">Producto activo (visible en tienda)</span>
          </div>

          <!-- Imagen del producto -->
          <div>
            <label class="block font-body text-xs text-gray-500 mb-1">Imagen del producto</label>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                <img v-if="modal.imagenPreview || modal.imagenActual" :src="modal.imagenPreview || modal.imagenActual" class="w-full h-full object-cover" alt="preview" />
                <span v-else class="text-gray-300 text-2xl">📷</span>
              </div>
              <label class="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl font-body text-sm cursor-pointer hover:border-teal transition-colors">
                {{ modal.imagenFile ? 'Cambiar imagen' : 'Elegir imagen' }}
                <input type="file" accept="image/*" class="hidden" @change="seleccionarImagen" />
              </label>
              <button v-if="modal.imagenFile" type="button" @click="quitarImagen" class="text-xs text-red-400 hover:underline">Quitar</button>
            </div>
            <p class="text-gray-300 text-xs mt-1">JPG, PNG o WEBP · máx 5MB. Se sube sola al guardar.</p>
          </div>

          <p v-if="modal.error" class="text-red-400 text-sm font-body">{{ modal.error }}</p>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="modal.abierto = false"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors">
            Cancelar
          </button>
          <button @click="guardarModal" :disabled="modal.guardando"
            class="flex-1 py-3 bg-teal text-gray-800 font-body font-semibold rounded-xl hover:bg-teal/80 transition-all disabled:opacity-50">
            {{ modal.guardando ? 'Guardando...' : (modal.modo === 'crear' ? 'Crear producto' : 'Guardar cambios') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div v-if="eliminarModal.abierto" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-red-500/30 rounded-2xl p-8 w-full max-w-sm text-center">
        <p class="text-4xl mb-4">🗑️</p>
        <h2 class="font-display text-xl font-bold text-gray-900 mb-2">Eliminar producto</h2>
        <p class="font-body text-gray-500 text-sm mb-1">¿Estás seguro que querés eliminar?</p>
        <p class="font-body text-gray-900 font-semibold mb-6">{{ eliminarModal.producto?.nombre }}</p>
        <p class="font-body text-yellow-400 text-xs mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3">
          <button @click="eliminarModal.abierto = false"
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-body text-sm hover:border-gray-400 transition-colors">
            Cancelar
          </button>
          <button @click="eliminarProducto" :disabled="eliminarModal.cargando"
            class="flex-1 py-3 bg-red-500 text-gray-800 font-body font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">
            {{ eliminarModal.cargando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-6 right-6 bg-teal text-gray-900 px-5 py-3 rounded-xl font-body text-sm shadow-xl">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import * as XLSX from 'xlsx'

const productos       = ref([])
const categoriasLista = ref([])
const filtroCategoria = ref('')
const busqueda        = ref('')
const toast           = ref('')

const FORM_VACIO = () => ({ nombre: '', codigo: '', codigo_barras: '', categoria_id: '', precio: 0, stock: 0, activo: true })

const modal = ref({ abierto: false, modo: 'crear', productoId: null, form: FORM_VACIO(), error: '', guardando: false, imagenFile: null, imagenPreview: '', imagenActual: '' })
const eliminarModal = ref({ abierto: false, producto: null, cargando: false })

const categoriasFiltro = computed(() => {
  const set = new Set(productos.value.map(p => p.categoria?.nombre).filter(Boolean))
  return [...set].sort()
})

const productosFiltrados = computed(() =>
  productos.value.filter(p => {
    const matchCat  = !filtroCategoria.value || p.categoria?.nombre === filtroCategoria.value
    const matchBusq = !busqueda.value ||
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.value.toLowerCase())
    return matchCat && matchBusq
  })
)

function abrirModalNuevo() {
  modal.value = { abierto: true, modo: 'crear', productoId: null, form: FORM_VACIO(), error: '', guardando: false, imagenFile: null, imagenPreview: '', imagenActual: '' }
}

function abrirModalEditar(p) {
  modal.value = {
    abierto: true,
    modo: 'editar',
    productoId: p.id,
    form: {
      nombre:        p.nombre,
      codigo:        p.codigo,
      codigo_barras: p.codigo_barras || '',
      categoria_id:  p.categoria_id || '',
      precio:        parseFloat(p.precio),
      stock:         p.stock,
      activo:        p.activo,
    },
    error: '',
    guardando: false,
    imagenFile: null,
    imagenPreview: '',
    imagenActual: p.imagen || '',
  }
}

function seleccionarImagen(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    modal.value.error = 'La imagen supera los 5MB'
    event.target.value = ''
    return
  }
  modal.value.error = ''
  modal.value.imagenFile = file
  modal.value.imagenPreview = URL.createObjectURL(file)
}

function quitarImagen() {
  modal.value.imagenFile = null
  modal.value.imagenPreview = ''
}

async function subirImagenCloudinary(id, file, token) {
  const form = new FormData()
  form.append('imagen', file)
  const { data } = await axios.post(`/api/uploads/producto/${id}`, form, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  })
  return data.imagen + '?t=' + Date.now()
}

async function guardarModal() {
  modal.value.error = ''
  if (!modal.value.form.nombre.trim() || !modal.value.form.codigo.trim()) {
    modal.value.error = 'Nombre y código son obligatorios'
    return
  }
  modal.value.guardando = true
  try {
    const token = localStorage.getItem('ceketo_token')
    const body = {
      ...modal.value.form,
      categoria_id: modal.value.form.categoria_id || null,
      codigo_barras: modal.value.form.codigo_barras || null,
    }
    if (modal.value.modo === 'crear') {
      const { data } = await axios.post('/api/productos', body, { headers: { Authorization: `Bearer ${token}` } })
      // Si se eligió imagen, subirla automáticamente a Cloudinary
      if (modal.value.imagenFile) {
        data.imagen = await subirImagenCloudinary(data.id, modal.value.imagenFile, token)
      }
      productos.value.unshift(data)
      mostrarToast('✓ Producto creado')
    } else {
      const { stock: _stock, ...bodySinStock } = body
      await axios.put(`/api/productos/${modal.value.productoId}`, bodySinStock, { headers: { Authorization: `Bearer ${token}` } })
      // Si se eligió una imagen nueva, subirla automáticamente a Cloudinary
      if (modal.value.imagenFile) {
        await subirImagenCloudinary(modal.value.productoId, modal.value.imagenFile, token)
      }
      const idx = productos.value.findIndex(p => p.id === modal.value.productoId)
      if (idx !== -1) {
        // Recargar producto con categoría incluida
        const { data } = await axios.get(`/api/productos/${modal.value.productoId}`)
        productos.value[idx] = data
      }
      mostrarToast('✓ Producto actualizado')
    }
    modal.value.abierto = false
  } catch (err) {
    modal.value.error = err.response?.data?.error || 'Error al guardar'
  } finally {
    modal.value.guardando = false
  }
}

function confirmarEliminar(p) {
  eliminarModal.value = { abierto: true, producto: p, cargando: false }
}

async function eliminarProducto() {
  eliminarModal.value.cargando = true
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.delete(`/api/productos/${eliminarModal.value.producto.id}`, { headers: { Authorization: `Bearer ${token}` } })
    productos.value = productos.value.filter(p => p.id !== eliminarModal.value.producto.id)
    eliminarModal.value.abierto = false
    mostrarToast('✓ Producto eliminado')
  } catch (err) {
    mostrarToast('✗ ' + (err.response?.data?.error || 'Error al eliminar'))
    eliminarModal.value.abierto = false
  }
}

async function toggleActivo(p) {
  try {
    const token = localStorage.getItem('ceketo_token')
    await axios.put(`/api/productos/${p.id}`, { activo: !p.activo }, { headers: { Authorization: `Bearer ${token}` } })
    p.activo = !p.activo
    mostrarToast(p.activo ? '✓ Producto activado' : '✓ Producto desactivado')
  } catch { mostrarToast('✗ Error') }
}

async function uploadImagen(event, p) {
  const file = event.target.files[0]
  if (!file) return
  const form = new FormData()
  form.append('imagen', file)
  try {
    const token = localStorage.getItem('ceketo_token')
    const { data } = await axios.post(`/api/uploads/producto/${p.id}`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    })
    p.imagen = data.imagen + '?t=' + Date.now()
    mostrarToast('✓ Imagen actualizada')
  } catch { mostrarToast('✗ Error al subir imagen') }
}

function productosFiltradosExport() {
  return productos.value.filter(p => {
    const matchCat  = !filtroCategoria.value || p.categoria?.nombre === filtroCategoria.value
    const matchBusq = !busqueda.value ||
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.value.toLowerCase())
    return matchCat && matchBusq
  })
}

function descargarPDF() {
  const lista = productosFiltradosExport()
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })
  const filas = lista.map((p, i) => {
    const stockColor = p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#eab308' : '#2a9d8f'
    const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb'
    return `<tr style="background:${bg}">
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:10px">${p.codigo}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb">${p.nombre}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;color:#555">${p.categoria?.nombre || '—'}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right">$${parseFloat(p.precio).toLocaleString('es-AR')}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;color:${stockColor}">${p.stock}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${p.activo ? 'Sí' : 'No'}</td>
    </tr>`
  }).join('')

  const el = document.createElement('div')
  el.style.cssText = 'font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px;width:190mm'
  el.innerHTML = `
    <h1 style="font-size:20px;font-weight:bold;margin-bottom:2px">CEKETO — Productos</h1>
    <p style="font-size:11px;color:#666;margin-bottom:16px">Generado el ${fecha}${filtroCategoria.value ? ' · Categoría: ' + filtroCategoria.value : ''} · ${lista.length} productos</p>
    <table style="width:100%;border-collapse:collapse;font-size:11px">
      <thead><tr style="background:#2a9d8f;color:white">
        <th style="padding:7px 8px;text-align:left">Código</th>
        <th style="padding:7px 8px;text-align:left">Nombre</th>
        <th style="padding:7px 8px;text-align:left">Categoría</th>
        <th style="padding:7px 8px;text-align:right">Precio</th>
        <th style="padding:7px 8px;text-align:right">Stock</th>
        <th style="padding:7px 8px;text-align:center">Activo</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#999;text-align:right">CEKETO · Independencia 663, Santiago del Estero</p>
  `
  document.body.appendChild(el)
  html2pdf().set({
    margin: [8, 8, 8, 8],
    filename: `productos-ceketo-${fecha.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save().then(() => document.body.removeChild(el))
}

function descargarExcel() {
  const lista = productosFiltradosExport()
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })
  const filas = lista.map(p => ({
    'Código':     p.codigo,
    'Nombre':     p.nombre,
    'Categoría':  p.categoria?.nombre || '—',
    'Precio ($)': parseFloat(p.precio),
    'Stock':      p.stock,
    'Estado':     p.stock === 0 ? 'Sin stock' : p.stock < 5 ? 'Stock bajo' : 'OK',
    'Activo':     p.activo ? 'Sí' : 'No',
  }))
  const ws = XLSX.utils.json_to_sheet(filas)
  ws['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 7 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Productos')
  XLSX.writeFile(wb, `productos-ceketo-${fecha.replace(/\//g, '-')}.xlsx`)
}

function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

onMounted(async () => {
  const [{ data: prods }, { data: cats }] = await Promise.all([
    axios.get('/api/productos?limit=500'),
    axios.get('/api/categorias'),
  ])
  productos.value      = prods
  categoriasLista.value = cats
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
