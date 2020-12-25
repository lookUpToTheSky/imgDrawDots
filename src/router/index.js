import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import(/* webpackChunkName: "preview" */ '../views/preview.vue')
  },
  {
    path: '/three',
    name: 'Three',
    component: () => import(/* webpackChunkName: "Three" */ '../views/three.vue')
  },
  {
    path: '/previewThree',
    name: 'PreviewThree',
    component: () => import(/* webpackChunkName: "Three" */ '../views/previewThree.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
