import React, { useState } from 'react';
import { DollarSign, Percent, TrendingDown, RefreshCw, Layers } from 'lucide-react';
import { optimizeMediaCost } from '../api/client';
import { CostComponent, MediaCostResponse } from '../types';

export const MediaCostAnalysis: React.FC = () => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [batchVolumeL, setBatchVolumeL] = useState<number>(2.0);

  const [currentComponents, setCurrentComponents] = useState<CostComponent[]>([
    { name: 'Basal Medium CHO-Pro', unit_cost: 4500.0, amount_used: 1.8, unit: 'L' },
    { name: 'Concentrated Nutrient Feed A', unit_cost: 9200.0, amount_used: 0.25, unit: 'L' },
    { name: 'Recombinant Growth Factor (mAb-Boost)', unit_cost: 18500.0, amount_used: 0.01, unit: 'g' },
    { name: 'Concentrated Glucose Bolus (400g/L)', unit_cost: 1200.0, amount_used: 0.15, unit: 'L' },
  ]);

  const [altComponents, setAltComponents] = useState<CostComponent[]>([
    { name: 'Basal Medium CHO-Pro', unit_cost: 4500.0, amount_used: 1.8, unit: 'L' },
    { name: 'Concentrated Nutrient Feed A', unit_cost: 7100.0, amount_used: 0.18, unit: 'L' },
    { name: 'Recombinant Growth Factor (mAb-Boost)', unit_cost: 18500.0, amount_used: 0.008, unit: 'g' },
    { name: 'Concentrated Glucose Bolus (400g/L)', unit_cost: 1200.0, amount_used: 0.12, unit: 'L' },
  ]);

  const [costResult, setCostResult] = useState<MediaCostResponse | null>(() => {
    // Initial calculation
    const currTotal = currentComponents.reduce((acc, c) => acc + c.unit_cost * c.amount_used, 0);
    const optTotal = altComponents.reduce((acc, c) => acc + c.unit_cost * c.amount_used, 0);
    const delta = optTotal - currTotal;
    const savings = ((currTotal - optTotal) / currTotal) * 100.0;
    return {
      currency: 'INR',
      current_batch_cost: currTotal,
      optimized_batch_cost: optTotal,
      cost_delta: delta,
      savings_percentage: Number(savings.toFixed(2)),
      cost_per_L_current: Number((currTotal / 2.0).toFixed(2)),
      cost_per_L_optimized: Number((optTotal / 2.0).toFixed(2)),
      cost_per_billion_cells_current: Number((currTotal / 30.0).toFixed(2)),
      cost_per_billion_cells_optimized: Number((optTotal / 30.0).toFixed(2)),
      disclaimer: 'Calculated strictly from supplied unit prices. Model estimate.'
    };
  });

  const handlePriceChange = (index: number, newPrice: number, isAlt: boolean = false) => {
    if (isAlt) {
      const updated = [...altComponents];
      updated[index].unit_cost = newPrice;
      setAltComponents(updated);
    } else {
      const updated = [...currentComponents];
      updated[index].unit_cost = newPrice;
      setCurrentComponents(updated);
    }
  };

  const handleRecalculate = async () => {
    try {
      const res = await optimizeMediaCost({
        currency,
        batch_volume_L: batchVolumeL,
        current_components: currentComponents,
        proposed_alternative: {
          name: 'Lean-Feed Fed-Batch Strategy',
          components: altComponents
        }
      });
      setCostResult(res);
    } catch (err) {
      console.error('Failed to optimize cost:', err);
    }
  };

  const currSymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span>Bioprocess Media Cost & Unit Economics Optimizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent batch economics: compute cost per liter, cost per billion cells, and formulation savings from user price tables.
          </p>
        </div>

        {/* Currency & Volume Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded font-semibold cursor-pointer transition-all ${
                currency === 'INR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded font-semibold cursor-pointer transition-all ${
                currency === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            <span>Scale:</span>
            <strong className="text-white font-mono">{batchVolumeL} L</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {costResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Current Batch Cost</span>
            <div className="text-2xl font-bold font-mono text-white">
              {currSymbol}{costResult.current_batch_cost.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {currSymbol}{costResult.cost_per_L_current} / Liter
            </span>
          </div>

          <div className="glass-panel-glow rounded-xl p-4 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Optimized Batch Cost</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {currSymbol}{costResult.optimized_batch_cost.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">
              {currSymbol}{costResult.cost_per_L_optimized} / Liter
            </span>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Cost per 10⁹ Viable Cells</span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {currSymbol}{costResult.cost_per_billion_cells_optimized}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              vs {currSymbol}{costResult.cost_per_billion_cells_current} baseline
            </span>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Calculated Savings</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center space-x-1">
              <span>{costResult.savings_percentage}%</span>
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Saving {currSymbol}{Math.abs(costResult.cost_delta).toLocaleString()} per batch
            </span>
          </div>
        </div>
      )}

      {/* Editable Component Table */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Medium Component Recipe & Price Configuration</h3>
            <p className="text-xs text-slate-400">
              Edit raw ingredient unit prices to dynamically recompute manufacturing unit economics.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Recalculate Economics</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Component Formulation</th>
                <th className="py-2.5 px-3">Current Usage</th>
                <th className="py-2.5 px-3">Unit Price ({currSymbol})</th>
                <th className="py-2.5 px-3">Current Subtotal</th>
                <th className="py-2.5 px-3">Optimized Usage</th>
                <th className="py-2.5 px-3">Optimized Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {currentComponents.map((c, idx) => {
                const alt = altComponents[idx] || c;
                const cSub = c.unit_cost * c.amount_used;
                const altSub = alt.unit_cost * alt.amount_used;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{c.amount_used} {c.unit}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1 font-mono">
                        <span className="text-slate-500">{currSymbol}</span>
                        <input
                          type="number"
                          value={c.unit_cost}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {currSymbol}{cSub.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                      {alt.amount_used} {alt.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                      {currSymbol}{altSub.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="italic">
            Disclaimer: {costResult?.disclaimer || 'Calculated strictly from supplied unit prices. Model estimate.'}
          </span>
          <span className="text-emerald-400 font-mono font-bold">
            Total Batch Savings: {currSymbol}{costResult ? Math.abs(costResult.cost_delta).toLocaleString() : 0}
          </span>
        </div>
      </div>
    </div>
  );
};
