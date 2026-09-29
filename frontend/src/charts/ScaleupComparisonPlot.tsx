import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { ScaleupRegimePoint } from '../types';

interface ScaleupComparisonPlotProps {
  strategies: Record<string, ScaleupRegimePoint[]>;
  metric: 'kla_h1' | 'tip_speed_m_s' | 'power_volume_W_m3' | 'mixing_time_s';
  metricLabel: string;
  unit: string;
}

export const ScaleupComparisonPlot: React.FC<ScaleupComparisonPlotProps> = ({
  strategies,
  metric,
  metricLabel,
  unit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !strategies) return;

    const names: Record<string, string> = {
      constant_power_volume: 'Constant P/V (Recommended)',
      constant_tip_speed: 'Constant Tip Speed',
      constant_kla: 'Constant kLa',
      constant_mixing_time: 'Constant Mixing Time'
    };

    const colors: Record<string, string> = {
      constant_power_volume: '#10b981',
      constant_tip_speed: '#f43f5e',
      constant_kla: '#06b6d4',
      constant_mixing_time: '#f59e0b'
    };

    const traces: any[] = Object.entries(strategies).map(([stratKey, points]) => {
      return {
        x: points.map(p => `${p.scale_L} L`),
        y: points.map(p => p[metric]),
        name: names[stratKey] || stratKey,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[stratKey] || '#94a3b8', width: 2.5 },
        marker: { size: 7 }
      };
    });

    const layout: any = {
      title: {
        text: `Scale-Up Hydrodynamic Trajectory: ${metricLabel} (${unit})`,
        font: { color: '#e2e8f0', size: 13, family: 'Inter, sans-serif' },
        x: 0.05
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 50, r: 25, t: 40, b: 35 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.05,
        y: 1.18,
        font: { color: '#94a3b8', size: 10 }
      },
      xaxis: {
        title: { text: 'Vessel Scale (Working Volume)', font: { color: '#94a3b8', size: 11 } },
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        tickfont: { color: '#94a3b8', size: 10 }
      },
      yaxis: {
        title: { text: `${metricLabel} (${unit})`, font: { color: '#94a3b8', size: 11 } },
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        tickfont: { color: '#94a3b8', size: 10 }
      }
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.newPlot(containerRef.current, traces, layout, config);

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [strategies, metric, metricLabel, unit]);

  return (
    <div className="w-full h-72 relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
