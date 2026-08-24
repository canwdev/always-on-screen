<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useFullscreen } from '@vueuse/core'

const canvas = ref<HTMLCanvasElement | null>(null)
const infoVisible = ref(false)

const infoText = ref('')

const { toggle: toggleFullscreen } = useFullscreen()

let ctx!: CanvasRenderingContext2D
let W = 0
let H = 0
let DPR = 1
const idx = ref(0)
let infoTimer: ReturnType<typeof setTimeout> | undefined

// ---------- drawing helpers ----------
const solid = (color: string) => {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, H)
}

const hgrad = (c1: string, c2: string) => {
  const g = ctx.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}
const vgrad = (c1: string, c2: string) => {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}
const diaggrad = (c1: string, c2: string) => {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}
const radialgrad = (c1: string, c2: string) => {
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 2)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// rainbow horizontal
const rainbow = () => {
  const colors = [
    '#ff0000',
    '#ff8800',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#0088ff',
    '#0000ff',
    '#8800ff',
    '#ff00ff',
  ]
  const g = ctx.createLinearGradient(0, 0, W, 0)
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// grayscale gradient
const graygrad = () => {
  const g = ctx.createLinearGradient(0, 0, W, 0)
  for (let i = 0; i <= 10; i++) {
    const v = Math.round(i * 25.5)
    g.addColorStop(i / 10, `rgb(${v},${v},${v})`)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// grayscale vertical bands
const graybands = () => {
  const n = 16
  const bw = W / n
  for (let i = 0; i < n; i++) {
    const v = Math.round((i * 255) / (n - 1))
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(i * bw, 0, bw + 1, H)
  }
}

// RGB channels vertical
const rgbChannels = () => {
  const third = W / 3
  const rg = ctx.createLinearGradient(0, 0, 0, H)
  rg.addColorStop(0, '#000')
  rg.addColorStop(1, '#f00')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, third, H)
  const gg = ctx.createLinearGradient(0, 0, 0, H)
  gg.addColorStop(0, '#000')
  gg.addColorStop(1, '#0f0')
  ctx.fillStyle = gg
  ctx.fillRect(third, 0, third, H)
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#000')
  bg.addColorStop(1, '#00f')
  ctx.fillStyle = bg
  ctx.fillRect(2 * third, 0, third, H)
}

// CMY channels
const cmyChannels = () => {
  const third = W / 3
  const cg = ctx.createLinearGradient(0, 0, 0, H)
  cg.addColorStop(0, '#000')
  cg.addColorStop(1, '#0ff')
  ctx.fillStyle = cg
  ctx.fillRect(0, 0, third, H)
  const mg = ctx.createLinearGradient(0, 0, 0, H)
  mg.addColorStop(0, '#000')
  mg.addColorStop(1, '#f0f')
  ctx.fillStyle = mg
  ctx.fillRect(third, 0, third, H)
  const yg = ctx.createLinearGradient(0, 0, 0, H)
  yg.addColorStop(0, '#000')
  yg.addColorStop(1, '#ff0')
  ctx.fillStyle = yg
  ctx.fillRect(2 * third, 0, third, H)
}

// grid pattern
const grid = (color: string, spacing: number) => {
  solid('#000')
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= W; x += spacing) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
  }
  for (let y = 0; y <= H; y += spacing) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(W, y + 0.5)
  }
  ctx.stroke()
}

// concentric circles
const circles = (bg: string, fg: string) => {
  solid(bg)
  ctx.strokeStyle = fg
  ctx.lineWidth = 1
  const cx = W / 2
  const cy = H / 2
  const maxR = Math.max(W, H)
  for (let r = 10; r < maxR; r += 10) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

// crosshatch / convergence
const convergence = () => {
  solid('#000')
  const cx = W / 2
  const cy = H / 2
  const colors = ['#f00', '#0f0', '#00f']
  colors.forEach((col, idx) => {
    ctx.strokeStyle = col
    ctx.lineWidth = 2
    const off = (idx - 1) * 3
    ctx.beginPath()
    ctx.moveTo(0, cy + off)
    ctx.lineTo(W, cy + off)
    ctx.moveTo(cx + off, 0)
    ctx.lineTo(cx + off, H)
    ctx.stroke()
  })
  // center marker
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fill()
}

// checkerboard
const checker = (size: number) => {
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#fff' : '#000'
      ctx.fillRect(x, y, size, size)
    }
  }
}

// resolution lines (vertical)
const resLines = () => {
  solid('#000')
  for (let x = 0; x < W; x += 2) {
    ctx.fillStyle = x % 4 === 0 ? '#fff' : '#000'
    ctx.fillRect(x, 0, 1, H)
  }
}

// resolution lines horizontal
const resLinesH = () => {
  solid('#000')
  for (let y = 0; y < H; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? '#fff' : '#000'
    ctx.fillRect(0, y, W, 1)
  }
}

// dead pixel walk - 1px colored dots
const pixelWalk = () => {
  solid('#000')
  const colors = ['#f00', '#0f0', '#00f', '#fff']
  let ci = 0
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      ctx.fillStyle = colors[ci % colors.length]
      ctx.fillRect(x, y, 1, 1)
      ci++
    }
  }
}

