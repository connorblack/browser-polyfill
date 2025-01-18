// src/window.ts

import './types'

import CanvasRenderingContext2D from 'expo-2d-context'
import { EventEmitter } from 'fbemitter'
import { TextDecoder, TextEncoder } from 'text-encoding'

import HTMLCanvasElement from './DOM/HTMLCanvasElement'

import './performance' // Side-effect import for performance polyfills

import HTMLImageElement from './DOM/HTMLImageElement'
import HTMLVideoElement from './DOM/HTMLVideoElement'

// Assign global DOM-like constructors if they are not already defined
global.HTMLImageElement = global.HTMLImageElement || HTMLImageElement
global.Image = global.Image || HTMLImageElement
global.ImageBitmap = global.ImageBitmap || HTMLImageElement
global.HTMLVideoElement = global.HTMLVideoElement || HTMLVideoElement
global.Video = global.Video || HTMLVideoElement
global.HTMLCanvasElement = global.HTMLCanvasElement || HTMLCanvasElement
global.Canvas = global.Canvas || HTMLCanvasElement
global.CanvasRenderingContext2D =
  global.CanvasRenderingContext2D || CanvasRenderingContext2D

/**
 * Ensures window.emitter is an EventEmitter instance.
 */
function checkEmitter(): void {
  if (
    !window.emitter ||
    !(
      window.emitter.on ||
      window.emitter.addEventListener ||
      window.emitter.addListener
    )
  ) {
    window.emitter = new EventEmitter()
  }
}

/**
 * Polyfill scrollTo with a no-op function.
 * A real DOM signature would accept (x?: number, y?: number) => void
 */
window.scrollTo =
  window.scrollTo ||
  (() => {
    /* no-op */
  })

/**
 * Polyfill addEventListener on window to use fbemitter internally.
 */
if (!window.addEventListener) {
  window.addEventListener = ((
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void => {
    checkEmitter()

    const addListener = () => {
      const emitter = window.emitter
      if (emitter.on && typeof emitter.on === 'function') {
        emitter.on(eventName, listener as Function)
      } else if (
        emitter.addEventListener &&
        typeof emitter.addEventListener === 'function'
      ) {
        emitter.addEventListener(eventName as any, listener as any, options)
      } else if (
        emitter.addListener &&
        typeof emitter.addListener === 'function'
      ) {
        emitter.addListener(eventName, listener as Function)
      }
    }

    addListener()

    // Simulate the DOM's behavior where 'load' events can fire soon after script execution
    if (eventName.toLowerCase() === 'load') {
      const emitter = window.emitter
      if (emitter && typeof emitter.emit === 'function') {
        setTimeout(() => {
          if (emitter.emit) {
            emitter.emit('load')
          }
        }, 1)
      }
    }
  }) as typeof window.addEventListener
}

/**
 * Polyfill removeEventListener on window to remove listener from fbemitter.
 */
if (!window.removeEventListener) {
  window.removeEventListener = ((
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void => {
    checkEmitter()
    const emitter = window.emitter
    if (emitter.off && typeof emitter.off === 'function') {
      emitter.off(eventName, listener as Function)
    } else if (
      emitter.removeEventListener &&
      typeof emitter.removeEventListener === 'function'
    ) {
      emitter.removeEventListener(eventName as any, listener as any, options)
    } else if (
      emitter.removeListener &&
      typeof emitter.removeListener === 'function'
    ) {
      emitter.removeListener(eventName, listener as Function)
    }
  }) as typeof window.removeEventListener
}

/**
 * Ensure DOMParser is available on window. Usually from xmldom-qsa.
 */
window.DOMParser = window.DOMParser || require('xmldom-qsa').DOMParser

/**
 * Ensure TextDecoder and TextEncoder are defined globally.
 */
global.TextDecoder = global.TextDecoder || TextDecoder
global.TextEncoder = global.TextEncoder || TextEncoder

/**
 * Set userAgent on global, then unify navigator’s userAgent too.
 */
const agent = 'chrome'
global.userAgent = global.userAgent || agent
;(global.navigator as any).userAgent = global.navigator.userAgent || agent
;(global.navigator as any).product = 'ReactNative'
;(global.navigator as any).platform = global.navigator.platform || []
;(global.navigator as any).appVersion = global.navigator.appVersion || 'OS10'
;(global.navigator as any).maxTouchPoints = global.navigator.maxTouchPoints || 5
;(global.navigator as any).standalone =
  global.navigator.standalone === null ? true : global.navigator.standalone

/**
 * Basic stub for window.chrome to avoid code that expects it existing.
 */
window.chrome = window.chrome || {
  extension: {},
}

// Provide a minimal location object if not defined (React Native environment).
if (!window.location) {
  window.location = {
    href: '',
    hostname: '',
    pathname: '',
    protocol: 'https',
    assign: () => {},
    hash: '',
    host: '',
    origin: '',
    port: '',
    search: '',
    reload: () => {},
    replace: () => {},
    toString: () => '',
    ancestorOrigins: [] as unknown as DOMStringList,
  } as Location
}

// If global.document exists, mark it as ready.
if (global.document) {
  global.document.readyState = 'complete'
}

/**
 * 1) Minimal getComputedStyle stub that returns a style object
 */
if (!window.getComputedStyle) {
  window.getComputedStyle = ((element: Element) => ({
    getPropertyValue: (prop: string) => (element as any).style?.[prop] || '',
    cssText: '',
    parentRule: null,
    getPropertyPriority: () => '',
    item: () => '',
    removeProperty: () => '',
    setProperty: () => undefined,
    ...Array.prototype,
  })) as unknown as (
    elt: Element,
    pseudoElt?: string | null
  ) => CSSStyleDeclaration
}

/**
 * 2) Minimal matchMedia stub returning an object with "matches" and "addListener"/"removeListener".
 */
if (!window.matchMedia) {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => {
      return {
        matches: false, // or some logic if you want to parse the query
        media: query,
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
      }
    })
}

/**
 * 3) requestAnimationFrame / cancelAnimationFrame stubs using setTimeout/clearTimeout
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(
      () => callback(performance.now()),
      16
    ) as unknown as number
  }
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (handle: number) => {
    clearTimeout(handle)
  }
}

/**
 * 4) scrollBy / resizeTo stubs
 */
if (!window.scrollBy) {
  window.scrollBy =
    window.scrollBy ||
    ((x: number, y: number) => {
      // no-op, but avoids crashes
    })
}

if (!window.resizeTo) {
  window.resizeTo =
    window.resizeTo ||
    ((width: number, height: number) => {
      // no-op
    })
}
