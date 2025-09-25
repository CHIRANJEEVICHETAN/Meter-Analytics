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
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart only once
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Use smooth update instead of full re-render
    if (isInitialized.current) {
      // Update data smoothly without animation reset
      chartInstance.current.setOption(option, {
        notMerge: false, // Merge with existing option
        lazyUpdate: true, // Lazy update for better performance
        silent: false, // Allow animation
      });
    } else {
      // Initial render
      chartInstance.current.setOption(option, true);
      isInitialized.current = true;
    }

    // Handle resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, []);

  return (
    <div 
      ref={chartRef} 
      className={className}
      style={{ height, width: '100%' }}
    />
  );
}
