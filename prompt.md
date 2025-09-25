# Comprehensive prompt — Build a single-page, glassmorphic analytics dashboard (Next.js, SSR + POST ingest)

Use this prompt to give to a developer, to an AI coding assistant, or to paste into a ticket/PRD. It describes the **goal**, **acceptance criteria**, **API contract**, **data model & storage**, **frontend structure**, **real-time updating**, **performance & retention**, and **deployment notes (Vercel)**. It also includes short pseudo-code examples you can use as a starting point.

----------

## Project goal (short)

Build a single-page analytics dashboard in **Next.js** (deployed on **Vercel**) that displays **real-time line graphs** (default) for device telemetry (voltage, current, temperature channels, vibration, etc.). The UI must be visually modern with a **glassmorphic** aesthetic. A `POST` endpoint will accept JSON payloads pushed every 5s from a Python backend. There is **no database** — choose the best feasible storage approach given Vercel constraints (see Storage section).

----------

## Acceptance criteria

1.  Single page with glassmorphic layout, responsive for desktop/tablet.
    
2.  Top area: **Live metrics** (instant numeric values for frequency, voltage, energy_kWh, latest CH1/CH3/CH5 temps, latest vibration).
    
3.  Two primary graphs below the live metrics:
    
    -   **Voltage** (y: 0–500 V) vs Time (x).
        
    -   **Current** (y: 0–100 A) vs Time (x).
        
4.  Second row: **Temperature** (three lines: CH1, CH3, CH5) and **Vibration** (single line) vs Time; temperature y-range 0–100, vibration 0–100.
    
5.  Every chart must:
    
    -   Default to line chart.
        
    -   Offer a UI control to switch chart type (line / area / bar) per chart.
        
    -   Have interactive tooltips (show timestamp & value(s)), legend, ability to toggle series visibility.
        
    -   Time axis is **dynamically adjustable** via a time filter (Last 1m, 5m, 30m, 1h, 6h, 24h, custom).
        
6.  Data ingestion `POST /api/ingest` accepts JSON (sample below) and **stores** the data into a structure that supports efficient time filtering and fast read by frontend. No external DB used.
    
7.  Charts update automatically when new data arrives (every ~5s).
    
8.  Use SSR for initial page render so first paint includes latest metrics.
    
9.  Provide a `GET /api/metrics` endpoint used by the frontend to retrieve time-windowed data.
    
10.  Provide a short section in the repo README explaining architecture and trade-offs (ephemeral vs durable storage).
    

----------

## Input JSON (sample)

```json
{
  "temperature": { "CH1": 32.0, "CH3": 31.0, "CH5": 31.05 },
  "energy_meter": { "energy_kWh": 17.39, "frequency_Hz": 158.97, "voltage_V": 50.0 },
  "vibrator_meter": { "s4_voltage": 2.9588 },
  "timestamp": "2025-09-25 09:54:39"
}

```

Python backend will POST this exact JSON every ~5 seconds.

----------

## API contract

### `POST /api/ingest`

-   Body: JSON as above. `timestamp` is ISO string or `YYYY-MM-DD HH:mm:ss`.
    
-   Behavior: parse the body, convert timestamp to UTC epoch ms, push the incoming values into the in-memory/kv structure, update aggregated quick stats (latest value, min/max).
    
-   Response: `200 OK` on success; `400` on malformed payload.
    

### `GET /api/metrics?from=<ISO>&to=<ISO>&metrics=voltage,current,temp.CH1,temp.CH3,temp.CH5,vibration&agg=raw|1min|5min`

-   Returns time-series arrays for requested metrics, downsampled according to `agg` if requested.
    
-   Response shape:
    

```json
{
  "range": { "from": "...", "to": "..." },
  "samples": {
    "voltage": [{ "ts": 169..., "value": 50.1 }, ...],
    "current": [...],
    "temp.CH1": [...],
    "temp.CH3": [...],
    "temp.CH5": [...],
    "vibration": [...]
  },
  "latest": { "voltage": 50.1, "temp.CH1": 32.0, "frequency_Hz": 158.97, ... }
}

```

----------

## Storage design (no DB) — options & recommended approach

**Important Vercel note:** Vercel serverless functions are ephemeral. Relying on in-process memory will **not** persist across cold starts or multiple function instances. Writing to the function local filesystem is also not a durable approach on Vercel. Therefore you must choose an external durable store or an officially supported key-value service (or accept ephemeral behavior).

### Recommended choices (production-safe)

1.  **Vercel KV / Redis / Upstash** — Best: a managed key-value store with TTL support. Use it to store compressed time-series per metric.
    
