// main.js (new file)
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app/App.vue'
import AIChat from './app/routes/index.vue' 
import './app/styles/app.css' 
import AIMessage from './app/components/AIMessage.vue'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AIChat
    }
  ]
})

// Create and mount the Vue app
const app = createApp(App)
app.use(router)
app.mount('#app')