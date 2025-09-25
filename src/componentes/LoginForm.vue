<template>
  <form class="login-form-container" @submit.prevent="$emit('submit')">
    <h2 class="login-title">Iniciar sesión</h2>
    <input
      placeholder="Correo electrónico"
      :value="email"
      @input="$emit('update:email', ($event.target as HTMLInputElement)?.value)"
      class="login-input"
      type="email"
      autocomplete="username"
      required
    />
    <input
      placeholder="Contraseña"
      type="password"
      :value="password"
      @input="$emit('update:password', ($event.target as HTMLInputElement)?.value)"
      class="login-input"
      autocomplete="current-password"
      required
    />
    <button type="submit" :disabled="loading" class="login-btn">
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </button>
    <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>
  </form>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  email: string
  password: string
  loading: boolean
  errorMessage: string
}>()
</script>

<style scoped>
@import "@/assets/theme.css";

.login-form-container {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  padding: 36px 32px 28px 32px;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 4px 24px 0 rgba(37, 99, 235, 0.10);
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}

.login-title {
  color: var(--color-primary-dark);
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.login-input {
  padding: 12px 16px;
  border: 1.5px solid var(--color-primary-light);
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: var(--color-on-surface);
  transition: border 0.2s;
  margin-bottom: 2px;
}
.login-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.login-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: bold;
  font-size: 1.08rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}
.login-btn:disabled {
  background: var(--color-primary-light);
  cursor: not-allowed;
}
.login-btn:hover:enabled {
  background: var(--color-primary-dark);
}

.login-error {
  color: var(--color-error-dark);
  margin-top: 6px;
  font-size: 1em;
  text-align: center;
  font-weight: 500;
}
</style>
