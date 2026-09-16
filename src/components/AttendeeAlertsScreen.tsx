import React from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Train,
  Bell,
  Compass,
  Sliders
} from 'lucide-react';
import { Zone, Gate, TransportHub } from '../types';

interface AttendeeAlertsScreenProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  onViewRoute: () => void;
  gate3BusySimulated: boolean;
  onToggleGate3Busy: () => void;
  interventionApplied?: boolean;
}

export const AttendeeAlertsScreen: React.FC<AttendeeAlertsScreenProps> = ({
  zones,
  gates,
  transports,
  onViewRoute,
  gate3BusySimulated,
  onToggleGate3Busy,
  interventionApplied = false,
}) => {
  const zoneA = zones.find((z) => z.id === 'zone-a') || zones[0];
  const gate3 = gates.find((g) => g.id === 'gate-3') || gates[2] || gates[0];
  const gate4 = gates.find((g) => g.id === 'gate-4') || gates[3] || gates[0];

  return (
    <div
      id="attendee-alerts-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
            LIVE ADVISORIES
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Alerts
          </h1>
        </div>

        {/* Simulation toggle button for test review */}
        <button
          id="btn-toggle-gate3-busy"
          onClick={onToggleGate3Busy}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 flex items-center gap-1.5 ${
            gate3BusySimulated
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
          }`}
          title="Toggle condition change to test dynamic route update alert"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{gate3BusySimulated ? 'Gate 3 Busy: ON' : 'Simulate Surge'}</span>
        </button>
      </div>

      {/* Alert 1: Dynamic ROUTE UPDATE Alert */}
      {gate3BusySimulated ? (
        <section
          id="alert-route-update-gate4"
          className="bg-black/60 backdrop-blur-xl rounded-3xl border border-amber-500/40 p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ROUTE UPDATE
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              88% confidence
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              Gate 3 is becoming busy.
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Queue at Gate 3 has reached 19 min. EventFlow recommends switching to <strong className="text-emerald-300 font-semibold">Gate 4 (Southwest)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 text-xs border border-white/10">
            <div>
              <span className="text-white/40 block text-[10px] uppercase font-bold">New Recommended Gate</span>
              <span className="text-emerald-300 font-bold text-sm">Gate 4 (Southwest)</span>
            </div>
            <div className="ml-auto text-right">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Queue</span>
              <span className="text-white font-mono font-bold text-sm">11 min</span>
            </div>
          </div>

          <button
            id="btn-alert-view-new-route"
            onClick={onViewRoute}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 min-h-[48px]"
          >
            <span>VIEW NEW ROUTE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section
          id="alert-route-normal-gate3"
          className="bg-black/60 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-4 shadow-xl flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-600/20 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              ACTIVE ROUTE ADVISORY
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              94% confidence
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Optimal Entry: Gate 3 (South Express)
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              Queue wait is currently 8 min with open turnstiles. Avoid Gate 1 North (28 min queue).
            </p>
          </div>

          <button
            onClick={onViewRoute}
            className="self-start text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 pt-1"
          >
            <span>View Route Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Alert 2: EVENT UPDATE */}
      <section
        id="alert-event-update-arena"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            EVENT UPDATE
          </span>
          <span className="text-[10px] font-mono text-white/40">
            Just now
          </span>
        </div>

        <p className="text-xs text-white/80 leading-relaxed font-medium">
          {interventionApplied
            ? 'Crowd conditions have improved. Main Arena load has stabilized at 71% with balanced flow.'
            : 'Main Arena entry is currently experiencing high crowd pressure (78% capacity, +320/min). Headliner begins at 21:00.'}
        </p>
      </section>

      {/* Alert 3: CAPACITY UPDATE */}
      <section
        id="alert-capacity-update"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-4 shadow-xl flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            CAPACITY UPDATE
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            Active
          </span>
        </div>

        <p className="text-xs text-white/80 leading-relaxed">
          {gate3BusySimulated
            ? 'Gate 4 currently has available capacity (11 min queue • 54% load).'
            : 'Gate 3 currently has available capacity (8 min queue • 69% load). Rapid scanning turnstiles 12–18 are open.'}
        </p>
      </section>

      {/* Alert 4: Transit Chokepoint Advisory */}
      <section
        id="alert-transit-update"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex items-start gap-3"
      >
        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
          <Train className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 block">
            TRANSIT ADVISORY
          </span>
          <h4 className="text-xs font-bold text-white mt-0.5">
            Central Station Skywalk Congestion
          </h4>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
            Commuter load is high (91%). Exit to ground level at Ramp C and follow East Corridor Avenue 4.
          </p>
        </div>
      </section>
    </div>
  );
};
