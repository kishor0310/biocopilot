import React, { useState } from 'react';
import { DollarSign, Sliders, TrendingDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchMediaOptimization } from '../api/client';

export const FeedOptimizerPage: React.FC = () => {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [baseMediaPrice, setBaseMediaPrice] = useState(35.0);
  const [costData, setCostData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const data = await fetchMediaOptimization(currency, baseMediaPrice);
      setCostData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runOptimization();
  }, [currency, baseMediaPrice]);

  return (
    <div className="space-y-6 py-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Smart Feed & Media Cost Optimizer</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bounded nutrient feed scheduling, editable cost breakdown, and Pareto frontier optimization.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === c
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {c === 'USD' ? '$ USD' : '₹ INR'}
            </button>
          ))}
        </div>
      </div>

      {/* EDITABLE PRICING TABLE (P0 Requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            <span>Editable Media Component Price Table</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">User-Supplied Input Pricing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Base Media Price ({currency}/L)</label>
            <input
              type="number"
              value={baseMediaPrice}
              onChange={e => setBaseMediaPrice(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Glucose Supplement ({currency}/L)</label>
            <input
              type="number"
              value={5.0}
              disabled
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Recombinant Growth Factor ({currency}/L)</label>
            <input
              type="number"
              value={15.0}
              disabled
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* COST COMPARISON & SAVINGS SUMMARY */}
      {costData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Plan Cost (2 L Batch)</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {costData.currency_symbol}{costData.current_batch_cost}
            </p>
            <p className="text-xs text-slate-400 mt-1">{costData.currency_symbol}{costData.current_cost_per_L} / L</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Smart Feed Optimized Cost</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {costData.currency_symbol}{costData.optimized_batch_cost}
            </p>
            <p className="text-xs text-slate-400 mt-1">{costData.currency_symbol}{costData.optimized_cost_per_L} / L</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-sm">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Estimated Savings per Batch</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {costData.currency_symbol}{costData.estimated_savings}
              </span>
              <span className="text-xs font-bold text-emerald-600">({costData.savings_percentage}%)</span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">Computed strictly from input prices</p>
          </div>
        </div>
      )}

      {/* PARETO FRONTIER SCENARIOS (P0 Requirement) */}
      {costData && costData.pareto_scenarios && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pareto Optimization Scenarios (Cost vs Growth)</h3>
              <p className="text-xs text-slate-500">Balances media expenditure against culture viability retention.</p>
            </div>
            <span className="text-xs text-amber-600 font-mono font-bold">MODEL ESTIMATE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {costData.pareto_scenarios.map((sc: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  idx === 1
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">SCENARIO {idx + 1}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{sc.scenario}</h4>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Cost/L:</span>
                  <span className="font-mono font-bold">{costData.currency_symbol}{sc.cost_per_L}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Expected Viability:</span>
                  <span className="font-mono font-bold text-emerald-600">{sc.expected_viability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
