<template>
  <div class="login-bg">
    <LoginForm
      :email="email"
      :password="password"
      :loading="loading"
      :errorMessage="errorMessage"
      @update:email="email = $event"
      @update:password="password = $event"
      @submit="handleLogin"
    />
  </div>
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
    errorMessage.value = 'Email o contraseña incorrectos'
    return
  }

  if (data.user) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<style scoped>
@import "@/assets/theme.css";

.login-bg {
  min-height: 100vh;
  width: 100vw;
  background: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 👈 Se alinea arriba */
  padding-top: 60px;       /* 👈 Ajusta este valor según se vea bien */
}

</style>
