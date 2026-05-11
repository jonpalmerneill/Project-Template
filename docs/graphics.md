# Graphics flows

## 3D scene (Three.js)

Three.js is not pre-installed — install it when the user asks for 3D or WebGL.

**When not to use Three.js:**
- 2D canvas animations → use Canvas 2D API or Motion.dev
- CSS-only 3D effects → CSS `transform: perspective()`
- Embedded 3D from Spline → Spline exports an `<iframe>` embed, no Three.js needed

**You do:**

1. Run `npm install three`

2. Add a container to `index.html`:
   ```html
   <div id="scene-container" class="scene-container"></div>
   ```

3. Create `src/scene.js`:
   ```js
   import * as THREE from 'three'

   export function initScene(containerId = 'scene-container') {
     const container = document.getElementById(containerId)

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
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
     container.appendChild(renderer.domElement)

     const observer = new ResizeObserver(() => {
       camera.aspect = container.clientWidth / container.clientHeight
       camera.updateProjectionMatrix()
       renderer.setSize(container.clientWidth, container.clientHeight)
     })
     observer.observe(container)

     const clock = new THREE.Clock()
     let animationId

     function tick() {
       animationId = requestAnimationFrame(tick)
       const elapsed = clock.getElapsedTime()
       // ── your animation code here ──
       renderer.render(scene, camera)
     }

     const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
     if (!prefersReduced.matches) tick()
     prefersReduced.addEventListener('change', e => {
       if (e.matches) cancelAnimationFrame(animationId)
       else tick()
     })

     function dispose() {
       observer.disconnect()
       cancelAnimationFrame(animationId)
       renderer.dispose()
     }

     return { scene, camera, renderer, clock, dispose }
   }
   ```

4. Call from `src/main.js`:
   ```js
   import { initScene } from './scene.js'
   const { scene, camera } = initScene()
   ```

5. Add to `src/style.css`:
   ```css
   .scene-container {
     width: 100%;
     height: 100vh;
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
Place `.glb` files in `public/models/`. Free model sources: [Sketchfab](https://sketchfab.com), [Poly Haven](https://polyhaven.com).

**Animating Three.js values with Motion.dev:**
```js
import { animate } from 'motion'
animate(mesh.position, { y: [0, 2] }, { duration: 1, easing: 'ease-in-out' })
```

---

## 2D canvas scene (PixiJS)

PixiJS is not pre-installed — install it when the user asks for 2D WebGL, sprite animation, or interactive canvas graphics.

**PixiJS vs Three.js:**
- PixiJS: 2D games, sprite animation, 2D particles, interactive canvas, CRT/screen filters
- Three.js: 3D depth, perspective cameras, 3D models, anything with a 3D scene

**You do:**

1. Run `npm install pixi.js`

2. Add a container to `index.html`:
   ```html
   <div id="canvas-container" class="canvas-container"></div>
   ```

3. Create `src/pixi.js`:
   ```js
   import { Application, Graphics, Sprite, Assets, Text } from 'pixi.js'

   export async function initPixi(containerId = 'canvas-container') {
     const container = document.getElementById(containerId)

     const app = new Application()
     await app.init({
       resizeTo: container,
       backgroundAlpha: 0,
       antialias: true,
       resolution: Math.min(window.devicePixelRatio, 2),
       autoDensity: true,
     })
     container.appendChild(app.canvas)

     // Animation loop
     app.ticker.add((ticker) => {
       const delta = ticker.deltaTime
       // ── your per-frame animation code here ──
     })

     const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
     if (prefersReduced.matches) app.ticker.stop()
     prefersReduced.addEventListener('change', e => {
       if (e.matches) app.ticker.stop()
       else app.ticker.start()
     })

     function dispose() {
       app.destroy(true, { children: true, texture: true })
     }

     return { app, dispose }
   }
   ```

4. Call from `src/main.js`:
   ```js
   import { initPixi } from './pixi.js'
   const { app } = await initPixi()
   ```

5. Add to `src/style.css`:
   ```css
   .canvas-container {
     width: 100%;
     height: 100vh;
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

Built-in filters:
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

## Custom GLSL shaders

Use for full-screen visual effects (CRT scanlines, distortion, noise, colour grading) or custom materials on Three.js/PixiJS objects.

**You do:**

1. Run `npm install -D vite-plugin-glsl`

2. Update `vite.config.js`:
   ```js
   import glsl from 'vite-plugin-glsl'
   // add glsl() to the plugins array
   ```
   After editing:
   ```js
   plugins: [
     glsl(),
     { name: 'local-api', configureServer(server) { /* existing password middleware */ } },
   ]
   ```

3. Create shader files in `src/shaders/`:

   `src/shaders/fullscreen.vert`:
   ```glsl
   varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
   ```

   `src/shaders/crt.frag` (CRT scanline effect):
   ```glsl
   uniform sampler2D tDiffuse;
   uniform float uTime;
   varying vec2 vUv;

   void main() {
     vec2 uv = vUv;
     float scanline = sin(uv.y * 800.0) * 0.04;
     float r = texture2D(tDiffuse, uv + vec2(0.001, 0.0)).r;
     float g = texture2D(tDiffuse, uv).g;
     float b = texture2D(tDiffuse, uv - vec2(0.001, 0.0)).b;
     gl_FragColor = vec4(r, g, b, 1.0) - scanline;
   }
   ```

4. Import and use:

   **With Three.js:**
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

   **With PixiJS:**
   ```js
   import fragmentSrc from './shaders/crt.frag'
   import { Filter } from 'pixi.js'

   const crtFilter = new Filter({ glProgram: { fragment: fragmentSrc }, resources: {} })
   app.stage.filters = [crtFilter]
   ```

**Tips:**
- `uTime` is the most common uniform: pass elapsed seconds from the animation loop for animated effects
- Use [shadertoy.com](https://shadertoy.com) as a reference — most GLSL from there can be adapted with minor coordinate system changes

---

## Interactive dot field background

A grid of dots on canvas that react to mouse proximity — dots grow or brighten near the cursor.

**You do:**

1. Add a container to `index.html`:
   ```html
   <div id="dot-field" class="dot-field" aria-hidden="true"></div>
   ```

2. Create `src/dotfield.js`:
   ```js
   export function initDotField(containerId = 'dot-field', {
     spacing = 28,
     baseRadius = 1.5,
     hoverRadius = 5,
     influence = 120,
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
     position: absolute;
     inset: 0;
     overflow: hidden;
     pointer-events: none;
     z-index: 0;
   }
   .dot-field canvas { display: block; width: 100%; height: 100%; }
   ```

   The parent element must have `position: relative` and `overflow: hidden`.

**Variations:**
- `spacing: 20` for a denser grid, `spacing: 40` for sparse
- Adjust `hoverRadius` and `influence` to control the effect intensity
- For a static dot grid with no JS, use an SVG `<pattern>` instead
