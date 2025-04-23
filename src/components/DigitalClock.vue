<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import moment from 'moment'

moment.locale(navigator.language || 'zh-CN')

// 定义响应式数据
const lastDateText = ref('')
const timeout = ref<number | null>(null)
const accTime = ref('--:--:--')
const accDate = ref('')

// 定义 timer 函数
const timer = (callback: () => void) => {
  const step = () => {
    const dt = Date.now() - expected // the drift (positive for overshooting)
    if (dt > interval) {
      console.warn(
        'something really bad happened. Maybe the browser (tab) was inactive?\npossibly special handling to avoid futile "catch up" run',
      )
    }
    callback()
    expected += interval
    timeout.value = setTimeout(step, Math.max(0, interval - dt)) // take into account drift
  }

  const interval = 1000
  let expected = Date.now() + interval
  timeout.value = setTimeout(step, interval)
}

// 定义 updateTime 函数
const updateTime = () => {
  const dt = new Date()
  accTime.value = moment(dt).format('HH:mm:ss')

  const dateText = moment(dt).format('LL dddd')
  if (dateText !== lastDateText.value) {
    accDate.value = dateText
    lastDateText.value = dateText
  }
}

// 生命周期钩子
onMounted(() => {
  updateTime()
  timer(updateTime)
})

onUnmounted(() => {
  if (timeout.value) {
    clearTimeout(timeout.value)
  }
})
</script>

<template>
  <div class="clock-wrapper" :class="{ 'is-mini': false }">
    <div class="clock-centered">
      <h1>{{ accTime }}</h1>
      <h2>{{ accDate }}</h2>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.clock-wrapper {
  height: 100vh;
  width: 100%;
  position: relative;
  user-select: none;
  font-family: sans-serif;

  .clock-centered {
    overflow: hidden;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    text-align: center;

    h1,
    h2 {
      margin: 0;
    }

    h1 {
      font-size: 16vw;
      font-weight: bolder;
      line-height: 1.1;
    }

    h2 {
      font-size: 6vw;
      font-weight: normal;
    }
  }

  &.is-mini {
    .clock-centered {
      h1 {
        font-size: 23px;
      }

      h2 {
        font-size: 12px;
      }
    }
  }
}
</style>
