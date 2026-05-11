# UI flows

## Dark / light theme toggle

Switches between light and dark themes using a `data-theme` attribute on `<html>`. Respects the user's system preference by default and remembers their choice in `localStorage`.

**You do:**

1. Add an inline script to `<head>` in `index.html` — before any `<link>` or `<style>` tags — to prevent a flash of wrong theme on load:
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

     document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
       btn.addEventListener('click', toggle)
     })

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

5. Add dark theme variables to `src/style.css`:
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

6. Show/hide the correct icon:
   ```css
   .theme-icon-dark  { display: none; }
   [data-theme="dark"] .theme-icon-light { display: none; }
   [data-theme="dark"] .theme-icon-dark  { display: inline; }
   ```

**Notes:**
- The inline `<script>` in step 1 must run before any CSS to prevent the flash
- All colors should reference CSS variables — hardcoded hex values won't respond to theme changes
- Add `data-theme-toggle` to as many buttons as needed — they all work automatically

---

## Reactive UI without a framework (Alpine.js)

Alpine.js adds reactivity directly to HTML attributes — no component files, no build step changes. Use it when multiple elements need to react to shared state: tabs, accordions, live-filtering lists, forms with conditional fields.

**Vanilla JS vs Alpine:**
- Vanilla JS: one-off event handlers, animations, interactions that don't depend on shared state
- Alpine: multiple elements that need to stay in sync with changing data

**Install:**

1. Run `npm install alpinejs`

2. Add to the top of `src/main.js` — before any other init:
   ```js
   import Alpine from 'alpinejs'
   Alpine.start()
   ```

**Core directives:**

| Directive | What it does |
|-----------|-------------|
| `x-data="{ key: value }"` | Declares a reactive scope on any element |
| `x-text="key"` | Sets element text content from state |
| `x-show="condition"` | Toggles visibility (`display: none/block`) |
| `x-if="condition"` | Adds/removes from the DOM entirely |
| `x-for="item in items"` | Loops over an array |
| `x-model="key"` | Two-way input binding |
| `@click="..."` | Event listener (shorthand for `x-on:click`) |
| `:class="..."` | Bind attributes to state (shorthand for `x-bind:class`) |
| `x-init="..."` | Run code when the component initializes |
| `x-transition` | Built-in enter/leave CSS transitions |

**Common patterns:**

Show/hide toggle:
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open" x-transition>Hidden content</div>
</div>
```

Tabs:
```html
<div x-data="{ tab: 'about' }">
  <button @click="tab = 'about'" :class="{ active: tab === 'about' }">About</button>
  <button @click="tab = 'work'"  :class="{ active: tab === 'work' }">Work</button>
  <div x-show="tab === 'about'">About content</div>
  <div x-show="tab === 'work'">Work content</div>
</div>
```

Live search / filter:
```html
<div x-data="{ search: '', items: ['Apple', 'Banana', 'Cherry'] }">
  <input x-model="search" placeholder="Filter..." />
  <ul>
    <template x-for="item in items.filter(i => i.toLowerCase().includes(search.toLowerCase()))">
      <li x-text="item"></li>
    </template>
  </ul>
</div>
```

Fetch and render a list:
```html
<div
  x-data="{ posts: [] }"
  x-init="fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(r => r.json()).then(d => posts = d)"
>
  <template x-for="post in posts" :key="post.id">
    <article>
      <h3 x-text="post.title"></h3>
      <p x-text="post.body"></p>
    </article>
  </template>
</div>
```

**Global store (share state across separate parts of the page):**

Register in `src/main.js` before `Alpine.start()`:
```js
import Alpine from 'alpinejs'

Alpine.store('cart', {
  items: [],
  get count() { return this.items.length },
  add(item)   { this.items.push(item) },
  remove(id)  { this.items = this.items.filter(i => i.id !== id) },
})

