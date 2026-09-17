import React, { useState } from 'react';
import {
  X,
  Zap,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Users,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AIAction, Zone, Gate, TransportHub } from '../types';
import { WhatIfAssistant } from './WhatIfAssistant';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: AIAction;
  onApplyIntervention: (actionId: string, redirectedCount: number) => void;
  zones?: Zone[];
  gates?: Gate[];
  transports?: TransportHub[];
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  action,
  onApplyIntervention,
  zones = [],
  gates = [],
  transports = [],
}) => {
  const [modalTab, setModalTab] = useState<'simulate' | 'whatif'>('simulate');
  const [attendeesRedirected, setAttendeesRedirected] = useState<number>(1800);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real-time calculation based on slider
  const baselinePressure = 94;
  const reliefFactor = (attendeesRedirected / 1800) * 23;
  const simulatedPressure = Math.max(55, Math.round(baselinePressure - reliefFactor));
  const queueMinutes = Math.max(5, Math.round(28 - (attendeesRedirected / 1800) * 20));

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => {
        onApplyIntervention(action.id, attendeesRedirected);
        onClose();
        setAppliedSuccess(false);
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        id="simulation-modal"
        className="relative w-full max-w-md my-auto bg-black/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white leading-none">
                {modalTab === 'simulate' ? 'Simulation Sandbox' : 'AI What-If Assistant'}
              </h3>
              <span className="text-[11px] font-mono text-blue-400 mt-0.5 block">
                {modalTab === 'simulate' ? 'OR-Tools Flow Optimizer' : 'Predictive Decision Engine'}
              </span>
            </div>
          </div>

          <button
            id="close-simulation-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-white/50 hover:text-white border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Simulation vs What-If */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mt-3 text-xs">
          <button
            onClick={() => setModalTab('simulate')}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              modalTab === 'simulate'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>

          <button
            id="btn-tab-whatif"
            onClick={() => setModalTab('whatif')}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              modalTab === 'whatif'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI What-If</span>
          </button>
        </div>

        {modalTab === 'whatif' ? (
          <div className="mt-3">
            <WhatIfAssistant
              zones={zones}
              gates={gates}
              transports={transports}
              onSimulate={() => setModalTab('simulate')}
            />
          </div>
        ) : (
          <>
            {/* Action Title */}
            <div className="mt-3.5">
              <h4 className="text-sm font-bold text-white leading-snug">
                {action.title}
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                Diverting pedestrian flow from North corridor to South Express Gate 3.
              </p>
            </div>

            {/* Before vs After Impact Visualizer */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* Baseline (Without action) */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-red-500/30 flex flex-col backdrop-blur-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                  WITHOUT ACTION
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-red-400">
                    94%
                  </span>
                  <span className="text-[10px] text-white/40">load</span>
                </div>
                <span className="text-[11px] text-white/60 font-mono mt-1">
                  Queue: 28 min
                </span>
                <span className="text-[10px] font-bold text-red-400 mt-1 uppercase">
                  Stampede Risk: High
                </span>
              </div>

              {/* With Intervention (Simulated) */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-emerald-500/40 flex flex-col backdrop-blur-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  WITH INTERVENTION
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-emerald-300">
                    {simulatedPressure}%
                  </span>
                  <span className="text-[10px] text-white/40">load</span>
                </div>
                <span className="text-[11px] text-emerald-300/90 font-mono mt-1">
                  Queue: {queueMinutes} min
                </span>
                <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">
                  Bottleneck Cleared
                </span>
              </div>
            </div>

            {/* Interactive Slider: Attendees to Divert */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Attendees to Reroute:
                </span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {attendeesRedirected.toLocaleString()} people
                </span>
              </div>

              <input
                id="simulation-attendee-slider"
                type="range"
                min="600"
                max="3000"
                step="100"
                value={attendeesRedirected}
                onChange={(e) => setAttendeesRedirected(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-white/10 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1.5">
                <span>600 (Min)</span>
                <span>1,800 (Recommended)</span>
                <span>3,000 (Max)</span>
              </div>
            </div>

            {/* OR-Tools Bounded Constraints Validation Audit */}
            <div className="mt-3.5 p-3.5 bg-black/60 rounded-2xl border border-purple-500/30 backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  OR-Tools Constraint Feasibility
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.2 rounded border border-emerald-500/30">
                  FEASIBLE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-white/40 uppercase text-[9px]">Turnstile Intake</span>
                  <span className="text-emerald-400 font-bold mt-0.5">
                    {Math.round((attendeesRedirected / 1800) * 85)} pax/min (PASSED)
                  </span>
                  <span className="text-white/30 text-[8px]">Cap: 192 pax/min</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-white/40 uppercase text-[9px]">Walk Distance</span>
                  <span className="text-emerald-400 font-bold mt-0.5">180m detour (PASSED)</span>
                  <span className="text-white/30 text-[8px]">Max: 350m allowed</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-white/40 uppercase text-[9px]">Shuttle Fleet</span>
                  <span className="text-emerald-400 font-bold mt-0.5">4 of 8 EV (PASSED)</span>
                  <span className="text-white/30 text-[8px]">Reserve: 4 standby</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-white/40 uppercase text-[9px]">Holding Buffer</span>
                  <span className="text-emerald-400 font-bold mt-0.5">400 Pax Lounge (PASSED)</span>
                  <span className="text-white/30 text-[8px]">Cap: 600 max</span>
                </div>
              </div>
            </div>

            {/* Execution Details */}
            <div className="my-3.5 p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-white/70 flex flex-col gap-1.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Overhead Dynamic VMS Displays switched to Gate 3</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Attendee mobile app push: "Gate 3 Express Lane Open (8m)"</span>
              </div>
            </div>

            {/* Apply Intervention Button */}
            <button
              id="btn-apply-intervention"
              onClick={handleApply}
              disabled={isApplying || appliedSuccess}
              className={`w-full py-4 px-4 rounded-2xl text-sm font-bold tracking-wide shadow-lg transition active:scale-95 flex items-center justify-center gap-2 min-h-[50px] ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-900/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              {isApplying ? (
                <span>COMMITTING TO LIVE MESH...</span>
              ) : appliedSuccess ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  INTERVENTION COMMITTED TO MESH!
                </span>
              ) : (
                <>
                  <span>APPLY INTERVENTION TO LIVE MESH</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
