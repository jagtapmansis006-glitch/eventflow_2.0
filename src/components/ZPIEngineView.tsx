import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Activity,
  Zap,
  ShieldAlert,
  Server,
  Terminal,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Train,
  DoorOpen,
  Users,
  EyeOff,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import {
  Zone,
  ZPIComponents,
  ZPIThresholds,
  ZPIWeights,
  EdgeVisionPacket,
  IngestionTierStatus,
} from '../types';
import {
  computeZPI,
  DEFAULT_THRESHOLDS,
  DEFAULT_WEIGHTS,
  generateEdgePackets,
  INITIAL_INGESTION_STATUS,
} from '../engine/fusionEngine';

interface ZPIEngineViewProps {
  zones: Zone[];
  isOpen: boolean;
  onClose: () => void;
  onSimulateAction?: (actionId: string) => void;
  onUpdateZoneZPI?: (zoneId: string, zpiData: ZPIComponents) => void;
}

export const ZPIEngineView: React.FC<ZPIEngineViewProps> = ({
  zones,
  isOpen,
  onClose,
  onSimulateAction,
}) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'vision' | 'formula' | 'thresholds'>('formula');
  const [thresholds, setThresholds] = useState<ZPIThresholds>(DEFAULT_THRESHOLDS);
  const [weights, setWeights] = useState<ZPIWeights>(DEFAULT_WEIGHTS);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-a');
  const [edgePackets, setEdgePackets] = useState<EdgeVisionPacket[]>(generateEdgePackets());
  const [ingestionStatus] = useState<IngestionTierStatus>(INITIAL_INGESTION_STATUS);
  const [packetTick, setPacketTick] = useState<number>(0);
  const [partnerBufferLevel, setPartnerBufferLevel] = useState<number>(0.35);

  // Periodic edge packet jitter simulation (representing high-frequency JSON telemetry)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEdgePackets((prev) =>
        prev.map((pkt) => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const newInflow = Math.max(12, pkt.inflow + delta);
          const newCount = Math.max(100, pkt.count + Math.floor(Math.random() * 7) - 3);
          return {
            ...pkt,
            count: newCount,
            inflow: newInflow,
            latencyMs: Math.floor(Math.random() * 6) + 12,
            fps: Number((29.5 + Math.random() * 0.8).toFixed(1)),
            timestamp: new Date().toTimeString().split(' ')[0],
          };
        })
      );
      setPacketTick((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const zpiData = computeZPI(activeZone, weights, thresholds, partnerBufferLevel);

  // Compute ZPI for all zones for comparison table
  const allZonesZPI = zones.map((z) => ({
    zone: z,
    zpi: computeZPI(z, weights, thresholds, partnerBufferLevel),
  }));

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/40',
          text: 'text-red-400',
          bar: 'bg-red-500',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          bar: 'bg-orange-500',
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          bar: 'bg-amber-500',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
        };
      default:
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          bar: 'bg-emerald-500',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
        };
    }
  };

  const riskStyle = getRiskColor(zpiData.riskLevel);

  const handleResetCalibration = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setWeights(DEFAULT_WEIGHTS);
    setPartnerBufferLevel(0.35);
  };

  return (
    <div
      id="zpi-engine-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zpi-engine-title"
    >
      <div className="relative w-full max-w-5xl bg-[#0d0e12] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="zpi-engine-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Multi-Modal Event State Fusion & ZPI Engine
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  v3.2 COMPOSITE
                </span>
              </div>
              <p className="text-xs text-white/60">
                EventFlow Connect Gateway (3-Tier) • Edge YOLOv8 Telemetry • Single Operational Trigger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="zpi-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-black/20 border-b border-white/10 overflow-x-auto text-xs">
          <button
            id="tab-zpi-formula"
            onClick={() => setActiveTab('formula')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'formula'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            ZPI Mathematical Core
          </button>
          <button
            id="tab-zpi-gateway"
            onClick={() => setActiveTab('gateway')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gateway'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            3-Tier Connect Gateway
          </button>
          <button
            id="tab-zpi-vision"
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vision'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Edge YOLOv8 Telemetry
          </button>
          <button
            id="tab-zpi-thresholds"
            onClick={() => setActiveTab('thresholds')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'thresholds'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Configurable Thresholds
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: ZPI MATHEMATICAL CORE */}
          {activeTab === 'formula' && (
            <div className="space-y-6">
              
              {/* Zone Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Inspect Target Zone:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {zones.map((z) => (
                      <button
                        key={z.id}
                        id={`select-zone-zpi-${z.id}`}
                        onClick={() => setSelectedZoneId(z.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                          selectedZoneId === z.id
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {z.name.split('—')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Risk Status:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                    {zpiData.riskLevel} ({(zpiData.zpi * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Formula & Operational Trigger Spotlight */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Composite ZPI Score Big Card */}
                <div className={`lg:col-span-4 rounded-2xl border p-5 flex flex-col justify-between ${riskStyle.bg} ${riskStyle.border} ${riskStyle.glow}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider uppercase text-white/70">
                        Zone Pressure Index (ZPIz)
                      </span>
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/90">
                        Range: 0.00 - 1.00
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tight">
                        {zpiData.zpi.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-white/60">/ 1.00</span>
                    </div>

                    {/* Gauge bar */}
                    <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden mt-4 p-0.5 border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${riskStyle.bar}`}
                        style={{ width: `${Math.min(100, Math.max(5, zpiData.zpi * 100))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1.5">
                      <span>0.00 (Low)</span>
                      <span>{thresholds.lowMax.toFixed(2)}</span>
                      <span>{thresholds.moderateMax.toFixed(2)}</span>
                      <span>{thresholds.highMax.toFixed(2)}</span>
                      <span>1.00 (Critical)</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10">
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                      Target Area
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {activeZone.name}
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                      {activeZone.description}
                    </p>
                  </div>
                </div>

                {/* Mathematical Formula & Term Fusion Breakdown */}
                <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Unified Composite Fusion Formulation
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">
                        Normalized [0.0 - 1.0]
                      </span>
                    </div>

                    {/* Formula Mathematical Box */}
                    <div className="bg-black/60 border border-blue-500/20 rounded-xl p-3 font-mono text-xs text-blue-200 overflow-x-auto leading-relaxed">
                      <div className="text-white/80 font-bold mb-1">
                        ZPI_z = clamp( w₁·ρ_z + w₂·ΔF_z + w₃·T_acc,z − w₄·M_cap,z , 0.0 , 1.0 )
                      </div>
                      <div className="text-[11px] text-white/50">
                        Where ρ=Density Ratio, ΔF=Net Flow Velocity, T_acc=GTFS Transit Influx, M_cap=Buffer Mitigation
                      </div>
                    </div>

                    {/* Four Term Breakdowns */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      
                      {/* Term 1: Crowd Density */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <span className="text-[10px] text-white/50 font-bold uppercase block">
                          1. Density Ratio (ρ)
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-white">
                            {zpiData.densityRatio.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-white/40">
                            ({((activeZone.occupancy / activeZone.capacity) * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-400 mt-1 block">
                          Weight: {weights.densityWeight.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          {activeZone.occupancy.toLocaleString()} / {activeZone.capacity.toLocaleString()}
                        </div>
                      </div>

                      {/* Term 2: Net Flow Rate */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <span className="text-[10px] text-white/50 font-bold uppercase block">
                          2. Net Flow (ΔF)
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-white">
                            {zpiData.netFlowVelocity.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-amber-400">
                            +{activeZone.inflow - activeZone.outflow}/m
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-400 mt-1 block">
                          Weight: {weights.netFlowWeight.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          In: {activeZone.inflow}/m • Out: {activeZone.outflow}/m
                        </div>
                      </div>

                      {/* Term 3: Transit Accumulation */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <span className="text-[10px] text-white/50 font-bold uppercase block">
                          3. Transit Influx (T_acc)
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-white">
                            {zpiData.transitAccumulation.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-400 mt-1 block">
                          Weight: {weights.transitWeight.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          GTFS Metro Line 3 Wave
                        </div>
                      </div>

                      {/* Term 4: Voluntary Mitigation */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <span className="text-[10px] text-white/50 font-bold uppercase block">
                          4. Mitigation (M_cap)
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-bold text-emerald-400">
                            -{zpiData.voluntaryMitigation.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-400 mt-1 block">
                          Damping: {weights.mitigationWeight.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          Tier 3 Holding Buffers
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Single Operational Trigger Box */}
                  <div className="mt-4 pt-3 border-t border-white/10 bg-blue-950/30 rounded-xl p-3.5 border border-blue-500/30 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Single Operational Trigger Activated:
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                          AUTO-DISPATCH
                        </span>
                      </div>
                      <p className="text-xs text-white/90 mt-1 font-medium">
                        {zpiData.operationalTrigger}
                      </p>
                      {onSimulateAction && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            id="zpi-trigger-simulate-btn"
                            onClick={() => onSimulateAction('action-1')}
                            className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1.5"
                          >
                            <span>Simulate Mitigation Dispatch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Cross-Zone Comparison Table */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Real-time Multi-Zone State Fusion Matrix
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 font-mono text-[11px]">
                        <th className="pb-2">Zone</th>
                        <th className="pb-2">Density (ρ)</th>
                        <th className="pb-2">Net Flow (ΔF)</th>
                        <th className="pb-2">Transit (T_acc)</th>
                        <th className="pb-2">Buffer (M_cap)</th>
                        <th className="pb-2 font-bold text-white">Calculated ZPI</th>
                        <th className="pb-2">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allZonesZPI.map(({ zone, zpi }) => {
                        const style = getRiskColor(zpi.riskLevel);
                        const isSelected = zone.id === selectedZoneId;
                        return (
                          <tr
                            key={zone.id}
                            onClick={() => setSelectedZoneId(zone.id)}
                            className={`cursor-pointer transition ${
                              isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="py-2.5 pr-2 font-semibold text-white">
                              {zone.name}
                            </td>
                            <td className="py-2.5 pr-2 font-mono text-white/70">
                              {zpi.densityRatio.toFixed(2)}
                            </td>
                            <td className="py-2.5 pr-2 font-mono text-white/70">
                              {zpi.netFlowVelocity.toFixed(2)}
                            </td>
                            <td className="py-2.5 pr-2 font-mono text-white/70">
                              {zpi.transitAccumulation.toFixed(2)}
                            </td>
                            <td className="py-2.5 pr-2 font-mono text-emerald-400">
                              {zpi.voluntaryMitigation.toFixed(2)}
                            </td>
                            <td className="py-2.5 pr-2 font-mono font-bold text-white">
                              {zpi.zpi.toFixed(2)}
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                                {zpi.riskLevel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EVENTFLOW CONNECT GATEWAY (3-TIER INGESTION) */}
          {activeTab === 'gateway' && (
            <div className="space-y-6">
              
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    Decoupled 3-Tier Ingestion Architecture
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Asynchronous ingestion bus aggregating isolated turnstiles, transit telemetry, and partner manual buffers into the ZPI engine.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
                  ● ALL 3 TIERS HEALTHY
                </span>
              </div>

              {/* 3 Tier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Tier 1: Turnstiles REST API */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                        TIER 1
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ingestionStatus.tier1Turnstiles.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2">
                      Venue REST APIs (Turnstiles)
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      {ingestionStatus.tier1Turnstiles.source}
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span>Active Gate Arrays:</span>
                        <span className="font-mono font-bold text-white">
                          {ingestionStatus.tier1Turnstiles.activeGates} Arrays
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Polling Cadence:</span>
                        <span className="font-mono text-blue-400">
                          {ingestionStatus.tier1Turnstiles.pollIntervalMs} ms
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Throughput:</span>
                        <span className="font-mono text-white">
                          {ingestionStatus.tier1Turnstiles.recordsPerMin} rec/min
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Roundtrip Latency:</span>
                        <span className="font-mono text-emerald-400">
                          {ingestionStatus.tier1Turnstiles.latencyMs} ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">
                      Sample Ingested JSON Packet
                    </span>
                    <pre className="bg-black/60 p-2 rounded text-[10px] font-mono text-blue-300 overflow-x-auto">
                      {ingestionStatus.tier1Turnstiles.lastPayload}
                    </pre>
                  </div>
                </div>

                {/* Tier 2: GTFS-Realtime Transit */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                        TIER 2
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ingestionStatus.tier2TransitGTFS.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2">
                      GTFS-Realtime (Transit & Metro)
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      {ingestionStatus.tier2TransitGTFS.source}
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span>Active Line Feeds:</span>
                        <span className="font-mono font-bold text-white">3 Lines Active</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Update Cadence:</span>
                        <span className="font-mono text-purple-400">
                          {ingestionStatus.tier2TransitGTFS.updateIntervalSec} sec Protobuf
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Pending Influx Surge:</span>
                        <span className="font-mono text-amber-400 font-bold">
                          +{ingestionStatus.tier2TransitGTFS.impendingSurgeCount} pax
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Protocol:</span>
                        <span className="font-mono text-white/70">Protobuf over HTTP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">
                      Sample Ingested GTFS-RT Payload
                    </span>
                    <pre className="bg-black/60 p-2 rounded text-[10px] font-mono text-purple-300 overflow-x-auto">
                      {ingestionStatus.tier2TransitGTFS.lastPayload}
                    </pre>
                  </div>
                </div>

                {/* Tier 3: Partner Web Portal */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                        TIER 3
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ingestionStatus.tier3PartnerPortal.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2">
                      Partner Web Portal (Buffer Capacity)
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      {ingestionStatus.tier3PartnerPortal.source}
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span>Total Buffer Capacity:</span>
                        <span className="font-mono font-bold text-white">
                          {ingestionStatus.tier3PartnerPortal.bufferAllocatedTotal} pax
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Currently Absorbed:</span>
                        <span className="font-mono text-emerald-400">
                          {ingestionStatus.tier3PartnerPortal.activeHoldings} pax
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Mitigation Reserve:</span>
                        <span className="font-mono text-white">
                          {((1 - partnerBufferLevel) * 100).toFixed(0)}% available
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Sync Channel:</span>
                        <span className="font-mono text-white/70">Secure WebSocket</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">
                      Latest Marshal Buffer Override
                    </span>
                    <pre className="bg-black/60 p-2 rounded text-[10px] font-mono text-amber-300 overflow-x-auto">
                      {ingestionStatus.tier3PartnerPortal.lastPayload}
                    </pre>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: EDGE-NATIVE VISION TELEMETRY (YOLOv8) */}
          {activeTab === 'vision' && (
            <div className="space-y-6">
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Edge-Native Vision Telemetry (YOLOv8 + ByteTrack)
                    </h3>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Inference executes strictly on local on-premise hardware (Jetson AGX Orin & Edge TPUs). 
                    Transmits <strong className="text-white">only lightweight numerical JSON packets</strong> with <strong className="text-emerald-400">zero raw video streaming</strong>.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap">
                  ZERO VIDEO EGRESS
                </span>
              </div>

              {/* Edge Spec Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-white/50 font-bold uppercase block">
                    Local Hardware
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    NVIDIA Jetson AGX Orin
                  </span>
                  <span className="text-[10px] text-white/40">24 On-Premise Rigs</span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-white/50 font-bold uppercase block">
                    Tracking Model
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    YOLOv8x + ByteTrack
                  </span>
                  <span className="text-[10px] text-emerald-400">30.0 FPS real-time</span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-white/50 font-bold uppercase block">
                    Bandwidth Used
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">
                    3.8 KB/sec (Venue Total)
                  </span>
                  <span className="text-[10px] text-white/40">vs 120 MB/s raw video</span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-white/50 font-bold uppercase block">
                    Privacy Guarantee
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    100% PII Anonymized
                  </span>
                  <span className="text-[10px] text-emerald-400">DPDP & GDPR Compliant</span>
                </div>
              </div>

              {/* Live JSON Packet Feed Stream */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Transmitted Numerical JSON Stream (Zero Video Streaming)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    Tick #{packetTick}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {edgePackets.map((pkt) => (
                    <div
                      key={pkt.id}
                      className="bg-[#11131a] border border-white/10 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {pkt.zone}
                        </span>
                        <span className="text-xs text-white/60 font-mono">
                          node: {pkt.nodeId}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {pkt.timestamp}
                        </span>
                      </div>

                      {/* Explicit JSON Packet format as requested in prompt */}
                      <div className="bg-black/80 px-3 py-1 rounded-lg border border-white/5 font-mono text-xs text-emerald-300">
                        {`{ "zone": "${pkt.zone}", "count": ${pkt.count}, "inflow": ${pkt.inflow} }`}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-white/60">
                        <span>FPS: {pkt.fps}</span>
                        <span>Latency: {pkt.latencyMs}ms</span>
                        <span className="text-emerald-400">{pkt.packetSizeKb} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CONFIGURABLE RISK THRESHOLDS & WEIGHTS */}
          {activeTab === 'thresholds' && (
            <div className="space-y-6">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Configurable Risk Status Boundaries
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Tune the operational status cutoffs. The ZPI engine recalculates all zones immediately to determine single operational triggers.
                  </p>
                </div>
                <button
                  id="reset-calibration-btn"
                  onClick={handleResetCalibration}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
              </div>

              {/* Threshold Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Low -> Moderate Boundary */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Low ➔ Moderate Cutoff
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {thresholds.lowMax.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="slider-threshold-low"
                    type="range"
                    min="0.20"
                    max="0.55"
                    step="0.05"
                    value={thresholds.lowMax}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        lowMax: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full mt-3 accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Low: 0.00 – {thresholds.lowMax.toFixed(2)}</span>
                    <span>Mod starts at {thresholds.lowMax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Moderate -> High Boundary */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      Moderate ➔ High Cutoff
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {thresholds.moderateMax.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="slider-threshold-mod"
                    type="range"
                    min="0.45"
                    max="0.75"
                    step="0.05"
                    value={thresholds.moderateMax}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        moderateMax: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full mt-3 accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>Mod: {thresholds.lowMax.toFixed(2)} – {thresholds.moderateMax.toFixed(2)}</span>
                    <span>High starts at {thresholds.moderateMax.toFixed(2)}</span>
                  </div>
                </div>

                {/* High -> Critical Boundary */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase">
                      High ➔ Critical Cutoff
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {thresholds.highMax.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="slider-threshold-high"
                    type="range"
                    min="0.65"
                    max="0.95"
                    step="0.05"
                    value={thresholds.highMax}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        highMax: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full mt-3 accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>High: {thresholds.moderateMax.toFixed(2)} – {thresholds.highMax.toFixed(2)}</span>
                    <span>Critical: {thresholds.highMax.toFixed(2)} – 1.00</span>
                  </div>
                </div>

              </div>

              {/* Mathematical Weights Sliders */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  Composite Fusion Weights (w₁ to w₄)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* w1 Density */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">w₁: Density Ratio</span>
                      <span className="font-mono font-bold text-blue-400">{weights.densityWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.70"
                      step="0.05"
                      value={weights.densityWeight}
                      onChange={(e) => setWeights((prev) => ({ ...prev, densityWeight: parseFloat(e.target.value) }))}
                      className="w-full mt-2 accent-blue-500"
                    />
                  </div>

                  {/* w2 Flow */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">w₂: Net Flow Velocity</span>
                      <span className="font-mono font-bold text-blue-400">{weights.netFlowWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.05"
                      value={weights.netFlowWeight}
                      onChange={(e) => setWeights((prev) => ({ ...prev, netFlowWeight: parseFloat(e.target.value) }))}
                      className="w-full mt-2 accent-blue-500"
                    />
                  </div>

                  {/* w3 Transit */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">w₃: Transit Influx</span>
                      <span className="font-mono font-bold text-blue-400">{weights.transitWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.50"
                      step="0.05"
                      value={weights.transitWeight}
                      onChange={(e) => setWeights((prev) => ({ ...prev, transitWeight: parseFloat(e.target.value) }))}
                      className="w-full mt-2 accent-blue-500"
                    />
                  </div>

                  {/* w4 Mitigation Damping */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">w₄: Mitigation Damping</span>
                      <span className="font-mono font-bold text-emerald-400">{weights.mitigationWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.40"
                      step="0.05"
                      value={weights.mitigationWeight}
                      onChange={(e) => setWeights((prev) => ({ ...prev, mitigationWeight: parseFloat(e.target.value) }))}
                      className="w-full mt-2 accent-emerald-500"
                    />
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-4 sm:px-6 py-3 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Operational Role: Transforming isolated multi-modal sensor inputs into single operational triggers</span>
          </div>
          <span className="font-mono text-[11px] text-white/40">
            EventFlow AI • Mumbai MegaFest Command Core
          </span>
        </div>

      </div>
    </div>
  );
};
