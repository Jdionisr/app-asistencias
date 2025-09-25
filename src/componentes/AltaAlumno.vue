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
    <p v-if="mensaje" :class="{ error: error }">{{ mensaje }}</p>
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
.alta-alumno {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alta-alumno input, .alta-alumno select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.alta-alumno button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  font-weight: bold;
  cursor: pointer;
}
.alta-alumno .error {
  color: #dc2626;
}
</style>
