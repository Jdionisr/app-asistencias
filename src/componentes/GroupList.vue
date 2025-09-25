<template>
  <div>
    <h2>Mis grupos</h2>
    <ul>
      <li
        v-for="group in groups"
        :key="group.id"
        @click="selectGroup(group)"
        class="group-item"
      >
        {{ group.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Simulamos algunos grupos para el ejemplo
interface Group {
  id: number
  name: string
}

const groups = ref<Group[]>([
  { id: 1, name: 'Karate Infantil' },
  { id: 2, name: 'Karate Adultos' },
  { id: 3, name: 'Karate Avanzado' }
])

// Evento que emitiremos al seleccionar un grupo
const emit = defineEmits<{
  (e: 'groupSelected', group: Group): void
}>()

function selectGroup(group: Group) {
  emit('groupSelected', group)
}
</script>

<style scoped>
.group-item {
  cursor: pointer;
  padding: 8px;
  border: 1px solid #ccc;
  margin-bottom: 4px;
  border-radius: 4px;
}

.group-item:hover {
  background-color: #f0f0f0;
}
</style>
