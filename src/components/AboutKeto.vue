<template>
  <section id="keto" class="py-24 bg-transparent overflow-hidden relative">
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent"></div>

    <!-- Decoración de fondo -->
    <div class="absolute top-20 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-20 left-0 w-80 h-80 bg-keto-purple/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-6">

      <div class="text-center mb-20 reveal" ref="headerRef">
        <span class="badge bg-brand-orange/15 text-brand-orange mb-4 inline-block border border-brand-orange/20">¿Por qué cetogénico?</span>
        <h2 class="section-title mb-4">
          Transforma tu cuerpo,<br />
          <span class="text-brand-orange italic">descubrí la dieta keto</span>
        </h2>
        <p class="section-subtitle max-w-xl mx-auto">
          La alimentación cetogénica es mucho más que una dieta. Es un estilo de vida
          que tu cuerpo va a agradecer.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-16 items-center">

        <!-- Left: Cards de beneficios -->
        <div class="space-y-4 reveal-left" ref="cardsRef">
          <div
            v-for="(benefit, i) in benefits"
            :key="i"
            class="group flex gap-5 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-default"
            :class="benefit.bgClass"
          >
            <div
              class="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
              :class="benefit.iconBg"
            >
              {{ benefit.icon }}
            </div>
            <div>
              <h3 class="font-display text-xl font-semibold text-gray-900 mb-1">
                {{ benefit.title }}
              </h3>
              <p class="font-body text-gray-500 text-sm leading-relaxed">
                {{ benefit.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Ilustración + stats -->
        <div class="flex flex-col items-center gap-8 reveal-right" ref="illustrationRef">
          <div class="relative w-full max-w-sm mx-auto">
            <div class="absolute inset-0 bg-brand-orange/10 rounded-3xl rotate-3 scale-105 blur-sm"></div>
            <div class="absolute inset-0 bg-brand-orange/5 rounded-3xl -rotate-2 scale-102"></div>
            <img
              src="@/assets/images/keto-illustration.png"
              alt="Ilustración alimentos keto"
              class="relative rounded-3xl w-full shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 w-full">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="text-center p-4 rounded-2xl bg-white/70 border border-gray-200 transition-all duration-300 hover:bg-brand-orange hover:border-brand-orange group cursor-default shadow-sm"
            >
              <div class="font-display text-3xl font-bold text-brand-orange group-hover:text-white transition-colors">
                {{ stat.value }}
              </div>
              <div class="font-body text-xs text-gray-500 group-hover:text-white/80 transition-colors mt-1">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="mt-20 bg-white/70 border border-gray-200 rounded-3xl p-10 md:p-14 reveal shadow-sm" ref="infoRef">
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(info, i) in ketoInfo" :key="i" class="group">
            <div class="text-brand-orange text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 inline-block">
              {{ info.icon }}
            </div>
            <h4 class="font-display text-xl font-semibold mb-3 text-gray-900">{{ info.title }}</h4>
            <p class="font-body text-gray-500 text-sm leading-relaxed">{{ info.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const headerRef = ref(null)
const cardsRef = ref(null)
const illustrationRef = ref(null)
const infoRef = ref(null)

useScrollReveal([headerRef, cardsRef, illustrationRef, infoRef])

const benefits = [
  { icon: '🔥', title: 'Quema grasa de forma natural', desc: 'Al reducir carbohidratos, tu cuerpo entra en cetosis y usa la grasa como fuente de energía principal.', bgClass: 'bg-keto-orange/10 border-keto-orange/20 hover:bg-keto-orange/15', iconBg: 'bg-keto-orange/20' },
  { icon: '⚡', title: 'Energía constante todo el día', desc: 'Sin picos de glucosa ni bajones. Las grasas ofrecen energía sostenida y enfoque mental prolongado.', bgClass: 'bg-teal/10 border-teal/20 hover:bg-teal/15', iconBg: 'bg-teal/20' },
  { icon: '😊', title: 'Saciedad y bienestar', desc: 'Las grasas y proteínas generan una sensación de saciedad duradera. Menos hambre, más control.', bgClass: 'bg-keto-purple/10 border-keto-purple/20 hover:bg-keto-purple/15', iconBg: 'bg-keto-purple/20' },
  { icon: '🧠', title: 'Claridad mental', desc: 'Las cetonas son el combustible preferido del cerebro. Mejor concentración, memoria y estado de ánimo.', bgClass: 'bg-keto-green/10 border-keto-green/20 hover:bg-keto-green/15', iconBg: 'bg-keto-green/20' },
]

const stats = [
  { value: '+500', label: 'Clientes felices' },
  { value: '100%', label: 'Sin azúcar' },
  { value: '3 años', label: 'De experiencia' },
]

const ketoInfo = [
  { icon: '🥑', title: '¿Qué es la dieta cetogénica?', desc: 'Es un plan alimentario alto en grasas, moderado en proteínas y muy bajo en carbohidratos (menos del 5% de las calorías diarias). Esto induce al cuerpo a un estado metabólico llamado cetosis.' },
  { icon: '🍞', title: 'Alimentos permitidos', desc: 'Aguacate, aceite de coco, nueces, semillas, quesos, huevos, carnes, pescados, vegetales de hoja verde. En CEKETO encontrás panes, galletitas y snacks especialmente formulados.' },
  { icon: '📉', title: 'Resultados comprobados', desc: 'Numerosos estudios muestran beneficios en pérdida de peso, control glucémico, reducción de inflamación y mejora en marcadores cardíacos. Una alimentación keto bien llevada transforma tu salud.' },
]
</script>
