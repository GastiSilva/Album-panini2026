import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory
} from 'vue-router'
import routes from './routes'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation guard: redirect to setup if user has no name set.
  // Uses localStorage directly (not useUserStore) because Pinia may not be
  // initialized when the guard runs during SSR or initial hydration.
  Router.beforeEach((to) => {
    const userId = localStorage.getItem('album_userId')
    if (to.meta.requiresSetup && !userId) {
      return { name: 'setup' }
    }
    // If already set up and going to setup, redirect to album
    if (to.name === 'setup' && userId) {
      return { name: 'album' }
    }
  })

  return Router
})
