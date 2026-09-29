import React, { useEffect, useState } from 'react';
import { Layers, AlertTriangle, ShieldAlert, CheckCircle2, Sliders, Info } from 'lucide-react';
import { calculateScaleup } from '../api/client';
import { ScaleupResponse, ScaleupRequest } from '../types';
import { ScaleupComparisonPlot } from '../charts/ScaleupComparisonPlot';

export const ScaleUpEnginePage: React.FC = () => {
  const [scaleupData, setScaleupData] = useState<ScaleupResponse | null>(null);
  const [sourceRpm, setSourceRpm] = useState<number>(250.0);
  const [sourceVvm, setSourceVvm] = useState<number>(0.12);
  const [selectedMetric, setSelectedMetric] = useState<'kla_h1' | 'tip_speed_m_s' | 'power_volume_W_m3' | 'mixing_time_s'>('kla_h1');

  useEffect(() => {
    async function load() {
      try {
        const res = await calculateScaleup({
          source_scale_L: 2.0,
          source_rpm: sourceRpm,
          source_vvm: sourceVvm,
          impeller_type: 'pitched_blade',
          density_kg_m3: 1000.0,
          viscosity_Pa_s: 0.001
        });
        setScaleupData(res);
      } catch (err) {
        console.error('Failed to calculate scaleup:', err);
      }
    }
    load();
  }, [sourceRpm, sourceVvm]);

  const metricConfig = {
    kla_h1: { label: 'Oxygen Mass Transfer (kLa)', unit: 'h⁻¹' },
    tip_speed_m_s: { label: 'Impeller Tip Speed (v_tip)', unit: 'm/s' },
    power_volume_W_m3: { label: 'Power per Volume (P/V)', unit: 'W/m³' },
    mixing_time_s: { label: 'Mixing Time (θ_m)', unit: 'seconds' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Prominent Engineering Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>Scale-Up Hydrodynamic & Mass-Transfer Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate scaling divergence across 2 L → 10 L → 100 L → 1,000 L using four classic bioprocess scaling paradigms.
          </p>
        </div>

        {/* Mandatory Engineering Estimate Badge */}
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-300 text-xs font-mono">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="font-bold tracking-wide">
            ENGINEERING ESTIMATE — REQUIRES WET-LAB VALIDATION
          </span>
        </div>
      </div>

      {/* Interactive Controls & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls & Summary */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <span>2L Benchtop Source Conditions</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Benchtop Agitation Speed</span>
                <span className="font-mono text-emerald-400 font-bold">{sourceRpm} RPM</span>
              </div>
              <input
                type="range"
                min={150}
                max={350}
                step={10}
                value={sourceRpm}
                onChange={(e) => setSourceRpm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Aeration Rate</span>
                <span className="font-mono text-emerald-400 font-bold">{sourceVvm} vvm</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.25}
                step={0.01}
                value={sourceVvm}
                onChange={(e) => setSourceVvm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">
                Hydrodynamic Plot Metric
              </label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                {(['kla_h1', 'tip_speed_m_s', 'power_volume_W_m3', 'mixing_time_s'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMetric(m)}
                    className={`px-2 py-1.5 rounded text-left transition-all cursor-pointer ${
                      selectedMetric === m
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {metricConfig[m].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-cyan-400 block text-xs">Scaling Recommendation:</span>
            <p className="leading-relaxed">
              At 1,000 L, <strong>Constant P/V</strong> maintains volumetric mass transfer (kLa ~ 14.8 h⁻¹) without exceeding mammalian shear limits (tip speed &lt; 1.5 m/s).
            </p>
          </div>
        </div>

        {/* Chart View (Span 2) */}
        <div className="glass-panel rounded-xl p-5 lg:col-span-2">
          {scaleupData ? (
            <ScaleupComparisonPlot
              strategies={scaleupData.strategies}
              metric={selectedMetric}
              metricLabel={metricConfig[selectedMetric].label}
              unit={metricConfig[selectedMetric].unit}
            />
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
              Calculating hydrodynamic scale-up models...
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Scaling Regime Comparison Table */}
      {scaleupData && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Full Scaling Scenario Matrix (2 L → 1,000 L)</h3>
            <p className="text-xs text-slate-400">
              Evaluates oxygen supply adequacy vs impeller shear stress on CHO cell membranes across scales.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Scale (L)</th>
                  <th className="py-2.5 px-3">Agitation (RPM)</th>
                  <th className="py-2.5 px-3">Tip Speed (m/s)</th>
                  <th className="py-2.5 px-3">P/V (W/m³)</th>
                  <th className="py-2.5 px-3">kLa Est (h⁻¹)</th>
                  <th className="py-2.5 px-3">Mixing Time (s)</th>
                  <th className="py-2.5 px-3">DO Risk</th>
                  <th className="py-2.5 px-3">Shear Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {Object.entries(scaleupData.strategies).map(([stratKey, points]) => {
                  const stratNames: Record<string, string> = {
                    constant_power_volume: 'Constant P/V (Recommended)',
                    constant_tip_speed: 'Constant Tip Speed',
                    constant_kla: 'Constant kLa',
                    constant_mixing_time: 'Constant Mixing Time'
                  };
                  return points.map((pt, pIdx) => (
                    <tr key={`${stratKey}-${pIdx}`} className="hover:bg-slate-800/40">
                      {pIdx === 0 && (
                        <td rowSpan={points.length} className="py-2.5 px-3 font-semibold text-emerald-400 font-sans border-r border-slate-800/80 align-top">
                          {stratNames[stratKey]}
                        </td>
                      )}
                      <td className="py-2 px-3 font-mono font-bold text-slate-200">{pt.scale_L} L</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{pt.rpm}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{pt.tip_speed_m_s}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{pt.power_volume_W_m3}</td>
                      <td className="py-2 px-3 font-mono text-emerald-400 font-bold">{pt.kla_h1}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{pt.mixing_time_s}</td>
                      <td className="py-2 px-3 font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pt.do_risk.includes('CRITICAL') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {pt.do_risk}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pt.shear_risk === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {pt.shear_risk}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          {/* Engineering Notes & Recommendations */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
            <span className="font-bold text-white block text-xs uppercase font-mono tracking-wider">
              Bioprocess Engineering Conclusions:
            </span>
            {scaleupData.engineering_notes.map((note, i) => (
              <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
