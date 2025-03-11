
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

// Define your routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // Add other routes as needed
  // {
  //   path: '/about',
  //   name: 'About',
  //   // Lazy loading example
  //   component: () => import('../views/About.vue')
  // }
]

// Create the router instance
export function createRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes
  })
  return router
}

// Default export for direct import
export default createRouter()