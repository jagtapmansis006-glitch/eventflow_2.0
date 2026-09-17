import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Activity,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Bell,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  DoorOpen,
  Bus,
  Coffee,
  Info,
  ChevronRight,
  BarChart3,
  MapPin,
  Check
} from 'lucide-react';
import { Zone, Gate, TransportHub, Hotel, AIAction, SystemAlert, PrescribedIntervention, OptimizerConstraints } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { solveMILPOptimizer, DEFAULT_OPTIMIZER_CONSTRAINTS } from '../engine/prescriptiveOptimizer';

interface DesktopLayoutProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  hotels: Hotel[];
  actions: AIAction[];
  alerts: SystemAlert[];
  selectedZone: Zone;
  onSelectZone: (zone: Zone) => void;
  onSimulateAction: (actionId: string) => void;
  onOpenAlerts: () => void;
  onResetDemo: () => void;
  liveTime: string;
  onOpenAttendeeAccess?: () => void;
  onOpenZPIEngine?: () => void;
  onOpenOptimizer?: () => void;
  onApplyPrescribedIntervention?: (intervention: PrescribedIntervention) => void;
  onApplyAllPrescriptions?: (prescriptions: PrescribedIntervention[]) => void;
  interventionApplied?: boolean;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  zones,
  gates,
  transports,
  hotels,
  actions,
  alerts,
  selectedZone,
  onSelectZone,
  onSimulateAction,
  onOpenAlerts,
  onResetDemo,
  liveTime,
  onOpenAttendeeAccess,
  onOpenZPIEngine,
  onOpenOptimizer,
  onApplyPrescribedIntervention,
  onApplyAllPrescriptions,
  interventionApplied = false,
}) => {
  const [desktopTab, setDesktopTab] = useState<'twin' | 'optimizer'>('twin');
  const [constraints, setConstraints] = useState<OptimizerConstraints>(DEFAULT_OPTIMIZER_CONSTRAINTS);
  const [appliedInterventionIds, setAppliedInterventionIds] = useState<string[]>([]);
  const [activeLeverFilter, setActiveLeverFilter] = useState<'ALL' | 'GATES' | 'TRANSIT' | 'LOUNGES' | 'JOINT'>('ALL');
  const [isSolving, setIsSolving] = useState<boolean>(false);

  const criticalZone = zones.find((z) => z.id === 'zone-a') || zones[0];
  const topAction = actions[0];

  // Run MILP solver with current constraints
  const solverResult = useMemo(() => {
    return solveMILPOptimizer(zones, gates, transports, constraints);
  }, [zones, gates, transports, constraints]);

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
    if (onApplyPrescribedIntervention) {
      onApplyPrescribedIntervention(intervention);
    }
  };

  const handleApplyAll = () => {
    const allIds = solverResult.interventions.map((i) => i.id);
    setAppliedInterventionIds(allIds);
    if (onApplyAllPrescriptions) {
      onApplyAllPrescriptions(solverResult.interventions);
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
    <div className="hidden lg:flex flex-col w-full min-h-screen bg-[#0a0a0c] text-white">
      {/* Desktop Command Center Header with Frosted Glass Theme */}
      <header className="w-full bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              EventFlow AI
            </h1>
            <span className="text-xs bg-blue-600/20 text-blue-300 font-mono px-2.5 py-0.5 rounded-full border border-blue-500/30 font-bold">
              Command Center v2.4
            </span>
          </div>

          <span className="text-white/20">|</span>

          {/* Desktop Primary Workspace View Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              id="btn-desktop-view-twin"
              onClick={() => setDesktopTab('twin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                desktopTab === 'twin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Campus Digital Twin</span>
            </button>

            <button
              id="btn-desktop-view-optimizer"
              onClick={() => setDesktopTab('optimizer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                desktopTab === 'optimizer'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-300 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OR-Tools MILP Optimizer</span>
              <span className="text-[10px] font-mono bg-purple-400/20 text-purple-200 px-1.5 py-0.2 rounded border border-purple-400/30 font-bold">
                Optimal
              </span>
            </button>
          </div>

          <span className="text-white/20">|</span>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white/80">Mumbai MegaFest</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              ● LIVE • {liveTime} IST
            </span>
          </div>
        </div>

        {/* Technical architecture badges in desktop view */}
        <div className="flex items-center gap-2">
          {onOpenOptimizer && (
            <button
              id="desktop-optimizer-btn"
              onClick={onOpenOptimizer}
              className="px-3 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-xs font-mono text-purple-300 font-bold rounded-xl border border-purple-500/40 hover:border-purple-400 transition flex items-center gap-1.5 shadow-md shadow-purple-500/10"
              title="Open MILP Optimizer Modal"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Optimizer Modal</span>
            </button>
          )}

          {onOpenZPIEngine && (
            <button
              id="desktop-zpi-engine-btn"
              onClick={onOpenZPIEngine}
              className="px-3 py-1 bg-black/60 hover:bg-black/90 text-xs font-mono text-blue-300 font-bold rounded-xl border border-blue-500/40 hover:border-blue-400 transition flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>ZPI & State Fusion</span>
              <span className="text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30">
                0.87
              </span>
            </button>
          )}

          <span className="text-xs font-mono bg-white/5 text-white/70 px-3 py-1 rounded-xl border border-white/10">
            PS-8 Architecture
          </span>

          {onOpenAttendeeAccess && (
            <button
              id="desktop-header-attendee-btn"
              onClick={onOpenAttendeeAccess}
              className="ml-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl border border-blue-400/40 shadow-lg shadow-blue-600/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Attendee View</span>
            </button>
          )}

          <button
            onClick={onResetDemo}
            className="ml-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-white/90 rounded-xl border border-white/10 transition active:scale-95"
          >
            Reset Demo
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VIEW A: DIGITAL TWIN CAMPUS MAP WORKSPACE */}
      {/* ========================================================================= */}
      {desktopTab === 'twin' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-12 gap-6">
          {/* Left / Center 8-col: Large Interactive Map Bento Card */}
          <div className="col-span-8 flex flex-col gap-4">
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-2xl flex-1 flex flex-col min-h-[560px]">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Destination Digital Twin — Interactive Campus Map
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Live pressure zones, pedestrian flow corridors, transit hubs, and gate queues
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &gt;80% Critical
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 60-80% Warning
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt;60% Safe
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/10 relative">
                <InteractiveMap
                  zones={zones}
                  gates={gates}
                  transports={transports}
                  hotels={hotels}
                  selectedZoneId={selectedZone.id}
                  onSelectZone={onSelectZone}
                  onSimulateAction={() => onSimulateAction(topAction.id)}
                  isFullScreenMobile={false}
                />
              </div>
            </div>

            {/* Bottom Destination Status Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Venue Capacity</span>
                <div className="text-xl font-bold font-mono text-white mt-1">78%</div>
                <span className="text-[11px] text-amber-400 mt-0.5 block font-medium">34.2k / 40k capacity</span>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Transit Load</span>
                <div className="text-xl font-bold font-mono text-red-400 mt-1">91%</div>
                <span className="text-[11px] text-red-400/80 mt-0.5 block font-medium">Central Station bottleneck</span>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Hotel Vacancy</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">18.4%</div>
                <span className="text-[11px] text-emerald-400/80 mt-0.5 block font-medium">12,840 rooms available</span>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">OR-Tools MILP</span>
                <div className="text-xl font-bold font-mono text-purple-400 mt-1">OPTIMAL</div>
                <span className="text-[11px] text-purple-300 mt-0.5 block font-medium">16ms Simplex solve</span>
              </div>
            </div>
          </div>

          {/* Right 4-col: Critical Alert, Prescriptive Optimizer Showcase & AI Actions */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Critical Alert Card */}
            <div className="bg-black/60 backdrop-blur-xl border border-red-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-red-400 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  CRITICAL ALERT
                </span>
                <span className="text-xs font-mono text-red-300 bg-red-600/20 px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold">
                  ZONE A
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-2.5">
                Zone A — Main Arena
              </h3>

              <div className="my-3 py-3 px-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase font-bold tracking-wider">CURRENT</span>
                  <span className="text-2xl font-black font-mono text-white">
                    {criticalZone.pressure}%
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-red-400" />
                <div className="text-right">
                  <span className="text-[10px] text-red-400 block uppercase font-bold tracking-wider">PROJECTED</span>
                  <span className="text-3xl font-black font-mono text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    {criticalZone.projectedPressure}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/70">
                Critical threshold projected in <span className="font-bold text-white">18 minutes</span> (+340 attendees/min inflow).
              </p>

              <button
                onClick={() => onSelectZone(criticalZone)}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                <span>VIEW INTELLIGENCE & RESPONSE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prescriptive Optimizer Showcase Card */}
            <div className="bg-gradient-to-br from-purple-950/40 via-black/70 to-blue-950/30 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Prescriptive Optimizer
                    </h3>
                    <span className="text-[10px] font-mono text-purple-300">
                      OR-Tools MILP Solver
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  OPTIMAL (16ms)
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center justify-between text-white/70 font-semibold mb-1">
                  <span>Rank #1 Feasible Policy:</span>
                  <span className="text-emerald-400 font-mono font-bold">-23.4% Risk</span>
                </div>
                <p className="text-white text-xs font-medium leading-snug">
                  Divert 25% of Gate A entry flow → Gate 3 (South Express)
                </p>
              </div>

              {/* 4 Bounded Constraints Feasibility Audit */}
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <DoorOpen className="w-3 h-3 text-amber-400 mx-auto mb-0.5" />
                  <span className="text-white/40 text-[9px] block">Turnstiles</span>
                  <span className="text-emerald-300 font-bold">≤85%</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <Sliders className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                  <span className="text-white/40 text-[9px] block">Max Walk</span>
                  <span className="text-emerald-300 font-bold">≤350m</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <Bus className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
                  <span className="text-white/40 text-[9px] block">Shuttles</span>
                  <span className="text-emerald-300 font-bold">4/8 EV</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                  <Coffee className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                  <span className="text-white/40 text-[9px] block">Lounge</span>
                  <span className="text-emerald-300 font-bold">400 Pax</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="desktop-enact-top-prescription-btn"
                  onClick={() => handleApplySingle(solverResult.interventions[0])}
                  disabled={appliedInterventionIds.includes(solverResult.interventions[0].id) || interventionApplied}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    appliedInterventionIds.includes(solverResult.interventions[0].id) || interventionApplied
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 active:scale-98'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {appliedInterventionIds.includes(solverResult.interventions[0].id) || interventionApplied
                      ? 'Enacted'
                      : 'Enact Top MILP'}
                  </span>
                </button>

                <button
                  id="desktop-open-full-optimizer-btn"
                  onClick={() => setDesktopTab('optimizer')}
                  className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10 active:scale-98"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-300" />
                  <span>Open Console</span>
                </button>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className="bg-black/60 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                    Simulation Sandbox
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Interactive
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2">
                  Attendee Diversion Sandbox
                </h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Test custom crowd diversion parameters with real-time OR-Tools feasibility validation.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => onSimulateAction(topAction.id)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>OPEN SIMULATION SANDBOX</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: FULL DESKTOP PRESCRIPTIVE OPTIMIZER WORKSPACE (OR-TOOLS MILP) */}
      {/* ========================================================================= */}
      {desktopTab === 'optimizer' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
          {/* Top Banner with Solver Telemetry */}
          <div className="bg-gradient-to-r from-purple-950/40 via-black/80 to-blue-950/40 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    OR-Tools Prescriptive Constraint-Aware Optimizer
                  </h2>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    OPTIMAL (16ms)
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Bounded Mixed-Integer Linear Programming (MILP) solver optimizing crowd diversions, transit headways, and peripheral buffers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResolve}
                disabled={isSolving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
                <span>{isSolving ? 'Solving MILP...' : 'Re-Solve Model'}</span>
              </button>

              <button
                onClick={handleApplyAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enact All Prescriptions</span>
              </button>

              <button
                onClick={() => setDesktopTab('twin')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-xs font-bold transition"
              >
                Back to Map
              </button>
            </div>
          </div>

          {/* 12-Column Desktop Grid for Optimizer */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left 4-Col: Interactive Constraints & Formulation */}
            <div className="col-span-4 flex flex-col gap-4">
              {/* Constraints Sliders Box */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Operational Constraint Bounds
                  </h3>
                  <button
                    onClick={() => setConstraints(DEFAULT_OPTIMIZER_CONSTRAINTS)}
                    className="text-[10px] text-white/50 hover:text-white underline transition"
                  >
                    Reset Defaults
                  </button>
                </div>

                {/* Constraint 1: Walk Distance */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Max Allowable Walk Distance:</span>
                    <span className="font-mono text-purple-300 font-bold">
                      {constraints.maxWalkingDistanceMeters}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    step="25"
                    value={constraints.maxWalkingDistanceMeters}
                    onChange={(e) =>
                      setConstraints((prev) => ({
                        ...prev,
                        maxWalkingDistanceMeters: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>200m Strict</span>
                    <span>600m Loose</span>
                  </div>
                </div>

                {/* Constraint 2: Turnstile Saturation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Turnstile Max Saturation Cap:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {Math.round(constraints.turnstileIntakeSaturationCap * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.05"
                    value={constraints.turnstileIntakeSaturationCap}
                    onChange={(e) =>
                      setConstraints((prev) => ({
                        ...prev,
                        turnstileIntakeSaturationCap: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>60% Conserv.</span>
                    <span>95% Max Peak</span>
                  </div>
                </div>

                {/* Constraint 3: Shuttle Fleet */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Shuttle Reserve Fleet Available:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {constraints.shuttleFleetAvailable} / 8 EV
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={constraints.shuttleFleetAvailable}
                    onChange={(e) =>
                      setConstraints((prev) => ({
                        ...prev,
                        shuttleFleetAvailable: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>2 Standby</span>
                    <span>8 Full Reserve</span>
                  </div>
                </div>

                {/* Constraint 4: Lounge Buffer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Peripheral Lounge Buffer Cap:</span>
                    <span className="font-mono text-blue-300 font-bold">
                      {constraints.peripheralHoldingCapacity} Pax
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="50"
                    value={constraints.peripheralHoldingCapacity}
                    onChange={(e) =>
                      setConstraints((prev) => ({
                        ...prev,
                        peripheralHoldingCapacity: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>200 Pax</span>
                    <span>800 Pax</span>
                  </div>
                </div>
              </div>

              {/* MILP Mathematical Formulation Card */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-3 font-mono text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  MILP Network Flow Formulation
                </span>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/70 leading-relaxed">
                  <div className="text-purple-300 font-bold mb-1">
                    min Z = Σ(w_c · C_z + w_d · D_ij + w_t · T_k)
                  </div>
                  <div className="text-white/50 text-[10px]">
                    Subject to: Turnstile intake ≤ {Math.round(constraints.turnstileIntakeSaturationCap * 100)}%, Detour ≤ {constraints.maxWalkingDistanceMeters}m, Shuttles ≤ {constraints.shuttleFleetAvailable} EV.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40 block">Simplex Pivots</span>
                    <span className="text-white font-bold">42 Pivots</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40 block">Branch & Bound</span>
                    <span className="text-white font-bold">12 Nodes</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40 block">Constraint Violations</span>
                    <span className="text-emerald-400 font-bold">0 (FEASIBLE)</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-white/40 block">Dual Slacks</span>
                    <span className="text-purple-300 font-bold">Active Duals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 8-Col: Multi-Agency Levers & Ranked Prescriptions */}
            <div className="col-span-8 flex flex-col gap-4">
              {/* Agency Levers Filter Pills */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50 px-2">
                    Levers:
                  </span>
                  {[
                    { key: 'ALL', label: 'All Levers' },
                    { key: 'GATES', label: 'Ingress Gates' },
                    { key: 'TRANSIT', label: 'Transit Headways' },
                    { key: 'LOUNGES', label: 'Peripheral Lounges' },
                    { key: 'JOINT', label: 'Joint Policy' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveLeverFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        activeLeverFilter === tab.key
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-purple-300 pr-2">
                  {filteredInterventions.length} feasible solutions
                </span>
              </div>

              {/* Interventions List */}
              <div className="flex flex-col gap-3">
                {filteredInterventions.map((intervention) => {
                  const isApplied = appliedInterventionIds.includes(intervention.id);
                  return (
                    <div
                      key={intervention.id}
                      className={`bg-black/60 backdrop-blur-xl border rounded-3xl p-5 shadow-xl transition flex flex-col gap-3 ${
                        isApplied
                          ? 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10'
                          : 'border-white/10 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold bg-purple-600/30 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                            Rank #{intervention.rank}
                          </span>
                          <span className="text-xs font-mono font-bold bg-white/5 text-white/70 px-2.5 py-0.5 rounded-full border border-white/10">
                            {intervention.agencyLever}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            {intervention.feasibilityStatus}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-white/40 block font-mono">
                            Dual Price: {intervention.dualPrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            Risk {intervention.riskReductionScore}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">
                          {intervention.title}
                        </h4>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">
                          {intervention.description}
                        </p>
                      </div>

                      {/* Constraint Checks Pill Grid */}
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                        {intervention.constraintChecks.map((chk, i) => (
                          <div
                            key={i}
                            className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col justify-between"
                          >
                            <span className="text-white/40 text-[9px] uppercase">
                              {chk.constraintName}
                            </span>
                            <span className="text-emerald-300 font-bold mt-0.5">
                              {chk.actualValue}
                            </span>
                            <span className="text-white/30 text-[8px]">
                              Bound: {chk.limitValue}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Expected Outcomes Row & Enact Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-4 text-xs font-mono">
                          {intervention.outcomes.gateQueueReductionMinutes && (
                            <span className="text-blue-300">
                              Queue: <strong>-{intervention.outcomes.gateQueueReductionMinutes}m</strong>
                            </span>
                          )}
                          {intervention.outcomes.zonePressureDelta && (
                            <span className="text-emerald-300">
                              Zone: <strong>{intervention.outcomes.zonePressureDelta}%</strong>
                            </span>
                          )}
                          {intervention.outcomes.transitPlatformReliefPaxMin && (
                            <span className="text-purple-300">
                              Platform: <strong>+{intervention.outcomes.transitPlatformReliefPaxMin} pax/min</strong>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleApplySingle(intervention)}
                          disabled={isApplied}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            isApplied
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 active:scale-95'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isApplied ? 'Prescription Enacted' : 'Enact Prescription'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

