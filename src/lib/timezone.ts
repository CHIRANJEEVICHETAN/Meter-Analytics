// Utility functions for IST timezone handling

export function formatISTTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatISTDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function getCurrentISTTime(): string {
  const now = new Date();
  return formatISTTime(now.getTime());
}

export function getISTTimeRange(range: string): { from: string; to: string } {
  const now = new Date();
  const nowTs = now.getTime();
  
  let fromTs: number;
  
  switch (range) {
    case '1m':
      fromTs = nowTs - (1 * 60 * 1000);
      break;
    case '5m':
      fromTs = nowTs - (5 * 60 * 1000);
      break;
    case '30m':
      fromTs = nowTs - (30 * 60 * 1000);
      break;
    case '1h':
      fromTs = nowTs - (60 * 60 * 1000);
      break;
    case '6h':
      fromTs = nowTs - (6 * 60 * 60 * 1000);
      break;
    case '24h':
      fromTs = nowTs - (24 * 60 * 60 * 1000);
      break;
    default:
      fromTs = nowTs - (60 * 60 * 1000); // Default to 1 hour
  }
  
  return {
    from: new Date(fromTs).toISOString(),
    to: new Date(nowTs).toISOString()
  };
}

export function convertISTToUTC(istDateTimeString: string): string {
  // Parse the IST datetime string and convert to UTC
  const istDate = new Date(istDateTimeString + '+05:30');
  return istDate.toISOString();
}
