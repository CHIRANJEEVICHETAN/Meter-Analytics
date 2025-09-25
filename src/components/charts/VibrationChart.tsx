'use client';

import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface VibrationChartProps {
  data: Array<{ ts: number; value: number }>;
  chartType: 'line' | 'area' | 'bar';
  timeRange: { from: string; to: string };
}

export default function VibrationChart({ data, chartType, timeRange }: VibrationChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No vibration data available</div>
          <div className="text-gray-400 text-sm">Data will appear here once sensors start sending readings</div>
        </div>
      </div>
    );
  }

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
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
        const point = (params as Array<{data: [number, number], color: string}>)[0];
        const timestamp = new Date(point.data[0]).toLocaleString();
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${timestamp}</div>
            <div style="color: ${point.color};">● Vibration: ${point.data[1].toFixed(3)} V</div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#374151',
        formatter: (value: number) => {
          return new Date(value).toLocaleTimeString();
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Vibration (V)',
      nameTextStyle: {
        color: '#374151',
      },
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#374151',
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    series: [
      {
        name: 'Vibration',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data.map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#a855f7',
          width: 2,
        },
        itemStyle: {
          color: '#a855f7',
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
                color: 'rgba(168, 85, 247, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(168, 85, 247, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
        emphasis: {
          itemStyle: {
            color: '#9333ea',
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      },
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };

  return <BaseChart option={option} />;
}
