import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, FileText, User } from 'lucide-react';
import { fetchAuditLog } from '../api/client';
import { AuditLogEntry } from '../types';

export const AuditApprovalPage: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const logs = await fetchAuditLog();
        setAuditLog(logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Human-in-the-Loop Decision Ledger & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all automated recommendations, human review justifications, and signed operator decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span>FDA 21 CFR Part 11 Electronic Signature Standard</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Review & Approval History</h3>
          <p className="text-xs text-slate-400">
            Every AI process recommendation requires affirmative operator sign-off before changes take effect.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Signatory</th>
                <th className="py-2.5 px-3">Recommendation</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Parameter Delta</th>
                <th className="py-2.5 px-3">Operator Review Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {auditLog.map((log) => {
                const isApproved = log.action === 'APPROVED';
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">{log.id}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{log.operator}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{log.recommendation_id}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">{log.parameter_delta}</td>
                    <td className="py-3 px-3 text-slate-300 italic text-[11px] max-w-xs">{log.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
