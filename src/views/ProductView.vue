<template>
  <main class="min-h-screen bg-ck-crema pt-28 relative overflow-hidden">
    <BrandBackdrop variante="tienda" />

    <div class="relative z-10 max-w-6xl mx-auto px-5 md:px-6 py-10">

      <RouterLink to="/tienda" class="inline-flex items-center gap-2 font-texto text-sm text-ck-tinta/60 hover:text-ck-verde-t mb-8 transition-colors">
        ← Volver a la tienda
      </RouterLink>

      <div v-if="product" class="grid md:grid-cols-2 gap-12 lg:gap-16 items-center" :style="{ '--c': estilo.hex, '--ct': estilo.texto }">
        <!-- Foto en arco (forma del mosaico de la marca) -->
        <div class="flex justify-center">
          <div class="pv-foto-zona" v-tilt="6">
            <div class="pv-arco-fondo"></div>
            <div class="pv-arco">
              <img
                v-if="product.imagen"
                :src="fotoArco(product.imagen)"
                :alt="product.nombre"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full grid place-items-center p-16 bg-ck-blanco">
                <BrandIcon :nombre="estilo.icono" />
              </div>
            </div>
            <div class="pv-icono"><BrandIcon :nombre="estilo.icono" /></div>
          </div>
        </div>

        <!-- Info -->
        <div>
          <span class="pv-categoria">
            <span class="w-5 h-5 p-[2.5px] rounded-full bg-ck-blanco"><BrandIcon :nombre="estilo.icono" /></span>
            {{ product.categoria?.nombre }}
          </span>
          <h1 class="font-marca text-4xl md:text-5xl leading-[1.05] text-ck-tinta mt-4 mb-2">{{ product.nombre }}</h1>
          <p class="font-texto text-xs text-ck-tinta/40 tracking-wider mb-5">{{ product.codigo_barras }}</p>

          <!-- Stock -->
          <div class="flex items-center gap-2 mb-6">
            <span class="relative flex w-2.5 h-2.5">
              <span v-if="product.stock > 0" class="absolute inset-0 rounded-full bg-ck-verde animate-ping opacity-60"></span>
              <span class="relative w-2.5 h-2.5 rounded-full" :class="product.stock > 0 ? 'bg-ck-verde' : 'bg-ck-naranja'"></span>
            </span>
            <span class="font-texto text-sm font-medium" :class="product.stock > 0 ? 'text-ck-verde-t' : 'text-ck-naranja-t'">
              {{ product.stock > 0 ? `${product.stock} en stock` : 'Sin stock' }}
            </span>
          </div>

          <!-- Precio -->
          <div class="font-marca text-5xl text-ck-naranja-t mb-8">
            ${{ parseFloat(product.precio).toLocaleString('es-AR') }}
          </div>

          <!-- Agregar -->
          <div class="flex gap-3 mb-4">
            <div class="pv-cantidad">
              <button @click="qty > 1 && qty--" aria-label="Menos">−</button>
              <span>{{ qty }}</span>
              <button
                @click="qty < product.stock && qty++"
                :disabled="qty >= product.stock"
                aria-label="Más"
              >+</button>
            </div>
            <button
              @click="addToCart"
              :disabled="product.stock === 0"
              class="flex-1 ck-btn-naranja text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ product.stock === 0 ? 'Sin stock' : 'Agregar al carrito' }}
            </button>
          </div>

          <!-- WhatsApp -->
          <a :href="whatsappLink" target="_blank" rel="noopener" class="pv-wa">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.4-.5.3-.5a.6.6 0 0 0 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2.1-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.2-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/></svg>
            Consultar por WhatsApp
          </a>

          <!-- Etiquetas -->
          <div class="flex flex-wrap gap-2 mt-6">
            <span
              v-for="(tag, i) in tags"
              :key="tag"
              class="pv-tag"
            >
              <span class="w-4 h-4"><BrandIcon :nombre="['gotas', 'diana', 'cuchara', 'rama'][i % 4]" /></span>
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- No encontrado -->
      <div v-else-if="loaded" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-5"><BrandIcon nombre="palta" /></div>
        <h2 class="font-marca text-3xl text-ck-tinta/60">Producto no encontrado</h2>
        <RouterLink to="/tienda" class="ck-btn-naranja mt-6">Volver a la tienda</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import { estiloCategoria } from '@/brand/marca'

