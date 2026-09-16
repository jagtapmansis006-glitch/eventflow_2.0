import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Footprints,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { Zone, Gate, TransportHub } from '../types';

interface AttendeeGuidanceScreenProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  onViewRouteOnMap: () => void;
  onAskEventFlow?: () => void;
  gate3BusySimulated?: boolean;
}

export const AttendeeGuidanceScreen: React.FC<AttendeeGuidanceScreenProps> = ({
  zones,
  gates,
  transports,
  onViewRouteOnMap,
  onAskEventFlow,
  gate3BusySimulated = false,
}) => {
  const zoneA = zones.find((z) => z.id === 'zone-a') || zones[0];
  const gate1 = gates.find((g) => g.id === 'gate-1') || gates[0];
  const gate3 = gates.find((g) => g.id === 'gate-3') || gates[2] || gates[0];
  const gate4 = gates.find((g) => g.id === 'gate-4') || gates[3] || gates[0];

  // Dynamic gate recommendation based on whether Gate 3 is crowded
  const recommendedGate = gate3BusySimulated ? gate4 : gate3;
  const recommendedGateQueue = gate3BusySimulated ? gate4.queueMin : gate3.queueMin;
  const recommendedGateCapacity = gate3BusySimulated ? gate4.capacity : gate3.capacity;
  const confidencePercent = gate3BusySimulated ? 88 : 94;
  const routeName = gate3BusySimulated ? 'Southwest Connector' : 'East Corridor';
  const walkMinutes = gate3BusySimulated ? 8 : 6;

  return (
    <div
      id="attendee-guidance-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
            LIVE NAVIGATION ASSIST
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Guidance
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{confidencePercent}% Confidence</span>
        </div>
      </div>

      {/* 1. YOUR DESTINATION */}
      <section
        id="guidance-destination-card"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <span className="text-lg font-black">A</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-white/50 font-bold block">
              YOUR DESTINATION
            </span>
            <h2 className="text-base font-bold text-white">
              Main Arena
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
              <span>Crowd: <strong className="text-white font-mono">{zoneA.pressure}%</strong></span>
              <span>•</span>
              <span className="text-red-400 font-mono font-bold">Forecast: {zoneA.projectedPressure}%</span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
          HIGH LOAD
        </span>
      </section>

      {/* Down arrow connector */}
      <div className="flex justify-center -my-2">
        <div className="p-1 rounded-full bg-white/10 text-white/50 border border-white/10">
          <ArrowDown className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* 2. RECOMMENDED ENTRY */}
      <section
        id="guidance-recommended-entry-card"
        className="bg-black/60 backdrop-blur-xl rounded-3xl border border-emerald-500/40 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col gap-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            RECOMMENDED ENTRY
          </span>
          <span className="text-[10px] font-mono text-white/60">
            Fastest Clearance
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {recommendedGate.name.toUpperCase()}
            </h3>
            <span className="text-xs text-emerald-300 font-medium">
              🟢 Available • Express Turnstiles Open
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {recommendedGateQueue} min
            </span>
            <span className="text-[10px] text-white/50 uppercase">
              Queue Wait
            </span>
            <span className="text-[10px] font-mono text-white/70 mt-0.5">
              {recommendedGateCapacity}% capacity
            </span>
          </div>
        </div>

        {/* Comparison with Gate 1 */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 text-xs text-white/70">
          <span className="text-white/60">Avoid Gate 1 (North Concourse):</span>
          <span className="font-mono text-red-400 font-bold">{gate1.queueMin} min queue</span>
        </div>
      </section>

      {/* Down arrow connector */}
      <div className="flex justify-center -my-2">
        <div className="p-1 rounded-full bg-white/10 text-white/50 border border-white/10">
          <ArrowDown className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* 3. BEST ROUTE & TURN-BY-TURN */}
      <section
        id="guidance-route-card"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
            BEST ROUTE
          </span>
          <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Approx. {walkMinutes} min walk
          </span>
        </div>

        <h3 className="text-base font-bold text-white">
          {routeName}
        </h3>

        {/* Step by Step Path */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span className="font-semibold text-white">Current Location: Concourse South</span>
              <p className="text-[11px] text-white/50">Exit Skywalk Ramp C toward East pedestrian lane</p>
            </div>
          </div>

          <div className="h-3 border-l-2 border-dashed border-white/20 ml-2.5" />

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span className="font-semibold text-white">Follow East Corridor Signage</span>
              <p className="text-[11px] text-white/50">Walk 350m along Avenue 4 • Bypasses Gate 1 crowd</p>
            </div>
          </div>

          <div className="h-3 border-l-2 border-dashed border-white/20 ml-2.5" />

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span className="font-semibold text-emerald-300">Enter via {recommendedGate.name} Express Lane</span>
              <p className="text-[11px] text-white/50">Turnstiles 12-18 open for rapid digital pass scanning</p>
            </div>
          </div>

          <div className="h-3 border-l-2 border-dashed border-white/20 ml-2.5" />

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              4
            </div>
            <div>
              <span className="font-semibold text-white">Arrive at Main Arena</span>
              <p className="text-[11px] text-white/50">Direct entry to South Terrace seating and festival floor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Down arrow connector */}
      <div className="flex justify-center -my-2">
        <div className="p-1 rounded-full bg-white/10 text-white/50 border border-white/10">
          <ArrowDown className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* 4. CURRENT INSTRUCTION */}
      <section
        id="guidance-instruction-card"
        className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            CURRENT INSTRUCTION
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            {confidencePercent}% confidence
          </span>
        </div>

        <p className="text-xs text-white/90 leading-relaxed font-medium">
          Avoid Gate 1 right now. {recommendedGate.name} currently has better capacity and saves approximately 20 minutes.
        </p>
      </section>

      {/* 5. VIEW ROUTE BUTTON */}
      <button
        id="btn-guidance-view-route-map"
        onClick={onViewRouteOnMap}
        className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
      >
        <Compass className="w-4 h-4" />
        <span>VIEW ROUTE ON MAP</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {onAskEventFlow && (
        <button
          id="btn-guidance-ask-eventflow"
          onClick={onAskEventFlow}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask EventFlow a Question</span>
        </button>
      )}
    </div>
  );
};