// gradient with gamma steps
const gammaSteps = () => {
  solid('#808080')
  const n = 10
  const bw = W / n
  for (let i = 0; i < n; i++) {
    const v = Math.round(Math.pow(i / (n - 1), 2.2) * 255)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(i * bw, H * 0.3, bw, H * 0.4)
  }
  ctx.fillStyle = '#fff'
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  for (let i = 0; i < n; i++) {
    ctx.fillText(String(i), i * bw + bw / 2, H * 0.3 - 8)
  }
}

// perspective / geometry test
const perspective = () => {
  solid('#000')
  ctx.strokeStyle = '#0f0'
  ctx.lineWidth = 1
  const cx = W / 2
  const cy = H / 2
  // radial lines
  for (let a = 0; a < 360; a += 10) {
    const rad = (a * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(rad) * Math.max(W, H), cy + Math.sin(rad) * Math.max(W, H))
    ctx.stroke()
  }
  // perspective squares
  for (let s = 20; s < Math.max(W, H); s += 30) {
    ctx.strokeRect(cx - s / 2, cy - s / 2, s, s)
  }
}

// color bars (SMPTE-ish)
const colorBars = () => {
  const bars = ['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f', '#000']
  const bw = W / bars.length
  bars.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(i * bw, 0, bw + 1, H * 0.7)
  })
  // lower bars
  const lower = ['#00f', '#000', '#f0f', '#000', '#0ff', '#000', '#fff', '#000']
  lower.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(i * bw, H * 0.7, bw + 1, H * 0.3)
  })
}

// bleeding / overscan border
const overscan = () => {
  solid('#000')
  ctx.strokeStyle = '#f00'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, W - 4, H - 4)
  ctx.strokeStyle = '#0f0'
  ctx.lineWidth = 2
  ctx.strokeRect(20, 20, W - 40, H - 40)
  ctx.strokeStyle = '#00f'
  ctx.lineWidth = 1
  ctx.strokeRect(50, 50, W - 100, H - 100)
  // corner markers
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('TL', 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('TR', W - 8, 24)
  ctx.textAlign = 'left'
  ctx.fillText('BL', 8, H - 8)
  ctx.textAlign = 'right'
  ctx.fillText('BR', W - 8, H - 8)
  ctx.textAlign = 'center'
  ctx.fillText('OVERSCAN / ASPECT RATIO TEST', W / 2, H / 2)
}

// text readability
const textTest = () => {
  const g = ctx.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, '#000')
  g.addColorStop(0.5, '#888')
  g.addColorStop(1, '#fff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  const sizes = [8, 10, 12, 14, 18, 24, 32, 48, 64]
  sizes.forEach((s, i) => {
    ctx.font = `${s}px monospace`
    ctx.fillStyle = '#000'
    ctx.fillText(`Screen Test ${s}px ABCabc 0123`, W / 2, 60 + i * 70)
    ctx.fillStyle = '#fff'
    ctx.fillText(`Screen Test ${s}px ABCabc 0123`, W / 2, 60 + i * 70 + 2)
  })
}

// moire pattern
const moire = () => {
  solid('#000')
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 4) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + H, H)
    ctx.stroke()
  }
  for (let i = -H; i < W + H; i += 4) {
    ctx.beginPath()
    ctx.moveTo(i, H)
    ctx.lineTo(i + H, 0)
    ctx.stroke()
  }
}

// gradient banding test (smooth)
const smoothGrad = () => {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#1a0033')
  g.addColorStop(0.3, '#001a4d')
  g.addColorStop(0.6, '#00331a')
  g.addColorStop(1, '#331a00')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

// ---------- screen details ----------
const screenDetails = () => {
  solid('#111')
  const lines: Array<[string, string]> = [
    ['Screen', `${window.screen.width} × ${window.screen.height}`],
    ['Viewport', `${window.innerWidth} × ${window.innerHeight}`],
    ['Device Pixel Ratio', `${window.devicePixelRatio}x`],
    ['Color Depth', `${window.screen.colorDepth}-bit`],
    ['Pixel Depth', `${window.screen.pixelDepth}-bit`],
    [
      'Orientation',
      window.screen.orientation?.type ||
        `${window.screen.width < window.screen.height ? 'portrait' : 'landscape'}`,
    ],
    ['User Agent', window.navigator.userAgent],
  ]
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 30px monospace'
  ctx.fillText('SCREEN DETAILS', 20, 20)
  ctx.font = '16px monospace'
  const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    let line = ''
    const words = text.split(/\s+/)
    let nextY = y
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, nextY)
        line = word
        nextY += lineHeight
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, nextY)
    return nextY + lineHeight
  }
  let y = 70
  for (const [key, value] of lines) {
    ctx.fillStyle = '#888'
    ctx.fillText(`${key}:`, 20, y)
    y += 22
    ctx.fillStyle = '#fff'
    y = wrapText(value, 20, y, W - 40, 22)
  }
}

