import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { RunSeriesPoint } from '../types';

interface ProcessTrendsPlotProps {
  series: RunSeriesPoint[];
  title?: string;
}

export const ProcessTrendsPlot: React.FC<ProcessTrendsPlotProps> = ({
  series,
  title = "Cell Culture Process Trajectory (2L Fed-Batch)"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !series || series.length === 0) return;

    const times = series.map(p => p.time_h);
    const vcd = series.map(p => p.VCD);
    const viab = series.map(p => p.viability_pct);
    const glc = series.map(p => p.glucose_gL);
    const lac = series.map(p => p.lactate_gL);

    const traces: any[] = [
      {
        x: times,
        y: vcd,
        name: 'VCD (10⁶ cells/mL)',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#10b981', width: 2.5 },
        marker: { size: 4 },
        yaxis: 'y1'
      },
      {
        x: times,
        y: viab,
        name: 'Viability (%)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#06b6d4', width: 2, dash: 'dot' },
        yaxis: 'y2'
      },
      {
        x: times,
        y: glc,
        name: 'Glucose (g/L)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#f59e0b', width: 1.8 },
        yaxis: 'y3'
      },
      {
        x: times,
        y: lac,
        name: 'Lactate (g/L)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#f43f5e', width: 2 },
        yaxis: 'y3'
      }
    ];

    const layout: any = {
      title: {
        text: title,
        font: { color: '#e2e8f0', size: 14, family: 'Inter, sans-serif' },
        x: 0.05
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 50, r: 50, t: 40, b: 40 },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.1,
        y: 1.15,
        font: { color: '#94a3b8', size: 11 }
      },
      xaxis: {
        title: { text: 'Culture Time (hours)', font: { color: '#94a3b8', size: 11 } },
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        zerolinecolor: 'rgba(51, 65, 85, 0.4)',
        tickfont: { color: '#94a3b8', size: 10 }
      },
      yaxis: {
        title: { text: 'VCD (10⁶ cells/mL)', font: { color: '#10b981', size: 11 } },
        gridcolor: 'rgba(51, 65, 85, 0.3)',
        tickfont: { color: '#10b981', size: 10 },
        side: 'left'
      },
      yaxis2: {
        title: { text: 'Viability (%)', font: { color: '#06b6d4', size: 11 } },
        tickfont: { color: '#06b6d4', size: 10 },
        overlaying: 'y',
        side: 'right',
        range: [40, 105]
      },
      yaxis3: {
        title: { text: 'Metabolites (g/L)', font: { color: '#f59e0b', size: 11 } },
        tickfont: { color: '#f59e0b', size: 10 },
        anchor: 'free',
        overlaying: 'y',
        side: 'right',
        position: 0.96,
        showgrid: false
      }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(containerRef.current, traces, layout, config);

    return () => {
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [series, title]);

  return (
    <div className="w-full h-80 relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
