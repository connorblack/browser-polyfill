import { EventEmitter } from 'fbemitter'
import { DOMParser } from 'xmldom-qsa'

/**
 * Narrow function type for adding a window-level event listener,
 * referencing WindowEventMap from the DOM library.
 */
type WindowEventListener = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) => void

/**
 * EventEmitter-like interface capturing the variants we might use.
 */
export interface EmitterLike {
  on?: (eventName: string, listener: Function) => void
  off?: (eventName: string, listener: Function) => void
  addEventListener?: WindowEventListener
  removeEventListener?: WindowEventListener
  addListener?: (eventName: string, listener: Function) => void
  removeListener?: (eventName: string, listener: Function) => void
  emit?: (eventName: string, ...args: any[]) => void
}

export type EventName = keyof WindowEventMap

/**
 * Interface representing the global object in a React Native or Node-like
 * environment with partial DOM polyfills.
 */
interface Global {
  HTMLImageElement: typeof HTMLImageElement
  Image: typeof HTMLImageElement
  ImageBitmap: typeof HTMLImageElement
  HTMLVideoElement: typeof HTMLVideoElement
  Video: typeof HTMLVideoElement
  HTMLCanvasElement: typeof HTMLCanvasElement
  Canvas: typeof HTMLCanvasElement
  CanvasRenderingContext2D: typeof CanvasRenderingContext2D
  TextDecoder: typeof TextDecoder
  TextEncoder: typeof TextEncoder
  userAgent: string
  navigator: Navigator
  document?: { readyState: string }
  __context?: unknown
  __EXPO_BROWSER_POLYFILL_RESIZE?: boolean
  nativePerformanceNow?: () => number
  performanceNow?: () => number
}

declare global {
  interface Navigator {
    standalone?: boolean | null
  }

  interface CustomLocation {
    href: string
    hostname: string
    pathname: string
    protocol: string
    assign: null
  }

  interface Window {
    emitter: EmitterLike
    chrome: { extension: Record<string, unknown> }
    DOMParser: typeof DOMParser
    __orientationDegrees?: number
    clientWidth: number
    clientHeight: number
    performance: Performance
  }

  // Extending NodeJS global. This merges with the standard NodeJS.Global.
  // If your environment is purely RN, you can keep this as is.
  // If on Node, consider naming collisions with the real NodeJS.Global.
  var global: Global
}

export {}
