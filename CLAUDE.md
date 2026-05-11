# Project Context for Claude Code

This is a minimal vanilla JS website starter, built with Vite, optionally connected to Supabase, and deployed via Vercel + GitHub.

---

## Your role

You are the user's hands. They should never have to open a terminal or edit a file manually — you do that for them using your tools.

**Core behaviors:**
- Run terminal commands yourself with your Bash tool. Never show a command and ask the user to run it.
- Edit files directly. Never show a diff or code block and ask the user to paste it in.
- When you need information only the user has (a GitHub URL, a Supabase key, a password), ask for it in plain language, then act on it immediately.
- Ask one clarifying question at a time — don't front-load multiple questions.

---

## On every session start

Do these checks automatically, without being asked:

1. **Dependencies**: Check if `node_modules/` exists. If not, run `npm install` and tell the user when it's done.
2. **Fresh clone detection**: Check if `index.html` contains the comment `TEMPLATE LANDING PAGE`. If it does, this is a fresh clone and the user hasn't built their site yet. Introduce yourself, ask what they want to build, then replace `index.html` with the fresh app scaffold below — do this before starting the dev server.
3. **Dev server**: Ask if they'd like to start the local preview (`npm run dev`) so they can see changes in their browser as they work.

### Fresh app scaffold

When replacing the landing page on a fresh clone, write this to `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Site</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>

    <!-- Password gate overlay — hidden automatically after successful auth -->
    <div id="gate" class="gate">
      <div class="gate-box">
        <h2 class="gate-title">Enter password to continue</h2>
        <form id="gate-form" class="gate-form">
          <input
            type="password"
            id="gate-input"
            class="gate-input"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
          <button type="submit" class="gate-button">Enter</button>
        </form>
        <p id="gate-error" class="gate-error" hidden>Incorrect password. Try again.</p>
      </div>
    </div>

    <!-- Main site content — revealed after auth -->
    <main id="app" class="app" hidden>
      <header class="site-header">
        <h1>Hello, world.</h1>
      </header>
      <section class="content">
        <p>Your site content goes here.</p>
      </section>
    </main>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

After writing the scaffold, ask the user what they'd like to change first — title, content, colors, or something else.

---

## Guided setup flows

When the user asks to do any of the following, follow these exact flows.

### "Set up GitHub" / "Push to GitHub" / "Put this on GitHub"

**You do:**
1. Run `git status` to check if it's already a git repo. If not, run `git init && git branch -M main`.
2. Run `git add .`
3. Run `git commit -m "Initial commit"`

**Tell the user to:**
4. Open [github.com/new](https://github.com/new) in their browser
5. Create a new **private** repository — leave "Add a README", "Add .gitignore", and "Choose a license" all unchecked (they already have these files)
6. Copy the repository URL shown on the next screen (looks like `https://github.com/username/repo-name.git`)

**Ask them to paste the URL, then you:**
7. Run `git remote add origin <their URL>`
8. Run `git push -u origin main`
9. Confirm success and tell them their code is on GitHub

### "Deploy to Vercel" / "Set up hosting" / "Make it live"

**Tell the user to:**
1. Go to [vercel.com](https://vercel.com) and sign in with their GitHub account
2. Click **Add New → Project**
3. Find their GitHub repo and click **Import**
4. Leave all build settings as-is — Vercel detects Vite automatically
5. Click **Deploy** and wait for the green checkmark

**Then tell them:**
- Their site is live at a `.vercel.app` URL
- Environment variables (Supabase keys, password) still need to be added in the Vercel dashboard for those features to work in production — offer to walk them through that next

### "Set up Supabase" / "Connect the database"

**Tell the user to:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait about a minute for it to finish setting up
3. Go to **Settings → API** in the left sidebar
4. Copy the **Project URL** (starts with `https://`)
5. Copy the **anon public** key (long string starting with `eyJ`)

**Ask them to paste both values, then you:**
6. Create a `.env` file by copying `.env.example` and filling in their values
7. Remind them to also add both values to Vercel: project dashboard → **Settings → Environment Variables**

### "Add user accounts" / "Add login" / "Add sign up"

Supabase Auth is already available — no new service needed. Clarify what they want before starting:
- **Individual accounts** (email/password or OAuth) → use Supabase Auth (this flow)
- **Just a shared secret** for a private site → use the existing password gate instead

**Tell the user to:**
1. Go to their Supabase project → **Authentication → Providers**
2. Enable **Email** (on by default) for email/password login, or enable an OAuth provider like Google or GitHub
3. For OAuth, they'll need to create credentials in that provider's developer console (Google Cloud Console, GitHub Settings → Developer Apps, etc.) and paste the client ID and secret into Supabase

**You do — build the UI and wire it up:**
4. Add a login/signup form to `index.html` (or a new `login.html` page)
5. Wire form submission to `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()` — see the commented examples in `src/supabase.js`
6. Call `supabase.auth.onAuthStateChange()` to show/hide content based on login state
7. Add a sign-out button that calls `supabase.auth.signOut()`

**Tell the user to:**
8. Go to Supabase → **Authentication → URL Configuration**
9. Add their site URL to the allowed redirect URLs (required for OAuth and email magic links to work in production)

**Notes:**
- The existing shared password gate and Supabase Auth are independent — either can be removed if not needed
- Once users are authenticated, `supabase.auth.getUser()` returns their ID, which can be used in Supabase RLS policies to restrict data access per-user
- See `src/supabase.js` for the full auth API reference with code examples

### "Turn on password protection" / "Add a password"

**Tell the user to:**
1. Go to their Vercel project dashboard
2. Click **Settings → Environment Variables**
3. Add a new variable — **Name:** `SITE_PASSWORD`, **Value:** the password they want
4. Click **Save**, then redeploy (either push a commit or click Redeploy in the Vercel dashboard)

**For local testing**, add `SITE_PASSWORD=anything` to their `.env` file so the gate works during development.

**Important:** Never add `SITE_PASSWORD` to `.env` and commit it. It should only ever live in Vercel's dashboard and optionally in the local `.env` (which is gitignored).

### "Deploy my changes" / "Push this" / "Go live with my changes"

**You do:**
1. Run `git add .`
2. Run `git commit -m "<short description of what changed>"`
3. Run `git push`
4. Tell them Vercel will automatically redeploy — usually takes under a minute

---

## Working with Figma

The Figma MCP server is available when the user has it configured in Claude Code. When a user shares a Figma URL, use these tools proactively — don't wait to be asked.

### When the user shares a Figma URL

Call `get_design_context` with the `fileKey` and `nodeId` from the URL. This returns reference code, a screenshot, and metadata.

**The reference code is React + Tailwind — always adapt it to this project:**
- Convert JSX to plain HTML
- Convert Tailwind utility classes to CSS, using existing `src/style.css` custom properties where they match (`--color-primary` instead of `text-blue-600`, `--space-md` instead of `p-4`, etc.)
- Add new HTML inside `<main id="app" class="app">` in `index.html`
- Add new CSS classes to `src/style.css` — never use `style=""` attributes
- Use the screenshot as the source of truth for layout and visual intent, not the reference code literally

### Syncing a Figma design token library

When the user wants to pull their Figma color/typography/spacing system into the project:

1. Call `get_variable_defs` on their Figma file node to extract all variable values
2. Map them to the `:root` block in `src/style.css` using this guide:

| CSS variable | Maps from Figma semantic |
|---|---|
| `--color-bg` | Background / Canvas / Surface/0 |
| `--color-text` | Text/Primary / Foreground / On-background |
| `--color-primary` | Primary / Brand / Accent / Interactive |
| `--color-border` | Border / Stroke / Outline |
| `--color-muted` | Text/Secondary / Muted / Subdued |
| `--color-surface` | Surface/Raised / Card / Input / Neutral/50 |
| `--font-body` | Body / Paragraph / Default typeface name |
| `--font-heading` | Heading / Display / Title typeface name |
| `--font-size-base` | Text/Base / Body/Default size |
| `--space-xs/sm/md/lg/xl` | Spacing/1 through Spacing/5 (or equivalent scale) |
| `--ease-default` | Animation/Ease / Motion/Standard |
| `--duration-base` | Animation/Duration / Motion/Base |

3. Update values in-place — keep the CSS variable names as-is
4. If a Figma token doesn't map cleanly, use the closest match and add a comment

### Implementing a specific Figma component or section

1. Call `get_design_context` on the specific node URL
2. If the file has a connected library, call `search_design_system` first to check for existing component mappings
3. Look at the screenshot — use it as the layout reference, not the generated code
4. Build it as plain HTML + CSS class in `src/style.css`, reusing existing variables
5. For interactive behavior, add vanilla JS in `src/main.js`

### What not to do with Figma output

- Don't paste the reference code directly — it's React + Tailwind, not vanilla HTML + CSS
- Don't add Tailwind, React, or any framework unless the user explicitly asks
- Don't use `style=""` inline attributes — all styles go in `src/style.css`
- Don't create new CSS files — add to the existing `src/style.css`
- Don't hardcode hex values that already exist as CSS variables

---

## Common customization tasks

### Change colors
Edit the `:root` block at the top of `src/style.css`. Every variable has a comment. Interpret requests like "make it dark mode" or "use a green accent" and apply them directly.

### Add a dark / light theme toggle

Switches between light and dark themes using a `data-theme` attribute on `<html>`. Respects the user's system preference by default and remembers their choice in `localStorage`.

**You do:**

1. Add an inline script to `<head>` in `index.html` — before any `<link>` or `<style>` tags — to set the theme before the page paints and prevent a flash of the wrong theme:
   ```html
   <script>
     (function () {
       const saved  = localStorage.getItem('theme')
       const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
       document.documentElement.setAttribute('data-theme', saved || system)
     })()
   </script>
   ```

2. Add a toggle button anywhere in `index.html`:
   ```html
   <button data-theme-toggle class="theme-toggle" aria-label="Toggle theme">
     <span class="theme-icon-light">☀</span>
     <span class="theme-icon-dark">☾</span>
   </button>
   ```

3. Create `src/theme.js`:
   ```js
   export function initTheme() {
     const root = document.documentElement

     function setTheme(theme) {
       root.setAttribute('data-theme', theme)
       localStorage.setItem('theme', theme)
     }

     function toggle() {
       setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
     }

     // Wire all toggle buttons
     document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
       btn.addEventListener('click', toggle)
     })

     // Follow system preference changes only if the user hasn't set a manual preference
     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
       if (!localStorage.getItem('theme')) {
         setTheme(e.matches ? 'dark' : 'light')
       }
     })
   }
   ```

4. Call from `src/main.js`:
   ```js
   import { initTheme } from './theme.js'
   initTheme()
   ```

5. Add dark theme variables to `src/style.css`. The `:root` block defines the light theme — add a `[data-theme="dark"]` block that overrides only the values that change:
   ```css
   /* Light theme (default) */
   :root {
     --color-bg:      #ffffff;
     --color-text:    #111111;
     --color-primary: #000000;
     --color-border:  #e0e0e0;
     --color-surface: #f5f5f5;
     --color-muted:   #666666;
   }

   /* Dark theme */
   [data-theme="dark"] {
     --color-bg:      #0f0f0f;
     --color-text:    #f0f0f0;
     --color-primary: #ffffff;
     --color-border:  #2a2a2a;
     --color-surface: #1a1a1a;
     --color-muted:   #999999;
   }
   ```

6. Show/hide the correct icon based on active theme:
   ```css
   .theme-icon-dark  { display: none; }
   [data-theme="dark"] .theme-icon-light { display: none; }
   [data-theme="dark"] .theme-icon-dark  { display: inline; }
   ```

**Notes:**
- The inline `<script>` in step 1 is intentionally synchronous and must run before any CSS — this is the only way to prevent the flash of wrong theme on load
- All colors in the project should reference CSS variables (`var(--color-bg)`, etc.) — hardcoded hex values won't respond to the theme switch
- Add `data-theme-toggle` to as many buttons as needed (nav, footer, etc.) — they all work automatically

---

### Change fonts

**Google Font:**
1. Go to fonts.google.com, find a font, click "Get font" → "Get embed code"
2. Paste the `<link>` tags into the `<head>` of `index.html` (there's a comment showing exactly where)
3. Update `--font-body` or `--font-heading` in the `:root` block of `src/style.css`

**Custom font (uploaded file):**
1. Place `.woff2` file(s) in `public/fonts/`
2. Add an `@font-face` block in `src/style.css` (there's a commented-out example already there)
3. Update `--font-body` or `--font-heading` in `:root`

### Add a page loader

A full-screen overlay that animates a progress bar and counter from 0 → 100, then fades out to reveal the site. Progress fills quickly to ~80% on its own, waits for the page to fully load, then completes.

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

     // Skip animation for users who prefer reduced motion
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       loader.remove()
       return Promise.resolve()
     }

     return new Promise((resolve) => {
       let progress = 0
       let loaded = document.readyState === 'complete'

       window.addEventListener('load', () => { loaded = true }, { once: true })

       const tick = setInterval(() => {
         // Ease toward 82% until page loads, then ease toward 100%
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
           }, 200) // brief pause at 100 before fading out
         }
       }, 16) // ~60fps
     })
   }
   ```

3. Call it at the top of `src/main.js`, before any other init:
   ```js
   import { initLoader } from './loader.js'
   await initLoader()
   // rest of app init below
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

