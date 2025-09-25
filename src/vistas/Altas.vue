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
@import "@/assets/theme.css";

.altas {
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(37, 99, 235, 0.10);
}

h2 {
  color: var(--color-primary-dark);
  text-align: center;
  margin-bottom: 24px;
}

.altas-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.altas-tabs button {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-primary-dark);
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-size: 1rem;
  box-shadow: 0 1px 2px 0 rgba(37, 99, 235, 0.04);
}
.altas-tabs button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.volver-btn {
  margin-top: 30px;
  background: var(--color-primary-light);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: bold;
  font-size: 1rem;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s;
}
.volver-btn:hover {
  background: var(--color-primary-dark);
  color: var(--color-on-primary);
}
</style>
