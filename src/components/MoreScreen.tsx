import React from 'react';
import {
  Cpu,
  Eye,
  RotateCcw,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  Terminal,
  Server,
  Compass,
  ArrowRight
} from 'lucide-react';

interface MoreScreenProps {
  onResetDemo: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onOpenAttendeeAccess?: () => void;
  onOpenZPIEngine?: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  onResetDemo,
  isSimulating,
  onToggleSimulating,
  onOpenAttendeeAccess,
  onOpenZPIEngine,
}) => {
  return (
    <div
      id="mobile-more-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white"
    >
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          System & Settings
        </h1>
        <p className="text-xs text-white/60 mt-0.5">
          Platform telemetry, algorithmic pipeline & edge mesh
        </p>
      </div>

      {/* Attendee Guidance Experience Mode */}
      {onOpenAttendeeAccess && (
        <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Close-Loop Attendee Experience
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              LIVE MESH
            </span>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">
            Switch to the Attendee Mobile Dashboard to experience live crowd guidance, shortest queue gate recommendations, and the AI What-If decision assistant as seen by festivalgoers.
          </p>

          <button
            id="btn-more-open-attendee"
            onClick={onOpenAttendeeAccess}
            className="w-full mt-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 min-h-[44px]"
          >
            <span>Launch Attendee App View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Technical Architecture Overview */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            State Fusion & ZPI Engine
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
            ACTIVE
          </span>
        </div>

        <p className="text-xs text-white/70 leading-relaxed">
          Decoupled 3-tier ingestion (Venue Turnstiles REST, GTFS-RT Transit, Partner Web Portal) fused with Edge-Native YOLOv8 telemetry transmitting lightweight numerical packets with zero raw video streaming.
        </p>

        {onOpenZPIEngine && (
          <button
            id="btn-more-open-zpi"
            onClick={onOpenZPIEngine}
            className="w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>Open ZPI Engine & Gateway Config</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </section>

      {/* Algorithmic Stack & Benchmarks */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col gap-3.5">

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-white/5 text-white/80 rounded-xl text-xs font-mono border border-white/10">
            PS-8 Compliant
          </span>
          <span className="px-2.5 py-1 bg-blue-600/20 text-blue-300 rounded-xl text-xs font-mono border border-blue-500/30">
            XGBoost Regressor
          </span>
          <span className="px-2.5 py-1 bg-purple-600/20 text-purple-300 rounded-xl text-xs font-mono border border-purple-500/30">
            Google OR-Tools
          </span>
          <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 rounded-xl text-xs font-mono border border-emerald-500/30">
            4.2x Faster Dispatch
          </span>
        </div>

        <p className="text-xs text-white/70 leading-relaxed">
          EventFlow AI predicts bottleneck formation 15–30 minutes before human visual detection, using real-time optical density matrices and network flow algorithms.
        </p>
      </section>

      {/* Edge Sensor & CV Telemetry */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col gap-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Camera & Optical Density Mesh
        </h3>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-white/40 block text-[11px] font-medium">Active Feeds</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">24 / 24 Online</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-white/40 block text-[11px] font-medium">Sensor Latency</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">14 ms avg</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-white/40 block text-[11px] font-medium">Privacy Protection</span>
            <span className="text-base font-bold text-blue-400 font-mono mt-0.5 block">Edge Vectorized</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-white/40 block text-[11px] font-medium">Map Engine</span>
            <span className="text-base font-bold text-purple-300 font-mono mt-0.5 block">Leaflet + Twin</span>
          </div>
        </div>
      </section>

      {/* Telemetry Control */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col gap-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Live Simulation Controls
        </h3>

        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Live Influx Telemetry</span>
            <span className="text-[11px] text-white/40">Updates crowd pressure every 3 seconds</span>
          </div>
          <button
            id="toggle-telemetry-btn"
            onClick={onToggleSimulating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
              isSimulating
                ? 'bg-blue-600 text-white shadow-blue-600/30'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            {isSimulating ? 'Active' : 'Paused'}
          </button>
        </div>

        {/* Reset State Button */}
        <button
          id="btn-reset-demo"
          onClick={onResetDemo}
          className="w-full mt-2 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 rounded-2xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 min-h-[46px]"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Reset EventFlow Demo to Baseline</span>
        </button>
      </section>
    </div>
  );
};