**Variations — ask the user which style they want:**
- Bar only: omit `.loader-count` span and its CSS
- Counter only: omit `.loader-bar` div and its CSS
- Branded: add a logo `<img>` or inline SVG inside `.loader` above the bar
- Faster fill: increase the `0.08` easing factor (e.g. `0.15` fills quicker)

### Add animations

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

Use `--duration-*` and `--ease-*` from `src/style.css` for timing consistency. The `prefers-reduced-motion` block in `src/style.css` suppresses CSS transitions automatically — for JS animations, also check:

```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

### Add advanced scroll animations (GSAP)

Use GSAP when Motion.dev isn't enough: complex timelines, scroll-pinned sections, scrub-based animations tied to scroll position, or sequenced choreography across multiple elements. Motion.dev is the right default for simple reveals and transitions — reach for GSAP when the animation logic starts to feel limiting.

**You do:**

1. Run `npm install gsap`

2. Register plugins and set up in `src/main.js` (or a dedicated `src/animations.js`):
   ```js
   import { gsap } from 'gsap'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'
   gsap.registerPlugin(ScrollTrigger)

   // If also using Lenis, wire them together so ScrollTrigger
   // tracks Lenis scroll position instead of native scroll:
   lenis?.on('scroll', ScrollTrigger.update)
   gsap.ticker.add(time => lenis?.raf(time * 1000))
   gsap.ticker.lagSmoothing(0)
   ```

3. Respect prefers-reduced-motion — skip or instant-complete animations:
   ```js
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     gsap.globalTimeline.timeScale(100) // complete all animations instantly
   }
   ```

**Key patterns:**

Basic animation (runs immediately):
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

Scrub (animation value is tied directly to scroll position):
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

Timeline (sequence animations with precise control):
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
| 3D/WebGL animation values | Motion.dev or GSAP both work |

---

### Add a 3D scene (Three.js)

Three.js is not pre-installed — install it when the user asks for 3D or WebGL.

**When not to reach for Three.js:**
- 2D canvas animations → use the Canvas 2D API or motion.dev
- CSS-only 3D effects (card flips, parallax depth) → CSS `transform: perspective()`
- Embedded 3D from a design tool → Spline exports an `<iframe>` embed, no Three.js needed

**When to install Three.js:** the user wants a 3D scene, WebGL background, interactive 3D object, particle system with depth, or to load a 3D model.

**You do:**

1. Run `npm install three`

2. Add a container element to `index.html` inside `<main id="app" class="app">`:
   ```html
   <div id="scene-container" class="scene-container"></div>
   ```

3. Create `src/scene.js` using this canonical structure — don't skip the resize handler or pixel ratio cap:
   ```js
   import * as THREE from 'three'

   export function initScene(containerId = 'scene-container') {
     const container = document.getElementById(containerId)

     // Scene, camera, renderer
     const scene = new THREE.Scene()
     const camera = new THREE.PerspectiveCamera(
       60,
       container.clientWidth / container.clientHeight,
       0.1,
       1000
     )
     camera.position.z = 5

     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
     renderer.setSize(container.clientWidth, container.clientHeight)
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // cap at 2× — 3× is wasteful
     container.appendChild(renderer.domElement)

     // Resize — use ResizeObserver, not window resize, so it tracks the container
     const observer = new ResizeObserver(() => {
       camera.aspect = container.clientWidth / container.clientHeight
       camera.updateProjectionMatrix()
       renderer.setSize(container.clientWidth, container.clientHeight)
     })
     observer.observe(container)

     // Animation loop
     const clock = new THREE.Clock()
     let animationId

     function tick() {
       animationId = requestAnimationFrame(tick)
       const elapsed = clock.getElapsedTime()
       // ── your animation code here ──
       renderer.render(scene, camera)
     }

     // Respect prefers-reduced-motion — pause animation if requested
     const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
     if (!prefersReduced.matches) tick()
     prefersReduced.addEventListener('change', e => {
       if (e.matches) cancelAnimationFrame(animationId)
       else tick()
     })

     // Cleanup — call this if the scene is ever removed
     function dispose() {
       observer.disconnect()
       cancelAnimationFrame(animationId)
       renderer.dispose()
     }

     return { scene, camera, renderer, clock, dispose }
   }
   ```

4. Call it from `src/main.js`:
   ```js
   import { initScene } from './scene.js'
   const { scene, camera } = initScene()
   ```

5. Add sizing CSS to `src/style.css`:
   ```css
   .scene-container {
     width: 100%;
     height: 100vh; /* or whatever height the design calls for */
   }
   ```

**Loading 3D models (GLTF/GLB):**
```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
loader.load('/models/my-model.glb', (gltf) => {
  scene.add(gltf.scene)
})
```
Place `.glb` files in `public/models/`. Good free model sources: [Sketchfab](https://sketchfab.com), [Poly Haven](https://polyhaven.com), [Market.pmnd.rs](https://market.pmnd.rs).

**Using motion.dev to animate Three.js values:**
```js
import { animate } from 'motion'
animate(mesh.position, { y: [0, 2] }, { duration: 1, easing: 'ease-in-out' })
```

### Add a 2D canvas scene (PixiJS)

PixiJS is not pre-installed — install it when the user asks for 2D WebGL, interactive graphics, sprite animation, or particle systems.

**When to use PixiJS vs Three.js:**
- PixiJS: 2D games, sprite-based animation, 2D particle systems, interactive canvas graphics, effects like CRT distortion or screen filters
- Three.js: anything with 3D depth, perspective cameras, 3D models, or a 3D scene

**You do:**

1. Run `npm install pixi.js`

2. Add a container to `index.html` inside `<main id="app" class="app">`:
   ```html
   <div id="canvas-container" class="canvas-container"></div>
   ```

3. Create `src/pixi.js` using this canonical structure — don't skip the reduced-motion check or dispose function:
   ```js
   import { Application, Graphics, Sprite, Assets, Text } from 'pixi.js'

   export async function initPixi(containerId = 'canvas-container') {
     const container = document.getElementById(containerId)

     const app = new Application()
     await app.init({
       resizeTo: container,
       backgroundAlpha: 0,           // transparent — set background: true and backgroundColor if you want a fill
       antialias: true,
       resolution: Math.min(window.devicePixelRatio, 2), // cap at 2× — 3× wastes GPU
       autoDensity: true,
     })
     container.appendChild(app.canvas)

     // ── Add objects to app.stage here ──
     // Graphics (shapes):
     //   const circle = new Graphics().circle(0, 0, 50).fill(0x3b5bdb)
     //   app.stage.addChild(circle)
     //
     // Sprites (images):
     //   const texture = await Assets.load('/images/sprite.png')
     //   const sprite = new Sprite(texture)
     //   app.stage.addChild(sprite)

     // Animation loop — runs every frame
     app.ticker.add((ticker) => {
       const delta = ticker.deltaTime  // frames elapsed since last tick (1 = 60fps)
       // ── your per-frame animation code here ──
     })

     // Respect prefers-reduced-motion
     const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
     if (prefersReduced.matches) app.ticker.stop()
     prefersReduced.addEventListener('change', e => {
       if (e.matches) app.ticker.stop()
       else app.ticker.start()
     })

     // Cleanup
     function dispose() {
       app.destroy(true, { children: true, texture: true })
     }

     return { app, dispose }
   }
   ```

4. Call it from `src/main.js`:
   ```js
   import { initPixi } from './pixi.js'
   const { app } = await initPixi()
   ```

5. Add sizing CSS to `src/style.css`:
   ```css
   .canvas-container {
     width: 100%;
     height: 100vh; /* adjust to match the design */
   }
   ```

**Common PixiJS patterns:**

Particle system:
```js
const particles = []
for (let i = 0; i < 100; i++) {
  const p = new Graphics().circle(0, 0, 3).fill(0xffffff)
  p.x = Math.random() * app.screen.width
  p.y = Math.random() * app.screen.height
  p.vx = (Math.random() - 0.5) * 2
  p.vy = (Math.random() - 0.5) * 2
  app.stage.addChild(p)
  particles.push(p)
}
app.ticker.add(() => {
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0 || p.x > app.screen.width) p.vx *= -1
    if (p.y < 0 || p.y > app.screen.height) p.vy *= -1
  }
})
```

Built-in filters (blur, color matrix, displacement — no custom GLSL needed):
```js
import { BlurFilter, ColorMatrixFilter } from 'pixi.js'
sprite.filters = [new BlurFilter({ strength: 4 })]
const cm = new ColorMatrixFilter()
cm.greyscale(0.5)
sprite.filters = [cm]
```

Interactive hit areas:
```js
sprite.eventMode = 'static'
sprite.cursor = 'pointer'
sprite.on('pointerdown', () => { /* handle click */ })
```

---

### Add custom GLSL shaders

Use this when the user wants full-screen visual effects (CRT scanlines, distortion, noise, colour grading) or custom materials on Three.js meshes or PixiJS objects. Not pre-installed — add when needed.

**You do:**

1. Run `npm install -D vite-plugin-glsl`

2. Update `vite.config.js` — import and add the plugin:
   ```js
   import glsl from 'vite-plugin-glsl'
   // add glsl() to the plugins array
   ```
   After editing, the plugins array should look like:
   ```js
   plugins: [
     glsl(),
     { name: 'local-api', configureServer(server) { /* existing password middleware */ } },
   ]
   ```

3. Create shader files in `src/shaders/`. Use `.vert` for vertex shaders and `.frag` for fragment shaders (or `.glsl` for shared utility code):

   `src/shaders/fullscreen.vert`:
   ```glsl
   varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
   ```

   `src/shaders/crt.frag` (example — CRT scanline effect):
   ```glsl
   uniform sampler2D tDiffuse;
   uniform float uTime;
   varying vec2 vUv;

   void main() {
     vec2 uv = vUv;
     // Scanlines
     float scanline = sin(uv.y * 800.0) * 0.04;
     // Slight chromatic aberration
     float r = texture2D(tDiffuse, uv + vec2(0.001, 0.0)).r;
     float g = texture2D(tDiffuse, uv).g;
     float b = texture2D(tDiffuse, uv - vec2(0.001, 0.0)).b;
     gl_FragColor = vec4(r, g, b, 1.0) - scanline;
   }
   ```

4. Import and use in JS — Vite handles the import automatically once the plugin is added:

   **With Three.js (ShaderMaterial):**
   ```js
   import vertexShader from './shaders/fullscreen.vert'
   import fragmentShader from './shaders/crt.frag'
   import * as THREE from 'three'

   const material = new THREE.ShaderMaterial({
     uniforms: {
       tDiffuse: { value: null },
       uTime: { value: 0 },
     },
     vertexShader,
     fragmentShader,
   })

   // Update uTime each frame
   app.ticker.add(() => {
     material.uniforms.uTime.value += 0.016
   })
   ```

   **With PixiJS (custom Filter):**
   ```js
   import fragmentSrc from './shaders/crt.frag'
   import { Filter } from 'pixi.js'

   const crtFilter = new Filter({ glProgram: { fragment: fragmentSrc }, resources: {} })
   app.stage.filters = [crtFilter]
   ```

**Tips:**
- Keep shader files small and focused — one effect per file
- `uTime` is the most common uniform: pass elapsed seconds from the animation loop for animated effects
- Use [shadertoy.com](https://shadertoy.com) as a reference — most GLSL from there can be adapted to Three.js/PixiJS with minor changes to the coordinate system

---

### Add smooth scrolling (Lenis)

Lenis replaces native scroll with a smooth, momentum-based version. Use it on any site where fluid scrolling is part of the feel — portfolios, landing pages, editorial sites.

**You do:**

1. Run `npm install lenis`

2. Add to `src/main.js` before other init:
   ```js
   import Lenis from 'lenis'

   // Skip on reduced motion preference
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

