import { Dimensions } from 'react-native'

import './types'

/**
 * We need to augment the global `window` object with the fields we are using:
 *   - devicePixelRatio
 *   - innerWidth
 *   - clientWidth
 *   - innerHeight
 *   - clientHeight
 *   - __orientationDegrees (a numeric representation for orientation)
 *   - emitter (optional, for emitting events)
 *
 * We also optionally track `__EXPO_BROWSER_POLYFILL_RESIZE` on the global object.
 *
 * Create a global type augmentation. You can place this block in a dedicated
 * *.d.ts file if you prefer, or inline it in this file before any code
 * that references these fields.
 */

// Retrieve the window dimensions from React Native
const { width, height, scale } = Dimensions.get('window')

// Initialize/override window properties
window.devicePixelRatio = scale
window.innerWidth = width
window.clientWidth = width
window.innerHeight = height
window.clientHeight = height

// Ensure window.screen exists
window.screen = window.screen || ({} as Screen)

// Initialize orientation degrees
if (typeof window.__orientationDegrees === 'undefined') {
  window.__orientationDegrees = width < height ? 0 : 90
}

// Only attach the listener once
if (!global.__EXPO_BROWSER_POLYFILL_RESIZE) {
  global.__EXPO_BROWSER_POLYFILL_RESIZE = true

  Dimensions.addEventListener(
    'change',
    ({ screen: { width, height, scale } }) => {
      window.devicePixelRatio = scale
      window.innerWidth = width
      window.clientWidth = width
      window.innerHeight = height
      window.clientHeight = height

      // Update orientation degrees
      window.__orientationDegrees = width < height ? 0 : 90

      // If you have a global window emitter, emit "resize"
      if (window.emitter && typeof window.emitter.emit === 'function') {
        window.emitter.emit('resize')
      }
    }
  )
}

export {} // Ensures this file is treated as an ES module
