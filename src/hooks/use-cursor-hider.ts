import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { CursorHider, type ShowHideFnType } from '@/utils/cursor-hider.ts'

// 鼠标不移动时，自动隐藏
export const useCursorHider = (
  target: Ref<HTMLElement | null | undefined> | string,
  showHideFn: ShowHideFnType,
  ms = 3000,
) => {
  let cursorHider: CursorHider | null = null

  onMounted(() => {
    const el = typeof target === 'string' ? target : target.value
    if (!el) return
    cursorHider = new CursorHider(el, showHideFn, ms)
  })

  onBeforeUnmount(() => {
    cursorHider?.stop()
  })
}
