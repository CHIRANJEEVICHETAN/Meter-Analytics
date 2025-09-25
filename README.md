# IoT Analytics Dashboard

A real-time IoT device telemetry monitoring dashboard built with Next.js, featuring a modern glassmorphic design and interactive charts.

## 🚀 Features

- **Real-time Data Visualization**: Live charts for voltage, current, temperature, and vibration metrics
- **Interactive Charts**: Switch between line, area, and bar chart types with ECharts
- **Time Range Filtering**: Dynamic time windows (1m, 5m, 30m, 1h, 6h, 24h, custom)
- **Live Metrics Display**: Real-time numeric tiles showing latest values
- **Glassmorphic UI**: Modern, translucent design with backdrop blur effects
- **Data Export**: CSV export functionality for all charts
- **Responsive Design**: Optimized for desktop and tablet viewing
- **Server-Side Rendering**: Fast initial page load with SSR

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom glassmorphism utilities
- **Charts**: ECharts with react-echarts integration
- **Data Fetching**: TanStack Query (React Query) for real-time polling
- **Storage**: In-memory storage with Vercel KV support for production

### Data Flow
1. **Data Ingestion**: Python backend POSTs JSON payloads to `/api/ingest` every 5 seconds
2. **Storage**: Data stored in circular buffers with 1-hour raw retention and 1-minute aggregation
3. **API**: `/api/metrics` endpoint provides time-windowed data with aggregation support
4. **Frontend**: SSR initial render + client-side polling every 5 seconds for real-time updates

### Storage Strategy

#### Development (In-Memory)
- Uses circular buffers for each metric
- 1-hour raw data retention (720 samples at 5s intervals)
- 1-minute aggregated buckets for longer time ranges
- Automatic cleanup and memory management

#### Production (Vercel KV)
- Redis-compatible key-value store
- Persistent across serverless function cold starts
- TTL-based data retention
- Horizontal scaling support

## 📊 Data Model

### Input JSON Format
```json
{
  "temperature": { "CH1": 32.0, "CH3": 31.0, "CH5": 31.05 },
  "energy_meter": { "energy_kWh": 17.39, "frequency_Hz": 158.97, "voltage_V": 50.0 },
  "vibrator_meter": { "s4_voltage": 2.9588 },
  "timestamp": "2025-09-25 09:54:39"
}
```

### Metrics Tracked
- **Voltage**: 0-500V range
- **Current**: 0-100A range (derived from voltage data)
- **Temperature**: CH1, CH3, CH5 channels (0-100°C)
- **Vibration**: S4 voltage sensor (0-100V)
- **Frequency**: Energy meter frequency (Hz)
- **Energy**: Cumulative energy consumption (kWh)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iot-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing Data Ingestion

Send test data to the ingest endpoint:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": { "CH1": 32.0, "CH3": 31.0, "CH5": 31.05 },
    "energy_meter": { "energy_kWh": 17.39, "frequency_Hz": 158.97, "voltage_V": 50.0 },
    "vibrator_meter": { "s4_voltage": 2.9588 },
    "timestamp": "2025-01-27 10:00:00"
  }'
```

## 🎨 UI Components

### Core Components
- **LiveMetricsBar**: Real-time numeric tiles with icons and color coding
- **TimeFilter**: Time range selector with preset and custom options
- **ChartCard**: Reusable chart container with type switching and export
- **BaseChart**: ECharts wrapper with responsive design

### Chart Components
- **VoltageChart**: Voltage monitoring (0-500V)
- **CurrentChart**: Current monitoring (0-100A)
- **TemperatureChart**: Multi-channel temperature (CH1, CH3, CH5)
- **VibrationChart**: Vibration sensor data

## 🔧 Configuration

### Environment Variables
```env
# Optional: Base URL for API calls (defaults to localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Production: Vercel KV configuration
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

### Storage Configuration
Modify retention settings in `src/lib/storage.ts`:
```typescript
private readonly RAW_RETENTION_HOURS = 1; // Raw data retention
private readonly RAW_SAMPLE_INTERVAL_MS = 5000; // Sample interval
```

## 📈 Performance Considerations

### Data Volume
- **5-second intervals**: 720 samples/hour, 17,280 samples/day per metric
- **6 metrics**: ~100k samples/day total
- **Memory usage**: ~2-5MB for 24-hour retention

### Optimization Strategies
- **Aggregation**: 1-minute buckets for longer time ranges
- **Circular buffers**: Automatic memory management
- **Client-side caching**: TanStack Query with 5-second polling
- **Chart optimization**: ECharts data sampling for large datasets

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect repository** to Vercel
2. **Configure environment variables** for Vercel KV
3. **Deploy** with automatic builds

### Manual Deployment
```bash
npm run build
npm start
```

## 🔍 API Reference

### POST /api/ingest
Accepts IoT device telemetry data.

**Request Body:**
```json
{
  "temperature": { "CH1": 32.0, "CH3": 31.0, "CH5": 31.05 },
  "energy_meter": { "energy_kWh": 17.39, "frequency_Hz": 158.97, "voltage_V": 50.0 },
  "vibrator_meter": { "s4_voltage": 2.9588 },
  "timestamp": "2025-09-25 09:54:39"
}
```

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-01-27T10:00:00.000Z",
  "metricsStored": 7
}
```

### GET /api/metrics
Retrieves time-series data for charts.

**Query Parameters:**
- `from`: ISO timestamp (optional, defaults to 1 hour ago)
- `to`: ISO timestamp (optional, defaults to now)
- `metrics`: Comma-separated metric names (optional)
- `agg`: Aggregation level - `raw`, `1min`, `5min` (default: `raw`)

**Response:**
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
  "latest": { "voltage": 50.1, "temp.CH1": 32.0, ... },
  "aggregation": "raw",
  "sampleCounts": { "voltage": 720, ... }
}
```

## 🛠️ Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ingest/        # Data ingestion endpoint
│   │   └── metrics/       # Data retrieval endpoint
│   ├── globals.css        # Global styles with glassmorphism
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard page (SSR)
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── providers/        # Context providers
│   ├── Dashboard.tsx     # Main dashboard component
│   ├── LiveMetricsBar.tsx
│   ├── TimeFilter.tsx
│   └── ChartCard.tsx
└── lib/                  # Utilities and storage
    ├── api.ts            # API client functions
    ├── storage.ts        # Data storage layer
    └── query-client.ts   # TanStack Query config
```

### Key Design Decisions

#### Storage Trade-offs
- **In-memory for development**: Fast, simple, but ephemeral
- **Vercel KV for production**: Persistent, scalable, but external dependency
- **No database**: Reduces complexity, suitable for time-series IoT data

#### Real-time Updates
- **Polling over WebSockets**: Simpler, more reliable, Vercel-friendly
- **5-second intervals**: Balance between real-time feel and performance
- **TanStack Query**: Handles caching, background updates, error recovery

#### Chart Library Choice
- **ECharts**: Excellent performance, rich interactivity, large dataset support
- **Client-side rendering**: Better performance than server-side chart generation
- **Responsive design**: Automatic resize handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [ECharts](https://echarts.apache.org/) for powerful charting capabilities
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vercel](https://vercel.com/) for deployment platform
