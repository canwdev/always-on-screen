import { isRef, onBeforeUnmount, onMounted, type Ref } from 'vue'
import { CursorHider, type CursorHiderTarget, type ShowHideFnType } from '@/utils/cursor-hider.ts'

// 鼠标不移动时，自动隐藏
export const useCursorHider = (
  target: Ref<CursorHiderTarget | null | undefined> | CursorHiderTarget,
  showHideFn?: ShowHideFnType,
  ms = 3000,
) => {
  let cursorHider: CursorHider | null = null

  onMounted(() => {
    const el = isRef(target) ? target.value : target
    if (!el) return
    cursorHider = new CursorHider(el, showHideFn, ms)
  })

  onBeforeUnmount(() => {
    cursorHider?.stop()
  })
}
