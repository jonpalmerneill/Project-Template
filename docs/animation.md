# Animation flows

## Page loader

A full-screen overlay that animates a progress bar and counter from 0 → 100, then fades out to reveal the site.

**You do:**

1. Add the loader HTML to `index.html`, immediately after `<body>` and before everything else:
   ```html
   <div id="loader" class="loader" aria-hidden="true">
     <div class="loader-bar"><div class="loader-fill" id="loader-fill"></div></div>
     <span class="loader-count" id="loader-count">0</span>
   </div>
   ```

2. Create `src/loader.js`:
   ```js
   export function initLoader() {
     const loader = document.getElementById('loader')
     const fill   = document.getElementById('loader-fill')
     const count  = document.getElementById('loader-count')

     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       loader.remove()
       return Promise.resolve()
     }

     return new Promise((resolve) => {
       let progress = 0
       let loaded = document.readyState === 'complete'

       window.addEventListener('load', () => { loaded = true }, { once: true })

       const tick = setInterval(() => {
         const target = loaded ? 100 : 82
         progress += (target - progress) * 0.08

         fill.style.transform = `scaleX(${progress / 100})`
         count.textContent = Math.floor(progress)

         if (progress >= 99.9) {
           clearInterval(tick)
           fill.style.transform = 'scaleX(1)'
           count.textContent = '100'

           setTimeout(() => {
             loader.classList.add('loader--done')
             loader.addEventListener('transitionend', () => {
               loader.remove()
               resolve()
             }, { once: true })
           }, 200)
         }
       }, 16)
     })
   }
   ```

3. Call it at the top of `src/main.js`, before any other init:
   ```js
   import { initLoader } from './loader.js'
   await initLoader()
   ```

4. Add to `src/style.css`:
   ```css
   .loader {
     position: fixed;
     inset: 0;
     z-index: 9999;
     background: var(--color-bg);
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 1rem;
     transition: opacity 0.5s ease, visibility 0.5s ease;
   }
   .loader--done { opacity: 0; visibility: hidden; pointer-events: none; }

   .loader-bar {
     width: min(280px, 80vw);
     height: 1px;
     background: color-mix(in srgb, var(--color-text) 20%, transparent);
     overflow: hidden;
   }
   .loader-fill {
     height: 100%;
     background: var(--color-text);
     transform: scaleX(0);
     transform-origin: left;
     transition: transform 0.1s linear;
   }

   .loader-count {
     font-size: 0.75rem;
     font-family: var(--font-body);
     color: var(--color-text);
     opacity: 0.5;
     min-width: 3ch;
     text-align: center;
   }
   ```

**Variations:**
- Bar only: omit `.loader-count` span and its CSS
- Counter only: omit `.loader-bar` div and its CSS
- Branded: add a logo `<img>` or inline SVG inside `.loader` above the bar

---

## Motion.dev animations

The `motion` package is already installed. Import what you need:

```js
import { animate, inView, scroll } from 'motion'

// Animate an element
animate('#hero', { opacity: [0, 1], y: [20, 0] }, { duration: 0.4 })

// Trigger when element enters the viewport
inView('#section', ({ target }) => {
  animate(target, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 })
})

// Animate based on scroll position
scroll(animate('#progress-bar', { scaleX: [0, 1] }))
```

Use `--duration-*` and `--ease-*` from `src/style.css` for timing consistency. For JS animations, also check:

```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

---

## Advanced scroll animations (GSAP)

Use GSAP when Motion.dev isn't enough: complex timelines, scroll-pinned sections, scrub-based animations, or sequenced choreography across multiple elements.

**You do:**

1. Run `npm install gsap`

2. Register plugins:
   ```js
   import { gsap } from 'gsap'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'
   gsap.registerPlugin(ScrollTrigger)

   // If also using Lenis, wire them together:
   lenis?.on('scroll', ScrollTrigger.update)
   gsap.ticker.add(time => lenis?.raf(time * 1000))
   gsap.ticker.lagSmoothing(0)
   ```

3. Respect prefers-reduced-motion:
   ```js
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     gsap.globalTimeline.timeScale(100)
   }
   ```

**Key patterns:**

Basic animation:
```js
gsap.from('.hero-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' })
```

Scroll-triggered reveal:
```js
gsap.from('.card', {
  scrollTrigger: { trigger: '.card', start: 'top 80%', toggleActions: 'play none none reverse' },
  opacity: 0,
  y: 60,
  stagger: 0.1,
  duration: 0.6,
  ease: 'power2.out',
})
```

Scrub (tied directly to scroll position):
```js
gsap.to('.parallax-image', {
  scrollTrigger: { trigger: '.section', start: 'top bottom', end: 'bottom top', scrub: true },
  y: -80,
})
```

Pin a section while content animates:
```js
gsap.to('.slide-content', {
  scrollTrigger: {
    trigger: '.pin-section',
    start: 'top top',
    end: '+=600',
    pin: true,
    scrub: 1,
  },
  x: '-100%',
})
```

Timeline (sequence animations):
```js
const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.6 } })
tl.from('.nav',      { opacity: 0, y: -20 })
  .from('.hero-tag', { opacity: 0, y: 10 }, '-=0.3')
  .from('.hero-h1',  { opacity: 0, y: 20 }, '-=0.4')
  .from('.hero-cta', { opacity: 0, y: 10 }, '-=0.3')
