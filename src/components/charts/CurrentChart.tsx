'use client';

import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface CurrentChartProps {
  data: Array<{ ts: number; value: number }>;
  chartType: 'line' | 'area' | 'bar';
  timeRange: { from: string; to: string };
}

export default function CurrentChart({ data, chartType, timeRange }: CurrentChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No current data available</div>
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
            <div style="color: ${point.color};">● Current: ${point.data[1].toFixed(2)} A</div>
          </div>
        `;
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
      name: 'Current (A)',
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
        name: 'Current',
        type: chartType === 'bar' ? 'bar' : chartType === 'area' ? 'line' : 'line',
        data: data.map(point => [point.ts, point.value]),
        smooth: true,
        lineStyle: {
          color: '#3b82f6',
          width: 2,
        },
        itemStyle: {
          color: '#3b82f6',
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
                color: 'rgba(59, 130, 246, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.05)',
              },
            ],
          },
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
        emphasis: {
          itemStyle: {
            color: '#2563eb',
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
