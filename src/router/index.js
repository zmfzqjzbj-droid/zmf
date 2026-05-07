import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import TeacherDashboard from '../components/TeacherDashboard.vue'
import StudentDashboard from '../components/StudentDashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/teacher', component: TeacherDashboard },
  { path: '/student', component: StudentDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router