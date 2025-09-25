<template>
  <tr class="student-row">
    <td>{{ student.nombre }}</td>
    <td>{{ student.apellidos }}</td>
    <td class="checkbox-cell">
      <label class="checkbox-container">
        <input type="checkbox" v-model="present" @change="updateAttendance" />
        <span class="checkmark"></span>
      </label>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Student {
  id: string
  nombre: string
  apellidos: string
  fecha_nac: string
  attendance?: Record<string, boolean>
}

const props = defineProps<{
  student: Student
  date: string
}>()

const emit = defineEmits<{
  (e: 'attendanceChanged', studentId: string, date: string, present: boolean): void
}>()

const present = ref(false)

function updateAttendance() {
  emit('attendanceChanged', props.student.id, props.date, present.value)
}

watch(
  () => props.student.attendance?.[props.date],
  (value) => {
    present.value = value ?? false
  },
  { immediate: true }
)
</script>

<style scoped>
@import "@/assets/theme.css";

.student-row {
  transition: background 0.2s, transform 0.2s;
}

.student-row:hover {
  background-color: var(--color-surface);
  transform: translateY(-2px);
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
  color: var(--color-on-surface);
}

/* Estilo del checkbox */
.checkbox-cell {
  align-items: center;
}

.checkbox-container {
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: var(--color-primary-light);
  border-radius: 4px;
  transition: background-color 0.2s, transform 0.2s;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--color-success);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
