import React, { useState } from 'react';
import { ShieldCheck, X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { approveRecommendation, rejectRecommendation } from '../api/client';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendationId: string;
  recommendationSummary: string;
  onSuccess: (status: 'APPROVED' | 'REJECTED') => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  recommendationId,
  recommendationSummary,
  onSuccess
}) => {
  const [reviewerName, setReviewerName] = useState('Dr. S. K. Ramanathan');
  const [reviewerRole, setReviewerRole] = useState('Senior Bioprocess Lead');
  const [comment, setComment] = useState('Approved feed rate modulation to suppress lactate overflow metabolism.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!comment.trim() || !reviewerName.trim()) {
      alert('Reviewer name and mandatory sign-off comment are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (decision === 'APPROVED') {
        await approveRecommendation(recommendationId, reviewerName, comment);
      } else {
        await rejectRecommendation(recommendationId, reviewerName, comment);
      }
      onSuccess(decision);
      onClose();
    } catch (err) {
      alert('Failed to log approval in audit ledger.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Human-in-the-Loop Sign-Off</h3>
              <p className="text-[11px] text-emerald-400 font-mono">REC ID: {recommendationId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Proposed AI Recommendation:
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">{recommendationSummary}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Reviewer Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Professional Role</label>
              <input
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Mandatory Operational Comment / Audit Justification
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter justification for approval or rejection..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Action will be cryptographically timestamped in FDA 21 CFR Part 11 compliant audit trail.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-5 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            <span>REJECT RECOMMENDATION</span>
          </button>
          <button
            onClick={() => handleAction('APPROVED')}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>APPROVE & LOG AUDIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
