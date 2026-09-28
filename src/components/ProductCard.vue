<template>
  <article class="pc group" :style="{ '--c': estilo.hex, '--ct': estilo.texto }">
    <div class="pc-tarjeta" v-tilt="6">

      <!-- Foto -->
      <RouterLink :to="`/producto/${product.id}`" class="pc-foto" :aria-label="`Ver ${product.name}`">
        <img
          v-if="!sinFoto"
          ref="imgRef"
          :src="optimizedImage(product.image)"
          :alt="product.name"
          class="pc-img"
          loading="lazy"
          width="400"
          height="300"
          @error="sinFoto = true"
        />
        <!-- Producto sin foto: placeholder con la marca (antes, un cuadro gris "Sin imagen") -->
        <div v-else class="pc-sinfoto">
          <div class="pc-sinfoto-icono"><BrandIcon :nombre="estilo.icono" /></div>
          <span>Foto próximamente</span>
        </div>
        <span class="pc-ver">Ver detalle →</span>
        <!-- Postres y tartas: se hacen a pedido (el stock no aplica) -->
        <span v-if="aPedido" class="pc-estado pc-apedido">A pedido</span>
        <span v-else-if="sinStock" class="pc-estado pc-agotado">Sin stock</span>
        <span v-else-if="product.stock <= 5 && product.stock > 0" class="pc-estado pc-ultimas">Últimas unidades</span>
        <div class="ck-brillo absolute inset-0"></div>
      </RouterLink>

      <!-- Etiqueta de categoría: SU color y SU ícono (antes mostraba el código interno) -->
      <span class="pc-categoria">
        <span class="pc-categoria-icono"><BrandIcon :nombre="estilo.icono" /></span>
        {{ product.description || product.category }}
      </span>

      <!-- Info -->
      <div class="pc-info">
        <h3 class="pc-nombre">
          <RouterLink :to="`/producto/${product.id}`">{{ product.name }}</RouterLink>
        </h3>
        <div class="flex items-end justify-between gap-3 mt-3">
          <div class="flex items-baseline gap-2">
            <span class="pc-precio">${{ product.price.toLocaleString('es-AR') }}</span>
            <span v-if="product.originalPrice" class="text-sm text-ck-tinta/40 line-through font-texto">
              ${{ product.originalPrice.toLocaleString('es-AR') }}
            </span>
          </div>
          <!-- A pedido: se encarga por WhatsApp en vez de ir al carrito -->
          <a
            v-if="aPedido"
            :href="linkEncargo(product.name)"
            target="_blank"
            rel="noopener"
            class="pc-encargar"
            :aria-label="`Encargar ${product.name} por WhatsApp`"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.4-.5.3-.5a.6.6 0 0 0 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2.1-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.2-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/></svg>
            Encargar
          </a>
          <button
            v-else
            @click="addToCart"
            :disabled="sinStock"
            class="pc-agregar"
            :aria-label="sinStock ? 'Sin stock' : `Agregar ${product.name} al carrito`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M12 5v14m7-7H5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Aviso: agregado / sin más stock -->
    <Transition name="pc-aviso">
      <div v-if="showAdded" class="pc-toast">✓ Agregado al carrito</div>
    </Transition>
    <Transition name="pc-aviso">
      <div v-if="showMax" class="pc-toast pc-toast-gris">No hay más stock disponible</div>
    </Transition>
  </article>
</template>

<script setup>
import { publico } from '@/brand/publico'
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import { estiloCategoria, esAPedido, linkEncargo } from '@/brand/marca'
import { volarAlCarrito } from '@/utils/volarAlCarrito'

const props = defineProps({
  product: { type: Object, required: true },
})

const cartStore = useCartStore()
const showAdded = ref(false)
const showMax   = ref(false)
const imgRef    = ref(null)

const sinStock = computed(() => Number.isFinite(props.product.stock) && props.product.stock <= 0)
const estilo   = computed(() => estiloCategoria(props.product.category))
const aPedido  = computed(() => esAPedido(props.product.category))
const sinFoto  = ref(!props.product.image || props.product.image.includes('sin-imagen'))

// Aplica transformaciones de Cloudinary para reducir tamaño en mobile
function optimizedImage(url) {
  if (!url || !url.includes('cloudinary.com')) return url || publico('/images/sin-imagen.svg')
  // e_trim: recorta el borde de fondo (blanco/color) para que el producto llene el campo.
  // + ancho 500px, calidad y formato automáticos.
  return url.replace('/upload/', '/upload/e_trim/c_scale,w_500,q_auto,f_auto/')
}

function addToCart() {
  if (sinStock.value || aPedido.value) return
  const ok = cartStore.addItem(props.product)
  if (ok) {
    volarAlCarrito(imgRef.value)
    showAdded.value = true
    setTimeout(() => { showAdded.value = false }, 1500)
  } else {
    showMax.value = true
    setTimeout(() => { showMax.value = false }, 1800)
  }
}
</script>

<style scoped>
.pc { position: relative; height: 100%; }
.pc-tarjeta {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFDF8;
  border-radius: 26px;
  box-shadow: 0 1px 0 rgba(23,48,43,.06), 0 18px 40px -30px rgba(23,48,43,.6);
  transition: box-shadow .4s ease;
}
.pc:hover .pc-tarjeta { box-shadow: 0 1px 0 rgba(23,48,43,.06), 0 30px 50px -28px rgba(23,48,43,.55); }

