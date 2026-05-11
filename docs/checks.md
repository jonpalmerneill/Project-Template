# Before you ship — accessibility and performance checks

Run these checks before considering any feature done. Fix issues found rather than noting them.

---

## Accessibility

### Semantic structure
- [ ] Heading hierarchy is logical — one `<h1>` per page, `<h2>`/`<h3>` used in order, never skipped
- [ ] Landmark elements are present — `<header>`, `<main>`, `<footer>`, `<nav>` where appropriate
- [ ] Lists use `<ul>`/`<ol>`/`<li>`, not a series of `<div>` elements

### Images and media
- [ ] Every `<img>` has an `alt` attribute — descriptive for content images, `alt=""` for decorative ones
- [ ] Videos have captions or a transcript if they convey information

### Interactive elements
- [ ] Every button and link has an accessible name — visible text, `aria-label`, or `aria-labelledby`
- [ ] Icon-only buttons always have `aria-label`: `<button aria-label="Close menu">`
- [ ] Links go somewhere — no `<a href="#">` used as buttons (use `<button>` instead)
- [ ] No `tabindex` values greater than 0

### Keyboard navigation
- [ ] All interactive elements are reachable by Tab key
- [ ] Focus is always visible — never remove `outline` without providing an equivalent visual indicator
- [ ] Modals trap focus while open and return focus to the trigger when closed
- [ ] Custom components (dropdowns, toggles) respond to keyboard: Enter/Space to activate, Escape to dismiss

### Forms
- [ ] Every `<input>`, `<select>`, and `<textarea>` has a `<label>` via `for`/`id` or `aria-label`
- [ ] Error messages are associated with their input via `aria-describedby`
- [ ] Required fields are marked with `required` attribute (not just a visual asterisk)

### Color and contrast
- [ ] Text contrast ratio is at least 4.5:1 against its background (normal text) or 3:1 (large text / UI components)
- [ ] Information is never conveyed by color alone — always pair with text, icon, or pattern

### Motion
- [ ] All JS-driven animations check `prefers-reduced-motion` and skip or instant-complete if set
- [ ] CSS transitions use the media query in `src/style.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## Performance

### Images
- [ ] All `<img>` elements have explicit `width` and `height` attributes to prevent layout shift (CLS)
- [ ] Images below the fold use `loading="lazy"`
- [ ] Images use modern formats (WebP or AVIF) where possible
- [ ] Large images are sized appropriately — don't serve a 3000px image in a 400px container

### Animation and rendering
- [ ] Animations only use `transform` and `opacity` — never animate `width`, `height`, `top`, `left` (these trigger reflow)
- [ ] `will-change: transform` is used sparingly and only on actively animating elements
- [ ] Canvas and WebGL renderers cap pixel ratio at 2: `Math.min(window.devicePixelRatio, 2)`
- [ ] `requestAnimationFrame` loops are cancelled (`cancelAnimationFrame`) when the element is removed or hidden
- [ ] RAF loops are paused when the page is hidden: `document.addEventListener('visibilitychange', () => { if (document.hidden) pause() })`

### DOM and JS
- [ ] DOM reads and writes are not interleaved in a loop — batch reads first, then writes, to avoid layout thrashing
- [ ] `ResizeObserver` is used to track element size changes, not polling on `window.resize`
- [ ] Event listeners on `scroll` and `mousemove` use passive mode: `addEventListener('scroll', fn, { passive: true })`
- [ ] Large datasets rendered to the DOM are paginated or virtualized — don't render 500 cards at once

### Loading
- [ ] `<script type="module">` tags are deferred by default — no extra attribute needed
- [ ] Third-party embeds (Calendly, Typeform, etc.) load asynchronously — their `<script>` tags are placed just before `</body>`
- [ ] Fonts use `font-display: swap` in `@font-face` declarations to prevent invisible text during load
