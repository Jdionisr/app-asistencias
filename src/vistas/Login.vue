<template>
  <LoginForm
    v-model:email="email"
    v-model:password="password"
    :loading="loading"
    :errorMessage="errorMessage"
    @submit="handleLogin"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import { supabase } from '@/lib/supabase'
import LoginForm from '@/componentes/LoginForm.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  loading.value = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  loading.value = false

  if (error) {
    console.error('Error login:', error)
    errorMessage.value = 'Email o contraseña incorrectos'
    return
  }

  if (data.user) {
    router.push({ name: 'dashboard' })
  }
}
</script>
