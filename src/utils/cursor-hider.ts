import { useThrottleFn } from '@vueuse/core'

// 显示/隐藏回调类型：告知调用方目标元素应显示还是隐藏
export type ShowHideFnType = (arg0: { el: HTMLElement; isShow: boolean }) => void

// 目标元素类型：单个/多个选择器或元素，以及它们的组合
export type CursorHiderTarget = string | HTMLElement | Array<string | HTMLElement>

// 解析目标为元素列表（选择器支持逗号分隔，例如 '.float-bar, .panel'）
const resolveTargets = (target: CursorHiderTarget): HTMLElement[] => {
  if (Array.isArray(target)) {
    return target.flatMap((t) => resolveTargets(t))
  }
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll<HTMLElement>(target))
  }
  return [target]
}

// 鼠标自动隐藏工具
// 鼠标停止移动一段时间后自动隐藏目标元素（可通过 .auto-hide-panel 样式控制外观），移动时恢复显示
export class CursorHider {
  // 隐藏延迟计时器 id，用于取消未触发的隐藏
  private hideTimerId: ReturnType<typeof setTimeout> | undefined = undefined
  // 目标（支持选择器、元素实例或它们的组合，每次显示/隐藏时重新解析）
  private target: CursorHiderTarget
  // 显示/隐藏回调；用于额外的副作用（如隐藏光标）
  private visibilityHandler?: ShowHideFnType
  // 鼠标停止移动多久后隐藏（毫秒）
  private hideDelayMs: number
  // 节流后的 mousemove 处理器，避免频繁触发
  private throttledMouseMove: () => void

  constructor(target: CursorHiderTarget, visibilityHandler?: ShowHideFnType, hideDelayMs = 1000) {
    this.target = target
    this.visibilityHandler = visibilityHandler
    this.hideDelayMs = hideDelayMs
    // 预绑定 this，保证事件回调中 this 指向实例
    this.show = this.show.bind(this)
    this.onPointerLockChange = this.onPointerLockChange.bind(this)
    // 100ms 节流 mousemove，降低开销
    this.throttledMouseMove = useThrottleFn(this.show, 100)

    this.start()
  }

  // 通过 .hidden 类切换所有目标元素的显示/隐藏（由 .auto-hide-panel 全局样式控制外观）
  private setVisibility(isShow: boolean) {
    for (const el of resolveTargets(this.target)) {
      el.classList.toggle('hidden', !isShow)
      this.visibilityHandler?.({ el, isShow })
    }
  }

  // 隐藏目标元素
  hide() {
    this.setVisibility(false)
  }

  // 显示目标元素，并重启隐藏倒计时
  show() {
    if (document.pointerLockElement) {
      // 处于指针锁定状态时忽略，交给 onPointerLockChange 处理
      return
    }

    this.setVisibility(true)
    this.resetHideTimer()
  }

  // 重置隐藏倒计时
  resetHideTimer() {
    clearTimeout(this.hideTimerId)
    this.hideTimerId = setTimeout(() => {
      this.hide()
    }, this.hideDelayMs)
  }

  // 指针锁定状态变化：进入锁定时直接隐藏，退出时恢复
  onPointerLockChange() {
    if (!document.pointerLockElement) {
      // 退出指针锁定
      // console.log('Exit pointer lock')
    } else {
      // 进入指针锁定，隐藏光标
      this.hide()
    }
  }

  // 开始监听并启动倒计时
  start() {
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
    document.addEventListener('mousemove', this.throttledMouseMove)
    this.resetHideTimer()
  }

  // 停止监听并恢复显示（用于组件卸载清理）
  stop() {
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.removeEventListener('mousemove', this.throttledMouseMove)
    clearTimeout(this.hideTimerId)
    this.setVisibility(true)
  }
}
