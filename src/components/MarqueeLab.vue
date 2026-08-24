<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  useDevicePixelRatio,
  useEventListener,
  useRafFn,
  useStorage,
  useTimeoutFn,
  useWindowSize,
} from '@vueuse/core'

type Effect = {
  name: string
  draw: (
    g: CanvasRenderingContext2D,
    t: number,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    bw: number,
  ) => void
}

const effects: Effect[] = [
  {
    name: 'Prism Chase',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createLinearGradient(x, y, x + w, y + h)
      const shift = (t * 90) % 360
      grad.addColorStop(0, `hsl(${shift}, 100%, 58%)`)
      grad.addColorStop(0.24, `hsl(${shift + 65}, 100%, 62%)`)
      grad.addColorStop(0.5, `hsl(${shift + 135}, 100%, 58%)`)
      grad.addColorStop(0.74, `hsl(${shift + 215}, 100%, 62%)`)
      grad.addColorStop(1, `hsl(${shift + 300}, 100%, 58%)`)
      strokePath(g, x, y, w, h, r, bw, grad)
    },
  },
  {
    name: 'Rainbow Scan',
    draw: (g, t, x, y, w, h, r, bw) => {
      const hue = (t * 140) % 360
      const grad = g.createConicGradient(0, x + w / 2, y + h / 2)
      for (let i = 0; i <= 10; i++) {
        grad.addColorStop(i / 10, `hsl(${hue + i * 36}, 100%, ${58 + (i % 2) * 10}%)`)
      }
      strokePath(g, x, y, w, h, r, bw, grad)
    },
  },
  {
    name: 'Electric Cyan',
    draw: (g, t, x, y, w, h, r, bw) => {
      const sweep = Math.sin(t * 2.7) * 0.5 + 0.5
      const grad = g.createLinearGradient(x + w * (sweep - 0.6), y, x + w * (sweep + 0.6), y + h)
      grad.addColorStop(0, 'rgba(0,255,255,.08)')
      grad.addColorStop(0.45, '#00f6ff')
      grad.addColorStop(0.5, '#c9ffff')
      grad.addColorStop(0.55, '#00d9ff')
      grad.addColorStop(1, 'rgba(0,255,255,.08)')
      glowStroke(g, x, y, w, h, r, bw, grad, '#00eaff')
    },
  },
  {
    name: 'Laser Magenta',
    draw: (g, t, x, y, w, h, r, bw) => {
      const p = (t * 0.42) % 1
      const grad = g.createLinearGradient(x - w, y + h * p, x + w * 2, y + h * (p + 0.4))
      grad.addColorStop(0, 'rgba(255,0,190,0)')
      grad.addColorStop(0.46, '#ff2abf')
      grad.addColorStop(0.5, '#fff')
      grad.addColorStop(0.54, '#ff2abf')
      grad.addColorStop(1, 'rgba(255,0,190,0)')
      glowStroke(g, x, y, w, h, r, bw, grad, '#ff19b9')
    },
  },
  {
    name: 'Aurora Drift',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createLinearGradient(x, y, x + w, y + h)
      const a = Math.sin(t * 0.7) * 50
      grad.addColorStop(0, `hsl(${125 + a}, 95%, 56%)`)
      grad.addColorStop(0.33, `hsl(${185 + a}, 95%, 58%)`)
      grad.addColorStop(0.68, `hsl(${275 + a}, 92%, 62%)`)
      grad.addColorStop(1, `hsl(${325 + a}, 96%, 58%)`)
      g.save()
      g.globalCompositeOperation = 'screen'
      g.shadowBlur = 22
      g.shadowColor = 'rgba(100,255,230,.7)'
      strokePath(g, x, y, w, h, r, bw, grad)
      g.shadowBlur = 7
      strokePath(g, x, y, w, h, r, Math.max(1, bw * 0.36), 'rgba(255,255,255,.68)')
      g.restore()
    },
  },
  {
    name: 'Candy Twirl',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createConicGradient(t * 0.55, x + w / 2, y + h / 2)
      const stops: Array<[number, string]> = [
        [0, '#ff5ea7'],
        [0.18, '#ffd36a'],
        [0.35, '#77f2ff'],
        [0.52, '#8d7bff'],
        [0.7, '#ff7ee2'],
        [0.86, '#7fffd4'],
        [1, '#ff5ea7'],
      ]
      for (const [s, c] of stops) grad.addColorStop(s, c)
      strokePath(g, x, y, w, h, r, bw, grad)
    },
  },
  {
    name: 'Pixel Heat',
    draw: (g, t, x, y, w, h, r, bw) => {
      const cell = Math.max(10, Math.min(32, bw * 0.6))
      const offset = (t * 85) % (cell * 2)
      const grad = g.createLinearGradient(x - offset, y, x + w + cell - offset, y)
      for (let i = 0; i < 12; i++) {
        const hue = 8 + i * 10
        grad.addColorStop(i / 11, `hsl(${hue}, ${95 - i * 2}%, ${52 + (i % 2) * 10}%)`)
      }
      g.save()
      strokePath(g, x, y, w, h, r, bw, grad)
      g.globalAlpha = 0.23
      g.lineWidth = Math.max(1, bw * 0.22)
      g.beginPath()
      roundedRectPath(
        g,
        x + cell,
        y + cell,
        Math.max(0, w - cell * 2),
        Math.max(0, h - cell * 2),
        Math.max(0, r - cell),
      )
      g.strokeStyle = '#fff'
      g.setLineDash([cell, cell])
      g.lineDashOffset = -offset
      g.stroke()
      g.restore()
    },
  },
  {
    name: 'Orbit Gradient',
    draw: (g, t, x, y, w, h, r, bw) => {
      const cx = x + w / 2 + Math.cos(t * 0.9) * w * 0.12
      const cy = y + h / 2 + Math.sin(t * 1.1) * h * 0.12
      const grad = g.createRadialGradient(cx, cy, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.8)
      grad.addColorStop(0, '#fff')
      grad.addColorStop(0.08, '#8ffcff')
      grad.addColorStop(0.33, '#1fc8ff')
      grad.addColorStop(0.58, '#6f52ff')
      grad.addColorStop(0.81, '#fe4ec6')
      grad.addColorStop(1, 'rgba(255,80,190,.12)')
      glowStroke(g, x, y, w, h, r, bw, grad, '#7a7aff')
    },
  },
  {
    name: 'Sunset Dash',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createLinearGradient(x, y + h, x + w, y)
      grad.addColorStop(0, '#ff7b00')
      grad.addColorStop(0.22, '#ffd166')
      grad.addColorStop(0.48, '#ff4d6d')
      grad.addColorStop(0.72, '#9b5de5')
      grad.addColorStop(1, '#00c2ff')
      g.save()
      g.beginPath()
      roundedRectPath(g, x, y, w, h, r)
      g.setLineDash([Math.max(10, bw * 0.85), Math.max(7, bw * 0.52)])
      g.lineDashOffset = -t * 150
      g.lineWidth = bw
      g.strokeStyle = grad
      g.lineCap = 'butt'
      g.stroke()
      g.restore()
    },
  },
  {
    name: 'Spectral Glass',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createLinearGradient(x, y, x + w, y + h)
      const q = (t * 55) % 360
      grad.addColorStop(0, `hsla(${q},100%,70%,.25)`)
      grad.addColorStop(0.25, `hsla(${q + 50},100%,70%,.9)`)
      grad.addColorStop(0.5, `hsla(${q + 110},100%,80%,.45)`)
      grad.addColorStop(0.75, `hsla(${q + 200},100%,75%,.92)`)
      grad.addColorStop(1, `hsla(${q + 280},100%,70%,.25)`)
      g.save()
      strokePath(g, x, y, w, h, r, bw, grad)
      g.globalAlpha = 0.34
      strokePath(g, x, y, w, h, r, Math.max(1, bw * 0.22), '#fff')
      g.restore()
    },
  },
  {
    name: 'Strobe Ribbon',
    draw: (g, t, x, y, w, h, r, bw) => {
      const pulse = Math.max(0.18, Math.sin(t * 7) * 0.5 + 0.5)
      const grad = g.createLinearGradient(x, y, x + w, y + h)
      grad.addColorStop(0, `rgba(255,255,255,${0.16 + pulse * 0.24})`)
      grad.addColorStop(0.2, `rgba(255,0,110,${0.55 + pulse * 0.4})`)
      grad.addColorStop(0.45, `rgba(255,255,0,${0.55 + pulse * 0.35})`)
      grad.addColorStop(0.72, `rgba(0,255,235,${0.55 + pulse * 0.4})`)
      grad.addColorStop(1, `rgba(120,70,255,${0.55 + pulse * 0.3})`)
      glowStroke(g, x, y, w, h, r, bw, grad, `rgba(255,255,255,${0.25 + pulse * 0.2})`)
    },
  },
  {
    name: 'Quantum Noise',
    draw: (g, t, x, y, w, h, r, bw) => {
      const grad = g.createLinearGradient(x, y, x + w, y + h)
      const base = (t * 90) % 360
      for (let i = 0; i <= 14; i++) {
        const n = Math.sin((i + 1) * 19.37 + t * 3.1) * 28
        grad.addColorStop(i / 14, `hsl(${base + i * 24 + n}, 100%, ${55 + (i % 3) * 8}%)`)
      }
      g.save()
      g.beginPath()
      roundedRectPath(g, x, y, w, h, r)
      g.lineWidth = bw
      g.strokeStyle = grad
      g.setLineDash([Math.max(2, bw * 0.12), Math.max(8, bw * 0.36)])
      g.lineDashOffset = -t * 250
      g.globalAlpha = 0.92
      g.stroke()
      g.globalAlpha = 0.35
      g.lineWidth = Math.max(1, bw * 0.3)
      g.lineDashOffset = t * 165
      g.strokeStyle = '#fff'
      g.stroke()
      g.restore()
    },
  },
  {
    name: 'Inferno Bloom',
    draw: (g, t, x, y, w, h, r, bw) => {
      const sway = Math.sin(t * 0.8) * 18
      const grad = g.createRadialGradient(
        x + w * 0.5 + sway,
        y + h * 0.45,
        0,
        x + w * 0.5,
        y + h * 0.5,
        Math.max(w, h) * 0.9,
      )
      grad.addColorStop(0, '#fff5b0')
      grad.addColorStop(0.12, '#ffd166')
      grad.addColorStop(0.32, '#ff7b00')
      grad.addColorStop(0.55, '#ff3b30')
      grad.addColorStop(0.8, '#c81d25')
      grad.addColorStop(1, '#4a0610')
      glowStroke(g, x, y, w, h, r, bw, grad, '#ff4d00')
    },
  },
]