3. If also using Motion.dev `scroll()` for scroll-driven animations, pass Lenis scroll events through:
   ```js
   lenis?.on('scroll', () => ScrollObserver.update?.())
   ```
   For most use cases with `inView()`, no extra wiring is needed — Lenis fires standard scroll events that IntersectionObserver picks up automatically.

**Common options:**

| Option | Default | Effect |
|--------|---------|--------|
| `duration` | `1.2` | Scroll duration in seconds — higher = more glide |
| `easing` | exponential | Any `t → t` function |
| `orientation` | `'vertical'` | `'horizontal'` for horizontal scroll |
| `infinite` | `false` | Infinite scroll loop |

To stop/start manually (e.g. when a modal is open): `lenis.stop()` / `lenis.start()`

---

### Add a custom cursor

Hides the default cursor and replaces it with a styled element that follows the mouse. The cursor scales or changes style when hovering interactive elements.

**Skip on touch devices** — always check for coarse pointer before adding a custom cursor.

**You do:**

1. Add to `index.html` immediately after `<body>`:
   ```html
   <div id="cursor" class="cursor" aria-hidden="true"></div>
   ```

2. Create `src/cursor.js`:
   ```js
   export function initCursor() {
     // Don't show on touch screens or when reduced motion is preferred
     if (window.matchMedia('(pointer: coarse)').matches) return
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

     const cursor = document.getElementById('cursor')
     let mouseX = 0, mouseY = 0
     let curX = 0, curY = 0
     const lag = 0.12 // lower = more lag behind the mouse

     document.addEventListener('mousemove', e => {
       mouseX = e.clientX
       mouseY = e.clientY
       cursor.style.opacity = '1'
     })

     // Hide cursor when mouse leaves the window
     document.addEventListener('mouseleave', () => { cursor.style.opacity = '0' })

     // Smoothly follow the mouse each frame
     function tick() {
       curX += (mouseX - curX) * lag
       curY += (mouseY - curY) * lag
       cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`
       requestAnimationFrame(tick)
     }
     tick()

     // Expand cursor on hover over interactive elements
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

