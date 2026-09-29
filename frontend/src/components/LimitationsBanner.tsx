import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export const LimitationsBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-slate-900/90 border-b border-amber-500/30 text-slate-300 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-400 tracking-wide uppercase text-[11px]">
            Regulatory Notice:
          </span>
          <span className="text-slate-300 truncate max-w-xl sm:max-w-3xl">
            Decision-Support System Only — Does NOT directly control laboratory equipment. All recommendations require human sign-off.
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium shrink-0 ml-2 cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Limitations' : 'View Scientific Limitations'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-400">
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Model Performance:</strong> Dependent on dataset scale, sampling frequency, and analytical precision.</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Synthetic Data:</strong> Demo benchmark dataset is biophysically modeled, not wet-lab experimental data.</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Scale-Up Correlations:</strong> Hydrodynamic P/V and kLa models are engineering approximations.</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Digital Twin:</strong> Simplified Monod kinetics representation; does not substitute biological ground truth.</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Causation Guard:</strong> Machine learning feature importance demonstrates correlation, not biological causation.</span>
          </div>
          <div className="flex items-start space-x-1.5">
            <span className="text-amber-500 font-bold">•</span>
            <span><strong>Empirical Validation:</strong> Wet-lab benchtop validation is mandatory prior to any physical implementation.</span>
          </div>
        </div>
      )}
    </div>
  );
};
