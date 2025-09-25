<template>
  <form class="alta-grupo" @submit.prevent="crearGrupo">
    <h3>Alta grupo</h3>
    <input v-model="nombre" placeholder="Nombre del grupo" required />
    <button type="submit">Crear grupo</button>
    <p v-if="mensaje" :class="{ error: error, success: !error }">{{ mensaje }}</p>
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
@import "@/assets/theme.css";

.alta-grupo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-background);
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
}

.alta-grupo h3 {
  color: var(--color-primary-dark);
  text-align: center;
  margin-bottom: 8px;
}

.alta-grupo input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary-light);
  font-size: 1rem;
  background: #fff;
  color: var(--color-on-surface);
  transition: border 0.2s;
}
.alta-grupo input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.alta-grupo button {
  background: var(--color-success);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.alta-grupo button:hover {
  background: var(--color-success-dark);
}

.alta-grupo .error {
  color: var(--color-error-dark);
  text-align: center;
  font-weight: 500;
}
.alta-grupo .success {
  color: var(--color-success-dark);
  text-align: center;
  font-weight: 500;
}
</style>
