import React from 'react';
import {
  X,
  TrendingUp,
  AlertOctagon,
  Clock,
  ArrowRight,
  Users,
  Zap,
  CheckCircle2,
  Share2,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { Zone, AIAction } from '../types';
import { computeZPI } from '../engine/fusionEngine';
import { ZonePredictiveChart } from './ZonePredictiveChart';

interface ZoneBottomSheetProps {
  zone: Zone | null;
  onClose: () => void;
  onSimulateAction: (actionId: string) => void;
  recommendedAction?: AIAction;
  onOpenZPIEngine?: () => void;
}

export const ZoneBottomSheet: React.FC<ZoneBottomSheetProps> = ({
  zone,
  onClose,
  onSimulateAction,
  recommendedAction,
  onOpenZPIEngine,
}) => {
  if (!zone) return null;

  const zpiData = computeZPI(zone);
  const isCritical = zone.pressure >= 80 || zone.status === 'CRITICAL' || zpiData.riskLevel === 'CRITICAL';
  const isWarning = (zone.pressure >= 60 && zone.pressure < 80) || zpiData.riskLevel === 'HIGH' || zpiData.riskLevel === 'MODERATE';

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Dismiss sheet"
      />

      {/* Slide-up sheet container on mobile / centered modal on desktop */}
      <div
        id="zone-bottom-sheet"
        className="relative w-full max-w-lg bg-black/90 backdrop-blur-2xl rounded-t-[32px] lg:rounded-3xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] lg:shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 pb-8 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200"
      >
        {/* Swipe drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition" onClick={onClose} />
        </div>

        {/* Header row: Zone Title & Status badge & close button */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCritical
                    ? 'text-red-500'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                Zone {zone.code} — {zone.status} INFLOW
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {zone.name}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {zone.description || 'Pedestrian thoroughfare & ingress sector'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span
                className={`text-2xl font-black font-mono ${
                  isCritical
                    ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {zone.projectedPressure}%
              </span>
              <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">PROJECTED</span>
            </div>

            <button
              id="close-zone-sheet-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 text-white/50 hover:text-white border border-white/10 transition active:scale-95 ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current vs Forecast Big Metric Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Current Load</span>
            <div className="text-xl font-black font-mono text-white mt-1">
              {zone.pressure}%
            </div>
            <span className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-white/40" />
              {zone.occupancy.toLocaleString()} in zone
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between backdrop-blur-md">
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Critical Timeline</span>
            <div className="text-xl font-black font-mono text-amber-400 mt-1">
              {zone.criticalInMinutes} mins
            </div>
            <span className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Until safety limit (80%)
            </span>
          </div>
        </div>

        {/* Live Dynamics: Inflow + Gate Queue */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-xs text-white/40 block">Current Inflow</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">
              +{zone.inflow}/min
            </span>
            <span className="text-[10px] text-red-400 mt-0.5 block font-medium">
              High acceleration
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-xs text-white/40 block">Est. Wait Time</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">
              {zone.gateQueueMin} mins
            </span>
            <span className="text-[10px] text-amber-400 mt-0.5 block font-medium">
              North gate bottleneck
            </span>
          </div>
        </div>

        {/* Pressure Forecast: Recharts 60-minute Predictive Trend based on Historical Flow Data */}
        <ZonePredictiveChart zone={zone} />

        {/* ZPI (Zone Pressure Index) State Fusion Card */}
        <div className="mt-4 bg-black/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              Zone Pressure Index (ZPI_z)
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              zpiData.riskLevel === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : zpiData.riskLevel === 'HIGH'
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                : zpiData.riskLevel === 'MODERATE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {zpiData.riskLevel} ({zpiData.zpi.toFixed(2)})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 bg-white/5 rounded-xl border border-white/5">
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Density (ρ)</span>
              <span className="font-mono font-bold text-white text-xs">{zpiData.densityRatio.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Net Flow (ΔF)</span>
              <span className="font-mono font-bold text-white text-xs">{zpiData.netFlowVelocity.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Transit (T_acc)</span>
              <span className="font-mono font-bold text-white text-xs">{zpiData.transitAccumulation.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase block">Buffer (M_cap)</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{zpiData.voluntaryMitigation.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[11px] text-white/60 mt-2 font-medium">
            <strong className="text-white">Trigger:</strong> {zpiData.operationalTrigger}
          </p>

          {onOpenZPIEngine && (
            <button
              onClick={() => {
                onClose();
                onOpenZPIEngine();
              }}
              className="mt-2.5 w-full text-center text-xs font-semibold text-blue-400 hover:text-blue-300 py-1"
            >
              Open Complete State Fusion Engine →
            </button>
          )}
        </div>

        {/* AI Recommendation Box */}
        <div className="mt-4 bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-blue-400" />
            AI Recommendation
          </div>
          <p className="text-sm font-bold text-white leading-snug">
            {recommendedAction?.title || 'Redirect 1,800 attendees to Gate 3'}
          </p>
          <div className="flex items-center justify-between text-xs text-white/60 mt-2">
            <span className="text-emerald-400 font-semibold">
              Expected: 94% → 71% load
            </span>
            <span className="font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/30">
              94% Confidence
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              id="sheet-simulate-action-btn"
              onClick={() => onSimulateAction(recommendedAction?.id || 'action-1')}
              className="flex-1 py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide rounded-2xl text-sm shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>DEPLOY FLOW BALANCING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
