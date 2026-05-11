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

## Constraints

- Keep it vanilla JS unless the user explicitly asks for a framework
- Don't install new dependencies without asking
- Keep all styles in `src/style.css`
- `SITE_PASSWORD` must never have a `VITE_` prefix
- Never ask the user to run a terminal command — use your Bash tool instead
- Never ask the user to manually edit a file — edit it for them
