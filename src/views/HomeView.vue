<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <RouterLink class="link-item" to="/analog-clock">Analog Clock</RouterLink>
      <RouterLink class="link-item" to="/digital-clock">Digital Clock</RouterLink>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;

  .link-item {
    aspect-ratio: 1;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: inherit;
    border: 2px solid currentColor;
    text-decoration: none;
    padding: 20px;
    text-align: center;
    font-weight: bold;
  }
}
</style>
