const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'setup' }
      },
      {
        path: 'album',
        name: 'album',
        component: () => import('pages/AlbumView.vue'),
        meta: { requiresSetup: true }
      },
      {
        path: 'exchange',
        name: 'exchange',
        component: () => import('pages/ExchangeView.vue'),
        meta: { requiresSetup: true }
      }
    ]
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('pages/SetupView.vue')
  },
  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    redirect: '/'
  }
]

export default routes
