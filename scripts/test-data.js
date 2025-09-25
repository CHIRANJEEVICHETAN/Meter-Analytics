// Test script to populate sample data for the IoT Analytics Dashboard
// Run with: node scripts/test-data.js

const baseUrl = 'http://localhost:3008';

// Generate sample data with realistic IoT sensor values
function generateSampleData() {
  const now = new Date();
  const timestamp = now.toISOString();
  
  return {
    temperature: {
      CH1: 25 + Math.random() * 15, // 25-40°C
      CH3: 24 + Math.random() * 16, // 24-40°C
      CH5: 23 + Math.random() * 17, // 23-40°C
    },
    energy_meter: {
      energy_kWh: 15 + Math.random() * 10, // 15-25 kWh
      frequency_Hz: 50 + Math.random() * 2, // 50-52 Hz
      voltage_V: 220 + Math.random() * 20, // 220-240V
    },
    vibrator_meter: {
      s4_voltage: 2 + Math.random() * 2, // 2-4V
    },
    timestamp: timestamp
  };
}

async function sendData() {
  try {
    const data = generateSampleData();
    console.log('Sending data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success:', result);
    } else {
      console.error('❌ Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Send data every 5 seconds
console.log('🚀 Starting IoT data simulation...');
console.log('📡 Sending data to:', `${baseUrl}/api/ingest`);
console.log('⏱️  Interval: 5 seconds');
console.log('🛑 Press Ctrl+C to stop\n');

sendData(); // Send immediately
setInterval(sendData, 5000);
