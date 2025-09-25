<template>
  <div class="group-page">
    <!-- Cabecera con título y Logout -->
    <div class="header">
      <h2>Grupo: {{ groupName }}</h2>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>

    <!-- Tabla de asistencia -->
    <table class="students-table">
      <thead>
        <tr>
          <th>Alumno</th>
          <th>Apellidos</th>
          <th>Asistencia {{ currentDate }}</th>
        </tr>
      </thead>
      <tbody>
        <StudentRow
          v-for="student in students"
          :key="student.id"
          :student="student"
          :date="currentDate"
          @attendanceChanged="handleAttendanceChanged"
        />
      </tbody>
    </table>

    <!-- Botones Back y Export distribuidos -->
   <div class="action-buttons">
    <button class="back-btn" @click="goBack">Volver</button>
    <button class="save-btn" @click="saveAttendance">Guardar asistencias</button>
  </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import StudentRow from '../componentes/StudentRow.vue'

interface Student {
  id: string
  nombre: string
  apellidos: string
  fecha_nac: string
  attendance?: Record<string, boolean>
}

const route = useRoute()
const router = useRouter()
const groupId = route.params.id as string
const groupName = ref('')
const students = ref<Student[]>([])
const currentDate = ref(new Date().toISOString().slice(0, 10))

onMounted(async () => {
  // Cargar nombre del grupo
  const { data: groupData, error: groupError } = await supabase
    .from('grupos')
    .select('nombre')
    .eq('id', groupId)
    .single()
  if (groupError) console.error('❌ Error cargando grupo:', groupError.message)
  else groupName.value = groupData?.nombre || 'Sin nombre'

  // Cargar alumnos del grupo
  const { data: studentsData, error: studentsError } = await supabase
    .from('alumnos')
    .select('id, nombre, apellidos, fecha_nac')
    .eq('grupo_id', groupId)
  if (studentsError) console.error('❌ Error cargando alumnos:', studentsError.message)
  else students.value = studentsData || []
})

function handleAttendanceChanged(studentId: string, date: string, present: boolean) {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return
  if (!student.attendance) student.attendance = {}
  student.attendance[date] = present
  console.log('✅ Asistencia actualizada:', student.nombre, date, present)
}

function goBack() { router.back() }
function logout() { router.push({ name: 'login' }) }
async function saveAttendance() {
  if (!students.value.length) return

  // Preparamos los datos para insertar
  const records = students.value.map(s => ({
    alumno_id: s.id,
    fecha: currentDate.value,
    presente: s.attendance?.[currentDate.value] ?? false
  }))

  // Inserción en Supabase con "upsert" para evitar duplicados
  const { data, error } = await supabase
    .from('asistencias')
    .upsert(records, { onConflict: ['alumno_id', 'fecha'] })

  if (error) {
    console.error('❌ Error guardando asistencias:', error.message)
    alert('Error guardando asistencias: ' + error.message)
  } else {
    console.log('✅ Asistencias guardadas:', data)
    alert('Asistencias guardadas correctamente')
  }
}

</script>

<style scoped>
.group-page {
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Cabecera */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 15px;
}

.header h2 { flex: 1; text-align: center; }
.logout-btn {
  position: absolute;
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

/* Tabla alumnos */
.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  table-layout: fixed; /* columnas iguales */
}
.students-table th, .students-table td {
  width: 33%; /* 3 columnas del mismo tamaño */
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
  color: #374151;
  text-align: center; /* texto centrado */
}
.students-table th {
  background-color: #f3f4f6;
}

/* Botones Back y Export */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 20%;
}

.back-btn, .export-btn, .save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

/* Colores */
.back-btn {
  background-color: #93c5fd; /* azul claro */
}
.back-btn:hover { background-color: #3b82f6; }

.save-btn {
  background-color: #22c55e; /* verde */
}
.save-btn:hover { background-color: #16a34a; }

</style>
