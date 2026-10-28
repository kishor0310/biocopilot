import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LimitationsBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-y border-amber-200 dark:border-amber-900/50 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-amber-900 dark:text-amber-200 gap-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold">SYSTEM LIMITATIONS & LEGAL DISCLAIMER:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-amber-100 dark:bg-amber-900/80 px-2 py-0.5 rounded font-mono font-medium border border-amber-300 dark:border-amber-800">
            SYNTHETIC DEMO DATA — NOT EXPERIMENTAL DATA
          </span>
          <span className="bg-amber-100 dark:bg-amber-900/80 px-2 py-0.5 rounded font-mono font-medium border border-amber-300 dark:border-amber-800">
            ENGINEERING ESTIMATE — REQUIRES VALIDATION
          </span>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-300 dark:border-emerald-800">
            HUMAN APPROVAL MANDATORY
          </span>
        </div>
      </div>
    </div>
  );
};
