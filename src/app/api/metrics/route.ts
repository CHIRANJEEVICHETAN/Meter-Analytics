import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const metricsParam = searchParams.get('metrics') || 'voltage,current,temp.CH1,temp.CH3,temp.CH5,vibration';
    const aggParam = searchParams.get('agg') || 'raw';


    // Validate aggregation parameter
    if (!['raw', '1min', '5min'].includes(aggParam)) {
      return NextResponse.json({ error: 'Invalid aggregation parameter. Use raw, 1min, or 5min' }, { status: 400 });
    }

    // Parse time range
    const now = Date.now();
    let fromTs: number | undefined;
    let toTs: number | undefined;

    if (fromParam && toParam) {
      fromTs = Date.parse(fromParam);
      toTs = Date.parse(toParam);
      
      if (isNaN(fromTs) || isNaN(toTs)) {
        return NextResponse.json({ error: 'Invalid date format. Use ISO strings' }, { status: 400 });
      }
    } else {
      // If no range specified, return all data
      fromTs = undefined;
      toTs = undefined;
    }

    // Parse requested metrics
    const requestedMetrics = metricsParam.split(',').map(m => m.trim());
    
    // Map frontend metric names to storage keys
    const metricMapping: Record<string, string> = {
      'voltage': 'voltage',
      'current': 'voltage', // Calculate current from voltage (assuming 230V nominal, 0-100A range)
      'temp.CH1': 'temp.CH1',
      'temp.CH3': 'temp.CH3', 
      'temp.CH5': 'temp.CH5',
      'vibration': 'vibration',
      'frequency_Hz': 'frequency_Hz',
      'energy_kWh': 'energy_kWh'
    };

    const storage = getStorage();
    const samples: Record<string, Array<{ ts: number; value: number }>> = {};
    
    // Fetch data for each requested metric
    for (const metric of requestedMetrics) {
      const storageKey = metricMapping[metric];
      if (storageKey) {
        const dataPoints = await storage.getDataPoints(storageKey, fromTs, toTs, aggParam as 'raw' | '1min' | '5min');
        
        // For current, calculate from voltage (assuming 230V nominal, 0-100A range)
        if (metric === 'current') {
          samples[metric] = dataPoints.map(point => ({
            ts: point.ts,
            // More realistic current calculation: P = V * I, assuming 10kW load
            value: Math.max(0, Math.min(100, (10000 / point.value) + (Math.random() - 0.5) * 2))
          }));
        } else {
          samples[metric] = dataPoints;
        }
      }
    }

    // Get latest values
    const latest = await storage.getLatestValues();

    // Format response
    const response = {
      range: fromTs && toTs ? {
        from: new Date(fromTs).toISOString(),
        to: new Date(toTs).toISOString()
      } : {
        from: 'all',
        to: 'all'
      },
      samples,
      latest: {
        voltage: latest.voltage || 0,
        current: latest.voltage ? Math.max(0, Math.min(100, (10000 / latest.voltage) + (Math.random() - 0.5) * 2)) : 0, // Calculate current from voltage
        'temp.CH1': latest['temp.CH1'] || 0,
        'temp.CH3': latest['temp.CH3'] || 0,
        'temp.CH5': latest['temp.CH5'] || 0,
        vibration: latest.vibration || 0,
        frequency_Hz: latest.frequency_Hz || 0,
        energy_kWh: latest.energy_kWh || 0
      },
      aggregation: aggParam,
      sampleCounts: Object.fromEntries(
        Object.entries(samples).map(([key, data]) => [key, data.length])
      )
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
