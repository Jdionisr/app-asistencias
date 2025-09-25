<template>
  <div class="export-page">
    <h2>Generar Informe de Asistencias</h2>

    <div class="form-group">
      <label for="group">Selecciona un grupo:</label>
      <select id="group" v-model="selectedGroup" class="export-input">
        <option value="">-- Selecciona un grupo --</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.nombre }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="month">Selecciona un mes:</label>
      <input type="month" id="month" v-model="selectedMonth" class="export-input" />
    </div>

    <div class="export-actions">
      <button class="back-btn" @click="goToDashboard">← Volver al Dashboard</button>
      <button class="export-btn" @click="generateReport">Generar Informe</button>
    </div>

    <!-- Mensajes de información -->
    <div v-if="message" class="info-message">
      {{ message }}
    </div>

    <!-- Tabla de asistencias -->
    <div v-if="reportData.length && reportDays.length" class="report-table-container">
      <table class="report-table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th v-for="day in reportDays" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in reportData" :key="student.id">
            <td>{{ student.nombre }}</td>
            <td v-for="day in reportDays" :key="day">
              <span
                :class="{
                  presente: student.attendance[day] === true,
                  falta: student.attendance[day] === false,
                  sinregistro: student.attendance[day] === undefined
                }"
              >
                {{ student.attendance[day] === true ? 'Presente' : student.attendance[day] === false ? 'Falta' : 'Sin registro' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

interface Group { id: string; nombre: string }
interface Student { id: string; nombre: string; apellidos: string }

const router = useRouter()

// Estados
const groups = ref<Group[]>([])
const selectedGroup = ref('')
const selectedMonth = ref('')
const reportData = ref<Array<Student & { attendance: Record<string, boolean | undefined> }>>([])
const reportDays = ref<string[]>([])
const message = ref('')

// Navegar al dashboard
function goToDashboard() {
  router.push('/dashboard')
}

// Cargar grupos al iniciar
async function loadGroups() {
  const { data, error } = await supabase.from('grupos').select('id, nombre')
  if (error) console.error('Error cargando grupos:', error)
  else groups.value = data || []
}
loadGroups()

// Generar informe (sin cambios respecto a tu versión anterior)
async function generateReport() {
  message.value = ''
  reportData.value = []
  reportDays.value = []

  if (!selectedGroup.value || !selectedMonth.value) {
    alert('Por favor selecciona un grupo y un mes')
    return
  }

  const { data: studentsData, error: studentsError } = await supabase
    .from('alumnos')
    .select('id, nombre, apellidos')
    .eq('grupo_id', selectedGroup.value)

  if (studentsError) {
    console.error('Error cargando alumnos:', studentsError)
    return
  }

  if (!studentsData || studentsData.length === 0) {
    message.value = 'No hay alumnos en este grupo'
    return
  }

  const alumnoIds = studentsData.map(s => s.id)
  const monthStart = selectedMonth.value + '-01'
  const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0)
  const monthEndStr = monthEnd.toISOString().slice(0, 10)

  const { data: attendanceDataRaw, error: attendanceError } = await supabase
    .from('asistencias')
    .select('alumno_id, fecha, presente')
    .in('alumno_id', alumnoIds)
    .gte('fecha', monthStart)
    .lte('fecha', monthEndStr)

  if (attendanceError) { console.error('Error cargando asistencias:', attendanceError); return }

  const attendanceData = Array.isArray(attendanceDataRaw) ? attendanceDataRaw : []

  if (attendanceData.length === 0) {
    message.value = 'No hay registros de asistencias para este mes'
    return
  }

  const daysSet = new Set<string>()
  attendanceData.forEach(a => daysSet.add(a.fecha))
  reportDays.value = Array.from(daysSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  reportData.value = studentsData.map(s => {
    const attendance: Record<string, boolean | undefined> = {}
    reportDays.value.forEach(day => {
      const record = attendanceData.find(a => a.alumno_id === s.id && a.fecha === day)
      attendance[day] = record?.presente
    })
    return { ...s, attendance }
  })
}
</script>

<style scoped>
@import "@/assets/theme.css";

.export-page {
  padding: 32px 12px 32px 12px;
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-on-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2 {
  color: var(--color-primary-dark);
  margin-bottom: 28px;
  text-align: center;
}

.form-group {
  margin: 18px 0 0 0;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  margin-bottom: 6px;
  font-weight: bold;
  color: var(--color-primary-dark);
}

.export-input {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary-light);
  font-size: 1rem;
  background: #fff;
  color: var(--color-on-surface);
  transition: border 0.2s;
  width: 100%;
  margin-bottom: 2px;
}
.export-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.export-actions {
  display: flex;
  gap: 16px;
  margin: 32px 0 18px 0;
  justify-content: center;
}

.export-btn {
  background: var(--color-success);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.export-btn:hover {
  background: var(--color-success-dark);
}

.back-btn {
  background: var(--color-error);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.back-btn:hover {
  background: var(--color-error-dark);
}

.info-message {
  margin-top: 20px;
  font-weight: bold;
  color: var(--color-warning);
  text-align: center;
}

.report-table-container {
  margin-top: 30px;
  overflow-x: auto;
  width: 100%;
  max-width: 900px;
}

.report-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 600px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(37, 99, 235, 0.06);
  overflow: hidden;
}

.report-table th, .report-table td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: center;
  font-size: 1rem;
  color: var(--color-on-surface);
}

.report-table th {
  background-color: var(--color-primary-light);
  color: var(--color-on-primary);
  font-weight: bold;
}

.presente {
  color: var(--color-success-dark);
  font-weight: bold;
}
.falta {
  color: var(--color-error-dark);
  font-weight: bold;
}
.sinregistro {
  color: var(--color-secondary);
}
</style>
