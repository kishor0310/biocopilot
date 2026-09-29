import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { HorizonPrediction } from '../types';

interface PredictionHorizonPlotProps {
  predictions: HorizonPrediction[];
  currentVal: number;
  currentTime: number;
  targetKey: 'vcd' | 'viability' | 'lactate' | 'ammonia';
  targetLabel: string;
  unit: string;
  color?: string;
}

export const PredictionHorizonPlot: React.FC<PredictionHorizonPlotProps> = ({
  predictions,
  currentVal,
  currentTime,
  targetKey,
  targetLabel,
  unit,
  color = '#10b981'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !predictions || predictions.length === 0) return;

    const times = [currentTime, ...predictions.map(p => p.time_h)];
    const means = [currentVal, ...predictions.map(p => p[targetKey].mean)];
    const uppers = [currentVal, ...predictions.map(p => p[targetKey].upper_bound)];
    const lowers = [currentVal, ...predictions.map(p => p[targetKey].lower_bound)];

    // Shaded uncertainty ribbon: upper trace + lower trace with fill='tonexty'
    const traces: any[] = [
      {
        x: times,
        y: uppers,
        mode: 'lines',
        line: { width: 0 },
        showlegend: false,
        hoverinfo: 'skip'
      },
      {
        x: times,
        y: lowers,
        mode: 'lines',
        line: { width: 0 },
        fill: 'tonexty',
        fillcolor: 'rgba(16, 185, 129, 0.15)',
        name: '95% Confidence Interval',
        hoverinfo: 'skip'
      },
      {
        x: times,
        y: means,
        mode: 'lines+markers',
        name: `Forecast (${targetLabel})`,
        line: { color: color, width: 2.5 },
        marker: { size: 6 }
      }
    ];

    const layout: any = {
      title: {
        text: `Forward Horizon Forecast: ${targetLabel} (${unit})`,
        font: { color: '#e2e8f0', size: 13, family: 'Inter, sans-serif' },
        x: 0.05
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 50, r: 25, t: 40, b: 35 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.1,
        y: 1.15,
        font: { color: '#94a3b8', size: 11 }
      },
      xaxis: {
        title: { text: 'Process Time (hours)', font: { color: '#94a3b8', size: 11 } },
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        tickfont: { color: '#94a3b8', size: 10 }
      },
      yaxis: {
        title: { text: `${targetLabel} (${unit})`, font: { color: '#94a3b8', size: 11 } },
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
  }, [predictions, currentVal, currentTime, targetKey, targetLabel, unit, color]);

  return (
    <div className="w-full h-72 relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
