<template>
  <div class="altas">
    <h2>Altas</h2>
    <div class="altas-tabs">
      <button :class="{ active: tab === 'grupo' }" @click="tab = 'grupo'">Alta grupo</button>
      <button :class="{ active: tab === 'alumno' }" @click="tab = 'alumno'">Alta alumno</button>
    </div>
    <div v-if="tab === 'grupo'">
      <AltaGrupo @grupoCreado="onGrupoCreado" />
    </div>
    <div v-else>
      <AltaAlumno :grupos="grupos" @alumnoCreado="onAlumnoCreado" />
    </div>
    <button class="volver-btn" @click="volver">Volver</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

function volver() {
  router.push({ name: 'dashboard' })
}
import { ref, onMounted } from 'vue'
import AltaGrupo from '@/componentes/AltaGrupo.vue'
import AltaAlumno from '@/componentes/AltaAlumno.vue'
import { supabase } from '@/lib/supabase'

const tab = ref<'grupo' | 'alumno'>('grupo')
const grupos = ref<{ id: string; nombre: string }[]>([])

onMounted(async () => {
  // Cargar grupos para el select de AltaAlumno
  const { data, error } = await supabase.from('grupos').select('id, nombre')
  if (!error && data) grupos.value = data
})

function onGrupoCreado() {
  // Refrescar lista de grupos tras crear uno nuevo
  supabase.from('grupos').select('id, nombre').then(({ data, error }) => {
    if (!error && data) grupos.value = data
  })
}

function onAlumnoCreado() {
  // Aquí podrías mostrar un mensaje o refrescar algo si lo necesitas
}
</script>

<style scoped>
.altas {
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.altas-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.altas-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #e5e7eb;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.altas-tabs button.active {
  background: #3b82f6;
  color: white;
}

.volver-btn {
  margin-top: 30px;
  background: #93c5fd;
  color: #1e293b;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.volver-btn:hover {
  background: #3b82f6;
  color: white;
}
</style>
