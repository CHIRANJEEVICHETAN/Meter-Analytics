'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import LiveMetricsBar from './LiveMetricsBar';
import ChartCard from './ChartCard';
import VoltageChart from './charts/VoltageChart';
import CurrentChart from './charts/CurrentChart';
import EnergyChart from './charts/EnergyChart';
import FrequencyChart from './charts/FrequencyChart';
import TemperatureChart from './charts/TemperatureChart';
import VibrationChart from './charts/VibrationChart';
import LoginwareLogo from './LoginwareLogo';
import TimeFilter from './TimeFilter';
import { fetchMetrics, MetricsData, resetData } from '@/lib/api';
import { getCurrentISTTime, getISTTimeRange, convertISTToUTC } from '@/lib/timezone';

interface DashboardProps {
  initialData: MetricsData;
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [chartTypes, setChartTypes] = useState({
    voltage: 'line' as 'line' | 'area' | 'bar',
    current: 'line' as 'line' | 'area' | 'bar',
    energy: 'line' as 'line' | 'area' | 'bar',
    frequency: 'line' as 'line' | 'area' | 'bar',
    temperature: 'line' as 'line' | 'area' | 'bar',
    vibration: 'line' as 'line' | 'area' | 'bar',
  });

  // Time filter state
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Calculate time range for API calls
  const timeRange = useMemo(() => {
    if (selectedTimeRange === 'custom' && customFrom && customTo) {
      return {
        from: convertISTToUTC(customFrom),
        to: convertISTToUTC(customTo)
      };
    } else {
      return getISTTimeRange(selectedTimeRange);
    }
  }, [selectedTimeRange, customFrom, customTo]);

  // Fetch data with time filtering
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['metrics', timeRange.from, timeRange.to],
    queryFn: () => fetchMetrics(
      timeRange.from,
      timeRange.to,
      'voltage,current,temp.CH1,temp.CH2,temp.CH3,vibration,frequency_Hz,energy_kWh',
      'raw'
    ),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 4000, // Consider data fresh for 4 seconds to reduce unnecessary refetches
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    voltage: metricsData?.samples.voltage || [],
    current: metricsData?.samples.current || [],
    energy: metricsData?.samples.energy_kWh || [],
    frequency: metricsData?.samples.frequency_Hz || [],
    temperature: {
      'temp.CH1': metricsData?.samples['temp.CH1'] || [],
      'temp.CH2': metricsData?.samples['temp.CH2'] || [],
      'temp.CH3': metricsData?.samples['temp.CH3'] || [],
    },
    vibration: metricsData?.samples.vibration || [],
    latest: metricsData?.latest || initialData.latest
  }), [metricsData, initialData.latest]);


  const handleChartTypeChange = (chartName: keyof typeof chartTypes, type: 'line' | 'area' | 'bar') => {
    setChartTypes(prev => ({
      ...prev,
      [chartName]: type
    }));
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        const response = await resetData();
        if (response.ok) {
          // Refetch data to show empty state
          window.location.reload();
        } else {
          alert('Failed to clear data. Please try again.');
        }
      } catch (error) {
        console.error('Reset error:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LoginwareLogo size="md" showText={true} />
              <div className="ml-6 pl-6 border-l border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IoT Analytics Dashboard
                </h2>
                <p className="text-gray-500 text-sm mt-1">Real-time sensor monitoring & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Reset Data
              </button>
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Live Data</span>
              </div>
              <div className="text-gray-500 text-sm">
                Last updated: <span suppressHydrationWarning>{getCurrentISTTime()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Time Filter */}
          <div className="mb-6">
            <TimeFilter
              selectedRange={selectedTimeRange}
              onRangeChange={setSelectedTimeRange}
              customFrom={customFrom}
              customTo={customTo}
              onCustomRangeChange={(from, to) => {
                setCustomFrom(from);
                setCustomTo(to);
              }}
            />
          </div>

          {/* Live Metrics */}
          <div className="mb-8">
            <LiveMetricsBar latest={chartData.latest} />
          </div>

          {/* First Row: Voltage and Current */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Voltage Chart */}
          <ChartCard
            title="Voltage"
            chartType={chartTypes.voltage}
            onChartTypeChange={(type) => handleChartTypeChange('voltage', type)}
             onExportCSV={() => exportCSV('voltage', chartData.voltage)}
           >
             <VoltageChart
               data={chartData.voltage}
               chartType={chartTypes.voltage}
             />
          </ChartCard>

          {/* Current Chart */}
          <ChartCard
            title="Current"
            chartType={chartTypes.current}
            onChartTypeChange={(type) => handleChartTypeChange('current', type)}
             onExportCSV={() => exportCSV('current', chartData.current)}
           >
             <CurrentChart
               data={chartData.current}
               chartType={chartTypes.current}
             />
          </ChartCard>
        </div>

          {/* Second Row: Energy and Frequency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Energy Chart */}
          <ChartCard
            title="Energy"
            chartType={chartTypes.energy}
            onChartTypeChange={(type) => handleChartTypeChange('energy', type)}
             onExportCSV={() => exportCSV('energy', chartData.energy)}
           >
             <EnergyChart
               data={chartData.energy}
               chartType={chartTypes.energy}
             />
          </ChartCard>

          {/* Frequency Chart */}
          <ChartCard
            title="Frequency"
            chartType={chartTypes.frequency}
            onChartTypeChange={(type) => handleChartTypeChange('frequency', type)}
             onExportCSV={() => exportCSV('frequency', chartData.frequency)}
           >
             <FrequencyChart
               data={chartData.frequency}
               chartType={chartTypes.frequency}
             />
          </ChartCard>
        </div>

          {/* Third Row: Temperature and Vibration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature Chart */}
          <ChartCard
            title="Temperature"
            chartType={chartTypes.temperature}
            onChartTypeChange={(type) => handleChartTypeChange('temperature', type)}
             onExportCSV={() => {
               const tempData = [
                 ...chartData.temperature['temp.CH1'].map(p => ({ ...p, series: 'CH1' })),
                 ...chartData.temperature['temp.CH2'].map(p => ({ ...p, series: 'CH2' })),
                 ...chartData.temperature['temp.CH3'].map(p => ({ ...p, series: 'CH3' }))
               ];
               exportCSV('temperature', tempData);
             }}
           >
             <TemperatureChart
               data={chartData.temperature}
               chartType={chartTypes.temperature}
             />
          </ChartCard>

          {/* Vibration Chart */}
          <ChartCard
            title="Vibration"
            chartType={chartTypes.vibration}
            onChartTypeChange={(type) => handleChartTypeChange('vibration', type)}
             onExportCSV={() => exportCSV('vibration', chartData.vibration)}
           >
             <VibrationChart
               data={chartData.vibration}
               chartType={chartTypes.vibration}
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
      
      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-500 text-sm">Powered by</p>
          <LoginwareLogo size="sm" showText={true} />
        </div>
      </div>
    </div>
  );
}
