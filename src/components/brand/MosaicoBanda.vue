<template>
  <div class="mb" :style="{ '--alto': alto }" aria-hidden="true">
    <div class="mb-pista" :class="{ 'mb-reversa': reversa }">
      <template v-for="n in 2" :key="n">
        <div v-for="t in TEJAS" :key="`${n}-${t}`" class="mb-teja" :style="{ backgroundPosition: t }"></div>
      </template>
    </div>
  </div>
</template>

<script setup>
// Franja de azulejos del mosaico de la marca, corriendo de costado (guarda decorativa).
defineProps({
  alto: { type: String, default: 'clamp(70px, 9vw, 120px)' },
  reversa: { type: Boolean, default: false },
})
const TEJAS = ['0% 0%', '100% 0%', '0% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%']
</script>

<style scoped>
.mb { overflow: hidden; height: var(--alto); }
.mb-pista {
  display: flex;
  width: max-content;
  height: 100%;
  animation: mb-correr 40s linear infinite;
}
.mb-reversa { animation-direction: reverse; }
.mb-teja {
  height: 100%;
  aspect-ratio: 1;
  background-image: url('/marca/mosaico.svg');
  background-size: 300% 300%;
  background-repeat: no-repeat;
}
@keyframes mb-correr {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
</style>
