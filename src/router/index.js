import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/text-tools',
    name: 'TextTools',
    component: () => import('../views/TextTools.vue')
  },
  {
    path: '/number-tools',
    name: 'NumberTools',
    component: () => import('../views/NumberTools.vue')
  },
  {
    path: '/image-tools',
    name: 'ImageTools',
    component: () => import('../views/ImageTools.vue')
  },
  {
    path: '/unit-converter',
    name: 'UnitConverter',
    component: () => import('../views/UnitConverter.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 