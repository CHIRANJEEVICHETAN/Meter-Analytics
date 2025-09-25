import Dashboard from '@/components/Dashboard';
import { fetchMetrics } from '@/lib/api';

export default async function Home() {
  // Fetch initial data for SSR
  let initialData;
  try {
    // Get last hour of data for initial render
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    
    initialData = await fetchMetrics(
      from,
      to,
      'voltage,current,temp.CH1,temp.CH2,temp.CH3,vibration,frequency_Hz,energy_kWh',
      'raw'
    );
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    // Provide fallback data structure
    initialData = {
      range: { from: '', to: '' },
      samples: {
        voltage: [],
        current: [],
        'temp.CH1': [],
        'temp.CH2': [],
        'temp.CH3': [],
        vibration: [],
        frequency_Hz: [],
        energy_kWh: []
      },
      latest: {
        voltage: 0,
        current: 0,
        'temp.CH1': 0,
        'temp.CH2': 0,
        'temp.CH3': 0,
        vibration: 0,
        frequency_Hz: 0,
        energy_kWh: 0
      },
      aggregation: 'raw',
      sampleCounts: {}
    };
  }

  return <Dashboard initialData={initialData} />;
}
