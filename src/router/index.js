import { createRouter, createWebHistory } from 'vue-router'

const FABRICA_ALLOWED = ['/admin/produccion', '/admin/stock']
// Categorías solo admin — no hace falta agregar aquí; el guard bloquea todo lo que no esté en FABRICA_ALLOWED

function requireAdmin(to, from, next) {
  const token = localStorage.getItem('ceketo_token')
  if (!token) return next('/admin/login')

  const rol = localStorage.getItem('ceketo_rol')
  if (rol === 'fabrica') {
    const allowed = FABRICA_ALLOWED.some(p => to.path.startsWith(p))
    if (!allowed) return next('/admin/produccion')
  }
  next()
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Redirigir raíz al panel admin
    { path: '/',             name: 'home',     component: () => import('../views/HomeView.vue') },
    { path: '/tienda',       name: 'shop',     component: () => import('../views/ShopView.vue') },
    { path: '/producto/:id', name: 'product',  component: () => import('../views/ProductView.vue') },
    { path: '/carrito',      name: 'cart',     component: () => import('../views/CartView.vue') },
    { path: '/checkout',     name: 'checkout', component: () => import('../views/CheckoutView.vue') },
    { path: '/nosotros',     name: 'about',    component: () => import('../views/AboutView.vue') },

    // Admin
    { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/LoginView.vue') },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      beforeEnter: requireAdmin,
      children: [
        { path: '',            redirect: '/admin/dashboard' },
        { path: 'dashboard',   name: 'admin-dashboard',   component: () => import('../views/admin/DashboardView.vue') },
        { path: 'produccion',  name: 'admin-produccion',  component: () => import('../views/admin/ProduccionView.vue') },
        { path: 'ventas',      name: 'admin-ventas',      component: () => import('../views/admin/VentasView.vue') },
        { path: 'pedidos',     name: 'admin-pedidos',     component: () => import('../views/admin/PedidosView.vue') },
        { path: 'productos',   name: 'admin-productos',   component: () => import('../views/admin/ProductosAdminView.vue') },
        { path: 'movimientos', name: 'admin-movimientos', component: () => import('../views/admin/MovimientosView.vue') },
        { path: 'stock',       name: 'admin-stock',       component: () => import('../views/admin/StockView.vue') },
        { path: 'gastos',      name: 'admin-gastos',      component: () => import('../views/admin/GastosView.vue') },
        { path: 'categorias',  name: 'admin-categorias',  component: () => import('../views/admin/CategoriasView.vue') },
        { path: 'cuentas',     name: 'admin-cuentas',     component: () => import('../views/admin/CuentasCorrientesView.vue') },
      ],
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
