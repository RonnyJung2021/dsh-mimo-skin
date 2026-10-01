/**
 * A minimal document double for the module tests.
 *
 * The browser half touches very little of the DOM: a `<style>` it appends to
 * `head`, a body whose attributes it reads and writes, a band it appends beside
 * `#root`, and inline custom properties. `jsdom` is not a dependency of this
 * plugin package, and pulling one in to observe five properties would cost more
 * than it proves.
 *
 * The observer models the browser behaviours the skin depends on, all of which
 * were measured rather than assumed:
 *
 * 1. **Every attribute write records, even one that rewrites the value already
 *    held** (`setAttribute('data-a', 'on')` over an existing `on` records). This
 *    is what makes an observer whose callback re-asserts its own watched
 *    attribute re-arm itself forever and starve the page's event loop.
 * 2. **Appending and removing children records too**, so the band's
 *    `childList` observer can be driven the same way.
 * 3. **Records are delivered after the current turn, and a write made from a
 *    callback is delivered on the next turn.** `flush()` therefore runs to
 *    quiescence like the real observer, bounded so a self-re-arming callback
 *    fails the test instead of hanging it.
 */

/** One recorded custom property write. */
class InlineStyle {
  constructor() {
    this.properties = new Map()
    this.removals = []
  }

  setProperty(name, value) {
    this.properties.set(name, String(value))
  }

  removeProperty(name) {
    this.removals.push(name)
    this.properties.delete(name)
  }

  /** @returns the value of one custom property, or undefined. */
  get(name) {
    return this.properties.get(name)
  }
}

/** One element with the attribute, style and child surface these modules use. */
class FakeElement {
  constructor(tagName, doc) {
    this.tagName = tagName
    this.ownerDocument = doc
    this.attributes = new Map()
    this.style = new InlineStyle()
    this.children = []
    this.parentElement = null
    this.textContent = ''
    this.nextElementSibling = null
  }

  /* `id` and `className` are the reflected forms of the attributes of the same
     name: assigning the property writes the attribute, the way a real element
     behaves. Keeping them as plain own fields would let `installStyles` set
     `.id` and leave `getElementById` looking at an empty attribute. */
  get id() {
    return this.getAttribute('id') ?? ''
  }

  set id(value) {
    this.setAttribute('id', value)
  }

  get className() {
    return this.getAttribute('class') ?? ''
  }

  set className(value) {
    this.setAttribute('class', value)
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
    this.ownerDocument.record(this, name, 'attributes')
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null
  }

  hasAttribute(name) {
    return this.attributes.has(name)
  }

  removeAttribute(name) {
    if (!this.attributes.has(name)) return
    this.attributes.delete(name)
    this.ownerDocument.record(this, name, 'attributes')
  }

  appendChild(child) {
    child.parentElement = this
    this.children.push(child)
    this.ownerDocument.record(this, '', 'childList')
    return child
  }

  /** @returns whether any descendant carries the class, the element included. */
  contains(node) {
    if (node === this) return true
    return this.children.some(child => child.contains?.(node) === true)
  }

  remove() {
    const parent = this.parentElement
    if (parent === null) return
    const at = parent.children.indexOf(this)
    if (at !== -1) parent.children.splice(at, 1)
    this.parentElement = null
    this.ownerDocument.record(parent, '', 'childList')
  }
}

/** The document double handed to the modules under test. */
class FakeDocument {
  constructor() {
    this.head = new FakeElement('head', this)
    this.body = new FakeElement('body', this)
    this.observers = []
    /** Mutations not yet delivered, as `{ target, name, kind }`. */
    this.records = []
    /** How many callbacks the last `flush()` ran. */
    this.callbacks = 0
    this.recording = true
  }

  createElement(tagName) {
    return new FakeElement(tagName, this)
  }

  getElementById(id) {
    return this.head.children.find(child => child.id === id)
      ?? this.body.children.find(child => child.id === id)
      ?? null
  }

  /**
   * Note one mutation for delivery, the way the browser queues a record.
   *
   * Every write is recorded, including one that rewrites the value already
   * held: that is the behaviour an idempotent writer has to survive.
   * @param target - element that was written.
   * @param name - attribute name, empty for a child-list mutation.
   * @param kind - `attributes` or `childList`.
   */
  record(target, name, kind) {
    if (!this.recording) return
    this.records.push({ target, name, kind })
  }

  /** @returns the observers watching any element. */
  bodyObservers() {
    return this.observers
  }

  /**
   * Deliver pending records until none remain, as the browser eventually does.
   * @param limit - callbacks allowed before the run is called a non-terminating
   * loop; a callback that re-arms its own observer exceeds it.
   * @throws when the limit is reached, naming the condition.
   */
  flush(limit = 200) {
    this.recording = false
    this.callbacks = 0
    try {
      while (this.records.length > 0) {
        if (this.callbacks >= limit) {
          throw new Error(`fake-dom: observer callbacks did not terminate after ${limit} passes`)
        }
        const batch = this.records.splice(0)
        this.callbacks += 1
        for (const observer of [...this.observers]) {
          if (batch.some(record => observer.watches(record))) observer.callback([], observer)
        }
      }
    } finally {
      this.records = []
      this.recording = true
    }
  }
}

/**
 * Build a document double whose global `MutationObserver` records registrations.
 * @returns the document, with `flush()` and `bodyObservers()` for the test.
 */
export function createFakeDocument() {
  const doc = new FakeDocument()
  const RealObserver = globalThis.MutationObserver
  // The modules construct `new MutationObserver(...)`; the double keeps the
  // callback and its filters so the test can drive delivery.
  globalThis.MutationObserver = class {
    constructor(callback) {
      this.callback = callback
      this.attributeFilter = []
      this.attributes = false
      this.childList = false
    }

    observe(target, options = {}) {
      this.target = target
      this.attributes = options.attributes === true
      this.childList = options.childList === true
      this.attributeFilter = options.attributeFilter ?? []
      doc.observers.push(this)
    }

    /** @returns whether this observer asked for the mutation on record. */
    watches(record) {
      if (record.kind === 'childList') return this.childList
      return this.attributes && this.attributeFilter.includes(record.name)
    }

    disconnect() {
      const at = doc.observers.indexOf(this)
      if (at !== -1) doc.observers.splice(at, 1)
    }
  }
  doc.restore = () => {
    if (RealObserver === undefined) delete globalThis.MutationObserver
    else globalThis.MutationObserver = RealObserver
  }
  return doc
}
