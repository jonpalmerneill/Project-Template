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
