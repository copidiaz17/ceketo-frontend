import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('ceketo-cart') || '[]'))

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  // Devuelve true si pudo agregar, false si no hay stock disponible
  function addItem(product) {
    const stock = Number.isFinite(product.stock) ? product.stock : Infinity
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      const max = Number.isFinite(existing.stock) ? existing.stock : stock
      if (existing.quantity >= max) return false   // ya llegó al máximo de stock
      existing.quantity++
    } else {
      if (stock <= 0) return false                 // sin stock
      items.value.push({ ...product, quantity: 1 })
    }
    saveToStorage()
    return true
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.id !== productId)
    saveToStorage()
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        const max = Number.isFinite(item.stock) ? item.stock : Infinity
        item.quantity = Math.min(quantity, max)   // nunca por encima del stock
        saveToStorage()
      }
    }
  }

  function clearCart() {
    items.value = []
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem('ceketo-cart', JSON.stringify(items.value))
  }

  return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }
})
