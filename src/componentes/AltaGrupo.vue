<template>
  <form class="alta-grupo" @submit.prevent="crearGrupo">
    <h3>Alta grupo</h3>
    <input v-model="nombre" placeholder="Nombre del grupo" required />
    <button type="submit">Crear grupo</button>
    <p v-if="mensaje" :class="{ error: error }">{{ mensaje }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const nombre = ref('')
const mensaje = ref('')
const error = ref(false)
const emit = defineEmits(['grupoCreado'])

async function crearGrupo() {
  mensaje.value = ''
  error.value = false
  const { error: err } = await supabase.from('grupos').insert({ nombre: nombre.value })
  if (err) {
    mensaje.value = 'Error: ' + err.message
    error.value = true
  } else {
    mensaje.value = 'Grupo creado correctamente'
    nombre.value = ''
    emit('grupoCreado')
  }
}
</script>

<style scoped>
.alta-grupo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alta-grupo input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.alta-grupo button {
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  font-weight: bold;
  cursor: pointer;
}
.alta-grupo .error {
  color: #dc2626;
}
</style>
