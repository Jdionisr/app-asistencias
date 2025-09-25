<template>
  <div class="login-container">
    <h2>Login</h2>
    <input
      placeholder="Email"
      :value="email"
      @input="$emit('update:email', $event.target.value)"
    />
    <input
      placeholder="Password"
      type="password"
      :value="password"
      @input="$emit('update:password', $event.target.value)"
    />
    <button @click="$emit('submit')" :disabled="loading">
      {{ loading ? 'Cargando...' : 'Login' }}
    </button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
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
.login-container {
  width: 300px;
  margin: 100px auto;
  padding: 30px;
  border-radius: 10px;
  background-color: #f0f4f8;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

button:hover:enabled {
  background-color: #4338ca;
}

.error-message {
  color: #f87171;
  font-weight: bold;
  text-align: center;
}
</style>
