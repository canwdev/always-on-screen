<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useFullscreen } from '@vueuse/core'
import { isDarkMode } from '@/stores/states.ts'

const { toggle: toggleFullscreen } = useFullscreen()
</script>

<template>
  <div class="main-wrapper" :class="{ dark: isDarkMode }">
    <RouterView />
    <div class="float-bar">
      <RouterLink class="link-item" to="/">⌂</RouterLink>

      <button title="Switch light/dark mode" @click="isDarkMode = !isDarkMode">☯</button>
      <button title="Fullscreen" @click="toggleFullscreen">☢</button>
    </div>
  </div>
</template>

<style lang="scss">
html,
body {
  height: 100%;
}
body {
  margin: 0;
}
#app {
  height: 100%;
}
* {
  box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.main-wrapper {
  height: 100%;
  &.dark {
    background: #000;
    color: #fff;
  }
}
.float-bar {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 16px;
  align-items: center;

  a,
  button {
    background: transparent;
    border: none;
    outline: none;
    font-size: 20px;
    color: inherit;
    cursor: pointer;
    opacity: 0.4;
    text-decoration: none;
    padding: 0;
    line-height: 1;

    &:active {
      opacity: 1;
    }
  }
}
</style>
