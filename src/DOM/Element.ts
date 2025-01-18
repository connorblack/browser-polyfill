// src/DOM/Element.ts

import '../types'

import CanvasRenderingContext2D, { Expo2dContextOptions } from 'expo-2d-context'

import Node from './Node'

/**
 * A minimal doc interface stub used by this polyfill.
 */
interface ElementDoc {
  body: {
    innerHTML: string
  }
}

/**
 * Basic DOM-like Element that extends the Node polyfill.
 */
export default class Element extends Node {
  private _doc: ElementDoc

  constructor(tagName: string) {
    super(tagName.toUpperCase())
    this._doc = {
      body: {
        innerHTML: '',
      },
    }
  }

  /** A stub doc object that can store or retrieve minimal state (e.g., body.innerHTML). */
  public get doc(): ElementDoc {
    return this._doc
  }

  /** Overridden from Node: returns the uppercase tagName used in the constructor. */
  public get tagName(): string {
    return this.nodeName
  }

  /** Stub for setting an attribute in a given namespace. */
  public setAttributeNS(): void {
    // no-op or minimal logic
  }

  protected get innerWidth(): number {
    return window.innerWidth
  }

  protected get innerHeight(): number {
    return window.innerHeight
  }

  /**
   * Mimic typical DOM geometry properties:
   */
  public get clientWidth(): number {
    return this.innerWidth
  }

  public get clientHeight(): number {
    return this.innerHeight
  }

  public get offsetWidth(): number {
    return this.innerWidth
  }

  public get offsetHeight(): number {
    return this.innerHeight
  }

  /**
   * Provides a canvas or 2D context if '2d' is requested and an appropriate global context is available.
   * Otherwise returns a stub or the existing context object.
   */
  public getContext(
    contextType: string,
    contextOptions?: Expo2dContextOptions,
    context?: unknown
  ): CanvasRenderingContext2D | Record<string, any> {
    console.log(`[getContext] Called with contextType: ${contextType}`, {
      contextOptions,
      hasContext: !!context,
      hasGlobalContext: !!(global as any).__context,
    })

    const possibleContext = context || (global as any).__context

    // If context type is not '2d' and we have a custom context, return it as-is.
    if (contextType !== '2d' && possibleContext) {
      console.log('[getContext] Returning non-2d custom context')
      return possibleContext
    }

    // If context type is '2d' and we have a custom context, wrap it with CanvasRenderingContext2D from expo-2d-context.
    if (contextType === '2d' && possibleContext) {
      console.log(
        '[getContext] Creating new CanvasRenderingContext2D with custom context'
      )
      const ctx = new CanvasRenderingContext2D(possibleContext, {
        maxGradStops: 10,
        renderWithOffscreenBuffer: false,
        fastFillTesselation: false,
        ...contextOptions,
      })
      console.log('[getContext] Created context with options:', {
        ...contextOptions,
        maxGradStops: 10,
        renderWithOffscreenBuffer: false,
        fastFillTesselation: false,
      })
      return ctx
    }

    // Otherwise, return a stub that won't fail typical draw calls.
    console.log('[getContext] Returning stub context')
    return {
      fillText: (
        _text: string,
        _x: number,
        _y: number,
        _maxWidth?: number
      ): Record<string, never> => {
        console.log('[stub.fillText] Called with:', {
          text: _text,
          x: _x,
          y: _y,
          maxWidth: _maxWidth,
        })
        return {}
      },
      measureText: (text: string): { width: number; height: number } => {
        const result = { width: (text || '').length * 6, height: 24 }
        console.log('[stub.measureText] Called with:', { text, result })
        return result
      },
      fillRect: (...args: any[]): Record<string, never> => {
        console.log('[stub.fillRect] Called with:', args)
        return {}
      },
      drawImage: (...args: any[]): Record<string, never> => {
        console.log('[stub.drawImage] Called with:', args)
        return {}
      },
      getImageData: (): { data: Uint8ClampedArray } => {
        console.log('[stub.getImageData] Called')
        return { data: new Uint8ClampedArray([255, 0, 0, 0]) }
      },
      getContextAttributes: (): { stencil: boolean } => {
        console.log('[stub.getContextAttributes] Called')
        return { stencil: true }
      },
      getExtension: (): { loseContext: () => void } => {
        console.log('[stub.getExtension] Called')
        return {
          loseContext: (): void => {
            console.log('[stub.loseContext] Called')
          },
        }
      },
      putImageData: (...args: any[]): Record<string, never> => {
        console.log('[stub.putImageData] Called with:', args)
        return {}
      },
      createImageData: (...args: any[]): Record<string, never> => {
        console.log('[stub.createImageData] Called with:', args)
        return {}
      },
    }
  }

  /** Stub for ontouchstart, commonly used in touch-enabled environments. */
  public get ontouchstart(): Record<string, never> {
    return {}
  }
}
