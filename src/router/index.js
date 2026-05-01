import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/album' },
      {
        path: 'album',
        name: 'album',
        component: () => import('src/pages/AlbumView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'exchange',
        name: 'exchange',
        component: () => import('src/pages/ExchangeView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('src/pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  // Importar dinámicamente para asegurar que Pinia ya esté activa
  const { useAuthStore } = await import('src/stores/authStore')
  const authStore = useAuthStore()

  if (!authStore.user) {
    return { name: 'login' }
  }
})

export default router
