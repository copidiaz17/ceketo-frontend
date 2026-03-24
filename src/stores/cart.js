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

  function addItem(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
    saveToStorage()
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
        item.quantity = quantity
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
