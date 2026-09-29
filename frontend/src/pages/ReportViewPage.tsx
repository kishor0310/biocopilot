import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, ShieldCheck } from 'lucide-react';
import { fetchReport } from '../api/client';

export const ReportViewPage: React.FC = () => {
  const [reportContent, setReportContent] = useState<string>('');
  const [selectedRun, setSelectedRun] = useState('BATCH-2026-CHO-001');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const md = await fetchReport(selectedRun);
        setReportContent(md);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedRun]);

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BioCopilot_Report_${selectedRun}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>Bioprocess Batch Regulatory Run Report</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal batch summary dossier compliant with ICH Q8/Q11 development documentation standards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedRun}
            onChange={(e) => setSelectedRun(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="BATCH-2026-CHO-001">BATCH-2026-CHO-001 (Benchmark)</option>
            <option value="BATCH-2026-CHO-002">BATCH-2026-CHO-002 (Replicate)</option>
            <option value="BATCH-2026-CHO-003">BATCH-2026-CHO-003 (High Lactate)</option>
            <option value="BATCH-2026-CHO-004">BATCH-2026-CHO-004 (Optimized)</option>
          </select>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Document View */}
      <div className="glass-panel rounded-xl p-8 max-w-4xl mx-auto shadow-2xl space-y-6 bg-slate-950/90 text-slate-200 font-sans">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Compiling bioprocess analytical dossier...
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line font-mono">
            {reportContent}
          </div>
        )}
      </div>
    </div>
  );
};
