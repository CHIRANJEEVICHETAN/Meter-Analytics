'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import LiveMetricsBar from './LiveMetricsBar';
import TimeFilter from './TimeFilter';
import ChartCard from './ChartCard';
import VoltageChart from './charts/VoltageChart';
import CurrentChart from './charts/CurrentChart';
import TemperatureChart from './charts/TemperatureChart';
import VibrationChart from './charts/VibrationChart';
import { fetchMetrics, MetricsData } from '@/lib/api';

interface DashboardProps {
  initialData: MetricsData;
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [selectedRange, setSelectedRange] = useState('1h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [chartTypes, setChartTypes] = useState({
    voltage: 'line' as 'line' | 'area' | 'bar',
    current: 'line' as 'line' | 'area' | 'bar',
    temperature: 'line' as 'line' | 'area' | 'bar',
    vibration: 'line' as 'line' | 'area' | 'bar',
  });

  // Calculate time range
  const getTimeRange = (range: string) => {
    const now = new Date();
    const to = now.toISOString();
    
    switch (range) {
      case '1m':
        return {
          from: new Date(now.getTime() - 60 * 1000).toISOString(),
          to
        };
      case '5m':
        return {
          from: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          to
        };
      case '30m':
        return {
          from: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          to
        };
      case '1h':
        return {
          from: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          to
        };
      case '6h':
        return {
          from: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          to
        };
      case '24h':
        return {
          from: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          to
        };
      case 'custom':
        return { from: customFrom, to: customTo };
      default:
        return { from: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), to };
    }
  };

  const timeRange = getTimeRange(selectedRange);

  // Fetch metrics data with polling
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['metrics', timeRange.from, timeRange.to],
    queryFn: () => fetchMetrics(
      timeRange.from,
      timeRange.to,
      'voltage,current,temp.CH1,temp.CH3,temp.CH5,vibration',
      'raw'
    ),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale to force refetch
  });

  const handleChartTypeChange = (chartName: keyof typeof chartTypes, type: 'line' | 'area' | 'bar') => {
    setChartTypes(prev => ({
      ...prev,
      [chartName]: type
    }));
  };

  const handleCustomRangeChange = (from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
  };

  const exportCSV = (metricName: string, data: Array<{ ts: number; value: number }>) => {
    const csvContent = [
      'Timestamp,Value',
      ...data.map(point => `${new Date(point.ts).toISOString()},${point.value}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metricName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h2>
            <p className="text-red-300">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back, User</h1>
              <p className="text-gray-600" suppressHydrationWarning>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Live Data</span>
              </div>
              <div className="text-gray-500 text-sm">
                Last updated: <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Time Filter */}
          <div className="mb-8">
            <TimeFilter
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              customFrom={customFrom}
              customTo={customTo}
              onCustomRangeChange={handleCustomRangeChange}
            />
          </div>

          {/* Live Metrics */}
          <div className="mb-8">
            <LiveMetricsBar latest={metricsData?.latest || initialData.latest} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voltage Chart */}
          <ChartCard
            title="Voltage"
            chartType={chartTypes.voltage}
            onChartTypeChange={(type) => handleChartTypeChange('voltage', type)}
            onExportCSV={() => exportCSV('voltage', metricsData?.samples.voltage || [])}
          >
            <VoltageChart
              data={metricsData?.samples.voltage || []}
              chartType={chartTypes.voltage}
              timeRange={timeRange}
            />
          </ChartCard>

          {/* Current Chart */}
          <ChartCard
            title="Current"
            chartType={chartTypes.current}
            onChartTypeChange={(type) => handleChartTypeChange('current', type)}
            onExportCSV={() => exportCSV('current', metricsData?.samples.current || [])}
          >
            <CurrentChart
              data={metricsData?.samples.current || []}
              chartType={chartTypes.current}
              timeRange={timeRange}
            />
          </ChartCard>
        </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <ChartCard
            title="Temperature"
            chartType={chartTypes.temperature}
            onChartTypeChange={(type) => handleChartTypeChange('temperature', type)}
            onExportCSV={() => {
              const tempData = [
                ...(metricsData?.samples['temp.CH1'] || []).map(p => ({ ...p, series: 'CH1' })),
                ...(metricsData?.samples['temp.CH3'] || []).map(p => ({ ...p, series: 'CH3' })),
                ...(metricsData?.samples['temp.CH5'] || []).map(p => ({ ...p, series: 'CH5' }))
              ];
              exportCSV('temperature', tempData);
            }}
          >
            <TemperatureChart
              data={{
                'temp.CH1': metricsData?.samples['temp.CH1'] || [],
                'temp.CH3': metricsData?.samples['temp.CH3'] || [],
                'temp.CH5': metricsData?.samples['temp.CH5'] || [],
              }}
              chartType={chartTypes.temperature}
              timeRange={timeRange}
            />
          </ChartCard>

          {/* Vibration Chart */}
          <ChartCard
            title="Vibration"
            chartType={chartTypes.vibration}
            onChartTypeChange={(type) => handleChartTypeChange('vibration', type)}
            onExportCSV={() => exportCSV('vibration', metricsData?.samples.vibration || [])}
          >
            <VibrationChart
              data={metricsData?.samples.vibration || []}
              chartType={chartTypes.vibration}
              timeRange={timeRange}
            />
          </ChartCard>
        </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="fixed bottom-8 right-8 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Updating data...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
