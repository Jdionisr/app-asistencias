<template>
  <RegistroAsistenciaPDF
    :grupo="grupo"
    :monitor="monitor"
    :dias="dias"
    :alumnos="alumnos"
  />
</template>

<script setup lang="ts">

import { useRoute } from 'vue-router'
import RegistroAsistenciaPDF from '@/componentes/RegistroAsistenciaPDF.vue'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const grupo = ref<any>({})
const monitor = ref(route.query.monitor || '')
const dias = computed(() => {
  try {
    return JSON.parse(route.query.dias as string) || []
  } catch {
    return []
  }
})
const alumnos = computed(() => {
  try {
    return JSON.parse(route.query.alumnos as string) || []
  } catch {
    return []
  }
})

onMounted(async () => {
  if (route.query.grupoId) {
    console.log('Buscando grupo con id:', route.query.grupoId)
    const { data, error } = await supabase.from('grupos').select('*').eq('id', route.query.grupoId).single()
    console.log('Resultado grupo:', { data, error })
    if (data) {
      grupo.value = data
      // Si el grupo tiene monitor, buscar su nombre
      if (data.uid_mon) {
        console.log('Buscando monitor con id:', data.uid_mon)
        const { data: monitorData, error: monitorError } = await supabase
          .from('monitores')
          .select('nombre')
          .eq('id', data.uid_mon)
          .single()
        console.log('Resultado monitor:', { monitorData, monitorError })
        if (monitorData) monitor.value = monitorData.nombre
      } else {
        console.log('El grupo no tiene uid_mon asignado')
      }
    } else {
      console.log('No se encontró el grupo o hubo error')
    }
  } else {
    console.log('No se proporcionó grupoId en la ruta')
  }
})

// Ejemplo de uso de router.push con los datos necesarios
function navigateToPDF() {
  router.push({
    name: 'pdf',
    query: {
      grupo: JSON.stringify(groups.value.find(g => g.id === selectedGroup.value) || {}),
      // Agregar el resto de los parámetros necesarios
    }
  })
}
</script>
