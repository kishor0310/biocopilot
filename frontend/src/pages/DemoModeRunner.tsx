import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle,
  RotateCcw, Sparkles, Activity, ShieldCheck, Database, Radio, TrendingUp,
  Sliders, DollarSign, Layers, FileText
} from 'lucide-react';
import { injectFault, resetSensors, approveRecommendation } from '../api/client';

interface DemoModeRunnerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoStep {
  step: number;
  title: string;
  narrative: string;
  actionText?: string;
  actionHandler?: () => Promise<void>;
  targetRoute?: string;
  icon: any;
}

export const DemoModeRunner: React.FC<DemoModeRunnerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  const demoSteps: DemoStep[] = [
    {
      step: 1,
      title: "Load Verified Bioprocess Dataset",
      narrative: "“Here is a real cell-culture process. We ingest the CHO fed-batch dataset containing VCD, viability, metabolites, and physical telemetry.”",
      targetRoute: "/data",
      icon: Database
    },
    {
      step: 2,
      title: "Audit Data Quality & Physiological Bounds",
      narrative: "“The data quality is checked before AI is allowed to make predictions. We evaluate missingness, sampling regularity, and range adherence (99.6/100 score).”",
      targetRoute: "/data",
      icon: CheckCircle2
    },
    {
      step: 3,
      title: "Select Cultivation Batch Run",
      narrative: "“We select BATCH-2026-CHO-001 (2.0 L working volume, 14-day production duration) for active monitoring.”",
      targetRoute: "/monitor",
      icon: Activity
    },
    {
      step: 4,
      title: "Verify Healthy Baseline Metabolism",
      narrative: "“In early exponential phase, the cells exhibit steady growth, viability > 96%, and basal lactate accumulation within normal bounds.”",
      targetRoute: "/monitor",
      icon: Radio
    },
    {
      step: 5,
      title: "Engage 12-Channel Virtual Sensors",
      narrative: "“Now we replay the process as simulated sensors streaming online telemetry at 2-second intervals.”",
      targetRoute: "/monitor",
      icon: Radio
    },
    {
      step: 6,
      title: "Inject 'Glucose Overfeed' Perturbation",
      narrative: "“We inject an overfeeding event to simulate operator error or pump overshoot during late stationary phase.”",
      actionText: "Trigger Glucose Overfeed (+2.5 g/L)",
      actionHandler: async () => {
        await injectFault('glucose_overfeed', 2.0);
      },
      targetRoute: "/monitor",
      icon: AlertTriangle
    },
    {
      step: 7,
      title: "Observe Lactate Surge & Glycolytic Shift",
      narrative: "“Excessive substrate triggers Warburg-like aerobic glycolysis: residual glucose pushes past 5.5 g/L and lactate surges rapidly toward 3.8 g/L.”",
      targetRoute: "/monitor",
      icon: AlertTriangle
    },
    {
      step: 8,
      title: "Risk Engine Flags Metabolic Alert",
      narrative: "“The Metabolic Risk Engine detects the issue, classifying it as CRITICAL with clinical evidence of cytotoxicity and buffering stress.”",
      targetRoute: "/risks",
      icon: AlertTriangle
    },
    {
      step: 9,
      title: "Forward Predictive Trajectory Projection",
      narrative: "“Instead of a generic alarm, BioCopilot forecasts the 48-hour forward trajectory: viability will drop below 85% within 36 hours if unaddressed.”",
      targetRoute: "/predictions",
      icon: TrendingUp
    },
    {
      step: 10,
      title: "Explainable AI (XAI) Attribution",
      narrative: "“Explainability shows contributing signals: 42% relative negative weight assigned to lactate accumulation. Note: Statistical correlation, not biological causation.”",
      targetRoute: "/predictions",
      icon: Sparkles
    },
    {
      step: 11,
      title: "Smart Feed Optimizer Generates Scenarios",
      narrative: "“Now we test alternative feed scenarios. The Smart Feed Scheduler modulates feeding down to 4.2 mL/h, triggering lactate consumption.”",
      targetRoute: "/nutrients",
      icon: Sliders
    },
    {
      step: 12,
      title: "Unit Economics & Media Cost Comparison",
      narrative: "“We compare economics: the optimized plan saves 22.18% in media cost while extending harvest viability by 6.5%.”",
      targetRoute: "/cost",
      icon: DollarSign
    },
    {
      step: 13,
      title: "Scale-Up Hydrodynamic Modeling (2 L → 1,000 L)",
      narrative: "“Finally, we evaluate scaling from 2 L toward 1,000 L. The scale-up engine proves that Constant P/V avoids hypoxic kLa deficits and lethal tip-speed shear.”",
      targetRoute: "/scaleup",
      icon: Layers
    },
    {
      step: 14,
      title: "Recommendation Enters Human-in-the-Loop",
      narrative: "“CRITICAL SAFETY RULE: Nothing is automatically applied to laboratory hardware. Every AI recommendation requires affirmative operator sign-off.”",
      targetRoute: "/approval",
      icon: ShieldCheck
    },
    {
      step: 15,
      title: "Approve Recommendation & Sign Audit Trail",
      narrative: "“The senior bioprocess lead enters review justification and executes formal approval in compliance with FDA 21 CFR Part 11.”",
      actionText: "Execute Operator Sign-Off",
      actionHandler: async () => {
        await approveRecommendation(
          'REC-DEMO-2026',
          'Dr. S. K. Ramanathan',
          'Approved feed modulation for lactate suppression during stationary phase.'
        );
      },
      targetRoute: "/approval",
      icon: CheckCircle2
    },
    {
      step: 16,
      title: "Generate Regulatory Batch Run Dossier",
      narrative: "“The complete batch dossier is compiled into an auditable Markdown/PDF summary report ready for regulatory submission. Demo complete!”",
      targetRoute: "/reports",
      icon: FileText
    }
  ];

  const current = demoSteps[currentStepIdx];
  const StepIcon = current.icon;

  useEffect(() => {
    if (current.targetRoute) {
      navigate(current.targetRoute);
    }
    setActionDone(false);
  }, [currentStepIdx]);

  // Auto-play timer (15s per step)
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        if (currentStepIdx < demoSteps.length - 1) {
          setCurrentStepIdx(prev => prev + 1);
        } else {
          setIsAutoPlaying(false);
        }
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStepIdx]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < demoSteps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleRunAction = async () => {
    if (current.actionHandler) {
      setIsExecutingAction(true);
      try {
        await current.actionHandler();
        setActionDone(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExecutingAction(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[500px] z-50">
      <div className="bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl p-5 backdrop-blur-xl space-y-4">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <StepIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                YUVA Megathon 2026 Judge Demo (Step {current.step} of 16)
              </span>
              <h4 className="text-sm font-bold text-white">{current.title}</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800 cursor-pointer"
          >
            EXIT
          </button>
        </div>

        {/* Narrative Box (The 3-Minute Story) */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
          <p className="italic text-emerald-300 font-medium">{current.narrative}</p>
        </div>

        {/* Action Button if required for this step */}
        {current.actionText && (
          <button
            onClick={handleRunAction}
            disabled={isExecutingAction || actionDone}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              actionDone
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-md'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{actionDone ? 'Action Executed' : current.actionText}</span>
          </button>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {isAutoPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isAutoPlaying ? 'Pause Auto' : 'Auto Play'}</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">15s / step</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIdx === demoSteps.length - 1}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / demoSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
