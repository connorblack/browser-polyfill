// src/DOM/Node.ts

import '../types'

import { EventEmitter, EventSubscription } from 'fbemitter'

import type { EmitterLike, EventName } from '../types'

/** Basic definition of a style object (key-value pairs). */
interface CSSStyle {
  [key: string]: any
}

/** An interface for className that simulates SVG/DOM usage of className.baseVal. */
interface ClassName {
  baseVal: string
}

/**
 * A polyfill-like Node class that uses fbemitter internally to mimic
 * event handling in a DOM Node.
 */
export default class Node {
  /** The name of this Node (e.g. 'div', 'img', etc.) */
  public nodeName: string

  /** Reference to the parent node (if any). */
  public parentNode: Node | null = null

  /** Child nodes of this node. */
  public childNodes: Node[] = []

  /** Style object that mimics CSS style properties. */
  public style: CSSStyle = {}

  /** Class name object that mimics DOM SVG usage (e.g. className.baseVal). */
  public className: ClassName = { baseVal: '' }

  /** Attributes object for storing name-value pairs. */
  public attributes: Record<string, string> = {}

  /** Emitter for this Node’s events. */
  protected emitter: EmitterLike

  /**
   * Internally keep track of added listeners so we can remove them properly.
   * Each `addListener` call returns an `EventSubscription` from fbemitter.
   * We map `eventName -> (listener -> subscription)`.
   */
  private _subscriptions: Record<
    string,
    Map<EventListener, EventSubscription>
  > = {}

  constructor(nodeName: string) {
    this.nodeName = nodeName
    this.emitter = new EventEmitter()

    // Bind our event handling methods
    this.addEventListener = this.addEventListener.bind(this)
    this.removeEventListener = this.removeEventListener.bind(this)
  }

  /**
   * Mimics `node.ownerDocument` in a browser environment.
   * In a React Native environment, `window.document` is often polyfilled or undefined.
   */
  public get ownerDocument(): Document | undefined {
    return (window as any).document
  }

  /**
   * Adds an event listener for the given event name.
   */
  public addEventListener(eventName: EventName, listener: EventListener): void {
    // Create a new event subscription, storing it for later removal.
    const subscription = (this.emitter as EventEmitter).addListener(
      eventName,
      listener
    )

    if (!this._subscriptions[eventName]) {
      this._subscriptions[eventName] = new Map()
    }
    this._subscriptions[eventName].set(listener, subscription)
  }

  /**
   * Removes a previously registered event listener.
   */
  public removeEventListener(
    eventName: EventName,
    listener: EventListener
  ): void {
    const subsForEvent = this._subscriptions[eventName]
    if (!subsForEvent) return

    const subscription = subsForEvent.get(listener)
    if (subscription) {
      subscription.remove()
      subsForEvent.delete(listener)
    }
  }

  /**
   * Appends a child node to this node's childNodes.
   */
  public appendChild(child: Node): Node {
    if (!child) {
      throw new Error('Cannot append an undefined or null child.')
    }
    // Remove from old parent
    if (child.parentNode && child.parentNode !== this) {
      child.parentNode.removeChild(child)
    }

    this.childNodes.push(child)
    child.parentNode = this
    return child
  }

  /**
   * Inserts a new node before a reference node (or at the start if referenceNode is null).
   */
  public insertBefore(newNode: Node, referenceNode: Node | null): Node {
    if (!newNode) {
      throw new Error('Cannot insert undefined or null node.')
    }
    if (referenceNode === null) {
      // Insert at the start
      this.childNodes.unshift(newNode)
    } else {
      const index = this.childNodes.indexOf(referenceNode)
      if (index === -1) {
        // If referenceNode isn't a child, just append
        this.childNodes.push(newNode)
      } else {
        this.childNodes.splice(index, 0, newNode)
      }
    }
    newNode.parentNode = this
    return newNode
  }

  /**
   * Removes a specified child node from this node's childNodes.
   */
  public removeChild(child: Node): Node {
    const index = this.childNodes.indexOf(child)
    if (index !== -1) {
      this.childNodes.splice(index, 1)
      child.parentNode = null
    }
    return child
  }

  /**
   * Stub for setting an attribute in a given namespace.
   * Stores the attribute in the `attributes` record.
   */
  public setAttributeNS(ns: string, attrName: string, attrValue: string): void {
    // Basic stub. The namespace `ns` is not used here.
    this.attributes[attrName] = attrValue
  }

  /**
   * Returns a mock bounding client rect for layout calculations.
   */
  public getBoundingClientRect(): DOMRect {
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      toJSON() {
        return this
      },
    } as DOMRect
  }
}
