'use client';

import { BarChart3, LineChart, AreaChart, Download, Settings } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  chartType: 'line' | 'area' | 'bar';
  onChartTypeChange: (type: 'line' | 'area' | 'bar') => void;
  onExportCSV?: () => void;
  className?: string;
}

export default function ChartCard({ 
  title, 
  children, 
  chartType, 
  onChartTypeChange, 
  onExportCSV,
  className = '' 
}: ChartCardProps) {
  const [showSettings, setShowSettings] = useState(false);

  const chartTypes = [
    { type: 'line' as const, icon: LineChart, label: 'Line' },
    { type: 'area' as const, icon: AreaChart, label: 'Area' },
    { type: 'bar' as const, icon: BarChart3, label: 'Bar' },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {chartTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => onChartTypeChange(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  chartType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Export Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Chart settings and customization options will be available here.</p>
            <p className="mt-2">Features: Legend toggle, series visibility, sampling rate, aggregation level.</p>
          </div>
        </div>
      )}

      {/* Chart Content */}
      <div className="h-80">
        {children}
      </div>
    </div>
  );
}