**Variations:**
- Instant cursor (no lag): remove the `tick()` RAF loop and set position directly in `mousemove`
- Add `data-cursor-hover` to any element beyond links/buttons to trigger the hover state
- Different states per element type: check `el.tagName` or a `data-cursor` attribute inside the forEach

---

### Add page transitions

Smooth animated transition between pages. An overlay fades in when a link is clicked, the new page loads, then the overlay fades out — giving the impression of a continuous experience.

**This requires the same transition HTML and JS on every page** in the site.

**You do:**

1. Add to every `.html` file in the project, immediately after `<body>`:
   ```html
   <div id="page-transition" class="page-transition" aria-hidden="true"></div>
   ```

2. Create `src/transitions.js`:
   ```js
   export function initPageTransitions() {
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

     const overlay = document.getElementById('page-transition')

     // Fade out the overlay on page enter (runs on every page load)
     overlay.classList.add('is-visible')
     requestAnimationFrame(() => requestAnimationFrame(() => {
       overlay.classList.remove('is-visible')
     }))

     // Fade in the overlay before navigating away
     document.addEventListener('click', e => {
       const link = e.target.closest('a')
       if (!link) return
       if (link.target === '_blank') return          // skip new-tab links
       if (link.hostname !== location.hostname) return // skip external links
       if (link.href === location.href) return        // skip same-page links

       e.preventDefault()
       const href = link.href

       overlay.classList.add('is-visible')
       overlay.addEventListener('transitionend', () => {
         window.location.href = href
       }, { once: true })
     })
   }
   ```

3. Call from `src/main.js` (and any other page entry files):
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
- The double `requestAnimationFrame` on entrance is intentional — it waits for the browser to paint the visible overlay before removing the class so the CSS transition actually fires
- Adjust `0.4s` to control transition speed
- For a slide instead of a fade, animate `transform: translateY()` instead of `opacity`
- For more complex transitions (per-route animations, shared element transitions), consider Barba.js — but it requires significant setup

---

### Add a carousel (Swiper)

Swiper is the standard for touch-friendly, responsive carousels. Use it for image galleries, portfolio case studies, testimonials, or any horizontally scrolling content.

**You do:**

1. Run `npm install swiper`

2. Add the HTML structure to `index.html`:
   ```html
   <div class="swiper">
     <div class="swiper-wrapper">
       <div class="swiper-slide"><!-- slide content --></div>
       <div class="swiper-slide"><!-- slide content --></div>
       <div class="swiper-slide"><!-- slide content --></div>
     </div>
     <!-- Optional controls -->
     <div class="swiper-pagination"></div>
     <button class="swiper-button-prev" aria-label="Previous slide"></button>
     <button class="swiper-button-next" aria-label="Next slide"></button>
   </div>
   ```

3. Initialize in `src/main.js` or a dedicated `src/carousel.js`:
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
     // Uncomment to autoplay:
     // autoplay: { delay: 4000, disableOnInteraction: false },

     // Responsive breakpoints:
     breakpoints: {
       640:  { slidesPerView: 2 },
       1024: { slidesPerView: 3 },
     },
   })
   ```

**Common Swiper modules:**

| Module | Import | What it does |
|--------|--------|-------------|
| `Navigation` | `swiper/modules` | Prev/next buttons |
| `Pagination` | `swiper/modules` | Dot or fraction indicators |
| `Autoplay` | `swiper/modules` | Auto-advances slides |
| `FreeMode` | `swiper/modules` | Drag freely, no snapping |
| `Thumbs` | `swiper/modules` | Thumbnail navigation |

To override Swiper's default button styles, add CSS to `src/style.css` targeting `.swiper-button-next`, `.swiper-button-prev`, and `.swiper-pagination-bullet`.

---

### Split text for animation (SplitType)

SplitType wraps every character, word, or line of a text element in its own `<span>`, so you can animate them individually. Use it for staggered word reveals, line-by-line entrances, or character scramble effects.

**You do:**

1. Run `npm install split-type`

2. Split and animate:
   ```js
   import SplitType from 'split-type'
   import { gsap } from 'gsap'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'

   // Split into lines (most common for scroll reveals)
   const split = new SplitType('.section-heading', { types: 'lines' })

   gsap.from(split.lines, {
     scrollTrigger: { trigger: '.section-heading', start: 'top 85%' },
     opacity: 0,
     y: '110%',       // slide up from below the line (clip with overflow:hidden on parent)
     stagger: 0.08,
     duration: 0.7,
     ease: 'power3.out',
   })
   ```

   Split types:
   - `'lines'` — each line of wrapped text becomes a span
   - `'words'` — each word
   - `'chars'` — each character (use for scramble/reveal effects)
   - `'words, chars'` — both at once

3. Clip the overflow so lines slide up from behind the baseline:
   ```css
   .section-heading { overflow: hidden; }
   /* SplitType wraps each line in a div — clip it */
   .section-heading .line { overflow: hidden; }
   ```

4. Re-split on window resize (line breaks change at different widths):
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

### Add a text scramble effect

Characters cycle through random values before settling on the real text. No library needed.

Add a `scrambleText` function to `src/effects.js` (create it if it doesn't exist):

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

// Trigger on hover
document.querySelectorAll('[data-scramble]').forEach(el => {
  el.addEventListener('mouseenter', () => scrambleText(el))
})

// Trigger on page load
scrambleText(document.querySelector('.nav-logo'))

// Faster with different character set
scrambleText(el, { duration: 400, chars: '01' })  // binary scramble
```

Add `data-scramble` attribute to any element in `index.html` to enable hover scramble automatically.

---

### Add a 3D card tilt on mouse move

Cards rotate in 3D to follow the mouse position — a common effect on product marketing sites. No library needed.

Add `initCardTilt` to `src/effects.js`:

