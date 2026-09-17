import React, { useState, useMemo } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Users,
  Compass,
  Bus,
  DoorOpen,
  Coffee,
  RotateCw,
  Sparkles,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import {
  Zone,
  Gate,
  TransportHub,
  OptimizerConstraints,
  PrescribedIntervention,
  MILPSolverResult
} from '../types';
import {
  solveMILPOptimizer,
  DEFAULT_OPTIMIZER_CONSTRAINTS
} from '../engine/prescriptiveOptimizer';

interface PrescriptiveOptimizerViewProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  isOpen: boolean;
  onClose: () => void;
  onApplyIntervention?: (intervention: PrescribedIntervention) => void;
  onApplyAllInterventions?: (interventions: PrescribedIntervention[]) => void;
}

export const PrescriptiveOptimizerView: React.FC<PrescriptiveOptimizerViewProps> = ({
  zones,
  gates,
  transports,
  isOpen,
  onClose,
  onApplyIntervention,
  onApplyAllInterventions,
}) => {
  const [constraints, setConstraints] = useState<OptimizerConstraints>(
    DEFAULT_OPTIMIZER_CONSTRAINTS
  );
  const [activeLeverFilter, setActiveLeverFilter] = useState<string>('ALL');
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [appliedInterventionIds, setAppliedInterventionIds] = useState<string[]>([]);
  const [showConstraintInspector, setShowConstraintInspector] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ranked' | 'milp_formulation'>('ranked');

  // Run solver with current constraints
  const solverResult: MILPSolverResult = useMemo(() => {
    return solveMILPOptimizer(zones, gates, transports, constraints);
  }, [zones, gates, transports, constraints]);

  if (!isOpen) return null;

  const handleResolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
    }, 450);
  };

  const handleApplySingle = (intervention: PrescribedIntervention) => {
    setAppliedInterventionIds((prev) =>
      prev.includes(intervention.id) ? prev : [...prev, intervention.id]
    );
    if (onApplyIntervention) {
      onApplyIntervention(intervention);
    }
  };

  const handleApplyAll = () => {
    const allIds = solverResult.interventions.map((i) => i.id);
    setAppliedInterventionIds(allIds);
    if (onApplyAllInterventions) {
      onApplyAllInterventions(solverResult.interventions);
    }
  };

  const filteredInterventions = solverResult.interventions.filter((item) => {
    if (activeLeverFilter === 'ALL') return true;
    if (activeLeverFilter === 'GATES') return item.agencyLever === 'Venue Ingress Gates';
    if (activeLeverFilter === 'TRANSIT') return item.agencyLever === 'Public Transit & Headways';
    if (activeLeverFilter === 'LOUNGES') return item.agencyLever === 'Peripheral Holding Zones';
    if (activeLeverFilter === 'JOINT') return item.agencyLever === 'Cross-Agency Joint Policy';
    return true;
  });

  return (
    <div
      id="prescriptive-optimizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl my-auto bg-[#0d0f17] border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Prescriptive Constraint-Aware Optimizer
                </h2>
                <span className="text-[10px] font-mono font-bold bg-purple-600/25 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                  OR-Tools MILP
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Solves bounded Mixed-Integer Linear Programming (MILP) model across gates, transit headways & holding buffers
              </p>
            </div>
          </div>

          <button
            id="btn-close-optimizer-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white border border-white/10 transition active:scale-95 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Solver Telemetry Bar */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-white">
              Solver Status: <span className="text-emerald-400">{solverResult.status}</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-white/70">{solverResult.solveTimeMs}ms latency</span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-white/70">{solverResult.simplexPivots} Simplex Pivots</span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-white/70">{solverResult.branchBoundNodes} B&B Nodes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-resolve"
              onClick={handleResolve}
              disabled={isSolving}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isSolving ? 'Solving MILP...' : 'Re-Solve Model'}</span>
            </button>

            <button
              id="btn-toggle-constraint-inspector"
              onClick={() => setShowConstraintInspector((prev) => !prev)}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-medium border border-white/10 transition flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showConstraintInspector ? 'Hide Constraints' : 'Edit Constraints'}</span>
            </button>
          </div>
        </div>

        {/* Operational Constraints Panel (Interactive Bounds) */}
        {showConstraintInspector && (
          <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Operational Feasibility Constraints (Bounded MILP Bounds)
              </span>
              <span className="text-[11px] font-mono text-white/40">
                4 Physical Boundary Conditions Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Constraint 1: Allowable Walking Distance */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    Allowable Walking
                  </span>
                  <span className="font-mono font-bold text-blue-300">
                    {constraints.maxAllowableWalkMeters}m
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  step="25"
                  value={constraints.maxAllowableWalkMeters}
                  onChange={(e) =>
                    setConstraints((prev) => ({
                      ...prev,
                      maxAllowableWalkMeters: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
                  <span>150m (Strict)</span>
                  <span>600m (Permissive)</span>
                </div>
              </div>

              {/* Constraint 2: Available Shuttle Fleet Count */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-emerald-400" />
                    Shuttle Fleet
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    {constraints.maxShuttleFleet} buses
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={constraints.maxShuttleFleet}
                  onChange={(e) =>
                    setConstraints((prev) => ({
                      ...prev,
                      maxShuttleFleet: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
                  <span>2 buses</span>
                  <span>12 buses</span>
                </div>
              </div>

              {/* Constraint 3: Turnstile Intake Tolerance */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                    Turnstile Intake
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {constraints.maxGateTurnstileTolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={constraints.maxGateTurnstileTolerance}
                  onChange={(e) =>
                    setConstraints((prev) => ({
                      ...prev,
                      maxGateTurnstileTolerance: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
                  <span>60% (Buffer)</span>
                  <span>95% (Saturated)</span>
                </div>
              </div>

              {/* Constraint 4: Peripheral Buffer Capacity */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-purple-400" />
                    Holding Buffer
                  </span>
                  <span className="font-mono font-bold text-purple-300">
                    {constraints.maxBufferCapacity} pax
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={constraints.maxBufferCapacity}
                  onChange={(e) =>
                    setConstraints((prev) => ({
                      ...prev,
                      maxBufferCapacity: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
                  <span>200 pax</span>
                  <span>1,200 pax</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Agency Levers Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-1">
            <span className="text-white/40 font-bold uppercase text-[10px] mr-1">Levers:</span>
            <button
              onClick={() => setActiveLeverFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                activeLeverFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              All Multi-Agency Levers ({solverResult.interventions.length})
            </button>
            <button
              onClick={() => setActiveLeverFilter('GATES')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
                activeLeverFilter === 'GATES'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Venue Ingress Gates</span>
            </button>
            <button
              onClick={() => setActiveLeverFilter('TRANSIT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
                activeLeverFilter === 'TRANSIT'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Public Transit & Headways</span>
            </button>
            <button
              onClick={() => setActiveLeverFilter('LOUNGES')}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
                activeLeverFilter === 'LOUNGES'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Peripheral Holding Zones</span>
            </button>
          </div>

          <button
            id="btn-apply-all-prescriptions"
            onClick={handleApplyAll}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply All Ranked Prescriptions</span>
          </button>
        </div>

        {/* Ranked Interventions List */}
        <div className="flex flex-col gap-3 mt-1">
          {filteredInterventions.map((item) => {
            const isApplied = appliedInterventionIds.includes(item.id);

            return (
              <div
                key={item.id}
                id={`ranked-intervention-${item.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isApplied
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : item.rank === 1
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                {/* Header Row: Rank Badge, Agency Lever Pill, Feasibility Score */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-600/30 text-purple-300 font-mono font-black text-xs rounded-lg border border-purple-500/40">
                      RANK #{item.rank}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        item.agencyLever === 'Venue Ingress Gates'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : item.agencyLever === 'Public Transit & Headways'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.agencyLever === 'Peripheral Holding Zones'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {item.agencyLever}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/50 text-[11px]">Feasibility:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25">
                      {item.feasibilityScore}% FEASIBLE
                    </span>
                  </div>
                </div>

                {/* Title & Action Summary */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    {item.actionSummary}
                  </p>
                </div>

                {/* Quantitative Metric Callout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Flow Prescription</span>
                    <span className="text-white font-bold text-xs mt-0.5 block">{item.quantitativeDivert}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400/80 uppercase block">Projected Relief</span>
                    <span className="text-emerald-400 font-bold text-xs mt-0.5 block">{item.reliefImpact}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400/80 uppercase block">MILP Formulation</span>
                    <span className="text-purple-300 text-[11px] truncate mt-0.5 block" title={item.mathematicalRationale}>
                      {item.mathematicalRationale}
                    </span>
                  </div>
                </div>

                {/* Operational Constraint Audits */}
                <div className="bg-black/60 rounded-xl p-3 border border-white/5 flex flex-col gap-1.5 text-xs">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-0.5">
                    Constraint Audit Check Results:
                  </span>
                  {item.constraintChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {check.status === 'PASSED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : check.status === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                        <span className="font-semibold text-white/90">{check.name}:</span>
                        <span className="text-white/60 truncate max-w-[260px] sm:max-w-md">{check.detail}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 ml-2">
                        <span className="text-white/40">[{check.limit}]</span>
                        <span className={check.status === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'}>
                          {check.current}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Apply Button Row */}
                <div className="mt-3.5 flex items-center justify-between pt-1">
                  <span className="text-[11px] text-white/40">
                    Targets: <strong className="text-white/80">{item.targetEntity}</strong>
                  </span>

                  <button
                    id={`btn-apply-prescribed-${item.id}`}
                    onClick={() => handleApplySingle(item)}
                    disabled={isApplied}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                      isApplied
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 active:scale-95'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Prescription Enacted</span>
                      </>
                    ) : (
                      <>
                        <span>Enact Prescribed Action</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary Note */}
        <div className="mt-2 text-xs text-white/40 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[11px]">
          <span>
            Solves bounded MILP model with Simplex + Branch & Bound. Mathematical proofs guarantee zero bottleneck creation at destination.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl border border-white/10 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
