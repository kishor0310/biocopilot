import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, FileText, RefreshCw, Lock } from 'lucide-react';
import { Recommendation, AuditLog } from '../types';
import { fetchRecommendations, approveRecommendation, rejectRecommendation, fetchAuditLogs } from '../api/client';

export const HumanApprovalPage: React.FC = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [operatorComment, setOperatorComment] = useState('');
  const [operatorId, setOperatorId] = useState('Op_Engineeer_01');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const recRes = await fetchRecommendations();
      const auditRes = await fetchAuditLogs();
      setRecs(recRes.recommendations);
      setAuditLogs(auditRes.audit_logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!operatorComment.trim()) {
      alert('Mandatory Operator Comment required before approval.');
      return;
    }
    try {
      await approveRecommendation(id, operatorId, operatorComment);
      setOperatorComment('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!operatorComment.trim()) {
      alert('Mandatory Operator Comment required before rejection.');
      return;
    }
    try {
      await rejectRecommendation(id, operatorId, operatorComment);
      setOperatorComment('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Human-in-the-Loop Approval & Audit Engine</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every AI recommendation requires explicit human operator sign-off before record logging.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold rounded-full border border-emerald-300">
          ZERO DIRECT EQUIPMENT CONTROL
        </span>
      </div>

      {/* Operator ID Input */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Authenticated Operator ID:</span>
          <input
            type="text"
            value={operatorId}
            onChange={e => setOperatorId(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-900 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-400">Role: Qualified Bioprocess Engineer</span>
      </div>

      {/* RECOMMENDATION APPROVAL QUEUE (P0 Requirement) */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Recommendation Review Queue</h3>

        {recs.map((rec) => (
          <div
            key={rec.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold rounded-full">
                  {rec.id}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{rec.title}</h4>
              </div>
              <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full ${
                rec.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : rec.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
              }`}>
                STATUS: {rec.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">EVIDENCE & SIGNAL:</p>
                <p>{rec.evidence}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">EXPECTED EFFECT:</p>
                <p>{rec.expected_effect}</p>
              </div>
            </div>

            {/* Operator Review Controls */}
            {rec.status === 'PENDING' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  MANDATORY OPERATOR REVIEW RATIONALE / COMMENT:
                </label>
                <textarea
                  rows={2}
                  value={operatorComment}
                  onChange={e => setOperatorComment(e.target.value)}
                  placeholder="Enter engineering justification for approval or rejection..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(rec.id)}
                    className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPROVE RECOMMENDATION</span>
                  </button>
                  <button
                    onClick={() => handleReject(rec.id)}
                    className="flex items-center space-x-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>REJECT RECOMMENDATION</span>
                  </button>
                </div>
              </div>
            )}

            {rec.reviewed_at && (
              <div className="text-xs text-slate-500 font-mono pt-1">
                Reviewed by <strong className="text-slate-900 dark:text-white">{rec.reviewer_id}</strong> at {rec.reviewed_at}. Comment: "{rec.reviewer_comment}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* IMMUTABLE AUDIT LOG TABLE (P0 Requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Immutable Decision Audit Trail</h3>
          <span className="text-xs text-slate-500 font-mono">SQLite Persistence Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Action</th>
                <th className="p-3">Dataset Version</th>
                <th className="p-3">Model Version</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Operator Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold">{log.user_id}</td>
                  <td className="p-3 text-teal-600">{log.action}</td>
                  <td className="p-3">{log.dataset_version}</td>
                  <td className="p-3">{log.model_version}</td>
                  <td className="p-3 font-bold text-emerald-600">{log.decision}</td>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">{log.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
