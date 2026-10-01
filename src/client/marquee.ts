/**
 * The scrolling band pinned across the top of the page.
 *
 * The reference site's hero carries a quiet row of oversized type behind the
 * title. This renders the same idea as a marquee — one `nowrap` line whose
 * content is the unit twice over, moved by `translateX(-50%)`, so the loop is
 * seamless because the distance travelled is exactly one copy.
 *
 * This is that band at window width: a fixed strip across the top, one line of
 * the configured text, the page pushed down by the strip's own height so the
 * mark never crosses the application's chrome.
 *
 * The element is a sibling of the shell's `#root`, is `aria-hidden`, and takes
 * no pointer events. It is appended to `body` — a node React never reconciles —
 * and re-attached if something removes it.
 */

import { MARQUEE_CLASS, MARQUEE_TRACK_CLASS } from '../constants/dom.ts'

/** One mounted band. */
export interface Marquee {
  /** Re-attach the band after a layout change (idempotent, cheap when settled). */
  ensure(): void
  /** Replace the line's text without rebuilding the band. */
  setText(text: string): void
  /** Remove every node and observer this band owns. */
  destroy(): void
}

/**
 * Characters one copy of the line has to reach.
 *
 * A copy has to overrun the widest window a single line can be rendered in, or
 * the band would show a gap at the seam; at the band's own
 * `clamp(20px, 2.2vw, 30px)` with `letter-spacing: 0.3em` a character averages
 * roughly 24px, so 140 characters covers a 3K-wide window.
 */
const COPY_CHARACTERS = 140

/**
 * Copies painted at the very least, however long the text is.
 * @remarks Two is the floor the animation needs: `translateX(-50%)` moves exactly
 *          one copy, so fewer than two would leave the second half empty.
 */
const MIN_COPIES = 2

/**
 * Build the line's content: the unit repeated whole, then the same again.
 * @param text - the configured mark.
 * @returns the string the track renders.
 */
export function marqueeContent(text: string): string {
  const unit = `${text.trim()} `
  const copies = Math.max(MIN_COPIES, Math.ceil(COPY_CHARACTERS / unit.length))
  return unit.repeat(copies * 2)
}

/**
 * Mount the scrolling band and keep it attached to the document body.
 * @param doc - document owning the shell.
 * @param text - the mark to scroll.
 * @returns the band handle owned by the caller's plugin fiber.
 */
export function createMarquee(doc: Document = document, text = ''): Marquee {
  let root: HTMLDivElement | undefined
  let track: HTMLSpanElement | undefined
  let observer: MutationObserver | undefined

  /** Build the band: one fixed strip holding one animated line. */
  function build(): HTMLDivElement {
    const element = doc.createElement('div')
    element.className = MARQUEE_CLASS
    element.setAttribute('aria-hidden', 'true')
    track = doc.createElement('span')
    track.className = MARQUEE_TRACK_CLASS
    track.textContent = marqueeContent(text)
    element.appendChild(track)
    return element
  }

  /** Attach the band, re-attach it, or leave it alone. */
  function sync(): void {
    const body = doc.body
    if (body === null) return
    if (root === undefined) {
      root = build()
      body.appendChild(root)
      observer = new MutationObserver(() => { sync() })
      observer.observe(body, { childList: true })
    } else if (root.parentElement !== body) {
      body.appendChild(root)
    }
  }

  sync()

  return {
    ensure: sync,
    setText(next: string): void {
      if (track !== undefined) track.textContent = marqueeContent(next)
    },
    destroy(): void {
      observer?.disconnect()
      observer = undefined
      root?.remove()
      root = undefined
      track = undefined
    },
  }
}
