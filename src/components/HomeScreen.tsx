import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  Zap,
  Activity,
  ShieldCheck,
  Users,
  Clock,
  Radio,
  Building2,
  Train,
  CheckCircle2
} from 'lucide-react';
import { Zone, AIAction, TabType } from '../types';

interface HomeScreenProps {
  criticalZone: Zone;
  onNavigateTab: (tab: TabType) => void;
  onSelectZone: (zone: Zone) => void;
  onTriggerAction: (actionId: string) => void;
  topAction: AIAction;
  cvStreamsOnline: number;
  totalCvStreams: number;
  onOpenZPIEngine?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  criticalZone,
  onNavigateTab,
  onSelectZone,
  onTriggerAction,
  topAction,
  cvStreamsOnline,
  totalCvStreams,
  onOpenZPIEngine,
}) => {
  return (
    <div
      id="mobile-home-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-3.5 pt-3 pb-24 text-white"
    >
      {/* 1. CRITICAL ALERT CARD (Frosted Glass with vivid red accents) */}
      <section
        id="critical-alert-card"
        className="relative overflow-hidden rounded-[28px] bg-black/60 backdrop-blur-2xl border border-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.25)] p-5 transition-all"
      >
        {/* Subtle ambient glow behind card */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top badge row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)]"></span>
            </span>
            <span className="text-xs font-black tracking-widest text-red-400 uppercase">
              CRITICAL ALERT
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full">
            ZONE A
          </span>
        </div>

        {/* Zone Name */}
        <div className="mt-2.5">
          <h2 className="text-xl font-black text-white tracking-tight leading-tight">
            Zone A — Main Arena
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Rapid bottleneck near North Concourse
          </p>
        </div>

        {/* Dominant Numbers: 78% -> 94% with frosted pill */}
        <div className="my-3.5 py-2.5 px-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              CURRENT
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {criticalZone.pressure}%
            </span>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-5 h-5 text-red-400" />
            <span className="text-[10px] text-red-400 font-semibold tracking-wider">18 MIN</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              FORECASTED
            </span>
            <span className="text-4xl sm:text-5xl font-black text-red-500 font-mono tracking-tighter drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
              {criticalZone.projectedPressure}%
            </span>
          </div>
        </div>

        {/* Context metadata in frosted cards */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1">
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-2.5 text-white/80">
            <Users className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-semibold text-xs text-white/90">+{criticalZone.inflow}/min inflow</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-2.5 text-white/80">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-xs text-white/90">Queue: {criticalZone.gateQueueMin} min</span>
          </div>
        </div>

        {/* Response Action Button: Electric frosted glass red */}
        <button
          id="btn-view-response"
          onClick={() => {
            onSelectZone(criticalZone);
          }}
          className="w-full mt-3 py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/30 active:scale-95 transition flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>SIMULATE RESPONSE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 1B. MULTI-MODAL STATE FUSION & ZPI ENGINE CARD */}
      <section
        id="zpi-fusion-engine-card"
        className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-blue-500/30 p-4 shadow-xl flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">
              State Fusion & ZPI Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            ZPI_z = 0.87 (CRITICAL)
          </span>
        </div>

        {/* 3-Tier Ingestion & Edge YOLOv8 pill badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <span className="text-[10px] text-white/50 uppercase font-bold block">
              EventFlow Connect Gateway
            </span>
            <span className="text-white font-semibold mt-0.5 block">
              Decoupled 3-Tier Ingestion
            </span>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 mt-1 font-mono">
              <span>● Tier 1 (REST)</span>
              <span>● Tier 2 (GTFS-RT)</span>
              <span>● Tier 3 (Portal)</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <span className="text-[10px] text-white/50 uppercase font-bold block">
              Edge-Native Vision Telemetry
            </span>
            <span className="text-white font-semibold mt-0.5 block">
              YOLOv8 + ByteTrack
            </span>
            <div className="flex items-center gap-1 text-[9px] text-blue-300 mt-1 font-mono">
              <span className="text-emerald-400">Zero Raw Video Stream</span>
            </div>
          </div>
        </div>

        {/* Lightweight Numerical JSON Packet preview snippet */}
        <div className="bg-black/80 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-emerald-300 flex items-center justify-between">
          <span className="text-white/40">Edge Packet:</span>
          <span>{`{"zone": "Gate_A", "count": 842, "inflow": 52}`}</span>
          <span className="text-white/40">14ms</span>
        </div>

        {/* Operational Trigger Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-white/90">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
            Composite Operational Trigger:
          </span>
          <span className="text-xs text-white font-medium mt-0.5 block">
            ZPI &gt; 0.80 threshold breached: Gate 3 bypass diversion activated
          </span>
        </div>

        {onOpenZPIEngine && (
          <button
            id="btn-open-zpi-engine-home"
            onClick={onOpenZPIEngine}
            className="w-full py-2.5 px-4 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Open Multi-Modal Fusion & ZPI Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </section>

      {/* 2. DESTINATION STATUS (Frosted 4-metric Bento) */}
      <section
        id="destination-status-section"
        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Destination Status
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE SYNC
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Venue */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Venue</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                HEAVY
              </span>
            </div>
            <span className="text-2xl font-black text-white font-mono mt-1">
              78%
            </span>
            <span className="text-[11px] text-white/40 mt-0.5">34.2k / 40k capacity</span>
          </div>

          {/* Transit */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Transit</span>
              <span className="text-[10px] font-bold text-red-400 bg-red-600/10 px-2 py-0.5 rounded-full border border-red-500/20">
                91% LOAD
              </span>
            </div>
            <span className="text-2xl font-black text-red-400 font-mono mt-1">
              91%
            </span>
            <span className="text-[11px] text-white/40 mt-0.5">Central Station bottleneck</span>
          </div>

          {/* Hotels */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Hotels</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                SPARE
              </span>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1">
              18.4%
            </span>
            <span className="text-[11px] text-white/40 mt-0.5">12,840 rooms open</span>
          </div>

          {/* CV Streams */}
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">CV Streams</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                100%
              </span>
            </div>
            <span className="text-2xl font-black text-blue-300 font-mono mt-1">
              {cvStreamsOnline}/{totalCvStreams}
            </span>
            <span className="text-[11px] text-white/40 mt-0.5">Edge AI optical feeds</span>
          </div>
        </div>
      </section>

      {/* 3. DESTINATION MAP PREVIEW (Frosted styling with glowing visual nodes) */}
      <section
        id="destination-map-preview-card"
        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
            <MapIcon className="w-3.5 h-3.5 text-blue-400" />
            Destination Map
          </h3>
          <span className="text-[10px] font-mono text-white/40">7 ZONES • 4 GATES</span>
        </div>

        {/* Stylized frosted interactive mini map preview */}
        <div
          onClick={() => onNavigateTab('map')}
          className="relative w-full h-44 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 overflow-hidden cursor-pointer group flex items-center justify-center select-none shadow-inner"
        >
          {/* Subtle dot matrix grid matching theme */}
          <div className="absolute inset-0 opacity-20 frosted-dots-pattern pointer-events-none" />

          {/* Ambient glow in map */}
          <div className="absolute w-48 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          {/* Crowd directional paths */}
          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 320 140">
            <path
              d="M 60 110 L 150 70 L 170 45"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="5 5"
              className="animate-flow-dash"
            />
            <path
              d="M 270 50 L 190 45"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-flow-dash"
            />
            <path
              d="M 170 45 L 220 95"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="5 4"
              className="animate-flow-dash"
            />
          </svg>

          {/* Zone A pin: Glowing red frosted ring */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-11 h-11 bg-red-600 rounded-full border-4 border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] ring-4 ring-red-600/20">
              <span className="font-black text-xs text-white">A</span>
            </div>
            <div className="mt-1.5 px-2 py-0.5 bg-red-600/90 backdrop-blur-md rounded-md text-[10px] font-bold uppercase shadow-md">
              Critical: 94%
            </div>
          </div>

          {/* Zone B pin: Station emerald */}
          <div className="absolute bottom-3 left-6 flex flex-col items-center">
            <div className="w-9 h-9 bg-emerald-500 rounded-full border-4 border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="font-black text-xs text-white">B</span>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[10px] font-medium text-white/80">
              Station: 91%
            </div>
          </div>

          {/* Zone C pin: Gate amber */}
          <div className="absolute top-7 right-7 flex flex-col items-center">
            <div className="w-9 h-9 bg-amber-500 rounded-full border-4 border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="font-black text-xs text-white">C</span>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[10px] font-medium text-white/80">
              Gate 3: 68%
            </div>
          </div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center backdrop-blur-xs">
            <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 shadow-2xl">
              Tap to Explore Live Twin
            </span>
          </div>
        </div>

        <button
          id="btn-open-full-map"
          onClick={() => onNavigateTab('map')}
          className="w-full mt-3 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl border border-white/10 shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <span>OPEN FULL MAP</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
        </button>
      </section>

      {/* 4. AI RECOMMENDATION (Frosted Glass with blue electric theme) */}
      <section
        id="ai-recommendation-section"
        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-blue-400" />
            AI Recommendation
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            {topAction.confidence}% CONFIDENCE
          </span>
        </div>

        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl mt-2">
          <p className="text-sm font-medium leading-relaxed text-white">
            Redirect <strong className="text-blue-400 font-bold">1,800 attendees</strong> from Central Gateway to <strong className="text-blue-400 font-bold">Gate 3</strong>.
          </p>
        </div>

        <div className="mt-3 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-white/40">Target relief:</span>
          <span className="font-mono font-bold text-emerald-400">
            {topAction.impactText}
          </span>
        </div>

        <button
          id="btn-simulate-home-action"
          onClick={() => onTriggerAction(topAction.id)}
          className="w-full mt-3.5 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>SIMULATE RESPONSE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 5. SYSTEM STATUS */}
      <section
        id="system-status-section"
        className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 p-3.5 text-xs text-white/40 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-white/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Engine: XGBoost + OR-Tools
          </span>
          <span className="text-emerald-400">STABLE • 12ms LATENCY</span>
        </div>
        <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2 text-white/30">
          <span>Simulation Horizon: 45 min</span>
          <span>Mesh Status: 100% Ingress Synced</span>
        </div>
      </section>
    </div>
  );
};
