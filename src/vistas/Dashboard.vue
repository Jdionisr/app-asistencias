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

    <!-- Botones de acciones centrados abajo -->
    <div class="dashboard-actions">
      <button class="altas-btn" @click="goToAltas">Altas</button>
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

const groups = ref<Array<GroupFromDB>>([])
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
      .from('grupos')
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


function goToAltas() {
  router.push({ name: 'altas' })
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
@import "@/assets/theme.css";

.dashboard {
  padding: 20px;
  text-align: center;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-on-surface);
}

/* Logout arriba a la derecha */
.logout-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: var(--color-error);
  color: var(--color-on-primary);
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn:hover { background-color: var(--color-error-dark); }

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
  background-color: var(--color-surface);
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  width: 220px;
  text-align: center;
  color: var(--color-primary-dark);
  border: 2px solid var(--color-primary-light);
}
.group-card:hover {
  background-color: var(--color-primary-light);
  color: var(--color-on-primary);
  transform: translateY(-2px);
}

.export-button-container { margin: 40px 0; }

.report-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: var(--color-success);
  color: var(--color-on-primary);
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.report-btn:hover { background-color: var(--color-success-dark); }

.dashboard-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
}
.altas-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.altas-btn:hover {
  background: var(--color-primary-dark);
}
.empty {
  color: var(--color-secondary);
  margin-top: 20px;
}
.error {
  color: var(--color-error-dark);
  margin-top: 10px;
}
</style>
