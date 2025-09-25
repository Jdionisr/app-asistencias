import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/vistas/Login.vue'
import Dashboard from '@/vistas/Dashboard.vue'
import Group from '@/vistas/Group.vue'
import ExportView from '@/vistas/Export.vue'
import Altas from '@/vistas/Altas.vue'

const routes = [
  { path: '/', name: 'login', component: Login },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/group/:id', name: 'group', component: Group, props: true },
  { path: '/export', name: 'export', component: ExportView },
  { path: '/altas', name: 'altas', component: Altas }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