2.  **Object storage (S3 / DigitalOcean Spaces)** — Append JSON NDJSON files periodically and retrieve/stream when needed (more complex).
    
3.  If truly no external service allowed and you accept limitations: use **client-side storage (IndexedDB / localStorage)** combined with polling GET to the ingest server (Python could push to user browser via WebSocket), or run a long-lived server (not Vercel) you control.
    

### Data structure (time series; example for key-value store)

-   **Key naming**: `metric:<name>` e.g. `metric:voltage`, `metric:temp.CH1`.
    
-   **Value**: append to a sorted set or list: items are tuples `(ts, value)` with ts = epoch ms.
    
-   **Retention and bucketed aggregation**:
    
    -   Keep last N raw points per metric (configurable, e.g., last 24 hours raw with 5s interval → ~17k points).
        
    -   Maintain aggregated buckets for longer ranges (1m averages, 5m averages, hourly aggregates). Store aggregated buckets in `metric:<name>:agg:1m`.
        
-   **In KV terms**:
    
    -   Use a Redis list or sorted set (`ZADD ts value`) to push raw points and trim to max length.
        
    -   For aggregation, compute on ingest: update per-minute rolling aggregates.
        

### If you must implement a pure in-memory fallback (dev/test only)

-   Use a **circular buffer** per metric:
    

```js
{ voltage: CircularBuffer(maxLen), "temp.CH1": CircularBuffer(maxLen), ... }

```

-   On ingest: push and, if length > maxLen, shift oldest.
    

----------

## Downsampling & retention strategy

-   Raw resolution: keep full samples for last `T_raw` (e.g., 1 hour for 5s interval = 720 samples).
    
-   For range > `T_raw`: serve precomputed 1min/5min aggregates.
    
-   Aggregates: store `{ bucketStartTs, avg, min, max, count }` so tooltips & zoom can show summary.
    
-   Downsampling algorithm: for each new sample, update the current 1min bucket (accumulate sum, count, min/max). On bucket rollover, push bucket into `agg:1m` list.
    

----------

## Frontend architecture (Next.js)

### Tech choices & rationale

-   **Next.js (Pages or App router)** using **SSR** for initial page render.
    
-   Charting: **ECharts** or **Recharts** (ECharts handles large datasets and interactive features well). Charting must be loaded client-side (dynamic import) because many chart libs are window-dependent.
    
-   Styling: **Tailwind CSS** for quick glassmorphism; use `backdrop-filter`, semi-transparent panels, soft shadows. (If you prefer a component system, use shadcn/ui.)
    
-   Data fetching & caching: **TanStack Query** (React Query) or SWR. Use it to poll `GET /api/metrics` every 5s or use SSE/WS if available.
    
-   State mgmt: local React state or Zustand if app grows.
    

### Page layout and components

1.  `pages/index.js` (or `app/page.jsx`) — SSR returns initial `latest` metrics and small chunk of time-series for selected default range.
    
2.  Components:
    
    -   `LiveMetricsBar` — top row showing latest numeric tiles (voltage, frequency, energy_kWh, CH1 temp, vibrator).
        
    -   `TimeFilter` — control to set time window (live, 1m, 5m, 30m, 1h, 6h, 24h, custom).
        
    -   `ChartCard` — generic card with title, chart area, chart type toggle (line/area/bar), legend, export CSV button.
        
    -   `VoltageChart`, `CurrentChart`, `TemperatureChart`, `VibrationChart` — reuse `ChartCard` and pass metric keys.
        
    -   `SettingsPanel` — toggles for series, sampling, and whether to use aggregates.
        
3.  Chart behavior:
    
    -   Load chart library on client: `const Chart = dynamic(() => import('../components/Chart'), { ssr: false })`.
        
    -   Configure tooltips to show human-readable timestamp and all values.
        
    -   Add zoom/pan support (chart library built-ins).
        

### SSR specifics

-   Use `getServerSideProps` (pages) or server component that fetches latest metrics & initial samples from `GET /api/metrics` at render time, so the page is hydrated with real values.
    
-   After hydration, client will start polling (or open SSE) to update charts.
    

----------

## Real-time update strategy (recommended, simplest)

1.  **Backend (Next.js API)** receives `POST /api/ingest` every 5s.
    
2.  **Frontend polling**: frontend calls `GET /api/metrics?from=...&to=...` every 5s (or uses TanStack Query `refetchInterval: 5000`). This is simple, robust, and Vercel friendly.
    