const canvas = ref<HTMLCanvasElement | null>(null)

const { width: winW, height: winH } = useWindowSize()
const { pixelRatio } = useDevicePixelRatio()
const minWH = computed(() => Math.min(winW.value, winH.value))

const settings = useStorage('marquee-lab-settings', {
  effect: { name: effects[0].name },
  thickness: 2,
  radius: 0,
  square: false,
})
const effectIndex = computed({
  get: () => {
    const i = effects.findIndex((e) => e.name === settings.value.effect.name)
    return i >= 0 ? i : 0
  },
  set: (v) => {
    const i = ((v % effects.length) + effects.length) % effects.length
    settings.value.effect = { name: effects[i].name }
  },
})
const effectName = computed<string>({
  get: () => effects[effectIndex.value].name,
  set: (name) => {
    const i = effects.findIndex((e) => e.name === name)
    if (i >= 0) effectIndex.value = i
  },
})
const thicknessPct = computed({
  get: () => settings.value.thickness,
  set: (v) => {
    settings.value.thickness = v
  },
})
const radiusPct = computed({
  get: () => settings.value.radius,
  set: (v) => {
    settings.value.radius = v
  },
})
const square = computed({
  get: () => settings.value.square,
  set: (v) => {
    settings.value.square = v
  },
})

