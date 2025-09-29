<template>
  <div id="asistencias-pdf" class="pdf-container">
    <div class="header">
      <img src="/logo.png" alt="Logo" class="logo" />
      <div class="title">
        HOJA DE ASISTENCIA PROGRAMA ACTIVIDADES FÍSICAS Y DEPORTIVAS MUNICIPALES CÁCERES
      </div>
    </div>
    {{ monitor }}
    <table class="asistencia-table">
      <tr>
        <td class="label">Nombre del curso</td>
        <td colspan="24">{{ grupo.cod_edm +" "+ grupo.nombre }}</td>
      </tr>
      <tr>
        <td class="label">Nombre del monitor</td>
        <td colspan="24">{{ monitor }}</td>
      </tr>
      <tr class="fechas-row">
        <td class="label">Fecha</td>
        <td v-for="n in columnas" :key="n" class="fecha-vertical">
          {{ dias[n] || '' }}
        </td>
      </tr>
      <tr>
        <td colspan="25" class="dias-label">Nº de días de asistencias</td>
      </tr>
      <tr v-for="i in filas" :key="i">
        <td class="alumno">{{ alumnos[i]?.nombre || '' }}</td>
        <td v-for="n in columnas" :key="n">
          <span v-if="alumnos[i]?.attendance && dias[n] && alumnos[i].attendance[dias[n]] === false">F</span>
          <span v-else></span>
        </td>
      </tr>
    </table>
    <div class="firma-row">
      <span>Firma monitor</span>
      <div class="firma-rect"></div>
    </div>
  </div>
</template>

<script setup>
defineProps(['grupo', 'monitor', 'dias', 'alumnos'])
const columnas = Array.from({ length: 24 }, (_, i) => i)
const filas = Array.from({ length: 20 }, (_, i) => i)
</script>

<style scoped>
.pdf-container {
  width: 100vw;
  max-width: 297mm;
  min-height: 210mm;
  font-family: Arial, sans-serif;
  background: #fff;
  padding: 0;
  margin: 0 auto;
  box-sizing: border-box;
  font-size: 11px;
}
.pdf-container.a4-landscape {
  width: 297mm;
  height: 210mm;
  font-family: Arial, sans-serif;
  background: #fff;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.logo {
  width: auto;
  height: 40px;
  object-fit: contain;
  margin-right: 24px;
}
.title {
  font-size: 0.95rem;
  font-weight: bold;
  text-align: center;
  text-decoration: underline;
  word-break: break-word;
  line-height: 1.1;
  max-width: 80%;
  margin-top: 20px;
  margin-left: 60px;
}
.asistencia-table {
  width: 99%;
  height: auto;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.75em;
}
.asistencia-table td, .asistencia-table th {
  border: 1.2px solid #222;
  padding: 2px 1px;
  text-align: center;
  box-sizing: border-box;
  min-height: 14px;
  height: 14px;
}
.pdf-container.a4-landscape .asistencia-table {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}
.fechas-row td {
  height: 70px;
  vertical-align: bottom;
}
.fecha-vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.75em;
  padding: 0;
}
.dias-label {
  font-weight: bold;
  background: #f9f9f9;
  text-align: left;
  padding-left: 4px;
  width: 150px;
}

.label {
  font-weight: bold;
  background: #f9f9f9;
  text-align: left;
  padding-left: 4px;
  width: 150px;
}

.alumno {
  text-align: left;
  padding-left: 4px;
  width: 150px;
}
.firma-row {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
.firma-row span {
  font-weight: bold;
  margin-right: 8px;
  width: 130px;
}
.firma-rect {
  border: 1.5px solid #333;
  width: 210px;
  height: 70px;
  margin-left: 8px;
}
.header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
