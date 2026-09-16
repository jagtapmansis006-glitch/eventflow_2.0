import React from 'react';
import {
  ArrowLeft,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation
} from 'lucide-react';
import { Zone, Gate, TransportHub, Hotel } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface AttendeeMapScreenProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  hotels: Hotel[];
  onBackToHome: () => void;
  onGetGuidance: () => void;
  gate3BusySimulated?: boolean;
}

export const AttendeeMapScreen: React.FC<AttendeeMapScreenProps> = ({
  zones,
  gates,
  transports,
  hotels,
  onBackToHome,
  onGetGuidance,
  gate3BusySimulated = false,
}) => {
  const gate3 = gates.find((g) => g.id === 'gate-3') || gates[2] || gates[0];
  const gate4 = gates.find((g) => g.id === 'gate-4') || gates[3] || gates[0];
  const targetGate = gate3BusySimulated ? gate4 : gate3;
  const targetQueue = gate3BusySimulated ? gate4.queueMin : gate3.queueMin;
  const targetRoute = gate3BusySimulated ? 'Southwest Connector' : 'East Corridor';

  return (
    <div
      id="attendee-map-screen"
      className="relative w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col bg-[#0a0a0c] overflow-hidden"
    >
      {/* Attendee Simplified Map Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <button
          id="btn-attendee-map-back"
          onClick={onBackToHome}
          className="pointer-events-auto h-10 px-3.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 text-white text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-black/90 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Event Map</span>
        </button>

        <div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-2xl text-[11px] font-bold text-white shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Destination: Main Arena</span>
        </div>
      </div>

      {/* Embedded Map (using existing InteractiveMap) */}
      <div className="w-full h-full flex-1">
        <InteractiveMap
          zones={zones}
          gates={gates}
          transports={transports}
          hotels={hotels}
          selectedZoneId="zone-a"
          onSelectZone={() => {}}
          isFullScreenMobile={true}
        />
      </div>

      {/* Floating Visual Route Overlay on Map (Diagrammatic overlay showing route & warnings) */}
      <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-3 shadow-2xl pointer-events-auto max-w-sm mx-auto w-full">
          <div className="flex items-center justify-between text-[11px] font-bold border-b border-white/10 pb-1.5 mb-2">
            <span className="text-blue-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Active Route Guidance
            </span>
            <span className="text-emerald-400 font-mono">
              {gate3BusySimulated ? '88%' : '94%'} confidence
            </span>
          </div>

          <div className="space-y-1 text-xs">
            {/* Main Arena Target */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Main Arena (Destination)
              </span>
              <span className="text-[10px] font-mono text-white/50">High Crowd</span>
            </div>

            {/* Route indicator */}
            <div className="flex items-center gap-2 pl-3 py-0.5 text-[11px] text-blue-300 font-medium">
              <span>↑ Recommended: {targetRoute} (6 min)</span>
            </div>

            {/* Recommended Gate */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {targetGate.name} (Recommended Entry)
              </span>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">{targetQueue}m queue</span>
            </div>

            {/* Avoid warning */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Gate 1 (North Concourse)
              </span>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                ⚠️ Avoid (28m Q)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Card: [ GET GUIDANCE ] */}
      <div className="absolute bottom-4 left-3 right-3 z-30 pointer-events-auto max-w-sm mx-auto w-full">
        <div className="bg-black/85 backdrop-blur-2xl p-4 rounded-3xl border border-white/15 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Follow {targetRoute}
                </h4>
                <p className="text-[11px] text-white/60">
                  Fastest route to {targetGate.name} • Saves ~20 min
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400">
              {targetQueue} min wait
            </span>
          </div>

          <button
            id="btn-attendee-map-get-guidance"
            onClick={onGetGuidance}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>GET GUIDANCE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