Alpine.start()
```

Use anywhere in HTML:
```html
<span x-text="$store.cart.count"></span>
<button @click="$store.cart.add({ id: 1, name: 'Item' })">Add to cart</button>
```

**Notes:**
- Alpine coexists with vanilla JS — use Alpine for reactive state, vanilla JS / GSAP / Motion.dev for animations
- `x-transition` applies simple CSS fade/scale transitions — for anything more complex, trigger a GSAP animation from `@click` handlers

---

## Audio player

A custom-styled HTML5 audio player with play/pause, a scrubbing timeline, and time display. No library needed.

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
   Place audio files in `public/audio/`. Repeat the `.audio-player` block for multiple tracks.

2. Create `src/player.js`:
   ```js
   export function initPlayers() {
     document.querySelectorAll('.audio-player').forEach(el => {
       const src      = el.dataset.src
       const btn      = el.querySelector('.player-btn')
       const fill     = el.querySelector('.player-fill')
       const time     = el.querySelector('.player-time')
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

       btn.addEventListener('click', () => {
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

---

## Contact form

### Option A — Formspree (recommended for most users)

No backend code required. Formspree receives submissions and emails them.

**Tell the user to:**
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Click **New Form**, give it a name, and copy the endpoint URL (looks like `https://formspree.io/f/xyzabcde`)

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
4. Add JS to handle async submission:
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

### Option B — Vercel serverless function + Resend

Use when the user wants custom email templates, sending from their own domain, or storing submissions in Supabase.

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
3. Build the same form HTML as Option A, but POST to `/api/contact` with JSON

**Tell the user to:**
4. Sign up at [resend.com](https://resend.com) and create an API key
5. Add `RESEND_API_KEY` and `CONTACT_EMAIL` to Vercel environment variables

---

## Survey or multi-step form

### Option A — SurveyJS (recommended for complex surveys)

Handles branching logic, validation, progress bars, and conditional questions from a JSON schema.

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

**Branching logic:**
```js
{
  type: 'text',
  name: 'other_reason',
  title: 'Please specify:',
  visibleIf: "{satisfaction} = 'Dissatisfied'",
}
```

**Styling:** Override with `--sjs-` CSS custom properties, or `survey.applyTheme({ cssVariables: { '--sjs-primary-backcolor': 'var(--color-primary)' } })`

### Option B — Custom survey backed by Supabase

Use when the user wants pixel-perfect branded design with responses stored in their own database.

**Database setup:**
```sql
create table surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id),
  position int not null,
  type text not null,
  label text not null,
  options jsonb,
  required boolean default false
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id),
  answers jsonb not null,
  submitted_at timestamptz default now()
);
```

**Survey runner in `src/survey.js`:**
```js
import { supabase } from './supabase.js'

export async function initSurvey(surveyId, containerId = 'survey') {
  const container = document.getElementById(containerId)
  const answers = {}
  let currentPage = 0

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
    if (q.required && !val) return
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

**When to use each:**
- SurveyJS: complex branching logic, many question types, faster to build
- Custom Supabase: pixel-perfect branded design, responses in your own DB

---

## Payments (Stripe)

Payment logic always runs server-side — never handle amounts or confirmations in browser JS.

**You do:**
1. Run `npm install @stripe/stripe-js`
2. Create `api/create-checkout.js`:
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
3. In browser JS:
   ```js
   const res = await fetch('/api/create-checkout', { method: 'POST' })
   const { url } = await res.json()
   window.location.href = url
   ```

**Tell the user to:**
4. Install Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli) for local webhook testing
5. Add `STRIPE_SECRET_KEY` and `SITE_URL` to Vercel environment variables (never `VITE_` prefixed)
6. Run `npm install stripe` for the server-side package

---

## Third-party embeds

Copy the embed code from the tool and paste into `index.html` inside `<main id="app" class="app">`.

| Tool | Where to get the embed code |
|------|-----------------------------|
| YouTube / Vimeo | Share → Embed |
| Google Maps | Share → Embed a map |
| Calendly | Integrations → Embed |
| Typeform | Share → Embed |
| Spotify | Share → Embed track/playlist |
| Airtable | Share → Embed this view |
| Loom | Share → Embed |

For embeds that load a `<script>` tag asynchronously (Calendly, HubSpot forms, etc.), place the `<script>` just before `</body>` to avoid blocking page render.

---

## Icons

No library needed — inline SVGs are the right approach. Themeable via CSS (`currentColor`), accessible, and zero bundle weight.

1. Find the icon at [lucide.dev](https://lucide.dev) or [heroicons.com](https://heroicons.com)
2. Copy the SVG source and paste it directly into `index.html`
3. Size with CSS (`width`/`height`) and color with `color: var(--color-primary)` — SVG strokes inherit `currentColor`

If the user needs many icons across many pages:
```js
import { createIcons, icons } from 'lucide'
createIcons({ icons }) // auto-replaces <i data-lucide="name"> elements
```

---

## Adding pages

Create a new `.html` file in the project root. Vite builds it automatically. Add a `<link>` in `index.html` to navigate to it. Each page needs its own `<script type="module">` tag pointing to a JS entry file.

For page-to-page transitions, see `docs/animation.md` → Page transitions.
