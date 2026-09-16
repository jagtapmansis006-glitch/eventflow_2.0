/**
 * Multi-Modal Event State Fusion & ZPI Engine
 * Decoupled 3-Tier Ingestion (REST, GTFS-RT, Partner Portal) + Edge-Native YOLOv8 Telemetry
 */

import {
  Zone,
  ZPIComponents,
  ZPIThresholds,
  ZPIWeights,
  ZPIRiskLevel,
  EdgeVisionPacket,
  IngestionTierStatus,
} from '../types';

export const DEFAULT_THRESHOLDS: ZPIThresholds = {
  lowMax: 0.40,
  moderateMax: 0.60,
  highMax: 0.80,
  criticalMax: 1.00,
};

export const DEFAULT_WEIGHTS: ZPIWeights = {
  densityWeight: 0.45,
  netFlowWeight: 0.25,
  transitWeight: 0.20,
  mitigationWeight: 0.15,
};

/**
 * Calculates the Zone Pressure Index (ZPI_z)
 * Unified composite state engine that transforms isolated sensor data into a single operational trigger.
 */
export function computeZPI(
  zone: Zone,
  weights: ZPIWeights = DEFAULT_WEIGHTS,
  thresholds: ZPIThresholds = DEFAULT_THRESHOLDS,
  partnerBufferRatio: number = 0.35, // Tier 3 partner voluntary buffer
  transitSurgeRatio?: number // Tier 2 GTFS surge
): ZPIComponents {
  // 1. Crowd Density Ratio: rho = Occupancy / Capacity
  const rawDensity = zone.capacity > 0 ? zone.occupancy / zone.capacity : 0.5;
  const densityRatio = Math.min(1.4, Math.max(0.0, rawDensity));

  // 2. Net Flow Rate Velocity: Delta F = (Inflow - Outflow) / ReferenceFlow
  const referenceFlow = Math.max(250, zone.inflow, zone.outflow);
  const netPeoplePerMin = zone.inflow - zone.outflow;
  // Normalized into 0.0 - 1.0 (0.5 is equilibrium, >0.5 indicates net accumulation)
  const normalizedNetFlow = Math.min(1.0, Math.max(0.0, 0.5 + (netPeoplePerMin / (referenceFlow * 1.5))));

  // 3. Transit Arrival Accumulation (T_acc): based on zone type and GTFS metro/train lines
  let calculatedTransitAcc = transitSurgeRatio !== undefined ? transitSurgeRatio : 0.3;
  if (transitSurgeRatio === undefined) {
    if (zone.id === 'zone-a') {
      // Main arena receives heavy inflow from Station corridor + Metro Line 3
      calculatedTransitAcc = zone.status === 'CRITICAL' ? 0.84 : 0.42;
    } else if (zone.id === 'zone-b') {
      // Station corridor itself directly receives GTFS train discharge
      calculatedTransitAcc = 0.92;
    } else if (zone.type === 'station') {
      calculatedTransitAcc = 0.78;
    } else if (zone.type === 'gate') {
      calculatedTransitAcc = 0.55;
    } else {
      calculatedTransitAcc = 0.25;
    }
  }

  // 4. Voluntary Mitigation Capacity (M_cap): Tier 3 buffer capacity reserve
  const voluntaryMitigation = Math.min(1.0, Math.max(0.05, partnerBufferRatio));

  // Weighted Composite Fusion Formulation
  // raw = (w1 * rho) + (w2 * Delta F) + (w3 * T_acc) - (w4 * M_cap)
  const positiveComposite =
    (weights.densityWeight * densityRatio) +
    (weights.netFlowWeight * normalizedNetFlow) +
    (weights.transitWeight * calculatedTransitAcc);

  const mitigationDamping = weights.mitigationWeight * voluntaryMitigation;
  
  // Normalization scaling
  const divisor = weights.densityWeight + weights.netFlowWeight + weights.transitWeight;
  const normalizedComposite = divisor > 0 ? (positiveComposite - mitigationDamping) / divisor : 0.5;

  const zpi = Math.min(1.0, Math.max(0.0, Number(normalizedComposite.toFixed(3))));

  // Classify into Configurable Risk Thresholds
  let riskLevel: ZPIRiskLevel = 'LOW';
  let operationalTrigger = 'Nominal status — Standard pedestrian routing maintained';

  if (zpi >= thresholds.highMax) {
    riskLevel = 'CRITICAL';
    operationalTrigger = 'CRITICAL DISPATCH: Force Gate 3 bypass diversion, throttle station concourse turnstiles, mobilize rapid response marshals';
  } else if (zpi >= thresholds.moderateMax) {
    riskLevel = 'HIGH';
    operationalTrigger = 'ELEVATED ALERT: Pre-announce alternate Gate 4/VIP corridors, activate dynamic applet push rerouting';
  } else if (zpi >= thresholds.lowMax) {
    riskLevel = 'MODERATE';
    operationalTrigger = 'ADVISORY: Monitor turnstile ingress, prepare auxiliary buffer holding pens';
  }

  return {
    densityRatio: Number(densityRatio.toFixed(3)),
    netFlowVelocity: Number(normalizedNetFlow.toFixed(3)),
    transitAccumulation: Number(calculatedTransitAcc.toFixed(3)),
    voluntaryMitigation: Number(voluntaryMitigation.toFixed(3)),
    rawScore: Number(normalizedComposite.toFixed(3)),
    zpi,
    riskLevel,
    operationalTrigger,
  };
}

