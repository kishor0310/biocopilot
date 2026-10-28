import React, { useEffect, useState } from 'react';
import { Scale, RefreshCw, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ScaleUpItem } from '../types';
import { fetchScaleUpMatrix } from '../api/client';

export const ScaleUpPage: React.FC = () => {
  const [strategy, setStrategy] = useState('constant_pv');
  const [matrix, setMatrix] = useState<ScaleUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScaleUp(strategy);
  }, [strategy]);

  const loadScaleUp = async (strat: string) => {
    setLoading(true);
    try {
      const data = await fetchScaleUpMatrix(strat);
      setMatrix(data.scaleup_matrix);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Scale className="w-6 h-6 text-teal-600" />
            <span>Bioreactor Scale-Up Engine (2 L → 1,000 L)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hydrodynamic correlations for oxygen transfer ($k_L a$), power input ($P/V$), mixing time, and shear stress evaluation.
          </p>
        </div>

        {/* Strategy Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {[
            { id: 'constant_pv', label: 'Constant P/V' },
            { id: 'constant_tipspeed', label: 'Constant Tip Speed' },
            { id: 'constant_kla', label: 'Constant kLa' },
            { id: 'constant_mixing', label: 'Constant Mixing' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                strategy === s.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>SCIENTIFIC MANDATE:</strong> Scaling calculations utilize empirical Rushton/Pitched-blade hydrodynamic correlations ($P = N_p \rho N^3 D^5$, $k_L a = k(P/V)^a(v_{vs})^b$).
          </span>
        </div>
        <span className="font-mono font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-900 rounded border border-amber-300">
          ENGINEERING ESTIMATE — REQUIRES VALIDATION
        </span>
      </div>

      {/* Scaling Matrix Table (P0 Requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Scale-Up Comparison Matrix ({strategy.replace('_', ' ').toUpperCase()})
          </h3>
          <span className="text-xs text-slate-500 font-mono">2.0 L Benchtop to 1,000 L Pilot Plant</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Scale (L)</th>
                  <th className="p-3">Strategy</th>
                  <th className="p-3">Agitation (RPM)</th>
                  <th className="p-3">Gas Flow (VVM)</th>
                  <th className="p-3">P/V (W/m³)</th>
                  <th className="p-3">Tip Speed (m/s)</th>
                  <th className="p-3">Reynolds No.</th>
                  <th className="p-3">kLa (1/h)</th>
                  <th className="p-3">Mixing Time (s)</th>
                  <th className="p-3">DO Risk</th>
                  <th className="p-3">Shear Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                {matrix.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                      idx === 0 ? 'bg-teal-50/50 dark:bg-teal-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.target_volume_L} L</td>
                    <td className="p-3">{row.strategy}</td>
                    <td className="p-3 text-teal-600 dark:text-teal-400 font-bold">{row.rpm}</td>
                    <td className="p-3">{row.gas_flow_vvm}</td>
                    <td className="p-3">{row.power_per_volume_W_m3}</td>
                    <td className="p-3">{row.tip_speed_m_s}</td>
                    <td className="p-3">{row.reynolds_number.toLocaleString()}</td>
                    <td className="p-3">{row.kla_est_h}</td>
                    <td className="p-3">{row.mixing_time_est_s}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.do_limitation_risk === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {row.do_limitation_risk}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.shear_risk_level === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {row.shear_risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