3.  Alternative (push to clients): implement SSE or use a 3rd-party pub/sub (Pusher, Ably) to push updates; this is more complex and may cost extra.
    

----------

## Example pseudo-code

### `pages/api/ingest.js` (simplified)

```js
// pages/api/ingest.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = req.body;
  if (!body || !body.timestamp) return res.status(400).json({ error: 'bad payload' });

  const ts = Date.parse(body.timestamp); // convert to epoch ms
  const toStore = [
    { key: 'voltage', value: body.energy_meter?.voltage_V },
    { key: 'frequency_Hz', value: body.energy_meter?.frequency_Hz },
    { key: 'energy_kWh', value: body.energy_meter?.energy_kWh },
    { key: 'temp.CH1', value: body.temperature?.CH1 },
    { key: 'temp.CH3', value: body.temperature?.CH3 },
    { key: 'temp.CH5', value: body.temperature?.CH5 },
    { key: 'vibration', value: body.vibrator_meter?.s4_voltage }
  ];

  // Example: use Vercel KV or redis client to ZADD by ts
  for (const item of toStore) {
    if (item.value == null) continue;
    await kv.zadd(`metric:${item.key}`, { score: ts, member: JSON.stringify([ts, item.value]) });
    // optionally trim list to max length
  }

  // update 'latest' cached object for fast SSR
  await kv.set('latest', JSON.stringify({ ... }));

  return res.status(200).json({ ok: true });
}

```

### `pages/api/metrics.js` (simplified)

```js
// accepts ?from=&to=&metrics=&agg=
export default async function handler(req, res) {
  const { from, to, metrics = 'voltage,current,temp.CH1,temp.CH3,temp.CH5,vibration', agg = 'raw' } = req.query;
  // convert times and query relevant lists / sorted sets from KV
  // assemble response as described above
  res.json({ range: { from, to }, samples: { ... }, latest: { ... } });
}

```

### Frontend polling (simplified)

```js
// useTanstackQuery or setInterval to call GET /api/metrics every 5s
useQuery(['metrics', range, selectedMetrics], () =>
  fetch(`/api/metrics?from=${range.from}&to=${range.to}&metrics=${selectedMetrics.join(',')}`).then(r => r.json()),
  { refetchInterval: 5000 }
);

```

----------

## Glassmorphism design tips (Tailwind)

-   Panel container classes:
    

```html
<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
  <!-- content -->
</div>

```

-   Use soft gradient background, subtle borders, inner glows, and consistent spacing. Provide high contrast for text and chart lines.
    

----------

## Charting library suggestions

-   **ECharts (recommended)** — great interactivity, large datasets, downsampling friendly, very configurable tooltips & legend.
    
-   **Recharts** — works well for simpler needs; lighter weight.
    
-   **Chart.js (react-chartjs-2)** — mature, but can be slower on large datasets.  
    Choose ECharts for best UX if you need many interactive features.
    

----------

## Testing & observability

-   Unit test `POST` handler with sample JSONs.
    
-   Add integration test to simulate 5s posts and check `GET` returns expected sample counts.
    
-   Add logging for inbound posts and errors.
    
-   Add an export CSV feature per chart (easy via array -> CSV).
    

----------

## Deployment notes (Vercel)

-   **Do not rely on server process memory** for durable time-series.
    
-   Use **Vercel KV** or an external managed Redis (Upstash) or S3 for persistence.
    
-   Use SSR (`getServerSideProps` or server component) to fetch `latest` metrics for first paint.
    
-   Keep API work lightweight — precompute aggregates on ingest to make `GET /api/metrics` fast.
    

----------

## Performance & sizing heuristics

-   With 5s cadence, 12 samples/minute → 720 samples/hour → 17280/day per metric.
    
-   If storing 6 metrics raw for 24h → ~100k samples (small JSON size, manageable in KV). But be mindful of memory and transfer sizes — always cap GET by `from`/`to` and rely on aggregation for larger windows.
    

----------

## Deliverables checklist

-   Next.js repository scaffolded.
    
-   `POST /api/ingest` implemented with chosen storage (KV/Redis/Upstash) + validation.
    
-   `GET /api/metrics` implemented supporting `from/to/metrics/agg`.
    
-   SSR initial render providing `latest` tiles and initial chart data.
    
-   Frontend components: LiveMetricsBar, TimeFilter, ChartCard, Voltage/Current/Temperature/Vibration charts.
    
-   Polling (or SSE) updating charts every 5s.
    
-   Glassmorphic UI using Tailwind.
    
-   README describing architecture, storage tradeoffs, and how to run locally.
    

----------

