import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

interface IngestPayload {
  temperature: {
    CH1: number;
    CH3: number;
    CH5: number;
  };
  energy_meter: {
    energy_kWh: number;
    frequency_Hz: number;
    voltage_V: number;
  };
  vibrator_meter: {
    s4_voltage: number;
  };
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestPayload = await request.json();
    
    // Validate payload
    if (!body.timestamp) {
      return NextResponse.json({ error: 'Missing timestamp' }, { status: 400 });
    }

    // Parse timestamp (support both ISO string and YYYY-MM-DD HH:mm:ss format)
    let timestamp: number;
    try {
      // Handle YYYY-MM-DD HH:mm:ss format by treating it as IST time
      if (body.timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        // Parse as IST time (UTC+5:30)
        const istDate = new Date(body.timestamp + '+05:30');
        timestamp = istDate.getTime();
      } else {
        // Parse as ISO string
        timestamp = Date.parse(body.timestamp);
      }
      
      if (isNaN(timestamp)) {
        return NextResponse.json({ error: 'Invalid timestamp format' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid timestamp format' }, { status: 400 });
    }

    const storage = getStorage();
    
    // Extract and store metrics
    const metrics = [
      { key: 'voltage', value: body.energy_meter?.voltage_V },
      { key: 'frequency_Hz', value: body.energy_meter?.frequency_Hz },
      { key: 'energy_kWh', value: body.energy_meter?.energy_kWh },
      { key: 'temp.CH1', value: body.temperature?.CH1 },
      { key: 'temp.CH3', value: body.temperature?.CH3 },
      { key: 'temp.CH5', value: body.temperature?.CH5 },
      { key: 'vibration', value: body.vibrator_meter?.s4_voltage }
    ];

    // Store each metric
    for (const metric of metrics) {
      if (metric.value !== null && metric.value !== undefined) {
        await storage.addDataPoint(metric.key, metric.value, timestamp);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date(timestamp).toISOString(),
      metricsStored: metrics.filter(m => m.value !== null && m.value !== undefined).length
    });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'IoT Analytics Ingest Endpoint',
    method: 'POST',
    expectedPayload: {
      temperature: { CH1: 32.0, CH3: 31.0, CH5: 31.05 },
      energy_meter: { energy_kWh: 17.39, frequency_Hz: 158.97, voltage_V: 50.0 },
      vibrator_meter: { s4_voltage: 2.9588 },
      timestamp: "2025-09-25 09:54:39"
    }
  });
}
