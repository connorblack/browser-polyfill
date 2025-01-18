import { EventEmitter } from 'fbemitter'

import './types'

// Import performanceNow with type assertion
const perfNow = require('fbjs/lib/performanceNow') as () => number

// Initialize performance now functions
if (!global.nativePerformanceNow) {
  global.nativePerformanceNow =
    global.nativePerformanceNow || global.performanceNow || perfNow
  global.performanceNow = global.performanceNow || global.nativePerformanceNow
}

// Create performance timing object
const timing: PerformanceTiming = {
  connectEnd: -1,
  connectStart: -1,
  domComplete: -1,
  domContentLoadedEventEnd: -1,
  domContentLoadedEventStart: -1,
  domInteractive: -1,
  domLoading: -1,
  domainLookupEnd: -1,
  domainLookupStart: -1,
  fetchStart: -1,
  loadEventEnd: -1,
  loadEventStart: -1,
  navigationStart: -1,
  redirectEnd: -1,
  redirectStart: -1,
  requestStart: -1,
  responseEnd: -1,
  responseStart: -1,
  secureConnectionStart: -1,
  unloadEventEnd: -1,
  unloadEventStart: -1,
  toJSON() {
    return this
  },
}

// Create performance navigation object
const navigation: PerformanceNavigation = {
  redirectCount: -1,
  type: -1,
  TYPE_NAVIGATE: 0 as const,
  TYPE_RELOAD: 1 as const,
  TYPE_BACK_FORWARD: 2 as const,
  TYPE_RESERVED: 255 as const,
  toJSON() {
    return this
  },
}

// Initialize performance if not exists
if (!window.performance || !window.performance.now) {
  const emitter = new EventEmitter()
  const subscriptions = new Map<
    EventListenerOrEventListenerObject,
    { remove: () => void }
  >()

  const performance: Performance = {
    timeOrigin: -1,
    timing,
    navigation,
    onresourcetimingbufferfull: null,
    eventCounts: {
      size: 0,
      [Symbol.iterator]() {
        return [][Symbol.iterator]()
      },
      entries() {
        return [][Symbol.iterator]()
      },
      forEach() {
        // Empty implementation
      },
      get() {
        return 0
      },
      has() {
        return false
      },
      keys() {
        return [][Symbol.iterator]()
      },
      values() {
        return [][Symbol.iterator]()
      },
    },

    // Event handling
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void {
      const wrapped =
        typeof listener === 'function' ? listener : (
          (event: Event) => listener.handleEvent(event)
        )

      const subscription = emitter.addListener(type, wrapped)
      subscriptions.set(listener, subscription)
    },

    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void {
      const subscription = subscriptions.get(listener)
      if (subscription) {
        subscription.remove()
        subscriptions.delete(listener)
      }
    },

    dispatchEvent(event: Event): boolean {
      emitter.emit(event.type, event)
      return true
    },

    // Performance methods
    now() {
      return global.nativePerformanceNow?.() ?? 0
    },
    toJSON() {
      return {
        timing: this.timing,
        navigation: this.navigation,
        timeOrigin: this.timeOrigin,
      }
    },

    // Performance entries
    mark(
      markName: string,
      markOptions?: PerformanceMarkOptions
    ): PerformanceMark {
      console.warn('window.performance.mark is not implemented')
      return {
        duration: 0,
        entryType: 'mark',
        name: markName,
        startTime: this.now(),
        detail: markOptions?.detail ?? null,
        toJSON() {
          return this
        },
      }
    },
    measure(
      measureName: string,
      startOrMeasureOptions?: string | PerformanceMeasureOptions,
      endMark?: string
    ): PerformanceMeasure {
      console.warn('window.performance.measure is not implemented')
      return {
        duration: 0,
        entryType: 'measure',
        name: measureName,
        startTime: 0,
        detail: null,
        toJSON() {
          return this
        },
      }
    },

    // Resource timing
    clearResourceTimings(): void {
      console.warn('window.performance.clearResourceTimings is not implemented')
    },
    setResourceTimingBufferSize(maxSize: number): void {
      console.warn(
        'window.performance.setResourceTimingBufferSize is not implemented'
      )
    },

    // Performance entries management
    clearMarks(markName?: string): void {
      console.warn('window.performance.clearMarks is not implemented')
    },
    clearMeasures(measureName?: string): void {
      console.warn('window.performance.clearMeasures is not implemented')
    },
    getEntries(): PerformanceEntryList {
      console.warn('window.performance.getEntries is not implemented')
      return []
    },
    getEntriesByName(name: string, type?: string): PerformanceEntryList {
      console.warn('window.performance.getEntriesByName is not implemented')
      return []
    },
    getEntriesByType(type: string): PerformanceEntryList {
      console.warn('window.performance.getEntriesByType is not implemented')
      return []
    },
  }

  window.performance = performance
}

export default window.performance
