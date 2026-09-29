import React, { useEffect, useState } from 'react';
import {
  Sliders, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
  DollarSign, Sparkles, Activity, FileCheck
} from 'lucide-react';
import { fetchNutrientAnalysis, scheduleFeed } from '../api/client';
import type { NutrientAnalysisResponse, FeedScheduleResponse, NutrientEvaluationItem } from '../types';
import { ApprovalModal } from '../components/ApprovalModal';

export const NutrientFeedOptimizer: React.FC = () => {
  const [analysis, setAnalysis] = useState<NutrientAnalysisResponse | null>(null);
  const [schedule, setSchedule] = useState<FeedScheduleResponse | null>(null);
  const [feedRate, setFeedRate] = useState<number>(6.0);
  const [glucoseTarget, setGlucoseTarget] = useState<number>(3.0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [aRes, sRes] = await Promise.all([
          fetchNutrientAnalysis(),
          scheduleFeed({ current_feed_mL_h: feedRate, glucose_target_gL: glucoseTarget, process_time_h: 96.0, vessel_volume_L: 2.0 })
        ]);
        setAnalysis(aRes);
        setSchedule(sRes);
      } catch (err) {
        console.error('Failed to load nutrients:', err);
      }
    }
    load();
  }, [feedRate, glucoseTarget]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-emerald-400" />
            <span>Nutrient Analysis & Smart Feed Scheduler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Biochemical substrate monitoring and bounded what-if decision support with mandatory operator sign-off.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-mono">
          <ShieldCheck className="h-4 w-4" />
          <span>HUMAN APPROVAL REQUIRED — NO DIRECT CONTROL</span>
        </div>
      </div>

      {/* Nutrient Envelope Gauges */}
      <div className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white">Metabolite Envelope & Nutrient Health</h3>
          <p className="text-[11px] text-slate-400 italic">
            Reference range depends on process, cell line, and medium formulation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {analysis?.evaluation.map((item: NutrientEvaluationItem, idx: number) => {
            const isExcess = item.status === 'EXCESS' || item.status === 'CRITICAL';
            const isDeficient = item.status === 'DEFICIENT';
            return (
              <div
                key={idx}
                className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{item.parameter}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isExcess
                        ? 'bg-rose-500/20 text-rose-400'
                        : isDeficient
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Envelopes: {item.range}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Decision-Support Feed Scenarios */}
      {schedule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Current Plan Card */}
          <div className="glass-panel rounded-xl p-5 space-y-4 border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Feed Strategy</span>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">STATUS QUO</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Feed Rate</span>
                <span className="text-lg font-bold text-slate-200">{schedule.current_plan.feed_rate_mL_h} mL/h</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Predicted End VCD</span>
                <span className="text-lg font-bold text-slate-200">{schedule.current_plan.predicted_end_vcd} x 10⁶</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Harvest Viability</span>
                <span className="text-lg font-bold text-amber-400">{schedule.current_plan.predicted_end_viability}%</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">End Lactate</span>
                <span className="text-lg font-bold text-rose-400">{schedule.current_plan.predicted_end_lactate} g/L</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs text-slate-400">
              Estimated Feed Cost: <strong className="text-slate-200 font-mono">₹{schedule.current_plan.estimated_cost_inr.toLocaleString()}</strong>
            </div>
          </div>

          {/* Optimized Plan Card */}
          <div className="glass-panel-glow rounded-xl p-5 space-y-4 border-emerald-500/40 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    BioCopilot Optimized Strategy
                  </span>
                </div>
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  +{schedule.expected_savings_pct}% SAVINGS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Modulated Feed</span>
                  <span className="text-lg font-bold text-emerald-400">{schedule.optimized_plan.feed_rate_mL_h} mL/h</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Predicted End VCD</span>
                  <span className="text-lg font-bold text-emerald-400">{schedule.optimized_plan.predicted_end_vcd} x 10⁶</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">Harvest Viability</span>
                  <span className="text-lg font-bold text-emerald-400">{schedule.optimized_plan.predicted_end_viability}%</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase block">End Lactate</span>
                  <span className="text-lg font-bold text-emerald-400">{schedule.optimized_plan.predicted_end_lactate} g/L</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20 text-xs text-slate-300 leading-relaxed space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px]">WHY THIS SCENARIO:</span>
                <p className="text-[11px] text-slate-300">{schedule.why}</p>
              </div>

              <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                <span className="text-slate-500 block uppercase">Constraints Checked:</span>
                {schedule.constraints_checked.map((c, i) => (
                  <div key={i} className="flex items-center space-x-1 text-slate-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Trigger */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">
                {approvalStatus ? `DECISION: ${approvalStatus}` : 'PENDING HUMAN APPROVAL'}
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>REVIEW & APPROVE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {schedule && (
        <ApprovalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recommendationId={schedule.recommendation_id}
          recommendationSummary={`Modulate feed rate from ${schedule.current_plan.feed_rate_mL_h} mL/h to ${schedule.optimized_plan.feed_rate_mL_h} mL/h. Extends viability +${(schedule.optimized_plan.predicted_end_viability - schedule.current_plan.predicted_end_viability).toFixed(1)}% and saves ${schedule.expected_savings_pct}% media cost.`}
          onSuccess={(status) => setApprovalStatus(status)}
        />
      )}
    </div>
  );
};
