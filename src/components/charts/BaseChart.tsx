'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: string;
  className?: string;
}

export default function BaseChart({ option, height = '100%', className = '' }: BaseChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Set option
    chartInstance.current.setOption(option, true);

    // Handle resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [option]);

  return (
    <div 
      ref={chartRef} 
      className={className}
      style={{ height, width: '100%' }}
    />
  );
}
