// Data storage layer with fallback to in-memory for development
// In production, this should use Vercel KV or Redis

interface DataPoint {
  ts: number;
  value: number;
}

interface AggregatedPoint {
  bucketStartTs: number;
  avg: number;
  min: number;
  max: number;
  count: number;
}

class CircularBuffer<T> {
  private buffer: T[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  push(item: T): void {
    this.buffer.push(item);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getAll(): T[] {
    return [...this.buffer];
  }

  getLast(): T | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  getLength(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}

class InMemoryStorage {
  private rawData: Map<string, CircularBuffer<DataPoint>> = new Map();
  private aggregatedData: Map<string, CircularBuffer<AggregatedPoint>> = new Map();
  private latestValues: Map<string, number> = new Map();
  private currentBuckets: Map<string, { sum: number; count: number; min: number; max: number; startTs: number }> = new Map();
  private instanceId: string;

  private readonly RAW_RETENTION_HOURS = 1; // Keep 1 hour of raw data
  private readonly RAW_SAMPLE_INTERVAL_MS = 5000; // 5 seconds
  private readonly MAX_RAW_POINTS = (this.RAW_RETENTION_HOURS * 60 * 60 * 1000) / this.RAW_SAMPLE_INTERVAL_MS;

  constructor() {
    this.instanceId = Math.random().toString(36).substr(2, 9);
    
    // Initialize storage for all metrics
    const metrics = ['voltage', 'current_A', 'frequency_Hz', 'energy_kWh', 'temp.CH1', 'temp.CH2', 'temp.CH3', 'vibration'];
    metrics.forEach(metric => {
      this.rawData.set(metric, new CircularBuffer(this.MAX_RAW_POINTS));
      this.aggregatedData.set(metric, new CircularBuffer(1000)); // Keep 1000 aggregated points
    });
  }

  async addDataPoint(metric: string, value: number, timestamp: number): Promise<void> {
    const dataPoint: DataPoint = { ts: timestamp, value };
    
    // Add to raw data
    const rawBuffer = this.rawData.get(metric);
    if (rawBuffer) {
      rawBuffer.push(dataPoint);
    }

    // Update latest value
    this.latestValues.set(metric, value);

    // Update aggregation bucket
    await this.updateAggregationBucket(metric, value, timestamp);
  }

  private async updateAggregationBucket(metric: string, value: number, timestamp: number): Promise<void> {
    const bucketSizeMs = 60 * 1000; // 1 minute buckets
    const bucketStartTs = Math.floor(timestamp / bucketSizeMs) * bucketSizeMs;

    let bucket = this.currentBuckets.get(metric);
    
    if (!bucket || bucket.startTs !== bucketStartTs) {
      // Save previous bucket if it exists
      if (bucket) {
        const aggregatedPoint: AggregatedPoint = {
          bucketStartTs: bucket.startTs,
          avg: bucket.sum / bucket.count,
          min: bucket.min,
          max: bucket.max,
          count: bucket.count
        };
        
        const aggBuffer = this.aggregatedData.get(metric);
        if (aggBuffer) {
          aggBuffer.push(aggregatedPoint);
        }
      }

      // Start new bucket
      bucket = {
        sum: value,
        count: 1,
        min: value,
        max: value,
        startTs: bucketStartTs
      };
    } else {
      // Update existing bucket
      bucket.sum += value;
      bucket.count += 1;
      bucket.min = Math.min(bucket.min, value);
      bucket.max = Math.max(bucket.max, value);
    }

    this.currentBuckets.set(metric, bucket);
  }

  async getDataPoints(metric: string, fromTs?: number, toTs?: number, aggregation: 'raw' | '1min' | '5min' = 'raw'): Promise<DataPoint[]> {
    if (aggregation === 'raw') {
      const rawBuffer = this.rawData.get(metric);
      if (!rawBuffer) {
        return [];
      }
      
      const allPoints = rawBuffer.getAll();
      
      // If no time range specified, return all data
      if (fromTs === undefined || toTs === undefined) {
        return allPoints;
      }
      
      return allPoints.filter(point => point.ts >= fromTs && point.ts <= toTs);
    } else {
      const aggBuffer = this.aggregatedData.get(metric);
      if (!aggBuffer) return [];
      
      const allAggregatedPoints = aggBuffer.getAll();
      
      // If no time range specified, return all data
      if (fromTs === undefined || toTs === undefined) {
        return allAggregatedPoints.map(point => ({
          ts: point.bucketStartTs,
          value: point.avg
        }));
      }
      
      const aggregatedPoints = allAggregatedPoints.filter(point => 
        point.bucketStartTs >= fromTs && point.bucketStartTs <= toTs
      );
      
      // Convert aggregated points to data points using average
      return aggregatedPoints.map(point => ({
        ts: point.bucketStartTs,
        value: point.avg
      }));
    }
  }

  async getLatestValues(): Promise<Record<string, number>> {
    const latest: Record<string, number> = {};
    this.latestValues.forEach((value, key) => {
      latest[key] = value;
    });
    return latest;
  }

  async getAverageValue(metric: string, fromTs: number, toTs: number): Promise<number> {
    const dataPoints = await this.getDataPoints(metric, fromTs, toTs, 'raw');
    if (dataPoints.length === 0) return 0;
    
    const sum = dataPoints.reduce((acc, point) => acc + point.value, 0);
    return sum / dataPoints.length;
  }

  async clear(): Promise<void> {
    this.rawData.forEach(buffer => buffer.clear());
    this.aggregatedData.forEach(buffer => buffer.clear());
    this.latestValues.clear();
    this.currentBuckets.clear();
  }
}

// Singleton instance - use global to persist across hot reloads in development
declare global {
  var __iot_storage: InMemoryStorage | undefined;
}

export function getStorage(): InMemoryStorage {
  if (!global.__iot_storage) {
    global.__iot_storage = new InMemoryStorage();
  }
  return global.__iot_storage;
}

// Vercel KV integration (for production)
export async function getVercelKV() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    console.warn('Vercel KV not available, using in-memory storage');
    return null;
  }
}

export type { DataPoint, AggregatedPoint };
