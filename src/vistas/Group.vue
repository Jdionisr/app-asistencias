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

    <!-- Botón Back -->
    <div class="action-buttons">
      <button class="back-btn" @click="goBack">Volver</button>
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
  if (studentsError) {
    console.error('❌ Error cargando alumnos:', studentsError.message)
    students.value = []
    return
  }
  students.value = studentsData || []

  // Cargar asistencias existentes para la fecha actual
  const { data: asistenciasData, error: asistenciasError } = await supabase
    .from('asistencias')
    .select('alumno_id, presente')
    .eq('fecha', currentDate.value)
    .in('alumno_id', students.value.map(s => s.id))
  if (asistenciasError) {
    console.error('❌ Error cargando asistencias:', asistenciasError.message)
    return
  }
  // Mapear asistencias a los alumnos
  for (const asistencia of asistenciasData || []) {
    const alumno = students.value.find(s => s.id === asistencia.alumno_id)
    if (alumno) {
      if (!alumno.attendance) alumno.attendance = {}
      alumno.attendance[currentDate.value] = asistencia.presente
    }
  }
})

async function handleAttendanceChanged(studentId: string, date: string, present: boolean) {
  const student = students.value.find(s => s.id === studentId)
  if (!student) return
  if (!student.attendance) student.attendance = {}
  student.attendance[date] = present
  console.log('✅ Asistencia actualizada:', student.nombre, date, present)

  // Guardar asistencia individual en Supabase
  const { error } = await supabase
    .from('asistencias')
    .upsert([
      {
        alumno_id: studentId,
        fecha: date,
        presente: present
      }
    ], { onConflict: 'alumno_id,fecha' })

  if (error) {
    alert('Error guardando asistencia: ' + error.message)
    console.error('❌ Error guardando asistencia:', error.message)
  } else {
    // Opcional: notificación visual rápida
    // alert('Asistencia guardada')
  }
}

function goBack() { router.back() }
function logout() { router.push({ name: 'login' }) }

</script>

<style scoped>
@import "@/assets/theme.css";

.group-page {
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-on-surface);
}

/* Cabecera */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 15px;
}

.header h2 {
  flex: 1;
  text-align: center;
  color: var(--color-primary-dark);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logout-btn {
  position: absolute;
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
.logout-btn:hover {
  background-color: var(--color-error-dark);
}

/* Tabla alumnos */
.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  table-layout: fixed;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(37, 99, 235, 0.06);
  overflow: hidden;
}
.students-table th, .students-table td {
  width: 33%;
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
  color: var(--color-on-surface);
  text-align: center;
}
.students-table th {
  background-color: var(--color-primary-light);
  color: var(--color-on-primary);
  font-weight: bold;
  font-size: 1.1em;
}

/* Botones Back y Export */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 0 20%;
}

.back-btn {
  background-color: var(--color-primary-light);
  color: var(--color-on-primary);
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover {
  background-color: var(--color-primary-dark);
}

/* Ajuste para filas de la tabla */
.students-table tr {
  transition: background 0.2s, transform 0.2s;
}
.students-table tr:hover {
  background-color: var(--color-surface);
  transform: translateY(-2px);
}
</style>
