<template>
  <div class="relative" ref="wrapper">
    <!-- Trigger -->
    <button
      type="button"
      @click="open = !open"
      class="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border text-left font-body text-sm transition-colors"
      :class="open ? 'border-teal text-white' : 'border-white/10 text-white/70 hover:border-white/30'"
    >
      <span :class="selectedProduct ? 'text-white' : 'text-white/30'">
        {{ selectedProduct ? `${selectedProduct.codigo} — ${selectedProduct.nombre}` : placeholder }}
      </span>
      <svg
        class="h-4 w-4 text-white/40 transition-transform duration-200 flex-shrink-0 ml-2"
        :class="open ? 'rotate-180' : ''"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute z-50 left-0 right-0 mt-2 bg-[#1A2E2A] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      >
        <!-- Buscador -->
        <div class="p-2 border-b border-white/10">
          <input
            v-model="search"
            ref="searchInput"
            type="text"
            placeholder="Buscar producto..."
            class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-body
                   focus:outline-none focus:border-teal transition-colors placeholder-white/30"
          />
        </div>

        <!-- Lista -->
        <div class="max-h-64 overflow-y-auto">
          <template v-for="cat in filteredGroups" :key="cat.codigo">
            <!-- Grupo -->
            <div class="px-3 py-1.5 text-xs font-body font-semibold text-white/30 uppercase tracking-wider bg-white/5 sticky top-0">
              {{ cat.nombre }}
            </div>
            <!-- Items -->
            <button
              v-for="p in cat.productos"
              :key="p.id"
              type="button"
              @click="select(p)"
              class="w-full flex items-center justify-between px-4 py-2.5 text-left font-body text-sm transition-colors hover:bg-teal/20"
              :class="modelValue === p.id ? 'bg-teal/10 text-teal' : 'text-white/80'"
            >
              <span>{{ p.nombre }}</span>
              <span class="text-xs text-white/30 font-mono ml-2 flex-shrink-0">{{ p.codigo }}</span>
            </button>
          </template>

          <div v-if="filteredGroups.length === 0" class="px-4 py-6 text-center text-white/30 text-sm font-body">
            Sin resultados
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: null },
  grupos: { type: Array, default: () => [] },   // [{ codigo, nombre, productos: [...] }]
  placeholder: { type: String, default: '— Seleccioná un producto —' },
})
const emit = defineEmits(['update:modelValue'])

const open       = ref(false)
const search     = ref('')
const wrapper    = ref(null)
const searchInput = ref(null)

const selectedProduct = computed(() => {
  for (const cat of props.grupos) {
    const found = cat.productos.find(p => p.id === props.modelValue)
    if (found) return found
  }
  return null
})

const filteredGroups = computed(() => {
  if (!search.value) return props.grupos
  const q = search.value.toLowerCase()
  return props.grupos
    .map(cat => ({
      ...cat,
      productos: cat.productos.filter(p =>
        p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
      ),
    }))
    .filter(cat => cat.productos.length > 0)
})

function select(p) {
  emit('update:modelValue', p.id)
  open.value  = false
  search.value = ''
}

// Abrir → foco en buscador
watch(open, async (val) => {
  if (val) {
    await nextTick()
    searchInput.value?.focus()
  }
})

// Cerrar al click fuera
function onClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
