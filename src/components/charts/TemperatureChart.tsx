'use client';

import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface TemperatureChartProps {
  data: {
    'temp.CH1': Array<{ ts: number; value: number }>;
    'temp.CH3': Array<{ ts: number; value: number }>;
    'temp.CH5': Array<{ ts: number; value: number }>;
  };
  chartType: 'line' | 'area' | 'bar';
  timeRange: { from: string; to: string };
}

export default function TemperatureChart({ data, chartType, timeRange }: TemperatureChartProps) {
  // Handle empty data
  const hasData = Object.values(data).some(channel => channel && channel.length > 0);
  if (!hasData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No temperature data available</div>
          <div className="text-gray-400 text-sm">Data will appear here once sensors start sending readings</div>
        </div>
      </div>
    );
  }

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    legend: {
      data: ['CH1', 'CH3', 'CH5'],
      textStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: unknown) => {
        const paramsArray = params as any[];
        const timestamp = new Date(paramsArray[0].data[0]).toLocaleString();
        let content = `<div style="padding: 8px;"><div style="font-weight: bold; margin-bottom: 4px;">${timestamp}</div>`;
        
        paramsArray.forEach((param: any) => {
          content += `<div style="color: ${param.color};">● ${param.seriesName}: ${param.data[1].toFixed(1)}°C</div>`;
        });
        
        content += '</div>';
        return content;
      },
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        formatter: (value: number) => {
          return new Date(value).toLocaleTimeString();
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Temperature (°C)',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    series: [
      {
        name: 'CH1',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data['temp.CH1'].map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#ef4444',
          width: 2,
        },
        itemStyle: {
          color: '#ef4444',
        },
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(239, 68, 68, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(239, 68, 68, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
      },
      {
        name: 'CH3',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data['temp.CH3'].map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#f97316',
          width: 2,
        },
        itemStyle: {
          color: '#f97316',
        },
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(249, 115, 22, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(249, 115, 22, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
      },
      {
        name: 'CH5',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data['temp.CH5'].map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#ec4899',
          width: 2,
        },
        itemStyle: {
          color: '#ec4899',
        },
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(236, 72, 153, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(236, 72, 153, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
      },
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };

  return <BaseChart option={option} />;
}
