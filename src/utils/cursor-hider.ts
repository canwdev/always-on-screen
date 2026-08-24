import { useThrottleFn } from '@vueuse/core'

// 显示/隐藏回调类型：告知调用方目标元素应显示还是隐藏
export type ShowHideFnType = (arg0: { el: HTMLElement; isShow: boolean }) => void

// 鼠标自动隐藏工具
// 鼠标在目标元素上停止移动一段时间后自动隐藏（光标或元素），移动时恢复显示
export class CursorHider {
  // 隐藏延迟计时器 id，用于取消未触发的隐藏
  private hideTimerId: ReturnType<typeof setTimeout> | undefined = undefined
  // 目标元素（可为选择器或元素实例）
  private targetElement: HTMLElement
  // 显示/隐藏回调；未提供时直接修改目标元素的光标样式
  private visibilityHandler?: ShowHideFnType
  // 鼠标停止移动多久后隐藏（毫秒）
  private hideDelayMs: number
  // 节流后的 mousemove 处理器，避免频繁触发
  private throttledMouseMove: () => void

  constructor(
    target: string | HTMLElement,
    visibilityHandler?: ShowHideFnType,
    hideDelayMs = 1000,
  ) {
    // 支持通过选择器或元素本身指定目标
    this.targetElement = typeof target === 'string' ? document.querySelector(target)! : target
    this.visibilityHandler = visibilityHandler
    this.hideDelayMs = hideDelayMs
    // 预绑定 this，保证事件回调中 this 指向实例
    this.show = this.show.bind(this)
    this.onPointerLockChange = this.onPointerLockChange.bind(this)
    // 100ms 节流 mousemove，降低开销
    this.throttledMouseMove = useThrottleFn(this.show, 100)

    this.start()
  }

  // 隐藏目标元素/光标
  hide() {
    if (typeof this.visibilityHandler === 'function') {
      // 有自定义回调时交由调用方处理
      this.visibilityHandler({ el: this.targetElement, isShow: false })
    } else {
      // 否则直接把目标元素光标隐藏
      this.targetElement.style.cursor = 'none'
    }
  }

  // 显示目标元素/光标，并重启隐藏倒计时
  show() {
    if (document.pointerLockElement) {
      // 处于指针锁定状态时忽略，交给 onPointerLockChange 处理
      return
    }

    if (typeof this.visibilityHandler === 'function') {
      this.visibilityHandler({ el: this.targetElement, isShow: true })
    } else {
      // 恢复默认光标
      this.targetElement.style.cursor = ''
    }
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
    if (typeof this.visibilityHandler === 'function') {
      this.visibilityHandler({ el: this.targetElement, isShow: true })
    } else {
      this.targetElement.style.cursor = ''
    }
  }
}
