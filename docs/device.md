# Device flows

## Real-time messaging between devices (Supabase Realtime)

Supabase Realtime lets any number of connected clients — phones, tablets, laptops, browsers — send messages to each other instantly and track which devices are connected. No new service needed: it's part of the Supabase project already configured in the template.

Use this for: multi-device prototypes, shared remote controls, live dashboards, collaborative tools, IoT command interfaces where the "hardware" is another browser tab or phone.

### Broadcast — send a message to every connected client

```js
import { supabase } from './supabase.js'

const channel = supabase.channel('prototype-room')

// Listen for incoming messages
channel.on('broadcast', { event: 'command' }, ({ payload }) => {
  console.log('Received:', payload)
})

channel.subscribe()

// Send a message — every other connected client receives it instantly
function send(action, value) {
  channel.send({
    type: 'broadcast',
    event: 'command',
    payload: { action, value },
  })
}

// Examples:
send('set-color', '#ff0000')
send('play', true)
send('navigate', '/screen-2')
```

### Presence — see which devices are currently connected

```js
const channel = supabase.channel('prototype-room')

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  const devices = Object.values(state).flat()
  console.log('Connected:', devices)
})

channel.on('presence', { event: 'join' }, ({ newPresences }) => {
  console.log('Joined:', newPresences)
})

channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
  console.log('Left:', leftPresences)
})

// Subscribe and announce this device
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      device: 'phone',
      user: 'Jon',
      joined_at: new Date().toISOString(),
    })
  }
})
```

**Notes:**
- Channel names are arbitrary strings — use a unique name per prototype
- Messages are ephemeral — not stored. Use `supabase.from('table').insert()` if you need a log
- No RLS applies to Realtime broadcast/presence — any client with the anon key can join any channel. Fine for prototyping; add channel-level auth for production

---

## Real-time messaging to physical hardware (MQTT)

MQTT is the standard protocol for IoT devices. Any MQTT-capable hardware — Arduino, ESP32, Raspberry Pi, smart home devices — can publish and subscribe to the same topics as the browser. `mqtt.js` connects from the browser via WebSockets.

Use this for: prototypes involving actual physical devices, smart home interfaces, sensor dashboards, hardware remote controls.

> **Public broker warning:** The default broker (`broker.hivemq.com`) is completely public. Anyone in the world can subscribe to any topic — there is no access control. Never send passwords, personal data, API keys, or anything sensitive over it. Use a unique, hard-to-guess topic prefix per project (e.g. `my-project-x7k2` not `my-project`). For a private broker, sign up for HiveMQ Cloud free tier and add credentials as env vars (see Notes below).

**You do:**

1. Run `npm install mqtt`

