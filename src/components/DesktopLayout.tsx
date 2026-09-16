import React from 'react';
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
  Bell
} from 'lucide-react';
import { Zone, Gate, TransportHub, Hotel, AIAction, SystemAlert } from '../types';
import { InteractiveMap } from './InteractiveMap';

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
}) => {
  const criticalZone = zones.find((z) => z.id === 'zone-a') || zones[0];
  const topAction = actions[0];

  return (
    <div className="hidden lg:flex flex-col w-full min-h-screen bg-[#0a0a0c] text-white">
      {/* Desktop Command Center Header with Frosted Glass Theme */}
      <header className="w-full bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
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

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white/80">Mumbai MegaFest</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              ● LIVE • {liveTime} IST
            </span>
          </div>
        </div>

        {/* Technical architecture badges in desktop view */}
        <div className="flex items-center gap-2">
          {onOpenZPIEngine && (
            <button
              id="desktop-zpi-engine-btn"
              onClick={onOpenZPIEngine}
              className="px-3 py-1 bg-black/60 hover:bg-black/90 text-xs font-mono text-blue-300 font-bold rounded-xl border border-blue-500/40 hover:border-blue-400 transition flex items-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>ZPI & State Fusion Engine</span>
              <span className="text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30">
                0.87
              </span>
            </button>
          )}

          <span className="text-xs font-mono bg-white/5 text-white/70 px-3 py-1 rounded-xl border border-white/10">
            PS-8 Architecture
          </span>
          <span className="text-xs font-mono bg-blue-600/20 text-blue-300 px-3 py-1 rounded-xl border border-blue-500/30">
            XGBoost Forecast
          </span>
          <span className="text-xs font-mono bg-purple-600/20 text-purple-300 px-3 py-1 rounded-xl border border-purple-500/30">
            OR-Tools Max-Flow
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

      {/* Main Bento Grid */}
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
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">CV Sensor Streams</span>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">24 / 24</div>
              <span className="text-[11px] text-white/50 mt-0.5 block font-medium">100% optical feeds online</span>
            </div>
          </div>
        </div>

        {/* Right 4-col: Critical Alert & AI Actions Side Panel */}
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

          {/* AI Recommendation Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-400" />
                  AI Recommendation
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {topAction.confidence}% Confidence
                </span>
              </div>

              <h4 className="text-base font-bold text-white mt-2.5">
                {topAction.title}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {topAction.description}
              </p>

              <div className="mt-3.5 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs backdrop-blur-md">
                <div className="flex justify-between py-1">
                  <span className="text-white/50">Pressure Impact:</span>
                  <span className="font-mono text-emerald-400 font-bold">94% → 71%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/50">Gate Queue:</span>
                  <span className="font-mono text-blue-300 font-bold">28m → 8m</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSimulateAction(topAction.id)}
              className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>OPEN SIMULATION SANDBOX</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
