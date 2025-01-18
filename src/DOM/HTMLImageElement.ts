// src/DOM/HTMLImageElement.ts

import '../types'

import * as FileSystem from 'expo-file-system'
import { Image } from 'react-native'
import { v1 as uuidv1 } from 'uuid'

import Element from './Element'

const { writeAsStringAsync, documentDirectory } = FileSystem

/**
 * In some versions of Expo, FileSystem.EncodingType might be named differently,
 * or it might be re-exported under FileSystem.EncodingTypes. You may need to
 * tweak this if your Expo version differs.
 */
const EncodingType =
  FileSystem.EncodingType || (FileSystem as any).EncodingTypes

// Define a small lookup table for base64 MIME extensions.
const b64Extensions: Record<string, string> = {
  '/': 'jpg',
  i: 'png',
  R: 'gif',
  U: 'webp',
}

/**
 * Removes the data URI prefix, returning only the Base64-encoded portion.
 */
function b64WithoutPrefix(b64: string): string {
  return b64.split(',')[1]
}

/**
 * Determines the MIME type/extension from the first character of the base64 string.
 * Throws if it cannot be determined.
 */
function getMIMEforBase64String(b64: string): string {
  let input = b64
  if (b64.includes(',')) {
    input = b64WithoutPrefix(b64)
  }
  const first = input.charAt(0)
  const mime = b64Extensions[first]
  if (!mime) {
    throw new Error(`Unknown Base64 MIME type: ${b64}`)
  }
  return mime
}

/**
 * Constructor props for HTMLImageElement.
 */
export interface HTMLImageElementProps {
  localUri?: string
  width?: number
  height?: number
}

class HTMLImageElement extends Element {
  // Backing fields
  private _base64?: string
  private _onload: () => void = () => {}
  private _complete?: boolean
  // Public properties
  public localUri?: string
  public width?: number
  public height?: number

  constructor(props?: HTMLImageElementProps | string) {
    const tagName = typeof props === 'string' ? props : 'img'
    super(tagName)
    this._load = this._load.bind(this)

    if (props && typeof props === 'object') {
      const { localUri, width, height } = props
      this.src = localUri
      this.width = width
      this.height = height
      this._load()
    }
  }

  /**
   * Getters and setters
   */
  public get src(): string | undefined {
    return this.localUri
  }

  public set src(value: string | undefined) {
    this.localUri = value
    this._load()
  }

  public get onload(): () => void {
    return this._onload
  }

  public set onload(value: () => void) {
    this._onload = value
  }

  public get complete(): boolean {
    return this._complete === true
  }

  public set complete(value: boolean) {
    this._complete = value
    if (value) {
      // Emitting "load" event
      if (this.emitter && this.emitter.emit) {
        this.emitter.emit('load', this)
      }
      this.onload()
    }
  }

  /**
   * Internal method to load the image. If the src is a data URI, it attempts
   * to convert it to a local URI using Expo's FileSystem.
   */
  private _load(): void {
    if (!this.src) {
      return
    }

    // Check for base64 data URI
    if (typeof this.src === 'string' && this.src.startsWith('data:')) {
      // Convert base64 data URI to an actual local file and reload
      this._base64 = this.src
      const base64result = b64WithoutPrefix(this.src)
      ;(async () => {
        try {
          const mime = getMIMEforBase64String(base64result)
          this.localUri = `${documentDirectory}${uuidv1()}-b64image.${mime}`
          await writeAsStringAsync(this.localUri, base64result, {
            encoding: EncodingType.Base64,
          })
          this._load()
        } catch (error: any) {
          // (optional) debug logging
          if ((global as any).__debug_browser_polyfill_image) {
            console.log(`@expo/browser-polyfill: Error:`, error.message)
          }
          // Emit an error event
          if (this.emitter && this.emitter.emit) {
            this.emitter.emit('error', { target: this, error })
          }
        }
      })()
      return
    }

    // If we don't have width and height yet, attempt to get them via Image.getSize
    if (!this.width || !this.height) {
      this.complete = false

      if (this.emitter && this.emitter.emit) {
        this.emitter.emit('loading', this)
      }

      Image.getSize(
        this.src,
        (width: number, height: number) => {
          this.width = width
          this.height = height
          this.complete = true
        },
        () => {
          if (this.emitter && this.emitter.emit) {
            this.emitter.emit('error', { target: this })
          }
        }
      )
    } else {
      // If width and height are already set, we can mark this as complete
      this.complete = true
    }
  }
}

export default HTMLImageElement
