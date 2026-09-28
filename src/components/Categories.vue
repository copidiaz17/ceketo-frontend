<template>
  <section id="categorias" class="relative py-24 md:py-28 overflow-hidden bg-ck-crema">
    <BrandBackdrop variante="categorias" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6">
      <div class="text-center mb-14 md:mb-16">
        <span v-reveal class="ck-eyebrow text-ck-verde-t mb-4">Explorá por categoría</span>
        <h2 v-reveal="100" class="ck-titulo">
          Encontrá lo que <span class="text-ck-verde">necesitás</span>
        </h2>
      </div>

      <!-- Esqueleto mientras carga -->
      <div v-if="cargando" class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div v-for="i in 8" :key="i" class="aspect-[4/5] rounded-[28px] bg-ck-tinta/[.06] animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <RouterLink
          v-for="(cat, i) in categories"
          :key="cat.codigo"
          v-reveal:giro="(i % 4) * 90"
          :to="`/tienda?categoria=${cat.codigo}`"
          class="cat block"
          :style="{ '--c': cat.estilo.hex }"
        >
          <div class="cat-tarjeta" v-tilt="10">
            <!-- fondo de color (recorta la textura; va aparte para no aplanar el 3D) -->
            <div class="cat-fondo">
              <!-- textura: el mismo ícono gigante y translúcido -->
              <div class="cat-textura"><BrandIcon :nombre="cat.estilo.icono" color="#FFFDF8" /></div>
              <div class="ck-brillo absolute inset-0"></div>
            </div>

            <!-- ventana crema con el ícono a color (formas distintas: arco, círculo, hoja, cuadrado) -->
            <div class="cat-ventana" :class="`forma-${FORMAS[i % FORMAS.length]}`">
              <div class="cat-icono" :class="`anim-${cat.estilo.icono}`">
                <BrandIcon :nombre="cat.estilo.icono" />
              </div>
            </div>

            <div class="cat-pie">
              <span class="cat-nombre">{{ cat.nombre }}</span>
              <span class="cat-cantidad">
                <template v-if="esAPedido(cat.codigo)">A pedido</template>
                <template v-else>{{ cat.cantidad }} {{ cat.cantidad === 1 ? 'producto' : 'productos' }}</template>
                <span class="cat-flecha">→</span>
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import { estiloCategoria, esAPedido } from '@/brand/marca'

// Categorías que NO se muestran en la web (sí siguen en el admin).
// Market (MKT) se volvió a mostrar el 18/09/2026.
const OCULTAS = []

const FORMAS = ['arco', 'circulo', 'hoja', 'cuadro']

const categories = ref([])
const cargando = ref(true)

onMounted(async () => {
  try {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      axios.get('/api/categorias'),
      axios.get('/api/productos?limit=500'),
    ])
    categories.value = cats
      .filter(c => !OCULTAS.includes(c.codigo))
      .map((c, i) => ({
        codigo:   c.codigo,
        nombre:   c.nombre,
        cantidad: prods.filter(p => p.categoria?.codigo === c.codigo && p.activo !== false).length,
        estilo:   estiloCategoria(c.codigo, i),
      }))
  } catch {
    categories.value = []
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.cat-tarjeta {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 11% 9% 9%;
  transform-style: preserve-3d;
}
.cat-fondo {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--c);
  overflow: hidden;
  box-shadow: 0 22px 40px -28px rgba(23,48,43,.8);
  transition: box-shadow .4s ease;
}
.cat:hover .cat-fondo { box-shadow: 0 34px 50px -26px rgba(23,48,43,.85); }

.cat-textura {
  position: absolute;
  width: 78%;
  aspect-ratio: 1;
  right: -26%;
  bottom: -18%;
  opacity: .16;
  transform: rotate(-18deg);
  transition: transform .8s cubic-bezier(.2,.8,.2,1);
}
.cat:hover .cat-textura { transform: rotate(8deg) scale(1.08); }

/* ventana crema: 4 formas distintas */
.cat-ventana {
  position: relative;
  width: 64%;
  aspect-ratio: 1;
  background: #FFFDF8;
  display: grid;
  place-items: center;
  transform: translateZ(40px);
  box-shadow: inset 0 -10px 20px -14px rgba(23,48,43,.25);
}
.forma-arco    { border-radius: 999px 999px 14px 14px; aspect-ratio: 4 / 5; }
.forma-circulo { border-radius: 50%; }
.forma-hoja    { border-radius: 999px 14px 999px 14px; }
.forma-cuadro  { border-radius: 30%; }

.cat-icono {
  width: 62%;
  aspect-ratio: 1;
  transform: translateZ(30px);
  transition: transform .5s cubic-bezier(.3,1.5,.5,1);
  filter: drop-shadow(0 8px 10px rgba(23,48,43,.18));
}
.cat:hover .cat-icono { transform: translateZ(30px) scale(1.12); }
/* cada ícono se mueve a su manera */
.cat:hover .anim-kiwi,
.cat:hover .anim-diana  { animation: cat-girar 1.6s cubic-bezier(.4,0,.2,1); }
.cat:hover .anim-gotas  { animation: cat-gotear .9s ease-in-out 2; }
.cat:hover .anim-hojas,
.cat:hover .anim-rama,
.cat:hover .anim-cuchara { animation: cat-mecer 1s ease-in-out 2; transform-origin: 50% 100%; }
.cat:hover .anim-palta  { animation: cat-gelatina .8s ease; }
.cat:hover .anim-melon  { animation: cat-balancear 1.1s ease-in-out; }
@keyframes cat-girar     { to { transform: translateZ(30px) scale(1.12) rotate(360deg); } }
@keyframes cat-gotear    { 50% { transform: translateZ(30px) scale(1.12) translateY(8%); } }
@keyframes cat-mecer     { 25% { transform: translateZ(30px) scale(1.12) rotate(-9deg); } 75% { transform: translateZ(30px) scale(1.12) rotate(9deg); } }
@keyframes cat-gelatina  { 30% { transform: translateZ(30px) scale(1.25, .9); } 50% { transform: translateZ(30px) scale(.95, 1.2); } 70% { transform: translateZ(30px) scale(1.15, 1); } }
@keyframes cat-balancear { 30% { transform: translateZ(30px) scale(1.12) rotate(-22deg); } 70% { transform: translateZ(30px) scale(1.12) rotate(12deg); } }

.cat-pie {
  position: relative;
  width: 100%;
  background: #FFFDF8;
  border-radius: 16px;
  padding: .7rem .8rem;
  text-align: center;
  transform: translateZ(20px);
}
.cat-nombre {
  display: block;
  font-family: 'CK Comodo', 'Poppins', sans-serif;
  font-size: clamp(.8rem, 1.3vw, 1rem);
  letter-spacing: .06em;
  line-height: 1.15;
  text-transform: uppercase;
  color: #17302B;
}
.cat-cantidad {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  margin-top: .3rem;
  font: 500 12px/1 'Poppins', sans-serif;
  color: rgba(23,48,43,.6);
}
.cat-flecha { display: inline-block; transition: transform .3s ease; color: var(--c); font-weight: 700; }
.cat:hover .cat-flecha { transform: translateX(4px); }

@media (max-width: 640px) {
  .cat-tarjeta { border-radius: 22px; padding: 12% 8% 8%; }
  .cat-pie { padding: .55rem .5rem; border-radius: 12px; }
  .cat-cantidad { font-size: 11px; }
}
</style>
