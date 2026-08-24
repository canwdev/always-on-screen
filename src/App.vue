<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useFullscreen, useWakeLock } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { themeMode, themeState } from '@/stores/states.ts'
import { useCursorHider } from '@/hooks/use-cursor-hider.ts'

const { toggle: toggleFullscreen } = useFullscreen()

const { isSupported, isActive, request, release } = useWakeLock()

const floatBarHidden = ref(false)
const mainWrapper = ref<HTMLElement | null>(null)

onMounted(() => {
  if (isSupported.value) request('screen')
})
const toggleWakeLock = () => {
  if (isActive.value) release()
  else request('screen')
}

useCursorHider('.float-bar', ({ isShow }) => {
  floatBarHidden.value = !isShow
  if (mainWrapper.value) {
    mainWrapper.value.style.cursor = isShow ? '' : 'none'
  }
})

const themes = ['auto', 'light', 'dark'] as const
const themeEmoji = computed(() => {
  switch (themeMode.value) {
    case 'dark':
      return '🌙'
    case 'light':
      return '☀️'
    default:
      return '🌓'
  }
})
const cycleTheme = () => {
  const i = themes.indexOf(themeMode.value)
  themeMode.value = themes[(i + 1) % themes.length]
}
</script>

<template>
  <div ref="mainWrapper" class="main-wrapper" :class="{ dark: themeState === 'dark' }">
    <RouterView />
    <div class="float-bar" :class="{ hidden: floatBarHidden }">
      <RouterLink class="link-item" to="/">🏠</RouterLink>

      <button :title="`Theme: ${themeMode}`" @click="cycleTheme">{{ themeEmoji }}</button>
      <button :title="isActive ? 'Wake lock active' : 'Wake lock off'" @click="toggleWakeLock">
        {{ isActive ? '⚡' : '💤' }}
      </button>
      <button title="Fullscreen" @click="toggleFullscreen">⛶</button>
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
  opacity: 1;
  transition: opacity 0.3s;

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }

  a,
  button {
    background: transparent;
    border: none;
    outline: none;
    font-size: 20px;
    color: inherit;
    cursor: pointer;
    opacity: 0.6;
    text-decoration: none;
    padding: 0;
    line-height: 1;

    &:active,
    &:hover {
      opacity: 1;
    }
  }
}
</style>