```js
export function initCardTilt(selector = '[data-tilt]', { max = 12, scale = 1.03 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(pointer: coarse)').matches) return  // skip on touch

  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5  // -0.5 to 0.5
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

Add `data-tilt` to any card element in `index.html`. Adjust `max` (rotation degrees) and `scale` (zoom factor) as needed.

---

### Add an interactive dot field background

A grid of dots rendered on canvas that react to mouse proximity — dots grow or brighten near the cursor. Common on SaaS and product marketing sites.

**You do:**

1. Add a container to `index.html` (typically as a background layer in a section):
   ```html
   <div id="dot-field" class="dot-field" aria-hidden="true"></div>
   ```

2. Create `src/dotfield.js`:
   ```js
   export function initDotField(containerId = 'dot-field', {
     spacing = 28,      // gap between dots in px
     baseRadius = 1.5,  // default dot size
     hoverRadius = 5,   // dot size at mouse position
     influence = 120,   // radius of mouse effect in px
   } = {}) {
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

     const container = document.getElementById(containerId)
     const canvas = document.createElement('canvas')
     const ctx = canvas.getContext('2d')
     container.appendChild(canvas)

     let mouseX = -9999, mouseY = -9999

     function resize() {
       canvas.width  = container.offsetWidth
       canvas.height = container.offsetHeight
     }
     resize()
     new ResizeObserver(resize).observe(container)

     window.addEventListener('mousemove', e => {
       const rect = canvas.getBoundingClientRect()
       mouseX = e.clientX - rect.left
       mouseY = e.clientY - rect.top
     })
     window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999 })

     // Read the text color once for dot colour
     const color = getComputedStyle(document.documentElement)
       .getPropertyValue('--color-text').trim() || '#1a1a1a'

     function draw() {
       ctx.clearRect(0, 0, canvas.width, canvas.height)

       for (let x = spacing / 2; x < canvas.width; x += spacing) {
         for (let y = spacing / 2; y < canvas.height; y += spacing) {
           const dx = mouseX - x
           const dy = mouseY - y
           const dist = Math.sqrt(dx * dx + dy * dy)
           const proximity = Math.max(0, 1 - dist / influence)

           const radius  = baseRadius + proximity * (hoverRadius - baseRadius)
           const opacity = 0.15 + proximity * 0.7

           ctx.globalAlpha = opacity
           ctx.fillStyle = color
           ctx.beginPath()
           ctx.arc(x, y, radius, 0, Math.PI * 2)
           ctx.fill()
         }
       }
       ctx.globalAlpha = 1
       requestAnimationFrame(draw)
     }
     draw()
   }
   ```

3. Call from `src/main.js`:
   ```js
   import { initDotField } from './dotfield.js'
   initDotField()
   ```

4. Add to `src/style.css`:
   ```css
   .dot-field {
     position: absolute;   /* or fixed for a full-page background */
     inset: 0;
     overflow: hidden;
     pointer-events: none;
     z-index: 0;
   }
   .dot-field canvas { display: block; width: 100%; height: 100%; }
   ```

   Make sure the parent element has `position: relative` and `overflow: hidden`.

**Variations:**
- `spacing: 20` for a denser grid, `spacing: 40` for sparse
- Change `hoverRadius` and `influence` to control how dramatic the effect is
- For a static (non-interactive) dot grid with no JS, use an SVG `<pattern>` instead

---

### Site content
Edit `index.html`. The main content lives inside `<main id="app" class="app">`.

### Site title and favicon
- Title: the `<title>` tag in `index.html`
- Favicon: replace `public/favicon.svg` with any SVG

### Add a new page
Create a new `.html` file in the project root. Vite builds it automatically. Add a `<link>` in `index.html` to navigate to it. Each page needs its own `<script type="module">` tag pointing to a JS entry file.

### Add a Supabase database query
1. Guide the user through creating a table in the Supabase dashboard
2. Help them set up Row Level Security (RLS) policies
3. Import the client: `import { supabase } from './supabase.js'`
4. Write the query: `const { data, error } = await supabase.from('table').select('*')`

### Add charts or data visualization

Chart.js is the right default — approachable API, good docs, no framework required.

**You do:**
1. Run `npm install chart.js`
2. Add a `<canvas>` element to `index.html` where the chart should appear:
   ```html
   <canvas id="my-chart"></canvas>
   ```
3. Import and initialize in `src/main.js` or a dedicated `src/charts.js`:
   ```js
   import { Chart, registerables } from 'chart.js'
   Chart.register(...registerables)

   const ctx = document.getElementById('my-chart')
   new Chart(ctx, {
     type: 'bar', // bar, line, pie, doughnut, scatter, etc.
     data: {
       labels: ['Jan', 'Feb', 'Mar'],
       datasets: [{ label: 'Sales', data: [12, 19, 8] }]
     },
     options: { responsive: true }
   })
   ```

For more complex data visualization (custom layouts, interactive graphics), D3.js is the right next step — but it has a steep learning curve. Ask the user what they need before reaching for D3.

### Add a map (Leaflet + OpenStreetMap)

Leaflet paired with OpenStreetMap tiles is completely free with no API key required — the right default for any mapping feature.

**You do:**

1. Run `npm install leaflet`

2. Add a container to `index.html`:
   ```html
   <div id="map" class="map-container"></div>
   ```

3. Initialize in `src/main.js` or a dedicated `src/map.js`:
   ```js
   import L from 'leaflet'
   import 'leaflet/dist/leaflet.css'

   // Fix default marker icon paths (Vite asset handling quirk)
   import markerIcon from 'leaflet/dist/images/marker-icon.png'
   import markerShadow from 'leaflet/dist/images/marker-shadow.png'
   delete L.Icon.Default.prototype._getIconUrl
   L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

   const map = L.map('map').setView([51.505, -0.09], 13) // [lat, lng], zoom

   // OpenStreetMap tiles — free, no API key needed
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
     maxZoom: 19,
   }).addTo(map)

   // Add a marker
   L.marker([51.505, -0.09])
     .addTo(map)
     .bindPopup('A popup message.')
     .openPopup()
   ```

4. Add CSS to `src/style.css`:
   ```css
   .map-container {
     width: 100%;
     height: 400px; /* adjust as needed */
   }
   ```

**Common patterns:**

Multiple markers from an array:
```js
const locations = [
  { lat: 51.505, lng: -0.09, label: 'London' },
  { lat: 48.857, lng: 2.352, label: 'Paris' },
]
const markers = locations.map(({ lat, lng, label }) =>
  L.marker([lat, lng]).addTo(map).bindPopup(label)
)
```

Fit map bounds to show all markers:
```js
const group = L.featureGroup(markers)
map.fitBounds(group.getBounds().pad(0.1))
```

GeoJSON layer (country borders, routes, polygons):
```js
L.geoJSON(geojsonData, {
  style: { color: '#000', weight: 1 },
  onEachFeature: (feature, layer) => layer.bindPopup(feature.properties.name),
}).addTo(map)
```

**Note:** For satellite imagery, styled base maps, or vector tiles, Mapbox GL JS offers these but requires a free API key from [mapbox.com](https://mapbox.com).

---

### Use a spreadsheet as a database (Airtable)

Airtable is a spreadsheet with a REST API — good for prototyping content-driven sites where non-developers need to edit data directly.

**Tell the user to:**
1. Go to [airtable.com](https://airtable.com) and create a free account
2. Create a new **Base** and add their data — each row is a record, each column a field
3. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens) → **Create token**
4. Give it **data.records:read** scope (add **write** scope if they need to submit data)
5. Note their **Base ID** from the URL: `airtable.com/appXXXXXXXXXXXXXX/...`

**You do:**
6. Add `VITE_AIRTABLE_TOKEN` and `VITE_AIRTABLE_BASE_ID` to `.env` (and Vercel dashboard)

7. Fetch records:
   ```js
   const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
   const token  = import.meta.env.VITE_AIRTABLE_TOKEN
   const table  = 'YourTableName' // matches the tab name in Airtable

   const res = await fetch(
     `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?maxRecords=100`,
     { headers: { Authorization: `Bearer ${token}` } }
   )
   const { records } = await res.json()
   // record.fields matches your column names exactly
   ```

Filtering and sorting:
```js
const params = new URLSearchParams({
  filterByFormula: `{Status}='Published'`,
  'sort[0][field]': 'CreatedAt',
  'sort[0][direction]': 'desc',
})
const res = await fetch(`https://api.airtable.com/v0/${baseId}/${table}?${params}`, ...)
```

Writing a record (proxy through a Vercel serverless function in production to keep the token server-side):
```js
await fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ records: [{ fields: { Name: 'Jon', Email: 'jon@example.com' } }] }),
})
```

**Airtable vs Supabase:**
- Airtable: non-developer content editing, simple read-heavy data, spreadsheet-friendly workflow
- Supabase: relational data, user auth, real-time updates, write-heavy apps, complex queries

---

### Prototype with real external data

These APIs are free for prototyping and don't require payment details.

**No API key needed — use immediately:**

| API | What it provides | Base URL |
|-----|-----------------|----------|
| JSONPlaceholder | Fake users, posts, comments, todos | `https://jsonplaceholder.typicode.com` |
| Open-Meteo | Real weather forecasts + historical data | `https://api.open-meteo.com/v1/forecast` |
| REST Countries | Country data, flags, currencies, population | `https://restcountries.com/v3.1` |
| Open Library | Book metadata and cover images | `https://openlibrary.org/api/books` |

