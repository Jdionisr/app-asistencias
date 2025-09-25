<template>
  <form class="alta-alumno" @submit.prevent="crearAlumno">
    <h3>Alta alumno</h3>
    <input v-model="nombre" placeholder="Nombre" required />
    <input v-model="apellidos" placeholder="Apellidos" required />
    <input v-model="fecha_nac" type="date" required />
    <select v-model="grupo_id" required>
      <option value="" disabled>Selecciona grupo</option>
      <option v-for="g in grupos" :key="g.id" :value="g.id">{{ g.nombre }}</option>
    </select>
    <button type="submit">Crear alumno</button>
    <p v-if="mensaje" :class="{ error: error, success: !error }">{{ mensaje }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps<{ grupos: { id: string; nombre: string }[] }>()
const { grupos } = toRefs(props)

const nombre = ref('')
const apellidos = ref('')
const fecha_nac = ref('')
const grupo_id = ref('')
const mensaje = ref('')
const error = ref(false)
const emit = defineEmits(['alumnoCreado'])

async function crearAlumno() {
  mensaje.value = ''
  error.value = false
  const { error: err } = await supabase.from('alumnos').insert({
    nombre: nombre.value,
    apellidos: apellidos.value,
    fecha_nac: fecha_nac.value,
    grupo_id: grupo_id.value
  })
  if (err) {
    mensaje.value = 'Error: ' + err.message
    error.value = true
  } else {
    mensaje.value = 'Alumno creado correctamente'
    nombre.value = ''
    apellidos.value = ''
    fecha_nac.value = ''
    grupo_id.value = ''
    emit('alumnoCreado')
  }
}
</script>

<style scoped>
@import "@/assets/theme.css";

.alta-alumno {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-background);
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
}

.alta-alumno h3 {
  color: var(--color-primary-dark);
  text-align: center;
  margin-bottom: 8px;
}

.alta-alumno input,
.alta-alumno select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary-light);
  font-size: 1rem;
  background: #fff;
  color: var(--color-on-surface);
  transition: border 0.2s;
}
.alta-alumno input:focus,
.alta-alumno select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.alta-alumno button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.alta-alumno button:hover {
  background: var(--color-primary-dark);
}

.alta-alumno .error {
  color: var(--color-error-dark);
  text-align: center;
  font-weight: 500;
}
.alta-alumno .success {
  color: var(--color-success-dark);
  text-align: center;
  font-weight: 500;
}
</style>
