<template>
  <section id="keto" class="relative py-24 md:py-32 overflow-hidden bg-ck-profundo text-ck-blanco">
    <BrandBackdrop variante="keto" />

    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-6">

      <div class="text-center mb-16 md:mb-20">
        <span v-reveal class="ck-eyebrow text-ck-lima mb-4">¿Por qué cetogénico?</span>
        <!-- Texto pedido por Celia (27/09) -->
        <h2 v-reveal="100" class="ck-titulo !text-ck-blanco">
          Transformá tu cuerpo,<br />
          <span class="text-ck-lima">descubrí una alimentación consciente</span>
        </h2>
        <p v-reveal="180" class="font-texto text-ck-blanco/75 text-lg leading-relaxed max-w-xl mx-auto mt-5">
          La alimentación cetogénica es mucho más que una dieta. Es un estilo de vida
          que tu cuerpo va a agradecer.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">

        <!-- Beneficios -->
        <div class="space-y-4">
          <div
            v-for="(b, i) in benefits"
            :key="b.title"
            v-reveal:izq="i * 110"
            class="kb group"
            :style="{ '--c': b.color }"
          >
            <span class="kb-icono"><BrandIcon :nombre="b.icono" /></span>
            <div>
              <h3 class="kb-titulo">{{ b.title }}</h3>
              <p class="font-texto text-ck-blanco/70 text-[15px] leading-relaxed">{{ b.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Mosaico vivo + números -->
        <div class="flex flex-col items-center gap-12">
          <div v-reveal:der class="w-full">
            <MosaicoVivo />
          </div>

          <div ref="statsRef" class="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-lg">
            <div v-for="(s, i) in stats" :key="s.label" v-reveal="i * 120" class="ks">
              <div class="ks-valor">{{ s.prefijo }}{{ Math.round(s.actual) }}{{ s.sufijo }}</div>
              <div class="ks-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info keto -->
      <div class="grid md:grid-cols-3 gap-5 mt-20">
        <div v-for="(info, i) in ketoInfo" :key="info.title" v-reveal="i * 120">
          <div v-tilt="5" class="ki">
            <span class="ki-num">0{{ i + 1 }}</span>
            <h4 class="font-marca text-2xl text-ck-tinta mb-3 pr-14">{{ info.title }}</h4>
            <p class="font-texto text-ck-tinta/70 text-[15px] leading-relaxed">{{ info.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import BrandBackdrop from '@/components/brand/BrandBackdrop.vue'
import BrandIcon from '@/components/brand/BrandIcon.vue'
import MosaicoVivo from '@/components/brand/MosaicoVivo.vue'

const benefits = [
  { icono: 'diana', color: '#F6521D', title: 'Quema grasa de forma natural', desc: 'Al reducir carbohidratos, tu cuerpo entra en cetosis y usa la grasa como fuente de energía principal.' },
  { icono: 'kiwi',  color: '#9CCC66', title: 'Energía constante todo el día', desc: 'Sin picos de glucosa ni bajones. Las grasas ofrecen energía sostenida y enfoque mental prolongado.' },
  { icono: 'palta', color: '#C99BC5', title: 'Saciedad y bienestar', desc: 'Las grasas y proteínas generan una sensación de saciedad duradera. Menos hambre, más control.' },
  { icono: 'hojas', color: '#5AB282', title: 'Claridad mental', desc: 'Las cetonas son el combustible preferido del cerebro. Mejor concentración, memoria y estado de ánimo.' },
]

// Números que "cuentan" hacia arriba cuando aparecen en pantalla
const stats = reactive([
  { valor: 500, actual: 0, prefijo: '+', sufijo: '', label: 'Clientes felices' },
  { valor: 100, actual: 0, prefijo: '', sufijo: '%', label: 'Sin azúcar' },
  { valor: 3,   actual: 0, prefijo: '', sufijo: ' años', label: 'De experiencia' },
])
const statsRef = ref(null)
let io = null

function contar() {
  const t0 = performance.now()
  const dur = 1600
  const paso = (t) => {
    const p = Math.min(1, (t - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    stats.forEach(s => { s.actual = s.valor * e })
    if (p < 1) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}

onMounted(() => {
  io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { contar(); io.disconnect() }
  }, { threshold: 0.5 })
  io.observe(statsRef.value)
})
onUnmounted(() => io?.disconnect())

const ketoInfo = [
  { title: '¿Qué es la dieta cetogénica?', desc: 'Es un plan alimentario alto en grasas, moderado en proteínas y muy bajo en carbohidratos (menos del 5% de las calorías diarias). Esto induce al cuerpo a un estado metabólico llamado cetosis.' },
  { title: 'Alimentos permitidos', desc: 'Palta, aceite de coco, nueces, semillas, quesos, huevos, carnes, pescados, vegetales de hoja verde. En CEKETO encontrás panes, galletitas y snacks especialmente formulados.' },
  { title: 'Resultados comprobados', desc: 'Numerosos estudios muestran beneficios en pérdida de peso, control glucémico, reducción de inflamación y mejora en marcadores cardíacos. Una alimentación keto bien llevada transforma tu salud.' },
]
</script>

<style scoped>
.kb {
  position: relative;
  display: flex;
  gap: 1.1rem;
  align-items: flex-start;
  padding: 1.35rem 1.4rem;
  border-radius: 22px;
  background: rgba(255,253,248,.06);
  border: 1px solid rgba(255,253,248,.1);
  transition: background .35s ease, transform .35s ease, border-color .35s ease;
}
.kb::before {
  content: '';
  position: absolute;
  left: 0; top: 18px; bottom: 18px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: var(--c);
}
.kb:hover { background: rgba(255,253,248,.1); border-color: color-mix(in srgb, var(--c) 60%, transparent); transform: translateX(6px); }
.kb-icono {
  flex-shrink: 0;
  width: 54px; height: 54px;
  padding: 9px;
  border-radius: 16px;
  background: #FFFDF8;
  transition: transform .5s cubic-bezier(.3,1.5,.5,1);
}
.kb:hover .kb-icono { transform: rotate(-8deg) scale(1.08); }
.kb-titulo {
  font-family: 'CK Cherione', 'Poppins', sans-serif;
  font-size: 1.35rem;
  line-height: 1.15;
  color: #FFFDF8;
  margin-bottom: .35rem;
}

.ks {
  text-align: center;
  padding: 1.1rem .5rem;
  border-radius: 20px;
  background: rgba(255,253,248,.07);
  border: 1px solid rgba(255,253,248,.12);
}
.ks-valor {
  font-family: 'CK Cherione', 'Poppins', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1;
  color: #9CCC66;
  font-variant-numeric: tabular-nums;
}
.ks-label { font: 500 12px/1.3 'Poppins', sans-serif; color: rgba(255,253,248,.7); margin-top: .45rem; }

.ki {
  position: relative;
  padding: 2rem 1.8rem;
  border-radius: 26px;
  background: #FFFDF8;
  box-shadow: 0 30px 50px -35px rgba(0,0,0,.6);
}
.ki-num {
  position: absolute;
  top: 1.2rem; right: 1.4rem;
  font-family: 'CK Cherione', 'Poppins', sans-serif;
  font-size: 2.6rem;
  line-height: 1;
  color: rgba(5,141,118,.18);
}
</style>
