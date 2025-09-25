'use client';

import { Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  customFrom?: string;
  customTo?: string;
  onCustomRangeChange?: (from: string, to: string) => void;
}

export default function TimeFilter({ 
  selectedRange, 
  onRangeChange, 
  customFrom, 
  customTo, 
  onCustomRangeChange 
}: TimeFilterProps) {
  const [localFrom, setLocalFrom] = useState('');
  const [localTo, setLocalTo] = useState('');

  const timeRanges = [
    { value: '1m', label: 'Last 1m' },
    { value: '5m', label: 'Last 5m' },
    { value: '30m', label: 'Last 30m' },
    { value: '1h', label: 'Last 1h' },
    { value: '6h', label: 'Last 6h' },
    { value: '24h', label: 'Last 24h' },
    { value: 'custom', label: 'Custom' },
  ];

  // Convert UTC datetime-local values to IST for display
  useEffect(() => {
    if (customFrom) {
      const istDate = new Date(customFrom + '+05:30');
      setLocalFrom(istDate.toISOString().slice(0, 16));
    } else {
      setLocalFrom('');
    }
  }, [customFrom]);

  useEffect(() => {
    if (customTo) {
      const istDate = new Date(customTo + '+05:30');
      setLocalTo(istDate.toISOString().slice(0, 16));
    } else {
      setLocalTo('');
    }
  }, [customTo]);

  const handleCustomFromChange = (value: string) => {
    setLocalFrom(value);
    if (value && onCustomRangeChange) {
      // Convert IST datetime-local to UTC
      const utcDate = new Date(value + '+05:30');
      onCustomRangeChange(utcDate.toISOString().slice(0, 16), localTo);
    }
  };

  const handleCustomToChange = (value: string) => {
    setLocalTo(value);
    if (value && onCustomRangeChange) {
      // Convert IST datetime-local to UTC
      const utcDate = new Date(value + '+05:30');
      onCustomRangeChange(localFrom, utcDate.toISOString().slice(0, 16));
    }
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">Time Range:</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onRangeChange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedRange === range.value
                  ? 'bg-gray-100 text-gray-900 border border-gray-300'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {selectedRange === 'custom' && onCustomRangeChange && (
          <div className="flex items-center gap-2 ml-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="datetime-local"
              value={localFrom}
              onChange={(e) => handleCustomFromChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="From (IST)"
            />
            <span className="text-gray-500">to</span>
            <input
              type="datetime-local"
              value={localTo}
              onChange={(e) => handleCustomToChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="To (IST)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { TimeFilter };
export type { TimeFilterProps };