const toastText = ref('')
const toastVisible = ref(false)

const thickness = computed(() => (thicknessPct.value / 100) * minWH.value)
const radius = computed(() => (radiusPct.value / 100) * minWH.value)

const currentEffect = computed(() => effects[effectIndex.value])
const modePill = computed(
  () =>
    `${String(effectIndex.value + 1).padStart(2, '0')} / ${String(effects.length).padStart(2, '0')}`,
)

const { start: startToastTimer } = useTimeoutFn(() => {
  toastVisible.value = false
}, 900)

let ctx: CanvasRenderingContext2D | null = null

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const clampInput = (v: number, lo: number, hi: number) => (Number.isNaN(v) ? lo : clamp(v, lo, hi))

function roundedRectPath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  if (r === 0) {
    g.rect(x, y, w, h)
    return
  }
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + r, r)
  g.arcTo(x + w, y + h, x + w - r, y + h, r)
  g.arcTo(x, y + h, x, y + h - r, r)
  g.arcTo(x, y, x + r, y, r)
  g.closePath()
}

function ringPath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  bw: number,
) {
  const half = bw / 2
  g.beginPath()
  roundedRectPath(g, x - half, y - half, w + bw, h + bw, r + half)
  const iw = w - bw
  const ih = h - bw
  if (iw > 0 && ih > 0) {
    roundedRectPath(g, x + half, y + half, iw, ih, r)
  }
}

