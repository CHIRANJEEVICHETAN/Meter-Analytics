import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour ago
    const twoHoursAgo = now - (2 * 60 * 60 * 1000); // 2 hours ago

    // Map frontend metric names to storage keys
    const metricMapping: Record<string, string> = {
      'voltage': 'voltage',
      'current': 'current_A',
      'temp.CH1': 'temp.CH1',
      'temp.CH2': 'temp.CH2', 
      'temp.CH3': 'temp.CH3',
      'vibration': 'vibration',
      'frequency_Hz': 'frequency_Hz',
      'energy_kWh': 'energy_kWh'
    };

    const percentages: Record<string, number> = {};

    // Calculate percentage change for each metric
    for (const [frontendKey, storageKey] of Object.entries(metricMapping)) {
      try {
        const currentAvg = await storage.getAverageValue(storageKey, oneHourAgo, now);
        const previousAvg = await storage.getAverageValue(storageKey, twoHoursAgo, oneHourAgo);
        
        if (previousAvg === 0) {
          percentages[frontendKey] = 0;
        } else {
          const change = ((currentAvg - previousAvg) / previousAvg) * 100;
          percentages[frontendKey] = Math.round(change * 10) / 10; // Round to 1 decimal place
        }
      } catch (error) {
        console.error(`Error calculating percentage for ${frontendKey}:`, error);
        percentages[frontendKey] = 0;
      }
    }

    return NextResponse.json({ percentages });

  } catch (error) {
    console.error('Percentages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