.pc-foto {
  position: relative;
  display: block;
  height: 15.5rem;
  margin: 10px 10px 0;
  border-radius: 20px;
  overflow: hidden;
  background: var(--c);
}
.pc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .8s cubic-bezier(.2,.8,.2,1);
}
.pc:hover .pc-img { transform: scale(1.08); }
.pc-ver {
  position: absolute;
  left: 50%; bottom: 14px;
  transform: translate(-50%, 16px);
  opacity: 0;
  padding: .5rem .95rem;
  border-radius: 999px;
  background: rgba(255,253,248,.95);
  color: #17302B;
  font: 600 13px/1 'Poppins', sans-serif;
  transition: all .35s cubic-bezier(.2,.8,.2,1);
  white-space: nowrap;
}
.pc:hover .pc-ver { opacity: 1; transform: translate(-50%, 0); }

.pc-categoria {
  position: absolute;
  top: 22px; left: 22px;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  max-width: calc(100% - 44px);
  padding: .4rem .7rem .4rem .45rem;
  border-radius: 999px;
  background: var(--c);
  color: var(--ct);
  font: 600 11px/1 'Poppins', sans-serif;
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 6px 14px -8px rgba(0,0,0,.5);
  transform: translateZ(30px);
}
.pc-categoria-icono {
  width: 20px; height: 20px;
  padding: 2.5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #FFFDF8;
}

.pc-estado {
  position: absolute;
  right: 12px; bottom: 12px;
  padding: .4rem .7rem;
  border-radius: 999px;
  font: 600 11px/1 'Poppins', sans-serif;
  transition: opacity .3s;
}
.pc:hover .pc-estado { opacity: 0; }

.pc-sinfoto {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .8rem;
  padding-bottom: 2.2rem;   /* deja lugar para la etiqueta de abajo (A pedido / Sin stock) */
  background:
    radial-gradient(circle at 50% 42%, rgba(255,253,248,.95) 0 32%, transparent 33%),
    color-mix(in srgb, var(--c) 22%, #FFFDF8);
}
.pc-sinfoto-icono {
  width: 34%;
  aspect-ratio: 1;
  transition: transform .6s cubic-bezier(.3,1.5,.5,1);
}
.pc:hover .pc-sinfoto-icono { transform: rotate(-10deg) scale(1.08); }
.pc-sinfoto span {
  font: 500 12px/1 'Poppins', sans-serif;
  color: rgba(23,48,43,.55);
  letter-spacing: .04em;
}
.pc-apedido { background: #885784; color: #FFFDF8; }
.pc-agotado { background: #17302B; color: #FFFDF8; }
.pc-ultimas { background: #FFFDF8; color: #C44117; box-shadow: inset 0 0 0 2px #F6521D; }

.pc-info { padding: 1rem 1.25rem 1.2rem; display: flex; flex-direction: column; flex: 1; justify-content: space-between; }
.pc-nombre {
  font: 600 15.5px/1.35 'Poppins', sans-serif !important;
  letter-spacing: 0 !important;
  color: #17302B;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}
.pc-nombre a:hover { color: #047764; }
.pc-precio {
  font-family: 'CK Cherione', 'Poppins', sans-serif;
  font-size: 1.85rem;
  line-height: 1;
  color: #C44117;
}
.pc-agregar {
  width: 46px; height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #047764;
  color: #fff;
  box-shadow: 0 10px 20px -10px rgba(4,119,100,.9);
  transition: transform .35s cubic-bezier(.3,1.6,.5,1), background .3s;
  transform: translateZ(20px);
}
.pc-agregar:hover:not(:disabled) { transform: translateZ(20px) rotate(90deg) scale(1.1); background: #058D76; }
.pc-agregar:active:not(:disabled) { transform: translateZ(20px) scale(.9); }
.pc-encargar {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .7rem 1rem;
  border-radius: 999px;
  background: #25D366;
  color: #0B3B34;
  font: 600 13px/1 'Poppins', sans-serif;
  white-space: nowrap;
  box-shadow: 0 10px 20px -10px rgba(37,211,102,.9);
  transition: transform .3s cubic-bezier(.3,1.6,.5,1);
}
.pc-encargar:hover { transform: translateY(-2px) scale(1.04); }
.pc-agregar:disabled { background: rgba(23,48,43,.1); color: rgba(23,48,43,.3); box-shadow: none; cursor: not-allowed; }

.pc-toast {
  position: absolute;
  left: 50%; top: 40%;
  transform: translate(-50%, -50%);
  z-index: 5;
  padding: .6rem 1rem;
  border-radius: 999px;
  background: #047764;
  color: #fff;
  font: 600 13px/1 'Poppins', sans-serif;
  white-space: nowrap;
  box-shadow: 0 12px 30px -12px rgba(0,0,0,.5);
  pointer-events: none;
}
.pc-toast-gris { background: #17302B; }
.pc-aviso-enter-active, .pc-aviso-leave-active { transition: all .3s ease; }
.pc-aviso-enter-from, .pc-aviso-leave-to { opacity: 0; transform: translate(-50%, -30%); }
</style>