function strokePath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  bw: number,
  style: string | CanvasGradient,
) {
  g.save()
  ringPath(g, x, y, w, h, r, bw)
  g.fillStyle = style
  g.fill('evenodd')
  g.restore()
}

function glowStroke(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  bw: number,
  style: string | CanvasGradient,
  glow: string,
) {
  g.save()
  g.shadowBlur = Math.max(12, bw * 0.95)
  g.shadowColor = glow
  ringPath(g, x, y, w, h, r, bw)
  g.fillStyle = style
  g.fill('evenodd')
  g.shadowBlur = Math.max(4, bw * 0.28)
  g.shadowColor = '#fff'
  g.globalAlpha = 0.22
  ringPath(g, x, y, w, h, r, Math.max(1, bw * 0.2))
  g.fillStyle = '#fff'
  g.fill('evenodd')
  g.restore()
}

function borderRect() {
  const inset = thickness.value * 0.5 + 1
  if (square.value) {
    const side = Math.max(0, minWH.value - inset * 2)
    return {
      x: (winW.value - side) / 2,
      y: (winH.value - side) / 2,
      w: side,
      h: side,
      r: Math.min(radius.value, side / 2),
    }
  }
  return {
    x: inset,
    y: inset,
    w: Math.max(0, winW.value - inset * 2),
    h: Math.max(0, winH.value - inset * 2),
    r: Math.min(radius.value, minWH.value / 2),
  }
}

function resize() {
  if (!canvas.value) return
  const dpr = pixelRatio.value
  canvas.value.width = Math.round(winW.value * dpr)
  canvas.value.height = Math.round(winH.value * dpr)
  canvas.value.style.width = `${winW.value}px`
  canvas.value.style.height = `${winH.value}px`
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

useRafFn(({ timestamp }) => {
  if (!ctx) return
  const dpr = pixelRatio.value
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, winW.value, winH.value)
  const rect = borderRect()
  currentEffect.value.draw(
    ctx,
    timestamp / 1000,
    rect.x,
    rect.y,
    rect.w,
    rect.h,
    rect.r,
    thickness.value,
  )
})

watch([winW, winH, pixelRatio], resize)

const showToast = (text: string) => {
  toastText.value = text
  toastVisible.value = true
  startToastTimer()
}

const changeEffect = (delta: number) => {
  effectIndex.value = (effectIndex.value + delta + effects.length) % effects.length
  showToast(
    `Effect ${String(effectIndex.value + 1).padStart(2, '0')} · ${effects[effectIndex.value].name}`,
  )
}

const onSquareChange = () => {
  showToast(square.value ? 'Square frame · ON' : 'Square frame · OFF')
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = Math.sign(e.deltaY) || 0
  if (e.shiftKey) {
    radiusPct.value = clampInput(radiusPct.value - delta * 0.5, 0, 100)
    showToast(`Corner radius · ${radiusPct.value.toFixed(1)}%`)
  } else {
    thicknessPct.value = clampInput(thicknessPct.value - delta * 0.5, 0.5, 50)
    showToast(`Border thickness · ${thicknessPct.value.toFixed(1)}%`)
  }
}

const onContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  changeEffect(-1)
}

const onWheelClamp = () => {
  thicknessPct.value = clampInput(thicknessPct.value, 0.5, 50)
}
const onRadiusClamp = () => {
  radiusPct.value = clampInput(radiusPct.value, 0, 100)
}

useEventListener(canvas, 'click', (e) => {
  if (e.button === 0) changeEffect(1)
})
useEventListener(canvas, 'contextmenu', onContextMenu)
useEventListener(canvas, 'wheel', onWheel, { passive: false })
useEventListener(document, 'contextmenu', (e) => e.preventDefault())

onMounted(() => {
  ctx = canvas.value?.getContext('2d', { alpha: false }) ?? null
  resize()
})
</script>

<template>
  <div class="marquee-lab">
    <canvas ref="canvas"></canvas>

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">Marquee Lab</div>
        <div class="mode-pill">{{ modePill }}</div>
      </div>

      <div class="row">
        <label class="label" for="effect-select">Effect</label>
        <select id="effect-select" v-model="effectName" class="value-input effect-select">
          <option v-for="effect in effects" :key="effect.name" :value="effect.name">
            {{ effect.name }}
          </option>
        </select>
      </div>

      <div class="row">
        <label class="label" for="thickness-input">Border thickness</label>
        <div class="input-wrap">
          <input
            id="thickness-input"
            v-model.number="thicknessPct"
            class="value-input"
            type="number"
            min="0.5"
            max="50"
            step="0.5"
            @change="onWheelClamp"
          />
          <span class="suffix">%</span>
        </div>
      </div>

      <div class="row">
        <label class="label" for="radius-input">Corner radius</label>
        <div class="input-wrap">
          <input
            id="radius-input"
            v-model.number="radiusPct"
            class="value-input"
            type="number"
            min="0"
            max="100"
            step="0.5"
            @change="onRadiusClamp"
          />
          <span class="suffix">%</span>
        </div>
      </div>

      <div class="row">
        <label class="toggle">
          <input v-model="square" type="checkbox" @change="onSquareChange" />
          <span>Square frame</span>
        </label>
        <div class="value">{{ square ? 'ON' : 'OFF' }}</div>
      </div>

      <div class="hint">
        Left click → next · Right click → previous · Wheel → thickness · Shift + wheel → corner
        radius.
      </div>
    </div>

    <transition name="toast">
      <div v-if="toastVisible" class="toast">{{ toastText }}</div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.marquee-lab {
  width: 100%;
  height: 100%;
  background: #000;
  color: #f5f7fb;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;

  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }

  .panel {
    position: fixed;
    right: 18px;
    bottom: 60px;
    z-index: 5;
    width: min(330px, calc(100vw - 36px));
    padding: 14px 15px 13px;
    background: rgba(12, 14, 20, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.38);
    user-select: none;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .panel-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.88);
  }

  .mode-pill {
    font-size: 11px;
    padding: 4px 7px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    font-variant-numeric: tabular-nums;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 7px 0;
  }

  .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.82);
  }

  .value {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.56);
    font-variant-numeric: tabular-nums;
  }

  .input-wrap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .value-input {
    width: 64px;
    padding: 4px 8px;
    border-radius: 7px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    outline: none;

    &:focus {
      border-color: rgba(255, 255, 255, 0.42);
    }
  }

  .effect-select {
    width: 150px;
    text-align: left;

    option {
      background: #14161d;
      color: #fff;
    }
  }

  .suffix {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.56);
  }

  .hint {
    margin-top: 9px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 11px;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.48);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.82);

    input {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.04);
      display: grid;
      place-items: center;
      margin: 0;

      &::after {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 2px;
        transform: scale(0);
        transition: transform 0.12s ease;
        background: white;
      }

      &:checked {
        background: rgba(255, 255, 255, 0.14);

        &::after {
          transform: scale(1);
        }
      }
    }
  }

  .toast {
    position: fixed;
    left: 50%;
    top: 22px;
    transform: translateX(-50%);
    z-index: 10;
    padding: 9px 12px;
    border-radius: 999px;
    background: rgba(10, 12, 18, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    pointer-events: none;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -18px);
  }
}
</style>
