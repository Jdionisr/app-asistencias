<template>
  <div class="export-page">
    <h2>Generar Informe de Asistencias</h2>

    <div class="form-group">
      <label for="group">Selecciona un grupo:</label>
      <select id="group" v-model="selectedGroup">
        <option value="">-- Selecciona un grupo --</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.nombre }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="month">Selecciona un mes:</label>
      <input type="month" id="month" v-model="selectedMonth" />
    </div>

    <!-- Botón para volver al dashboard -->
    <button class="back-btn" @click="goToDashboard">← Volver al Dashboard</button>

    <button class="export-btn" @click="generateReport">Generar Informe</button>

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
              {{ student.attendance[day] === true ? 'Presente' : student.attendance[day] === false ? 'Falta' : 'Sin registro' }}
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
.export-page { padding: 20px; text-align: center }
.form-group { margin: 15px 0 }
label { display: block; margin-bottom: 5px; font-weight: bold }
select, input[type="month"] { padding: 6px 10px; border-radius: 6px; border: 1px solid #ccc; min-width: 220px }

.export-btn { margin-top: 20px; padding: 8px 16px; border: none; border-radius: 6px; background-color: #34d399; color: white; font-weight: bold; cursor: pointer; transition: 0.2s }
.export-btn:hover { background-color: #16a34a }

.back-btn { margin-top: 15px; padding: 6px 12px; border: none; border-radius: 6px; background-color: #f87171; color: white; font-weight: bold; cursor: pointer; transition: 0.2s }
.back-btn:hover { background-color: #ef4444 }

.info-message { margin-top: 20px; font-weight: bold; color: #f59e0b }

.report-table-container { margin-top: 30px; overflow-x: auto }
.report-table { border-collapse: collapse; width: 100%; min-width: 600px }
.report-table th, .report-table td { border: 1px solid #ccc; padding: 8px; text-align: center }
.report-table th { background-color: #f3f4f6 }
</style>
