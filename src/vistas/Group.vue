<template>
  <div class="group-page">
    <!-- Cabecera con título y Logout -->
    <div class="header">
      <h2>Grupo: {{ groupName }}</h2>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>

    <!-- Resumen de asistencias -->
    <div class="attendance-summary">
      <div class="summary-item">
        <span class="summary-label">Total:</span>
        <span class="summary-value">{{ students.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Presentes:</span>
        <span class="summary-value present">{{ presentCount }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Ausentes:</span>
        <span class="summary-value absent">{{ absentCount }}</span>
      </div>
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

    <!-- Botones de acción -->
    <div class="action-buttons">
      <button class="save-all-btn" @click="saveAllAttendance" :disabled="isSaving">
        {{ isSaving ? 'Guardando...' : 'Guardar Lista Completa' }}
      </button>
      <button class="back-btn" @click="goBack">Volver</button>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="statusMessage" class="status-message" :class="statusMessageType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
const isSaving = ref(false)
const statusMessage = ref('')
const statusMessageType = ref('')
const hasUnsavedChanges = ref(true)

// Computed properties para el resumen
const presentCount = computed(() => {
  return students.value.filter(student =>
    student.attendance?.[currentDate.value] === true
  ).length
})

const absentCount = computed(() => {
  return students.value.filter(student =>
    student.attendance?.[currentDate.value] === false
  ).length
})

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

  // Actualizar estado local inmediatamente
  if (!student.attendance) student.attendance = {}
  student.attendance[date] = present
  console.log('✅ Asistencia actualizada:', student.nombre, date, present)

  // Guardar asistencia individual en Supabase
  try {
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
      console.error('❌ Error guardando asistencia:', error.message)
      showStatusMessage('Error al guardar asistencia de ' + student.nombre, 'error')
      // Revertir el cambio local si falla el guardado
      student.attendance[date] = !present
    } else {
      showStatusMessage('✅ Asistencia de ' + student.nombre + ' guardada', 'success')
      // Marcar que puede haber otros cambios sin guardar
      hasUnsavedChanges.value = students.value.some(s =>
        s.attendance?.[currentDate.value] === undefined
      )
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err)
    showStatusMessage('Error inesperado al guardar asistencia', 'error')
    // Revertir el cambio local si falla el guardado
    student.attendance[date] = !present
  }
}

async function saveAllAttendance() {
  if (isSaving.value) return

  isSaving.value = true
  showStatusMessage('Guardando asistencias...', 'info')

  try {
    const attendanceRecords = students.value.map(student => ({
      alumno_id: student.id,
      fecha: currentDate.value,
      presente: student.attendance?.[currentDate.value] ?? false
    }))

    const { error } = await supabase
      .from('asistencias')
      .upsert(attendanceRecords, { onConflict: 'alumno_id,fecha' })

    if (error) {
      console.error('❌ Error guardando asistencias:', error.message)
      showStatusMessage('Error al guardar las asistencias: ' + error.message, 'error')
    } else {
      console.log('✅ Todas las asistencias guardadas correctamente')
      showStatusMessage('✅ Lista de asistencias guardada correctamente', 'success')
      hasUnsavedChanges.value = false
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err)
    showStatusMessage('Error inesperado al guardar las asistencias', 'error')
  } finally {
    isSaving.value = false
  }
}

function showStatusMessage(message: string, type: string) {
  statusMessage.value = message
  statusMessageType.value = type

  // Limpiar el mensaje después de 5 segundos
  setTimeout(() => {
    statusMessage.value = ''
    statusMessageType.value = ''
  }, 5000)
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

/* Resumen de asistencias */
.attendance-summary {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
  padding: 15px 20px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-on-surface);
}

.summary-value.present {
  color: var(--color-success);
}

.summary-value.absent {
  color: var(--color-error);
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

/* Botones de acción */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 0 20%;
}

.save-all-btn {
  background-color: var(--color-success);
  color: var(--color-on-primary);
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.save-all-btn:hover:not(:disabled) {
  background-color: var(--color-success-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.save-all-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* Mensajes de estado */
.status-message {
  margin-top: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.status-message.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-message.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-message.info {
  background-color: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
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
