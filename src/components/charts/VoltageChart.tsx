'use client';

import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface VoltageChartProps {
  data: Array<{ ts: number; value: number }>;
  chartType: 'line' | 'area' | 'bar';
  timeRange: { from: string; to: string };
}

export default function VoltageChart({ data, chartType, timeRange }: VoltageChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No voltage data available</div>
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      textStyle: {
        color: '#374151',
      },
      formatter: (params: unknown) => {
        const point = (params as Array<{data: [number, number], color: string}>)[0];
        const timestamp = new Date(point.data[0]).toLocaleString();
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${timestamp}</div>
            <div style="color: ${point.color};">● Voltage: ${point.data[1].toFixed(2)} V</div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => {
          return new Date(value).toLocaleTimeString();
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Voltage (V)',
      nameTextStyle: {
        color: '#6b7280',
      },
      min: 0,
      max: 500,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    series: [
      {
        name: 'Voltage',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data.map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#8b5cf6',
          width: 2,
        },
        itemStyle: {
          color: '#8b5cf6',
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
                color: 'rgba(139, 92, 246, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(139, 92, 246, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
        emphasis: {
          itemStyle: {
            color: '#7c3aed',
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
