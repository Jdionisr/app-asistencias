<template>
  <div class="dashboard">
    <!-- Logout arriba a la derecha -->
    <button class="logout-btn" @click="logout">Logout</button>

    <h2>Mis grupos</h2>

    <div v-if="loading">Cargando grupos...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Lista de grupos centrada -->
    <div class="group-list" v-if="!loading && groups.length > 0">
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-card"
        @click="openGroup(group.id)"
      >
        {{ group.nombre }}
      </div>
    </div>

    <div v-if="!loading && groups.length === 0" class="empty">
      No tienes grupos aún. Crea uno en el panel de Supabase o usa el editor de tablas.
    </div>

    <!-- Botón de informes centrado abajo -->
    <div class="export-button-container">
      <button class="report-btn" @click="goToExport">Informes</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// Modelo tal cual viene de la BBDD
type GroupFromDB = { id: string; nombre: string }

const groups = ref<GroupFromDB[]>([])
const loading = ref(false)
const error = ref('')

// Verificar sesión al montar
onMounted(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    router.push({ name: 'login' })
    return
  }

  console.log("➡️ Entrando en onMounted del Dashboard")

  loading.value = true
  error.value = ''
  try {
    const { data, error: err } = await supabase
      .from<GroupFromDB>('grupos')
      .select('id, nombre')

    console.log("📦 Respuesta supabase:", { data, err })

    if (err) {
      console.error('Error cargando grupos:', err)
      error.value = err.message || 'Error al cargar grupos'
      groups.value = []
    } else {
      groups.value = data || []
    }
  } catch (e: any) {
    console.error(e)
    error.value = e.message || 'Error inesperado'
  } finally {
    loading.value = false
  }
})

function openGroup(id: string) {
  router.push({ name: 'group', params: { id } })
}

function goToExport() {
  router.push({ name: 'export' })
}

async function logout() {
  await supabase.auth.signOut()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  text-align: center;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Logout arriba a la derecha */
.logout-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: #f87171;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn:hover { background-color: #ef4444; }

.group-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  margin-top: 20px;
}

.group-card {
  padding: 20px 30px;
  border-radius: 10px;
  background-color: #e0e7ff;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  width: 220px;
  text-align: center;
}
.group-card:hover { background-color: #c7d2fe; transform: translateY(-2px); }

.export-button-container { margin: 40px 0; }

.report-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #34d399;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.report-btn:hover { background-color: #10b981; }

.empty { color: #6b7280; margin-top: 20px; }
.error { color: #b91c1c; margin-top: 10px; }
</style>
