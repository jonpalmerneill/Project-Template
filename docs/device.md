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