// ---------- test list ----------
const tests: Array<{ name: string; fn: () => void }> = [
  { name: 'Screen Details', fn: screenDetails },
  { name: 'White', fn: () => solid('#ffffff') },
  { name: 'Black', fn: () => solid('#000000') },
  { name: 'Red', fn: () => solid('#ff0000') },
  { name: 'Green', fn: () => solid('#00ff00') },
  { name: 'Blue', fn: () => solid('#0000ff') },
  { name: 'Cyan', fn: () => solid('#00ffff') },
  { name: 'Magenta', fn: () => solid('#ff00ff') },
  { name: 'Yellow', fn: () => solid('#ffff00') },
  { name: 'Gray 50%', fn: () => solid('#808080') },
  { name: 'Rainbow H-Grad', fn: rainbow },
  { name: 'Grayscale H-Grad', fn: graygrad },
  { name: 'Grayscale Bands', fn: graybands },
  { name: 'Black→White V-Grad', fn: () => vgrad('#000', '#fff') },
  { name: 'White→Black V-Grad', fn: () => vgrad('#fff', '#000') },
  { name: 'Red→Cyan H-Grad', fn: () => hgrad('#f00', '#0ff') },
  { name: 'Green→Magenta', fn: () => hgrad('#0f0', '#f0f') },
  { name: 'Blue→Yellow', fn: () => hgrad('#00f', '#ff0') },
  { name: 'Diagonal Grad', fn: () => diaggrad('#ff0000', '#0000ff') },
  { name: 'Radial Grad', fn: () => radialgrad('#fff', '#000') },
  { name: 'RGB Channels', fn: rgbChannels },
  { name: 'CMY Channels', fn: cmyChannels },
  { name: 'Smooth Dark Grad', fn: smoothGrad },
  { name: 'Gamma Steps', fn: gammaSteps },
  { name: 'Color Bars', fn: colorBars },
  { name: 'Grid 50px', fn: () => grid('#fff', 50) },
  { name: 'Grid 20px', fn: () => grid('#0f0', 20) },
  { name: 'Concentric Circles', fn: () => circles('#000', '#fff') },
  { name: 'Convergence', fn: convergence },
  { name: 'Checkerboard 40px', fn: () => checker(40) },
  { name: 'Checkerboard 8px', fn: () => checker(8) },
  { name: 'Vertical Lines 1px', fn: resLines },
  { name: 'Horizontal Lines', fn: resLinesH },
  { name: 'Pixel Walk', fn: pixelWalk },
  { name: 'Perspective', fn: perspective },
  { name: 'Overscan Border', fn: overscan },
  { name: 'Text Readability', fn: textTest },
  { name: 'Moire Pattern', fn: moire },
]

const showInfo = () => {
  infoText.value = `${idx.value + 1}/${tests.length} — ${tests[idx.value].name}`
  infoVisible.value = true
  clearTimeout(infoTimer)
  infoTimer = setTimeout(() => {
    infoVisible.value = false
  }, 1500)
}

const draw = () => {
  tests[idx.value].fn()
  showInfo()
}

const next = () => {
  idx.value = (idx.value + 1) % tests.length
  draw()
}
const prev = () => {
  idx.value = (idx.value - 1 + tests.length) % tests.length
  draw()
}

const onContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  prev()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
    e.preventDefault()
    next()
  } else if (e.code === 'ArrowLeft' || e.code === 'Backspace') {
    e.preventDefault()
    prev()
  } else if (e.key === 'Shift') {
    prev()
  } else if (e.key.toLowerCase() === 'f') {
    toggleFullscreen()
  } else if (e.key >= '0' && e.key <= '9') {
    // jump by 10
    const n = parseInt(e.key)
    idx.value = (idx.value + n) % tests.length
    draw()
  }
}

const resize = () => {
  if (!canvas.value) return
  DPR = window.devicePixelRatio || 1
  W = window.innerWidth
  H = window.innerHeight
  canvas.value.width = W * DPR
  canvas.value.height = H * DPR
  canvas.value.style.width = W + 'px'
  canvas.value.style.height = H + 'px'
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  draw()
}

onMounted(() => {
  ctx = canvas.value!.getContext('2d')!
  resize()
  canvas.value!.addEventListener('click', next)
  canvas.value!.addEventListener('contextmenu', onContextMenu)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  canvas.value!.removeEventListener('click', next)
  canvas.value!.removeEventListener('contextmenu', onContextMenu)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', resize)
  clearTimeout(infoTimer)
})
</script>

<template>
  <div class="screen-test">
    <canvas ref="canvas"></canvas>
    <div id="info" :class="{ show: infoVisible }">{{ infoText }}</div>
    <div id="hint" v-show="idx === 0">
      Click / Space = next | Right-click / Shift = previous | F = fullscreen
    </div>
  </div>
</template>

<style lang="scss" scoped>
.screen-test {
  width: 100%;
  height: 100%;
  background: #000;

  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }

  #info {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 8px 14px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 13px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s;
    max-width: 80vw;

    &.show {
      opacity: 1;
    }
  }

  #hint {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    color: #ccc;
    padding: 6px 16px;
    border-radius: 20px;
    font-family: sans-serif;
    font-size: 12px;
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