2. Create `src/mqtt.js`:
   ```js
   import mqtt from 'mqtt'

   // Free public broker — no account needed, good for prototyping
   const BROKER = 'wss://broker.hivemq.com:8884/mqtt'
   const TOPIC_PREFIX = 'my-prototype' // change this per project

   let client

   export function initMQTT({ onMessage } = {}) {
     client = mqtt.connect(BROKER)

     client.on('connect', () => {
       console.log('MQTT connected')
       client.subscribe(`${TOPIC_PREFIX}/#`, (err) => {
         if (err) console.error('Subscribe error:', err)
       })
     })

     client.on('message', (topic, message) => {
       try {
         const payload = JSON.parse(message.toString())
         onMessage?.({ topic, payload })
       } catch {
         onMessage?.({ topic, payload: message.toString() })
       }
     })

     client.on('error', (err) => console.error('MQTT error:', err))

     return client
   }

   export function publish(subtopic, payload) {
     client?.publish(
       `${TOPIC_PREFIX}/${subtopic}`,
       JSON.stringify(payload)
     )
   }
   ```

3. Initialize in `src/main.js`:
   ```js
   import { initMQTT, publish } from './mqtt.js'

   initMQTT({
     onMessage({ topic, payload }) {
       console.log(topic, payload)
       // handle incoming messages here
     }
   })

   // Send a command to any subscribed client (browser or hardware)
   publish('commands', { action: 'set-color', r: 255, g: 0, b: 0 })
   publish('commands', { action: 'toggle', device: 'light-1' })
   ```

**On the hardware side (Arduino/ESP32 example using PubSubClient):**
```cpp
#include <PubSubClient.h>
// broker: broker.hivemq.com, port: 1883
// subscribe to: my-prototype/#
// publish to: my-prototype/sensor
```

**Topic structure:**

| Topic | Purpose |
|-------|---------|
| `my-prototype/commands` | Browser → hardware commands |
| `my-prototype/sensor` | Hardware → browser sensor data |
| `my-prototype/status` | Hardware → browser status updates |

**Broker options:**

| Broker | Notes |
|--------|-------|
| `broker.hivemq.com` | Free, public, no account — for prototyping only |
| HiveMQ Cloud | Free tier, persistent, requires account at hivemq.com |
| `test.mosquitto.org` | Free, public, Eclipse project |

**Notes:**
- The public broker is shared — anyone who knows your topic name can publish to it. Use a unique prefix and don't send sensitive data
- For a private broker, sign up for HiveMQ Cloud free tier — add credentials as `VITE_MQTT_USER` / `VITE_MQTT_PASS` env vars and pass them to `mqtt.connect(BROKER, { username, password })`
- Smartwatches: Apple Watch requires Swift/Xcode — no browser path. For watch prototyping, simulate the watch UI on a phone in a small viewport

---

## Install to mobile home screen (PWA)

Progressive Web Apps can be installed to the home screen on iOS and Android from a Vercel URL — no app store required. Once installed they open full-screen with no browser chrome and work offline after the first visit.

**When to use:** When the prototype needs to feel like a native app on a real device — for user testing, stakeholder demos, or any full-screen mobile experience.

**You do:**

1. Run `npm install -D vite-plugin-pwa`

2. Add two PNG icons to `public/`:
   - `public/icon-192.png` (192×192px)
   - `public/icon-512.png` (512×512px)

   If the user doesn't have icons ready, generate them at [realfavicongenerator.net](https://realfavicongenerator.net) or use a colored square as a placeholder.

3. Update `vite.config.js` — add `VitePWA` to the existing plugins array:
   ```js
   import { defineConfig, loadEnv } from 'vite'
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig(({ mode }) => {
     const env = loadEnv(mode, process.cwd(), '')
     return {
       plugins: [
         VitePWA({
           registerType: 'autoUpdate',
           manifest: {
             name: 'My App',
             short_name: 'My App',
             description: 'A short description of your app',
             theme_color: '#000000',
             background_color: '#ffffff',
             display: 'standalone',
             start_url: '/',
             icons: [
               { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
               { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
               { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
             ],
           },
           workbox: {
             globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
           },
         }),
         {
           // existing local-api middleware stays here unchanged
           name: 'local-api',
           // ...
         },
       ],
     }
   })
   ```

   Replace `name`, `short_name`, `description`, `theme_color`, and `background_color` with values matching the app.

4. Add iOS meta tags to `<head>` in `index.html`:
   ```html
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   <meta name="apple-mobile-web-app-title" content="My App" />
   <link rel="apple-touch-icon" href="/icon-192.png" />
   ```

5. Deploy to Vercel — the service worker only activates on HTTPS, so it won't work on localhost.

**Tell the user how to install:**
- **iOS (Safari):** Open the Vercel URL → tap Share → "Add to Home Screen" → tap Add
- **Android (Chrome):** Open the Vercel URL → tap menu (⋮) → "Add to Home screen", or tap the install prompt in the address bar

**Notes:**
- `display: 'standalone'` removes all browser chrome — use `'browser'` to keep the URL bar
- `registerType: 'autoUpdate'` silently updates the cached app on next visit after a new deploy
- Offline support is automatic once the service worker is active
- iOS generates a splash screen automatically from the icon and `background_color`

---

## Geolocation

The browser Geolocation API returns the device's lat/lng. Works on desktop and mobile — always shows a permission prompt first.

**Get position once:**
```js
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude, accuracy } = pos.coords
    console.log(`${latitude}, ${longitude} (±${accuracy}m)`)
  },
  (err) => {
    console.error('Geolocation denied or unavailable:', err.message)
  },
  { enableHighAccuracy: true, timeout: 10000 }
)
```

**Watch position (live tracking):**
```js
const watchId = navigator.geolocation.watchPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords
    // update map marker, log trail, etc.
  },
  (err) => console.error(err)
)

// Stop tracking when done
navigator.geolocation.clearWatch(watchId)
```

**Center a Leaflet or Mapbox map on the user:**
```js
navigator.geolocation.getCurrentPosition(({ coords }) => {
  map.setView([coords.latitude, coords.longitude], 14) // Leaflet
  // map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 }) // Mapbox
})
```

**Notes:**
- Geolocation only works on HTTPS — it will silently fail on `http://`
- Always handle the error callback — the user may deny permission or be on a desktop with no GPS
- `enableHighAccuracy: true` uses GPS on mobile (more accurate, more battery)
- On desktop, position is estimated from Wi-Fi/IP — accuracy can be off by kilometers

---

## Camera and microphone

Access the device's camera or microphone using `getUserMedia`. Works in any modern browser, requires HTTPS, and always shows a browser permission prompt.

**Camera preview:**
```html
<video id="camera-preview" autoplay playsinline muted></video>
<button id="take-photo">Take photo</button>
<canvas id="snapshot" hidden></canvas>
<img id="photo-output" alt="Captured photo" />
```

```js
const video    = document.getElementById('camera-preview')
const canvas   = document.getElementById('snapshot')
const output   = document.getElementById('photo-output')
const photoBtn = document.getElementById('take-photo')

// Start camera
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }, // 'user' = front camera
  audio: false,
})
video.srcObject = stream

// Take a photo
photoBtn.addEventListener('click', () => {
  canvas.width  = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)
  output.src = canvas.toDataURL('image/jpeg')
  output.hidden = false
})

// Stop the camera when done
function stopCamera() {
  stream.getTracks().forEach(t => t.stop())
}
```