/**
 * Generates sample Edge-Native YOLOv8 lightweight numerical packets
 * Demonstrates local on-premise inference with zero raw video egress
 */
export function generateEdgePackets(): EdgeVisionPacket[] {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  return [
    {
      id: 'pkt-01',
      zone: 'Gate_A',
      zoneId: 'zone-a',
      nodeId: 'jetson-orin-node-01',
      count: 842,
      inflow: 52,
      outflow: 18,
      fps: 29.8,
      latencyMs: 14,
      timestamp: timeStr,
      packetSizeKb: 0.18,
      trackingModel: 'YOLOv8x + ByteTrack',
    },
    {
      id: 'pkt-02',
      zone: 'Concourse_B',
      zoneId: 'zone-b',
      nodeId: 'jetson-orin-node-03',
      count: 1120,
      inflow: 88,
      outflow: 35,
      fps: 30.0,
      latencyMs: 16,
      timestamp: timeStr,
      packetSizeKb: 0.19,
      trackingModel: 'YOLOv8x + ByteTrack',
    },
    {
      id: 'pkt-03',
      zone: 'Plaza_Gate_3',
      zoneId: 'gate-3',
      nodeId: 'edge-tpu-rig-04',
      count: 310,
      inflow: 22,
      outflow: 28,
      fps: 28.5,
      latencyMs: 11,
      timestamp: timeStr,
      packetSizeKb: 0.17,
      trackingModel: 'YOLOv8m + ByteTrack',
    },
    {
      id: 'pkt-04',
      zone: 'Hospitality_East',
      zoneId: 'zone-c',
      nodeId: 'jetson-orin-node-02',
      count: 420,
      inflow: 19,
      outflow: 24,
      fps: 29.9,
      latencyMs: 15,
      timestamp: timeStr,
      packetSizeKb: 0.18,
      trackingModel: 'YOLOv8x + ByteTrack',
    },
  ];
}

/**
 * Current health and packet metrics for the 3-tier Ingestion Gateway
 */
export const INITIAL_INGESTION_STATUS: IngestionTierStatus = {
  tier1Turnstiles: {
    name: 'Tier 1 — Venue Turnstile Ingress REST APIs',
    source: 'Boon Edam & SKIDATA Array Gateway (REST / JSON Poller)',
    protocol: 'HTTPS REST / Mutual TLS',
    status: 'HEALTHY',
    activeGates: 18,
    pollIntervalMs: 500,
    recordsPerMin: 1420,
    latencyMs: 24,
    lastPayload: '{"turnstile_id": "T-04A", "pulse_count": 82, "flow_hz": 1.4, "rejections": 1}',
  },
  tier2TransitGTFS: {
    name: 'Tier 2 — GTFS-Realtime Transit Feeds',
    source: 'Mumbai Metro Line 3 & Western Railway Suburban Feeds',
    protocol: 'Protobuf over HTTP / GTFS-RT v2.0',
    status: 'HEALTHY',
    activeFeeds: ['MMRCL Line 3 Bandra Station', 'Western Railway BKC Shuttle Feeder', 'BEST Rapid Bus'],
    updateIntervalSec: 10,
    impendingSurgeCount: 2450,
    lastPayload: '{"entity": [{"trip_update": {"trip_id": "WR-901", "delay": 0}, "vehicle": {"occupancy": "CRUSH_CAPACITY"}}]}',
  },
  tier3PartnerPortal: {
    name: 'Tier 3 — Partner Web Portal Buffer Allocation',
    source: 'Hospitality & Security Holding Marshals Manual Sync',
    protocol: 'WebSocket / Partner Dispatch Portal',
    status: 'HEALTHY',
    bufferAllocatedTotal: 4500,
    activeHoldings: 1850,
    lastOperatorOverride: 'Zone A North Buffer Pen unlocked for 1,200 overflow',
    lastPayload: '{"marshal_id": "OP-BKC-7", "holding_zone": "PEN_A_NORTH", "open_status": true, "headcount": 680}',
  },
};
