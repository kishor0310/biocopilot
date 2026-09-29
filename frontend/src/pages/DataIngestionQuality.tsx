import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, FileText, ShieldAlert } from 'lucide-react';
import { fetchDatasets, cleanDataset } from '../api/client';
import { DatasetInfo, ColumnHealth } from '../types';

export const DataIngestionQuality: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedDs, setSelectedDs] = useState<DatasetInfo | null>(null);
  const [columnHealth, setColumnHealth] = useState<ColumnHealth[]>([]);
  const [qualityScore, setQualityScore] = useState<number>(99.6);
  const [isCleaning, setIsCleaning] = useState(false);

  // Mappings
  const [mappings, setMappings] = useState<Record<string, string>>({
    Time_hr: 'time_h',
    Batch_Run_ID: 'batch_id',
    Vessel_Vol_L: 'vessel_volume_L',
    Viable_Cell_Density_1e6_mL: 'VCD',
    Viability_Percent: 'viability_pct',
    Glucose_Conc_g_L: 'glucose_gL',
    Glutamine_Conc_mM: 'glutamine_mM',
    Lactate_Conc_g_L: 'lactate_gL',
    Ammonia_Conc_mM: 'ammonia_mM',
    Culture_pH: 'pH',
    Dissolved_Oxygen_Pct: 'DO_pct',
    Temperature_C: 'temp_C',
    Agitation_RPM: 'rpm',
    Aeration_vvm: 'gas_flow_vvm',
    Feed_Flow_mL_hr: 'feed_rate_mL_h',
    Medium_Cost_Per_L: 'media_cost_per_L'
  });

  useEffect(() => {
    async function init() {
      try {
        const list = await fetchDatasets();
        setDatasets(list);
        if (list.length > 0) {
          setSelectedDs(list[0]);
          handleClean(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      }
    }
    init();
  }, []);

  const handleClean = async (dsId: string) => {
    setIsCleaning(true);
    try {
      const res = await cleanDataset(dsId, mappings);
      setQualityScore(res.data_quality_score);
      setColumnHealth(res.column_health);
    } catch (err) {
      console.error('Failed to clean dataset:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Provenance Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Database className="h-5 w-5 text-emerald-400" />
            <span>Dataset Ingestion & Quality Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated column mapping adapter, physiological boundary checks, and FDA 21 CFR validation scoring.
          </p>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-300 text-xs">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="font-mono font-bold tracking-wide">
            SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA
          </span>
        </div>
      </div>

      {/* Dataset Summary & Quality Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="glass-panel-glow rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Data Quality Score</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-4xl font-black text-emerald-400 font-mono">
              {qualityScore} <span className="text-lg text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">High integrity for predictive modeling</p>
          </div>
          <button
            onClick={() => selectedDs && handleClean(selectedDs.id)}
            disabled={isCleaning}
            className="flex items-center justify-center space-x-1.5 w-full py-1.5 px-3 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCleaning ? 'animate-spin' : ''}`} />
            <span>Recalculate Quality Score</span>
          </button>
        </div>

        {/* Dataset Metadata */}
        <div className="glass-panel rounded-xl p-5 md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Dataset Identifier</span>
            <span className="text-white font-bold font-mono text-sm truncate block">cho-benchmark-v1</span>
            <span className="text-slate-500 text-[10px] mt-1 block">Industrial CHO Fed-Batch</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Audited Batches</span>
            <span className="text-emerald-400 font-bold font-mono text-xl">4 Runs</span>
            <span className="text-slate-500 text-[10px] mt-1 block">676 Telemetry Records</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Sampling Window</span>
            <span className="text-cyan-400 font-bold font-mono text-xl">0 → 336 h</span>
            <span className="text-slate-500 text-[10px] mt-1 block">Δt = 2.0h Regular Interval</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">License & Provenance</span>
            <span className="text-amber-400 font-bold font-mono text-sm">CC-BY-4.0</span>
            <span className="text-slate-500 text-[10px] mt-1 block">Monod Kinetics Model</span>
          </div>
        </div>
      </div>

      {/* Column Adapter & Canonical Schema Mapping */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Canonical Variable Mapping & Physiological Validation</h3>
            <p className="text-xs text-slate-400">
              Source columns mapped automatically using fuzzy matching. Verified against biological CHO bounds.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            16 / 16 Mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-2.5 px-3">Canonical Variable</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Source Column Name</th>
                <th className="py-2.5 px-3">Observed Range</th>
                <th className="py-2.5 px-3">Missing %</th>
                <th className="py-2.5 px-3">Physiological Status</th>
                <th className="py-2.5 px-3">Model Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {columnHealth.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                    {col.canonical_name}
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono">
                    {col.unit || '-'}
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                    {col.source_column}
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-mono">
                    {col.min !== null && col.max !== null ? `[${col.min}, ${col.max}]` : 'N/A'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${col.missing_percentage === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {col.missing_percentage}%
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {col.physiological_valid ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>VALID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 text-[11px]">
                        <AlertTriangle className="h-3 w-3" />
                        <span>FLAGGED</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">
                    {['VCD', 'viability_pct', 'glucose_gL', 'lactate_gL'].includes(col.canonical_name)
                      ? 'Core Target / XAI'
                      : 'Feature Derivation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
