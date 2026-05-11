# Data flows

## Charts and data visualization (Chart.js)

Chart.js is the right default — approachable API, good docs, no framework required.

**You do:**
1. Run `npm install chart.js`
2. Add a `<canvas>` element to `index.html`:
   ```html
   <canvas id="my-chart"></canvas>
   ```
3. Import and initialize:
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

For more complex visualization (custom layouts, interactive graphics), D3.js is the right next step — but it has a steep learning curve. Ask the user what they need before reaching for D3.

---

## Map with markers (Leaflet + OpenStreetMap)

Leaflet paired with OpenStreetMap is completely free with no API key required.

**You do:**

1. Run `npm install leaflet`

2. Add a container to `index.html`:
   ```html
   <div id="map" class="map-container"></div>
   ```

3. Initialize:
   ```js
   import L from 'leaflet'
   import 'leaflet/dist/leaflet.css'

   // Fix default marker icon paths (Vite asset handling quirk)
   import markerIcon from 'leaflet/dist/images/marker-icon.png'
   import markerShadow from 'leaflet/dist/images/marker-shadow.png'
   delete L.Icon.Default.prototype._getIconUrl
   L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

   const map = L.map('map').setView([51.505, -0.09], 13) // [lat, lng], zoom

   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
     maxZoom: 19,
   }).addTo(map)

   L.marker([51.505, -0.09])
     .addTo(map)
     .bindPopup('A popup message.')
     .openPopup()
   ```

4. Add to `src/style.css`:
   ```css
   .map-container {
     width: 100%;
     height: 400px;
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

Fit map to show all markers:
```js
const group = L.featureGroup(markers)
map.fitBounds(group.getBounds().pad(0.1))
```

GeoJSON layer:
```js
L.geoJSON(geojsonData, {
  style: { color: '#000', weight: 1 },
  onEachFeature: (feature, layer) => layer.bindPopup(feature.properties.name),
}).addTo(map)
```

---

## 3D map (Mapbox GL JS)

Use Mapbox GL JS when the design calls for 3D terrain, building extrusion, satellite imagery, or custom-styled base maps. Leaflet is the default for simple 2D marker maps.

| | Leaflet | Mapbox GL JS |
|--|---------|-------------|
| API key | None — free | Free tier at mapbox.com |
| Rendering | Raster tiles (PNG) | GPU-accelerated vector tiles |
| 3D terrain | No | Yes |
| 3D buildings | No | Yes |
| Satellite imagery | No | Yes |
| Custom styles | Limited | Full control via Mapbox Studio |

**Tell the user to:**
1. Create a free account at [mapbox.com](https://mapbox.com)
2. Copy their **Default public token** (starts with `pk.`)

**You do:**

1. Add `VITE_MAPBOX_TOKEN=pk.your_token_here` to `.env` and the Vercel dashboard

2. Run `npm install mapbox-gl`

3. Add a container to `index.html`:
   ```html
   <div id="map" class="map-container"></div>
   ```

4. Create `src/map.js`:
   ```js
   import mapboxgl from 'mapbox-gl'
   import 'mapbox-gl/dist/mapbox-gl.css'

   export function initMap(containerId = 'map') {
     mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

     const map = new mapboxgl.Map({
       container: containerId,
       style: 'mapbox://styles/mapbox/streets-v12',
       center: [-122.4194, 37.7749], // [lng, lat]
       zoom: 12,
       pitch: 45,
       bearing: 0,
     })

     map.addControl(new mapboxgl.NavigationControl())

     map.on('load', () => {
       // 3D terrain
       map.addSource('mapbox-dem', {
         type: 'raster-dem',
         url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
         tileSize: 512,
       })
       map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

       // 3D building extrusion
       map.addLayer({
         id: '3d-buildings',
         source: 'composite',
         'source-layer': 'building',
         filter: ['==', 'extrude', 'true'],
         type: 'fill-extrusion',
         minzoom: 15,
         paint: {
           'fill-extrusion-color': '#aaa',
           'fill-extrusion-height': ['get', 'height'],
           'fill-extrusion-base': ['get', 'min_height'],
           'fill-extrusion-opacity': 0.6,
         },
       })
     })

     return map
   }
   ```

5. Call from `src/main.js`:
   ```js
   import { initMap } from './map.js'
   const map = initMap()
   ```

6. Add to `src/style.css`:
   ```css
   .map-container {
     width: 100%;
     height: 500px;
   }
   ```

**Common patterns:**

Marker with popup:
```js
new mapboxgl.Marker()
  .setLngLat([-122.4194, 37.7749])
  .setPopup(new mapboxgl.Popup().setHTML('<strong>San Francisco</strong>'))
  .addTo(map)
```

Fly to a location:
```js
map.flyTo({ center: [-73.9857, 40.7484], zoom: 14, pitch: 60, duration: 2000 })
```

**Style options:**

| Style | What it looks like |
|-------|--------------------|
| `mapbox://styles/mapbox/streets-v12` | Default street map |
| `mapbox://styles/mapbox/satellite-streets-v12` | Satellite with road labels |
| `mapbox://styles/mapbox/outdoors-v12` | Terrain, trails, elevation |
| `mapbox://styles/mapbox/dark-v11` | Dark base map |
| `mapbox://styles/mapbox/light-v11` | Light/minimal base map |

**API key note:** The `pk.` token is safe to bundle in browser code. Restrict it to your domain in the Mapbox dashboard under **Access tokens → URL restrictions** before going live.

---

## Spreadsheet as database (Airtable)

Good for prototyping content-driven sites where non-developers need to edit data directly.

**Tell the user to:**
1. Go to [airtable.com](https://airtable.com) and create a free account
2. Create a new **Base** and add their data
3. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens) → **Create token**
4. Give it **data.records:read** scope (add **write** scope if needed)
5. Note their **Base ID** from the URL: `airtable.com/appXXXXXXXXXXXXXX/...`

**You do:**

6. Add `VITE_AIRTABLE_TOKEN` and `VITE_AIRTABLE_BASE_ID` to `.env` and Vercel dashboard

7. Fetch records:
   ```js
   const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
   const token  = import.meta.env.VITE_AIRTABLE_TOKEN
   const table  = 'YourTableName'

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

## External data APIs

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

**Standard fetch pattern:**
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

**Rate limit tip:** For APIs with low rate limits, fetch once via a Vercel serverless function, cache the result in a Supabase table, and serve from there.

---

## Supabase database queries

Import the client wherever you need data:

```js
import { supabase } from './supabase.js'
```

**Common query patterns:**

```js
// Read all rows
const { data, error } = await supabase.from('my_table').select('*')

// Filter
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)

// Insert
await supabase.from('responses').insert([{ name: 'Jon', score: 42 }])

// Update
await supabase.from('items').update({ status: 'done' }).eq('id', 123)

// Delete
await supabase.from('items').delete().eq('id', 123)
```

**Creating a table:**
Guide the user to the Supabase dashboard → Table Editor → New Table. After creating the table, help them set up Row Level Security (RLS) policies so data access is properly controlled.

**RLS example policy (SQL editor):**
```sql
-- Allow anyone to read published posts
CREATE POLICY "Public can read published posts"
ON posts FOR SELECT
USING (status = 'published');

-- Allow authenticated users to insert their own rows
CREATE POLICY "Users can insert their own rows"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);
```