Quick example — real weather data with zero setup:
```js
const res = await fetch(
  'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current=temperature_2m,wind_speed_10m'
)
const { current } = await res.json()
console.log(current.temperature_2m) // °C
```

**Free tier, API key required:**

| API | What it provides | Sign up |
|-----|-----------------|---------|
| ProPublica Congress | US voting records, bills, members | [propublica.org/datastore](https://www.propublica.org/datastore/api/propublica-congress-api) |
| The Guardian | News articles back to 1999 | [open-platform.theguardian.com](https://open-platform.theguardian.com) |
| NASA | Space imagery, asteroid data, Mars rover photos | [api.nasa.gov](https://api.nasa.gov) |
| Alpha Vantage | Stock prices and financial data | [alphavantage.co](https://alphavantage.co) |
| NewsAPI | Headlines from 80,000+ sources | [newsapi.org](https://newsapi.org) |

Add keys as `VITE_` prefixed env vars in `.env` and the Vercel dashboard.

**Standard fetch pattern with error handling:**
```js
async function fetchData(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

try {
  const data = await fetchData('https://api.example.com/endpoint')
  // render data into the DOM
} catch (err) {
  console.error(err)
  // show an error state to the user
}
```

**Rate limit tip:** For APIs with low rate limits, fetch once via a Vercel serverless function, cache the result in a Supabase table, and serve from there — avoids hitting limits and speeds up the UI.

---

### Add icons

No library needed — inline SVGs are the right approach for vanilla JS. They're themeable via CSS (`currentColor`), accessible, and zero added bundle weight.

**When the user asks for an icon:**
1. Find it at [lucide.dev](https://lucide.dev) (clean, consistent set) or [heroicons.com](https://heroicons.com)
2. Copy the SVG source and paste it directly into `index.html`
3. Size with CSS (`width`/`height`) and color with `color: var(--color-primary)` — SVG strokes inherit `currentColor` automatically

If the user needs many icons across many pages, install `lucide` as a dependency:
```js
import { createIcons, icons } from 'lucide'
createIcons({ icons }) // auto-replaces <i data-lucide="name"> elements
```

### Add payments (Stripe)

Stripe is the standard for web payments. The key rule: **payment logic runs server-side** — never handle payment amounts or confirmations in browser JS.

**You do:**
1. Run `npm install @stripe/stripe-js`
2. Create `api/create-checkout.js` — a Vercel serverless function that creates a Stripe Checkout session:
   ```js
   import Stripe from 'stripe'
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

   export default async function handler(req, res) {
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: [{ price: 'price_xxxxx', quantity: 1 }],
       mode: 'payment',
       success_url: `${process.env.SITE_URL}/success.html`,
       cancel_url: `${process.env.SITE_URL}`,
     })
     res.json({ url: session.url })
   }
   ```
3. In browser JS, call the endpoint and redirect:
   ```js
   const res = await fetch('/api/create-checkout', { method: 'POST' })
   const { url } = await res.json()
   window.location.href = url
   ```

**Tell the user to:**
4. Install the Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli) (needed for local webhook testing)
5. Add `STRIPE_SECRET_KEY` and `SITE_URL` to their Vercel environment variables (never `VITE_` prefixed — server only)
6. Add `stripe` as a server-side dependency: `npm install stripe`

### Add a survey or multi-step form

Two approaches — pick based on how much control the user needs over the UI.

**Option A — SurveyJS (recommended for complex surveys)**

SurveyJS renders multi-step surveys from a JSON schema. Handles branching logic, validation, progress bars, conditional questions, and multiple page flows — without building any of that from scratch.

**You do:**

1. Run `npm install survey-core survey-js-ui`

2. Add a container to `index.html`:
   ```html
   <div id="survey"></div>
   ```

3. Create `src/survey.js`:
   ```js
   import { Model } from 'survey-core'
   import { SurveyJS } from 'survey-js-ui'
   import 'survey-core/defaultV2.min.css'

   export function initSurvey(containerId = 'survey') {
     const surveyJson = {
       title: 'Your Survey Title',
       showProgressBar: 'top',
       pages: [
         {
           name: 'page1',
           elements: [
             {
               type: 'text',
               name: 'name',
               title: 'What is your name?',
               isRequired: true,
             },
             {
               type: 'radiogroup',
               name: 'satisfaction',
               title: 'How satisfied are you?',
               choices: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
               isRequired: true,
             },
           ],
         },
         {
           name: 'page2',
           elements: [
             {
               type: 'comment',
               name: 'feedback',
               title: 'Any additional feedback?',
             },
           ],
         },
       ],
     }

     const survey = new Model(surveyJson)

     // Handle completion — save to Supabase, post to an API, or log
     survey.onComplete.add(async (sender) => {
       const responses = sender.data
       console.log('Survey results:', responses)
       // await supabase.from('survey_responses').insert([responses])
     })

     const surveyUI = new SurveyJS(document.getElementById(containerId), survey)
   }
   ```

4. Call from `src/main.js`:
   ```js
   import { initSurvey } from './survey.js'
   initSurvey()
   ```

**Key SurveyJS question types:**

| type | What it renders |
|------|----------------|
| `text` | Single-line text input |
| `comment` | Multi-line textarea |
| `radiogroup` | Single-choice radio buttons |
| `checkbox` | Multi-choice checkboxes |
| `dropdown` | Select menu |
| `rating` | Star or number rating scale |
| `boolean` | Yes/No toggle |
| `matrix` | Grid of radio buttons |
| `html` | Arbitrary HTML between questions |

**Branching logic (show question only if condition met):**
```js
{
  type: 'text',
  name: 'other_reason',
  title: 'Please specify:',
  visibleIf: "{satisfaction} = 'Dissatisfied'",
}
```

**Styling:** SurveyJS ships with `defaultV2.min.css`. Override variables in `src/style.css` using the `--sjs-` CSS custom property prefix, or set `survey.applyTheme({ cssVariables: { '--sjs-primary-backcolor': 'var(--color-primary)' } })` to match the site's design tokens.

---

**Option B — Custom survey backed by Supabase**

Use this when the user wants a fully branded, pixel-perfect survey experience with responses stored in their own database.

**Database setup — tell the user to create these tables in Supabase:**

```sql
-- Surveys table
create table surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz default now()
);

-- Questions table
create table questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id),
  position int not null,
  type text not null,       -- 'text' | 'radio' | 'checkbox' | 'scale'
  label text not null,
  options jsonb,            -- array of choices for radio/checkbox
  required boolean default false
);

-- Responses table
create table responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id),
  answers jsonb not null,   -- { question_id: answer_value }
  submitted_at timestamptz default now()
);
```

**You do — build the survey runner in `src/survey.js`:**

```js
import { supabase } from './supabase.js'

export async function initSurvey(surveyId, containerId = 'survey') {
  const container = document.getElementById(containerId)
  const answers = {}
  let currentPage = 0

  // Load questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', surveyId)
    .order('position')

  function renderQuestion(q) {
    container.innerHTML = `
      <div class="survey-step">
        <p class="survey-label">${q.label}${q.required ? ' *' : ''}</p>
        ${renderInput(q)}
        <div class="survey-nav">
          ${currentPage > 0 ? '<button id="back-btn" class="btn-secondary">Back</button>' : ''}
          <button id="next-btn" class="btn-primary">${currentPage === questions.length - 1 ? 'Submit' : 'Next'}</button>
        </div>
      </div>
    `
    document.getElementById('next-btn').addEventListener('click', () => advance(q))
    document.getElementById('back-btn')?.addEventListener('click', () => { currentPage--; renderQuestion(questions[currentPage]) })
  }

  function renderInput(q) {
    if (q.type === 'text') return `<input id="answer" class="survey-input" type="text" value="${answers[q.id] || ''}" />`
    if (q.type === 'radio') return q.options.map(opt =>
      `<label class="survey-option"><input type="radio" name="answer" value="${opt}" ${answers[q.id] === opt ? 'checked' : ''}> ${opt}</label>`
    ).join('')
    if (q.type === 'scale') return `<input id="answer" type="range" min="1" max="10" value="${answers[q.id] || 5}">`
    return ''
  }

  async function advance(q) {
    const val = q.type === 'radio'
      ? document.querySelector('input[name="answer"]:checked')?.value
      : document.getElementById('answer')?.value
    if (q.required && !val) return // basic validation
    answers[q.id] = val

    if (currentPage < questions.length - 1) {
      currentPage++
      renderQuestion(questions[currentPage])
    } else {
      await supabase.from('responses').insert([{ survey_id: surveyId, answers }])
      container.innerHTML = '<p class="survey-complete">Thanks for your response!</p>'
    }
  }

  renderQuestion(questions[currentPage])
}
```

**When to use each approach:**
- SurveyJS: complex branching logic, many question types, faster to build, good enough styling control
- Custom Supabase: pixel-perfect branded design, responses in your own DB, full control over every interaction

---

### Add an audio player

A custom-styled HTML5 audio player with play/pause, a scrubbing timeline, and current/duration display. No library needed.

**You do:**

1. Add to `index.html`:
   ```html
   <div class="audio-player" data-src="/audio/track.mp3">
     <button class="player-btn" id="play-btn" aria-label="Play">
       <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
       <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" hidden><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
     </button>
     <div class="player-meta">
       <span class="player-title">Track Title</span>
       <div class="player-timeline">
         <div class="player-progress">
           <div class="player-fill" id="player-fill"></div>
         </div>
         <span class="player-time" id="player-time">0:00 / 0:00</span>
       </div>
     </div>
   </div>
   ```
   Place audio files in `public/audio/`. For multiple tracks, repeat the `.audio-player` block with different `data-src` and titles.

2. Create `src/player.js`:
   ```js
   export function initPlayers() {
     document.querySelectorAll('.audio-player').forEach(el => {
       const src     = el.dataset.src
       const btn     = el.querySelector('.player-btn')
       const fill    = el.querySelector('.player-fill')
       const time    = el.querySelector('.player-time')
       const progress = el.querySelector('.player-progress')
       const iconPlay  = el.querySelector('.icon-play')
       const iconPause = el.querySelector('.icon-pause')

       const audio = new Audio(src)

       function fmt(s) {
         const m = Math.floor(s / 60)
         return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
       }

       audio.addEventListener('timeupdate', () => {
         const pct = audio.duration ? audio.currentTime / audio.duration : 0
         fill.style.width = `${pct * 100}%`
         time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`
       })

       audio.addEventListener('ended', () => {
         iconPlay.hidden  = false
         iconPause.hidden = true
         el.classList.remove('is-playing')
       })

       // Play/pause
       btn.addEventListener('click', () => {
         // Pause any other active players first
         document.querySelectorAll('.audio-player.is-playing').forEach(other => {
           if (other !== el) other.querySelector('.player-btn').click()
         })
         if (audio.paused) {
           audio.play()
           iconPlay.hidden  = true
           iconPause.hidden = false
           el.classList.add('is-playing')
         } else {
           audio.pause()
           iconPlay.hidden  = false
           iconPause.hidden = true
           el.classList.remove('is-playing')
         }
       })

       // Scrubbing
       progress.addEventListener('click', e => {
         const rect = progress.getBoundingClientRect()
         audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
       })
     })
   }
   ```

3. Call from `src/main.js`:
   ```js
   import { initPlayers } from './player.js'
   initPlayers()
   ```

4. Add to `src/style.css`:
   ```css
   .audio-player {
     display: flex;
     align-items: center;
     gap: 1rem;
     padding: 0.75rem 1rem;
     border: 1px solid var(--color-border);
     background: var(--color-surface);
   }

   .player-btn {
     flex-shrink: 0;
     width: 40px;
     height: 40px;
     border: none;
     background: var(--color-primary);
     color: #fff;
     cursor: pointer;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   .player-btn svg { width: 20px; height: 20px; }

   .player-meta {
     flex: 1;
     min-width: 0;
     display: flex;
     flex-direction: column;
     gap: 0.35rem;
   }

   .player-title {
     font-size: 0.85rem;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
   }

   .player-timeline {
     display: flex;
     align-items: center;
     gap: 0.5rem;
   }

   .player-progress {
     flex: 1;
     height: 3px;
     background: var(--color-border);
     cursor: pointer;
     position: relative;
   }

   .player-fill {
     height: 100%;
     width: 0%;
     background: var(--color-primary);
     pointer-events: none;
   }

   .player-time {
     font-size: 0.75rem;
     white-space: nowrap;
     opacity: 0.6;
   }
   ```

**Multiple tracks / playlist:**
Repeat `.audio-player` blocks in the HTML. The player automatically pauses any currently playing track when another is started.

**Autoplay note:** Browsers block autoplay with sound by default. Never call `audio.play()` without a user gesture (a click). The pattern above is always user-initiated.

**Streaming audio:** Replace `data-src` with any publicly accessible audio URL (Spotify previews, SoundCloud direct links, etc.). For protected audio, serve files from Supabase Storage.

---

### Add a contact form

Two approaches — pick based on what the user needs:

**Option A — Formspree (recommended for most users)**
No backend code required. Formspree receives submissions and emails them to the user.

**Tell the user to:**
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Click **New Form**, give it a name, and copy the form endpoint URL (looks like `https://formspree.io/f/xyzabcde`)

**You do:**
3. Add the form HTML to `index.html`:
   ```html
   <form id="contact-form" class="contact-form" action="https://formspree.io/f/xyzabcde" method="POST">
     <label for="contact-name">Name</label>
     <input type="text" id="contact-name" name="name" required />

     <label for="contact-email">Email</label>
     <input type="email" id="contact-email" name="email" required />

     <label for="contact-message">Message</label>
     <textarea id="contact-message" name="message" rows="5" required></textarea>

     <button type="submit" class="btn-submit">Send message</button>
     <p id="contact-status" class="contact-status" hidden></p>
   </form>
   ```
4. Add JS to handle the async submission and show a success/error message:
   ```js
   const form = document.getElementById('contact-form')
   const status = document.getElementById('contact-status')

   form.addEventListener('submit', async (e) => {
     e.preventDefault()
     const data = new FormData(form)
     const res = await fetch(form.action, {
       method: 'POST',
       body: data,
       headers: { Accept: 'application/json' }
     })
     status.hidden = false
     if (res.ok) {
       status.textContent = 'Message sent — thanks!'
       form.reset()
     } else {
       status.textContent = 'Something went wrong. Please try again.'
     }
   })
   ```
5. Add form styles to `src/style.css` — inputs, labels, button, and status message

**Option B — Vercel serverless function + Resend**
Use this when the user wants custom email templates, to send from their own domain, or to store submissions in Supabase.

**You do:**
1. Run `npm install resend`
2. Create `api/contact.js`:
   ```js
   import { Resend } from 'resend'
   const resend = new Resend(process.env.RESEND_API_KEY)

   export default async function handler(req, res) {
     if (req.method !== 'POST') return res.status(405).end()
     const { name, email, message } = req.body
     const { error } = await resend.emails.send({
       from: 'Contact Form <onboarding@resend.dev>',
       to: process.env.CONTACT_EMAIL,
       subject: `New message from ${name}`,
       text: `From: ${name} <${email}>\n\n${message}`,
     })
     if (error) return res.status(500).json({ error })
     res.json({ success: true })
   }
   ```
3. Build the same form HTML as Option A, but point it at `/api/contact` with `fetch`
4. Add `Content-Type: application/json` header and send `JSON.stringify({ name, email, message })`

**Tell the user to:**
5. Sign up at [resend.com](https://resend.com) and create an API key
6. Add `RESEND_API_KEY` and `CONTACT_EMAIL` to their Vercel environment variables

### Add third-party embeds

Many sites need embeds from external tools. These are paste-and-done — no npm install, no JS to write.

**How to handle them:**
- Copy the embed code from the third-party tool
- Paste it into `index.html` at the right location inside `<main id="app" class="app">`
- Style the container in `src/style.css` if needed (width, aspect ratio, etc.)

**Common embeds:**

| Tool | Where to get the embed code |
|------|-----------------------------|
| YouTube / Vimeo | Share → Embed |
| Google Maps | Share → Embed a map |
| Calendly | Integrations → Embed |
| Typeform | Share → Embed |
| Spotify | Share → Embed track/playlist |
| Airtable | Share → Embed this view |
| Loom | Share → Embed |

For embeds that load a `<script>` tag asynchronously (Calendly, HubSpot forms, etc.), place the `<script>` tag just before `</body>` in `index.html` to avoid blocking page render.

### Disable password protection
1. Remove `initAuth()` from `src/main.js`
2. Remove the `<div id="gate">` block from `index.html`

---

## File map

| File | What it does |
|------|-------------|
| `index.html` | The only HTML page. Contains the password gate overlay and the main content area. |
| `src/style.css` | All CSS. The `:root` block at the top is the design control panel. |
| `src/main.js` | Entry point. Calls `initAuth()`, then app logic goes here. |
| `src/auth.js` | Gate logic: checks sessionStorage → shows form → calls API → hides gate on success. |
| `src/supabase.js` | Creates and exports the configured Supabase client. |
| `api/check-password.js` | Vercel serverless function. Validates the password server-side. |
| `public/favicon.svg` | Placeholder favicon. Replace with any SVG. |
| `public/fonts/` | Place custom font files (`.woff2`) here. Served as static assets. |
| `vite.config.js` | Vite config. Includes a local middleware that mirrors the password API for dev. |
| `vercel.json` | Tells Vercel how to build and serve the project. |
| `package.json` | Dependencies and dev scripts. |
| `.env.example` | Documents required environment variables. |
| `.env` | Local secrets (gitignored). Copy from `.env.example`. |
| `.gitignore` | Excludes `.env`, `node_modules/`, `dist/`. |
| `CLAUDE.md` | Project context for Claude Code users (this file). |
| `.cursorrules` | Project context for Cursor users — mirrors this file. |

---

## How password protection works

1. `main.js` calls `initAuth()` from `src/auth.js`
2. `auth.js` checks `sessionStorage` for an existing auth flag
3. Found → gate hides immediately, app shows
4. Not found → gate overlay shown, user enters password
5. On submit → password POSTed to `/api/check-password`
6. Serverless function compares it to `SITE_PASSWORD` env var (server-side only)
7. Success → flag saved to `sessionStorage`, gate hides, app shows
8. Failure → error message shown, input cleared

`sessionStorage` is tab-scoped — it clears when the tab closes. Intentional for a shared-password site.

---

## How Supabase is wired

`src/supabase.js` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the environment and exports a configured client. Import it wherever you need database access:

```js
import { supabase } from './supabase.js'
const { data, error } = await supabase.from('my_table').select('*')
```

The anon key is safe to expose in the browser — Supabase uses Row Level Security policies to control data access. If Supabase isn't being used, this file can be ignored entirely.

---

## Environment variables

| Variable | Where it lives | What it is |
|----------|---------------|------------|
| `VITE_SUPABASE_URL` | `.env` + Vercel dashboard | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` + Vercel dashboard | Supabase public/anon key |
| `SITE_PASSWORD` | Vercel dashboard only | The shared password for the gate |

`VITE_` prefix = bundled into the browser JS (safe for public keys). No prefix = server-only. Never give `SITE_PASSWORD` a `VITE_` prefix.

---

## Before you ship — accessibility and performance checks

Run these checks before considering any feature done. Fix issues found rather than noting them.

### Accessibility

**Semantic structure**
- [ ] Heading hierarchy is logical — one `<h1>` per page, `<h2>`/`<h3>` used in order, never skipped
- [ ] Landmark elements are present — `<header>`, `<main>`, `<footer>`, `<nav>` where appropriate
- [ ] Lists use `<ul>`/`<ol>`/`<li>`, not a series of `<div>` elements

**Images and media**
- [ ] Every `<img>` has an `alt` attribute — descriptive for content images, `alt=""` for decorative ones
- [ ] Videos have captions or a transcript if they convey information

**Interactive elements**
- [ ] Every button and link has an accessible name — either visible text, `aria-label`, or `aria-labelledby`
- [ ] Icon-only buttons always have `aria-label`: `<button aria-label="Close menu">`
- [ ] Links go somewhere — no `<a href="#">` used as buttons (use `<button>` instead)
- [ ] No `tabindex` values greater than 0

**Keyboard navigation**
- [ ] All interactive elements are reachable by Tab key
- [ ] Focus is always visible — never remove `outline` without providing an equivalent visual indicator
- [ ] Modals trap focus while open and return focus to the trigger when closed
- [ ] Custom components (dropdowns, toggles) respond to keyboard: Enter/Space to activate, Escape to dismiss, arrow keys where expected

**Forms**
- [ ] Every `<input>`, `<select>`, and `<textarea>` has a `<label>` associated via `for`/`id` or `aria-label`
- [ ] Error messages are programmatically associated with their input via `aria-describedby`
- [ ] Required fields are marked with `required` attribute (not just a visual asterisk)

**Color and contrast**
- [ ] Text contrast ratio is at least 4.5:1 against its background (normal text) or 3:1 (large text / UI components)
- [ ] Information is never conveyed by color alone — always pair color with text, icon, or pattern

**Motion**
- [ ] All JS-driven animations check `prefers-reduced-motion` and skip or instant-complete if set
- [ ] CSS transitions use the `prefers-reduced-motion` media query in `src/style.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

### Performance

**Images**
- [ ] All `<img>` elements have explicit `width` and `height` attributes to prevent layout shift (CLS)
- [ ] Images below the fold use `loading="lazy"`
- [ ] Images use modern formats (WebP or AVIF) where possible
- [ ] Large images are sized appropriately — don't serve a 3000px image in a 400px container

**Animation and rendering**
- [ ] Animations only use `transform` and `opacity` — never animate `width`, `height`, `top`, `left`, or other layout properties (these trigger reflow)
- [ ] `will-change: transform` is used sparingly and only on elements that are actively animating — remove it after the animation completes
- [ ] Canvas and WebGL renderers cap pixel ratio at 2: `Math.min(window.devicePixelRatio, 2)` — 3× screens gain nothing visible and waste significant GPU
- [ ] `requestAnimationFrame` loops are cancelled (`cancelAnimationFrame`) when the element is removed or hidden
- [ ] RAF loops are paused when the page is hidden: `document.addEventListener('visibilitychange', () => { if (document.hidden) pause() })`

**DOM and JS**
- [ ] DOM reads and writes are not interleaved in a loop — batch reads first, then writes, to avoid layout thrashing
- [ ] `ResizeObserver` is used to track element size changes, not `window.resize` polling
- [ ] Event listeners on `scroll` and `mousemove` use passive mode where possible: `addEventListener('scroll', fn, { passive: true })`
- [ ] Large datasets rendered to the DOM are paginated or virtualized — don't render 500 cards at once

**Loading**
- [ ] `<script type="module">` tags are in `<head>` with `defer` behavior (modules are deferred by default — no extra attribute needed)
- [ ] Third-party embeds (Calendly, Typeform, etc.) load asynchronously — their `<script>` tags are placed just before `</body>`
- [ ] Fonts use `font-display: swap` in `@font-face` declarations to prevent invisible text during load

---

## Constraints

- Keep it vanilla JS unless the user explicitly asks for a framework
- Don't install new dependencies without asking
- Keep all styles in `src/style.css`
- `SITE_PASSWORD` must never have a `VITE_` prefix
- Never ask the user to run a terminal command — use your Bash tool instead
- Never ask the user to manually edit a file — edit it for them
