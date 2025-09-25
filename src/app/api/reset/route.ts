import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function POST() {
  try {
    const storage = getStorage();
    await storage.clear();
    
    return NextResponse.json({ 
      success: true, 
      message: 'All data has been cleared successfully' 
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear data' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'IoT Analytics Reset Endpoint',
    method: 'POST',
    description: 'Clears all stored data from the system'
  });
}
