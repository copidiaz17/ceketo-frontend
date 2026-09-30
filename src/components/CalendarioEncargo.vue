<template>
  <div class="cal">
    <div class="cal-cabecera">
      <button type="button" class="cal-nav" :disabled="!puedeAtras" @click="mover(-1)" aria-label="Mes anterior">‹</button>
      <span class="cal-mes">{{ tituloMes }}</span>
      <button type="button" class="cal-nav" :disabled="!puedeAdelante" @click="mover(1)" aria-label="Mes siguiente">›</button>
    </div>
    <div class="cal-grilla">
      <span v-for="d in ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']" :key="d" class="cal-dia-nombre">{{ d }}</span>
      <span v-for="n in huecoInicial" :key="'h' + n"></span>
      <button
        v-for="d in dias"
        :key="d.ymd"
        type="button"
        class="cal-dia"
        :class="{ elegido: d.ymd === modelValue, hoy: d.ymd === hoy }"
        :disabled="!d.habil"
        :title="d.motivo"
        @click="$emit('update:modelValue', d.ymd)"
      >{{ d.numero }}</button>
    </div>
    <p class="cal-ayuda">Primer día posible: <b>{{ fechaLarga(min) }}</b> · Los domingos estamos cerrados.</p>
  </div>
</template>

<script setup>
// Calendario para elegir el día de entrega de un encargo.
// Bloquea los días anteriores a `min` y los domingos. Permite elegir hasta `diasMax` días adelante.
import { ref, computed } from 'vue'
import { esDomingo, hoyAR, fechaLarga, sumarDias } from '@/brand/marca'

const props = defineProps({
  modelValue: { type: String, default: '' },
  min: { type: String, required: true },       // YYYY-MM-DD
  diasMax: { type: Number, default: 60 },
})
defineEmits(['update:modelValue'])

const hoy = hoyAR()
const max = computed(() => sumarDias(props.min, props.diasMax))
const [a0, m0] = props.min.split('-').map(Number)
const anio = ref(a0)
const mes = ref(m0)   // 1..12

const tituloMes = computed(() =>
  new Date(Date.UTC(anio.value, mes.value - 1, 1)).toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))

const huecoInicial = computed(() => {
  const dow = new Date(Date.UTC(anio.value, mes.value - 1, 1)).getUTCDay()   // 0 = domingo
  return (dow + 6) % 7                                                          // la semana arranca el lunes
})

const dias = computed(() => {
  const cant = new Date(Date.UTC(anio.value, mes.value, 0)).getUTCDate()
  return Array.from({ length: cant }, (_, i) => {
    const ymd = `${anio.value}-${String(mes.value).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    let motivo = ''
    if (ymd < props.min) motivo = 'Se encarga con 2 días de anticipación'
    else if (ymd > max.value) motivo = 'Todavía no se puede encargar para ese día'
    else if (esDomingo(ymd)) motivo = 'Domingo: cerrado'
    return { ymd, numero: i + 1, habil: !motivo, motivo }
  })
})

const clave = (a, m) => a * 12 + m
const puedeAtras = computed(() => clave(anio.value, mes.value) > clave(a0, m0))
const puedeAdelante = computed(() => {
  const [aM, mM] = max.value.split('-').map(Number)
  return clave(anio.value, mes.value) < clave(aM, mM)
})
function mover(n) {
  let m = mes.value + n, a = anio.value
  if (m < 1) { m = 12; a-- }
  if (m > 12) { m = 1; a++ }
  mes.value = m; anio.value = a
}
</script>

<style scoped>
.cal { max-width: 360px; }
.cal-cabecera { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6rem; }
.cal-mes { font: 600 15px/1 'Poppins', sans-serif; color: #17302B; text-transform: capitalize; }
.cal-nav {
  width: 34px; height: 34px; border-radius: 50%;
  font-size: 20px; line-height: 1; color: #047764;
  background: #FFFDF8; box-shadow: inset 0 0 0 2px rgba(4,119,100,.2);
}
.cal-nav:disabled { opacity: .3; cursor: not-allowed; }
.cal-grilla { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dia-nombre { text-align: center; font: 600 11px/1.8 'Poppins', sans-serif; color: rgba(23,48,43,.45); text-transform: uppercase; }
.cal-dia {
  aspect-ratio: 1;
  border-radius: 10px;
  font: 500 14px/1 'Poppins', sans-serif;
  color: #17302B;
  background: #FFFDF8;
  box-shadow: inset 0 0 0 1.5px rgba(23,48,43,.1);
  transition: all .15s ease;
}
.cal-dia:hover:not(:disabled) { box-shadow: inset 0 0 0 2px #885784; }
.cal-dia:disabled { color: rgba(23,48,43,.22); background: transparent; box-shadow: none; cursor: not-allowed; text-decoration: line-through; }
.cal-dia.hoy { font-weight: 700; }
.cal-dia.elegido { background: #885784; color: #fff; box-shadow: 0 8px 16px -8px #885784; }
.cal-ayuda { margin-top: .7rem; font: 400 12.5px/1.4 'Poppins', sans-serif; color: rgba(23,48,43,.6); }
</style>
