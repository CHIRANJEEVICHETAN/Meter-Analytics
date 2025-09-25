'use client';

import { Activity, Zap, Thermometer, Gauge, Battery } from 'lucide-react';

interface LiveMetricsBarProps {
  latest: {
    voltage: number;
    current: number;
    'temp.CH1': number;
    'temp.CH3': number;
    'temp.CH5': number;
    vibration: number;
    frequency_Hz: number;
    energy_kWh: number;
  };
}

export default function LiveMetricsBar({ latest }: LiveMetricsBarProps) {
  const metrics = [
    {
      label: 'Frequency',
      value: latest.frequency_Hz.toFixed(2),
      unit: 'Hz',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Voltage',
      value: latest.voltage.toFixed(1),
      unit: 'V',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      label: 'Current',
      value: latest.current.toFixed(1),
      unit: 'A',
      icon: Zap,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
    },
    {
      label: 'Energy',
      value: latest.energy_kWh.toFixed(2),
      unit: 'kWh',
      icon: Battery,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'CH1 Temp',
      value: latest['temp.CH1'].toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      label: 'CH3 Temp',
      value: latest['temp.CH3'].toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      label: 'CH5 Temp',
      value: latest['temp.CH5'].toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      label: 'Vibration',
      value: latest.vibration.toFixed(3),
      unit: 'V',
      icon: Gauge,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">{metric.label}</div>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900">
                {metric.value}
              </span>
              <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
            </div>
            {/* Trend indicator */}
            <div className="mt-2 flex items-center text-xs text-green-600">
              <span className="font-medium">+2.5%</span>
              <span className="ml-1">vs last hour</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