const route     = useRoute()
const cartStore = useCartStore()
const product   = ref(null)
const loaded    = ref(false)
const qty       = ref(1)

const tags = ['Sin azúcar', 'Bajo en carbos', 'Artesanal', 'Sin TACC']

// Foto recortada al tamaño del arco (Cloudinary), liviana
function fotoArco(url) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', '/upload/c_fill,g_auto,w_880,h_1100,q_auto,f_auto/')
}
const estilo = computed(() => estiloCategoria(product.value?.categoria?.codigo))

const whatsappLink = computed(() => {
  if (!product.value) return '#'
  const msg = `Hola CEKETO! Quiero consultar sobre *${product.value.nombre}* ($${parseFloat(product.value.precio).toLocaleString('es-AR')})`
  return `https://wa.me/543854133969?text=${encodeURIComponent(msg)}`
})

function addToCart() {
  if (!product.value || product.value.stock === 0) return
  const item = {
    id:       product.value.id,
    name:     product.value.nombre,
    price:    parseFloat(product.value.precio),
    category: product.value.categoria?.nombre || '',
    image:    product.value.imagen || '',
    stock:    product.value.stock,
  }
  for (let i = 0; i < qty.value; i++) cartStore.addItem(item)
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/productos/${route.params.id}`)
    product.value = data
  } catch {
    product.value = null
  } finally {
    loaded.value = true
  }
})
</script>

<style scoped>
.pv-foto-zona {
  position: relative;
  width: min(440px, 86vw);
  aspect-ratio: 4 / 5;
  transform-style: preserve-3d;
}
.pv-arco, .pv-arco-fondo {
  position: absolute;
  inset: 0;
  border-radius: 999px 999px 32px 32px;
}
.pv-arco-fondo { background: var(--c); transform: translate3d(18px, 18px, -50px); }
.pv-arco { overflow: hidden; background: #FFFDF8; box-shadow: 0 40px 60px -35px rgba(23,48,43,.6); }
.pv-icono {
  position: absolute;
  width: 22%;
  aspect-ratio: 1;
  right: -6%;
  top: 10%;
  padding: 3.5%;
  border-radius: 50%;
  background: #FFFDF8;
  box-shadow: 0 16px 30px -14px rgba(23,48,43,.5);
  transform: translateZ(60px);
  animation: pv-flotar 5s ease-in-out infinite;
}
@keyframes pv-flotar { 50% { transform: translateZ(60px) translateY(-10px) rotate(8deg); } }

.pv-categoria {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .45rem .85rem .45rem .5rem;
  border-radius: 999px;
  background: var(--c);
  color: var(--ct);
  font: 600 12px/1 'Poppins', sans-serif;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.pv-cantidad {
  display: flex;
  align-items: center;
  gap: .9rem;
  padding: .4rem 1rem;
  border-radius: 999px;
  background: #FFFDF8;
  box-shadow: inset 0 0 0 2px rgba(23,48,43,.1);
  font: 600 16px/1 'Poppins', sans-serif;
  color: #17302B;
}
.pv-cantidad button { width: 26px; font-size: 20px; color: rgba(23,48,43,.5); transition: color .2s; }
.pv-cantidad button:hover:not(:disabled) { color: #C44117; }
.pv-cantidad button:disabled { color: rgba(23,48,43,.2); cursor: not-allowed; }
.pv-cantidad span { min-width: 22px; text-align: center; }
.pv-wa {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .9rem;
  border-radius: 999px;
  box-shadow: inset 0 0 0 2px rgba(4,119,100,.35);
  color: #047764;
  font: 600 15px/1 'Poppins', sans-serif;
  transition: all .3s;
}
.pv-wa:hover { background: #047764; color: #fff; box-shadow: none; }
.pv-tag {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .4rem .75rem .4rem .45rem;
  border-radius: 999px;
  background: #FFFDF8;
  box-shadow: inset 0 0 0 1.5px rgba(23,48,43,.1);
  font: 500 13px/1 'Poppins', sans-serif;
  color: rgba(23,48,43,.75);
}
</style>
