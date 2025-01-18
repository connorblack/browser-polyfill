// src/DOM/Document.ts

import '../types'

import Element from './Element'
import HTMLCanvasElement from './HTMLCanvasElement'
import HTMLImageElement from './HTMLImageElement'
import HTMLVideoElement from './HTMLVideoElement'

/**
 * A minimal Document polyfill that extends Element.
 */
export default class Document extends Element {
  /** The document’s <body> element. */
  public body: Element
  /** The document’s <html> element. */
  public documentElement: Element
  /** The document’s readyState; defaults to 'complete'. */
  public readyState: string

  /** Internal mapping of element IDs to references. */
  private elementById: Map<string, Element>

  constructor() {
    super('#document')
    this.body = new Element('BODY')
    this.documentElement = new Element('HTML')
    this.readyState = 'complete'
    this.elementById = new Map()

    // In a normal DOM, documentElement is the top-level ancestor, with body under it.
    this.appendChild(this.documentElement)
    this.documentElement.appendChild(this.body)
  }

  /**
   * Create an element by tag name. Returns specialized stubs for known tags, or a generic Element otherwise.
   */
  public createElement(
    tagName: string
  ): Element | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null {
    tagName = (tagName || '').toLowerCase()

    switch (tagName) {
      case 'video':
        return new HTMLVideoElement(tagName)
      case 'img':
        return new HTMLImageElement(tagName)
      case 'canvas':
        return new HTMLCanvasElement(tagName)
      case 'iframe':
        return null
      default:
        return new Element(tagName)
    }
  }

  /**
   * Minimal namespaced element creation, ignoring the actual namespace.
   */
  public createElementNS(
    _namespace: string | null,
    tagName: string
  ): Element | null {
    const element = this.createElement(tagName)
    if (element) {
      // Provide a stub method to mimic certain canvas usage
      ;(element as any).toDataURL = () => ({})
    }
    return element
  }

  /**
   * Retrieves an element by its ID. Uses a cached Map if available, otherwise falls back to a recursive search.
   */
  public getElementById(id: string): Element | null {
    // Check the cache first
    if (this.elementById.has(id)) {
      return this.elementById.get(id)!
    }

    // Otherwise, do a DFS
    const findElementById = (element: Element): Element | null => {
      const elementId = (element as any).attributes?.id
      if (elementId === id) {
        return element
      }

      for (const child of element.childNodes) {
        if (child instanceof Element) {
          const found = findElementById(child)
          if (found) {
            // Cache the found element
            this.elementById.set(id, found)
            return found
          }
        }
      }
      return null
    }

    return findElementById(this)
  }

  /**
   * Registers (caches) an element with a given ID string.
   * Useful if you know the ID at creation time.
   */
  public registerElementById(id: string, element: Element): void {
    this.elementById.set(id, element)
  }

  /**
   * Unregisters an element's ID from the cache, useful when removing from DOM.
   */
  public unregisterElementById(id: string): void {
    this.elementById.delete(id)
  }

  /**
   * Minimal querySelector that only supports a few simple patterns:
   * - '#someId'
   * - the tagName (like 'canvas' or 'body')
   * If more complex selectors are used, returns null.
   */
  public querySelector(selector: string): Element | null {
    if (!selector) return null

    // ID-based
    if (selector.startsWith('#')) {
      return this.getElementById(selector.slice(1))
    }

    // tagName-based (very simplistic)
    const lowerSel = selector.toLowerCase()
    let foundElement: Element | null = null

    const search = (elem: Element) => {
      if (elem.nodeName.toLowerCase() === lowerSel) {
        foundElement = elem
        return true // short-circuit
      }
      for (const child of elem.childNodes) {
        if (child instanceof Element) {
          if (search(child)) return true
        }
      }
      return false
    }
    search(this)
    return foundElement
  }

  /**
   * Minimal querySelectorAll that returns an array of matched elements for:
   * - '#someId' (either 0 or 1 matches)
   * - tagName (like 'canvas', 'body')
   */
  public querySelectorAll(selector: string): Element[] {
    if (!selector) return []
    const results: Element[] = []

    if (selector.startsWith('#')) {
      const maybe = this.getElementById(selector.slice(1))
      if (maybe) results.push(maybe)
      return results
    }

    // tagName-based
    const lowerSel = selector.toLowerCase()
    const gather = (elem: Element) => {
      if (elem.nodeName.toLowerCase() === lowerSel) {
        results.push(elem)
      }
      for (const child of elem.childNodes) {
        if (child instanceof Element) {
          gather(child)
        }
      }
    }
    gather(this)
    return results
  }
}