**Microphone input level meter:**
```js
const stream  = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
const ctx     = new AudioContext()
const source  = ctx.createMediaStreamSource(stream)
const analyser = ctx.createAnalyser()
analyser.fftSize = 256
source.connect(analyser)

const data = new Uint8Array(analyser.frequencyBinCount)
const meter = document.getElementById('level-bar')

function tick() {
  analyser.getByteFrequencyData(data)
  const avg = data.reduce((a, b) => a + b, 0) / data.length
  meter.style.width = `${(avg / 255) * 100}%`
  requestAnimationFrame(tick)
}
tick()
```

**Switch between front and rear camera:**
```js
let facingMode = 'environment'

async function switchCamera() {
  stream.getTracks().forEach(t => t.stop())
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
  video.srcObject = newStream
}
```

**Notes:**
- Always call `stream.getTracks().forEach(t => t.stop())` when the camera is no longer needed — this turns off the browser's recording indicator
- `getUserMedia` throws if the user denies permission — always wrap in `try/catch`
- On iOS, camera access requires Safari or a PWA installed to the home screen — it does not work in in-app browsers (Instagram, Gmail)
- For QR code scanning, use a library like [html5-qrcode](https://github.com/mebjas/html5-qrcode) on top of this camera stream

---

## Push notifications

Web Push lets a site send notifications to users even when the browser is closed. It requires a service worker, VAPID keys, and user permission.

> **Complexity note:** Web Push is the most involved feature in this template. The setup takes 30–60 minutes and involves VAPID keys, a service worker, a Vercel serverless function, and a Supabase table for subscriptions. Only add it if the user specifically needs background notifications. For in-page alerts while the user is on the site, use a toast/notification UI element instead.

**Architecture:**
1. Browser asks for notification permission → receives a push subscription object
2. Subscription is saved to Supabase
3. A Vercel serverless function reads subscriptions from Supabase and sends push messages using the Web Push protocol
4. The service worker receives push events and displays the notification

**You do:**

1. Generate VAPID keys (one time, run in the terminal):
   ```
   npx web-push generate-vapid-keys
   ```
   Copy the public and private keys.

2. Add to `.env` and Vercel environment variables:
   ```
   VITE_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_EMAIL=mailto:you@example.com
   ```

3. Create `public/sw.js` (the service worker — must be in `public/`, not `src/`):
   ```js
   self.addEventListener('push', (event) => {
     const data = event.data?.json() ?? { title: 'Notification', body: '' }
     event.waitUntil(
       self.registration.showNotification(data.title, {
         body: data.body,
         icon: '/icon-192.png',
       })
     )
   })
   ```

4. Register the service worker and subscribe in `src/push.js`:
   ```js
   import { supabase } from './supabase.js'

   export async function initPush() {
     if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

     const reg = await navigator.serviceWorker.register('/sw.js')
     const permission = await Notification.requestPermission()
     if (permission !== 'granted') return

     const sub = await reg.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
     })

     // Save subscription to Supabase
     await supabase.from('push_subscriptions').upsert([{
       endpoint: sub.endpoint,
       subscription: JSON.stringify(sub),
     }])
   }
   ```

5. Create `api/send-push.js` (Vercel serverless function that triggers notifications):
   ```js
   import webpush from 'web-push'
   import { createClient } from '@supabase/supabase-js'

   webpush.setVapidDetails(
     process.env.VAPID_EMAIL,
     process.env.VITE_VAPID_PUBLIC_KEY,
     process.env.VAPID_PRIVATE_KEY
   )

   const supabase = createClient(
     process.env.VITE_SUPABASE_URL,
     process.env.SUPABASE_SERVICE_KEY // service role key, not anon
   )

   export default async function handler(req, res) {
     const { title, body } = req.body

     const { data: subs } = await supabase.from('push_subscriptions').select('subscription')

     await Promise.allSettled(
       subs.map(({ subscription }) =>
         webpush.sendNotification(JSON.parse(subscription), JSON.stringify({ title, body }))
       )
     )

     res.json({ sent: subs.length })
   }
   ```

6. Run `npm install web-push`

7. Create the `push_subscriptions` table in Supabase:
   ```sql
   create table push_subscriptions (
     endpoint text primary key,
     subscription text not null,
     created_at timestamptz default now()
   );

   -- Public insert so any visitor can subscribe
   create policy "Public insert" on push_subscriptions
   for insert with check (true);
   ```

8. Trigger a notification (from your own code, a cron job, or another serverless function):
   ```js
   await fetch('/api/send-push', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Hello', body: 'This is a push notification' }),
   })
   ```

**Notes:**
- iOS requires the app to be installed as a PWA (home screen) before push notifications work — in-browser push on iOS is not supported
- The `SUPABASE_SERVICE_KEY` (service role key) bypasses RLS — only use it server-side, never in browser code
- Stale subscriptions (uninstalled browsers) will return 410 errors — filter them out and delete from the table in production