```

**When to use each tool:**

| Scenario | Tool |
|----------|------|
| Simple fade/slide in on scroll | Motion.dev `inView()` |
| Entrance animations on load | Motion.dev `animate()` or GSAP |
| Complex staggered sequences | GSAP timeline |
| Scrub / scroll-pinned sections | GSAP ScrollTrigger |

---

## Split text for animation (SplitType)

SplitType wraps every character, word, or line in its own `<span>` for individual animation.

**You do:**

1. Run `npm install split-type`

2. Split and animate:
   ```js
   import SplitType from 'split-type'
   import { gsap } from 'gsap'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'

   const split = new SplitType('.section-heading', { types: 'lines' })

   gsap.from(split.lines, {
     scrollTrigger: { trigger: '.section-heading', start: 'top 85%' },
     opacity: 0,
     y: '110%',
     stagger: 0.08,
     duration: 0.7,
     ease: 'power3.out',
   })
   ```

   Split types: `'lines'`, `'words'`, `'chars'`, `'words, chars'`

3. Clip so lines slide up from behind the baseline:
   ```css
   .section-heading { overflow: hidden; }
   .section-heading .line { overflow: hidden; }
   ```

4. Re-split on resize:
   ```js
   let resizeTimer
   window.addEventListener('resize', () => {
     clearTimeout(resizeTimer)
     resizeTimer = setTimeout(() => {
       split.revert()
       split.split()
       ScrollTrigger.refresh()
     }, 200)
   })
   ```

---

## Smooth scrolling (Lenis)

Lenis replaces native scroll with smooth, momentum-based scrolling.

**You do:**

1. Add to `src/main.js`:
   ```js
   import Lenis from 'lenis'

   const lenis = window.matchMedia('(prefers-reduced-motion: reduce)').matches
     ? null
     : new Lenis({
         duration: 1.2,
         easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
       })

   if (lenis) {
     function raf(time) {
       lenis.raf(time)
       requestAnimationFrame(raf)
     }
     requestAnimationFrame(raf)
   }
   ```

**Common options:**

| Option | Default | Effect |
|--------|---------|--------|
| `duration` | `1.2` | Scroll duration in seconds |
| `easing` | exponential | Any `t → t` function |
| `orientation` | `'vertical'` | `'horizontal'` for horizontal scroll |
| `infinite` | `false` | Infinite scroll loop |

To stop/start manually: `lenis.stop()` / `lenis.start()`

---

## Page transitions

An overlay fades in when a link is clicked, the new page loads, then fades out.

**This requires the same transition HTML and JS on every page.**

**You do:**

1. Add to every `.html` file, immediately after `<body>`:
   ```html
   <div id="page-transition" class="page-transition" aria-hidden="true"></div>
   ```

2. Create `src/transitions.js`:
   ```js
   export function initPageTransitions() {
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

     const overlay = document.getElementById('page-transition')

     overlay.classList.add('is-visible')
     requestAnimationFrame(() => requestAnimationFrame(() => {
       overlay.classList.remove('is-visible')
     }))

     document.addEventListener('click', e => {
       const link = e.target.closest('a')
       if (!link) return
       if (link.target === '_blank') return
       if (link.hostname !== location.hostname) return
       if (link.href === location.href) return

       e.preventDefault()
       const href = link.href

       overlay.classList.add('is-visible')
       overlay.addEventListener('transitionend', () => {
         window.location.href = href
       }, { once: true })
     })
   }
   ```

3. Call from `src/main.js`:
   ```js
   import { initPageTransitions } from './transitions.js'
   initPageTransitions()
   ```

4. Add to `src/style.css`:
   ```css
   .page-transition {
     position: fixed;
     inset: 0;
     z-index: 9998;
     background: var(--color-bg);
     opacity: 0;
     pointer-events: none;
     transition: opacity 0.4s ease;
   }
   .page-transition.is-visible {
     opacity: 1;
     pointer-events: all;
   }
   ```

**Notes:**
- The double `requestAnimationFrame` on entrance is intentional — it waits for the browser to paint before removing the class so the CSS transition fires
- For a slide instead of fade, animate `transform: translateY()` instead of `opacity`

---

## Custom cursor

Hides the default cursor and replaces it with a styled element. Skips on touch devices.

**You do:**

1. Add to `index.html` immediately after `<body>`:
   ```html
   <div id="cursor" class="cursor" aria-hidden="true"></div>
   ```

2. Create `src/cursor.js`:
   ```js
   export function initCursor() {
     if (window.matchMedia('(pointer: coarse)').matches) return
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

     const cursor = document.getElementById('cursor')
     let mouseX = 0, mouseY = 0
     let curX = 0, curY = 0
     const lag = 0.12

     document.addEventListener('mousemove', e => {
       mouseX = e.clientX
       mouseY = e.clientY
       cursor.style.opacity = '1'
     })

     document.addEventListener('mouseleave', () => { cursor.style.opacity = '0' })

     function tick() {
       curX += (mouseX - curX) * lag
       curY += (mouseY - curY) * lag
       cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`
       requestAnimationFrame(tick)
     }
     tick()

     document.querySelectorAll('a, button, [data-cursor-hover]').forEach(el => {
       el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'))
       el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'))
     })
   }
   ```

3. Call from `src/main.js`:
   ```js
   import { initCursor } from './cursor.js'
   initCursor()
   ```

4. Add to `src/style.css`:
   ```css
   body { cursor: none; }

   .cursor {
     position: fixed;
     top: 0;
     left: 0;
     width: 10px;
     height: 10px;
     border-radius: 50%;
     background: var(--color-text);
     pointer-events: none;
     z-index: 99999;
     opacity: 0;
     will-change: transform;
     transition: width 0.2s ease, height 0.2s ease,
                 background 0.2s ease, border 0.2s ease,
                 opacity 0.3s ease;
   }

   .cursor--hover {
     width: 36px;
     height: 36px;
     background: transparent;
     border: 1px solid var(--color-text);
   }
   ```

---

## Carousel (Swiper)

Touch-friendly, responsive carousels. Use for image galleries, testimonials, or horizontally scrolling content.

**You do:**

1. Run `npm install swiper`

2. Add HTML to `index.html`:
   ```html
   <div class="swiper">
     <div class="swiper-wrapper">
       <div class="swiper-slide"><!-- slide content --></div>
       <div class="swiper-slide"><!-- slide content --></div>
     </div>
     <div class="swiper-pagination"></div>
     <button class="swiper-button-prev" aria-label="Previous slide"></button>
     <button class="swiper-button-next" aria-label="Next slide"></button>
   </div>
   ```

3. Initialize:
   ```js
   import Swiper from 'swiper'
   import { Navigation, Pagination, Autoplay } from 'swiper/modules'
   import 'swiper/css'
   import 'swiper/css/navigation'
   import 'swiper/css/pagination'

   const swiper = new Swiper('.swiper', {
     modules: [Navigation, Pagination, Autoplay],
     loop: true,
     slidesPerView: 1,
     spaceBetween: 24,
     pagination: { el: '.swiper-pagination', clickable: true },
     navigation: {
       nextEl: '.swiper-button-next',
       prevEl: '.swiper-button-prev',
     },
     breakpoints: {
       640:  { slidesPerView: 2 },
       1024: { slidesPerView: 3 },
     },
   })
   ```

---

## Text scramble

Characters cycle through random values before settling on the real text. No library needed.

Add to `src/effects.js`:

```js
export function scrambleText(element, {
  duration = 700,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&',
} = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const original = element.textContent
  const start = performance.now()

  function update(now) {
    const progress = Math.min((now - start) / duration, 1)
    const revealedCount = Math.floor(progress * original.length)

    element.textContent = original
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' '
        if (i < revealedCount) return char
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join('')

    if (progress < 1) requestAnimationFrame(update)
    else element.textContent = original
  }

  requestAnimationFrame(update)
}
```

**Usage:**
```js
import { scrambleText } from './effects.js'

// On hover
document.querySelectorAll('[data-scramble]').forEach(el => {
  el.addEventListener('mouseenter', () => scrambleText(el))
})

// On load
scrambleText(document.querySelector('.nav-logo'))

// Binary scramble
scrambleText(el, { duration: 400, chars: '01' })
```

Add `data-scramble` to any element in `index.html` to enable hover scramble automatically.

---

## 3D card tilt

Cards rotate in 3D to follow the mouse. No library needed.

Add to `src/effects.js`:

```js
export function initCardTilt(selector = '[data-tilt]', { max = 12, scale = 1.03 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(pointer: coarse)').matches) return

  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5
      card.style.transform =
        `perspective(800px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(${scale})`
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
    })
  })
}
```

Call from `src/main.js`:
```js
import { initCardTilt } from './effects.js'
initCardTilt()
```

Add to `src/style.css`:
```css
[data-tilt] {
  transition: transform 0.15s ease;
  will-change: transform;
}
```

Add `data-tilt` to any card in `index.html`. Adjust `max` (degrees) and `scale` (zoom) as needed.
