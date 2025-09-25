'use client';

import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';
import { formatISTDateTime, formatISTTime } from '@/lib/timezone';

interface VibrationChartProps {
  data: Array<{ ts: number; value: number }>;
  chartType: 'line' | 'area' | 'bar';
}

export default function VibrationChart({ data, chartType }: VibrationChartProps) {
  const option: EChartsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
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
        const timestamp = formatISTDateTime(point.data[0]);
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${timestamp}</div>
            <div style="color: ${point.color};">● Vibration: ${(point.data[1] ?? 0).toFixed(3)} V</div>
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
        rotate: -45,
        formatter: (value: number) => {
          return formatISTTime(value);
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
      max: 10,
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
    animationDuration: 300, // Reduced animation duration for smoother updates
    animationEasing: 'cubicOut',
  }), [data, chartType]);

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

  return <BaseChart option={option} />;
}
