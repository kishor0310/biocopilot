import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, FileText, Upload, RefreshCw } from 'lucide-react';
import { DataQualityReport } from '../types';
import { fetchQualityReport } from '../api/client';

export const DataQualityPage: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchQualityReport();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="py-12 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="w-6 h-6 text-teal-600" />
            <span>Dataset Ingestion & Data Quality Engine</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Canonical schema adapter, physiological range validation, and transparency scorecard.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold rounded-full border border-amber-300">
            {report.data_label}
          </span>
          <button
            onClick={loadReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-validate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Data Quality Score</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{report.quality_score}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Passed Checks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Ingested Rows</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report.total_rows}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Batch Runs</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report.total_batches}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Duplicate Rows</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report.duplicate_count}</p>
        </div>
      </div>

      {/* Physiological Violations Box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Physiological Range Checks & Outlier Rules</span>
        </h3>
        {report.physiological_violations.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>All parameters strictly adhere to biological limits (pH: 6.0–8.0, Viability: 0–100%, Temp: 20–42°C).</span>
          </p>
        ) : (
          <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
            {report.physiological_violations.map((v, i) => (
              <li key={i} className="flex items-center space-x-2">
                <span>•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Canonical Schema Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Canonical Mapping & Attribute Status</h3>
          <span className="text-xs text-slate-500 font-mono">16 Standard Telemetry Channels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Source Column</th>
                <th className="p-3">Canonical Variable</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Datatype</th>
                <th className="p-3">Missing %</th>
                <th className="p-3">Validity</th>
                <th className="p-3">Model Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              {report.column_mappings.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-mono font-semibold text-teal-700 dark:text-teal-400">{item.source_column}</td>
                  <td className="p-3 font-mono">{item.canonical_variable}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3 text-slate-500">{item.datatype}</td>
                  <td className="p-3">{item.missing_pct}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.validity_status === 'Valid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.validity_status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.model_usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
