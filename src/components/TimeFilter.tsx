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
    <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-lg shadow-gray-200/20">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-700 font-semibold text-lg">Time Range:</span>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onRangeChange(range.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedRange === range.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200 transform -translate-y-0.5'
                  : 'bg-white/80 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 border border-gray-200/50 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {selectedRange === 'custom' && onCustomRangeChange && (
          <div className="flex items-center gap-3 ml-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <input
              type="datetime-local"
              value={localFrom}
              onChange={(e) => handleCustomFromChange(e.target.value)}
              className="bg-white/80 border border-gray-200/50 rounded-xl px-4 py-2.5 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              placeholder="From (IST)"
            />
            <span className="text-gray-500 font-medium">to</span>
            <input
              type="datetime-local"
              value={localTo}
              onChange={(e) => handleCustomToChange(e.target.value)}
              className="bg-white/80 border border-gray-200/50 rounded-xl px-4 py-2.5 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
