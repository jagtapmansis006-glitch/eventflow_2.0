export type ZPIRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface ZPIComponents {
  densityRatio: number; // Occupancy / Capacity (rho)
  netFlowVelocity: number; // (Inflow - Outflow) / MaxRatedFlow (Delta F)
  transitAccumulation: number; // Pending transit arrival surge / absorption cap (T_acc)
  voluntaryMitigation: number; // Buffer reserve capacity ratio (M_cap)
  rawScore: number;
  zpi: number; // Normalized 0.0 - 1.0
  riskLevel: ZPIRiskLevel;
  operationalTrigger?: string;
}

export interface ZPIThresholds {
  lowMax: number; // default 0.40
  moderateMax: number; // default 0.60
  highMax: number; // default 0.80
  criticalMax: number; // default 1.00
}

export interface ZPIWeights {
  densityWeight: number; // w1, default 0.40
  netFlowWeight: number; // w2, default 0.25
  transitWeight: number; // w3, default 0.20
  mitigationWeight: number; // w4, default 0.15 (subtractive damping)
}

export interface EdgeVisionPacket {
  id: string;
  zone: string;
  zoneId: string;
  nodeId: string;
  count: number;
  inflow: number;
  outflow: number;
  fps: number;
  latencyMs: number;
  timestamp: string;
  packetSizeKb: number;
  trackingModel: string;
}

export interface IngestionTierStatus {
  tier1Turnstiles: {
    name: string;
    source: string;
    protocol: string;
    status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    activeGates: number;
    pollIntervalMs: number;
    recordsPerMin: number;
    latencyMs: number;
    lastPayload: string;
  };
  tier2TransitGTFS: {
    name: string;
    source: string;
    protocol: string;
    status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    activeFeeds: string[];
    updateIntervalSec: number;
    impendingSurgeCount: number;
    lastPayload: string;
  };
  tier3PartnerPortal: {
    name: string;
    source: string;
    protocol: string;
    status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    bufferAllocatedTotal: number;
    activeHoldings: number;
    lastOperatorOverride: string;
    lastPayload: string;
  };
}

export interface Zone {
  id: string;
  code: string; // 'A', 'B', etc.
  name: string;
  type: 'arena' | 'station' | 'gate' | 'hospitality' | 'parking' | 'village';
  latitude: number;
  longitude: number;
  pressure: number; // 0 - 100
  projectedPressure: number; // 0 - 100
  criticalInMinutes: number;
  occupancy: number;
  capacity: number;
  inflow: number; // per minute
  outflow: number;
  gateQueueMin: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  description: string;
  recommendedGate?: string;
  forecastPoints: { time: string; pressure: number }[];
  zpiBreakdown?: ZPIComponents;
}

export interface Gate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  queueMin: number;
  capacity: number; // percentage
  status: 'AVAILABLE' | 'MODERATE' | 'CONGESTED';
  flowRate: number; // people / min
}

export interface TransportHub {
  id: string;
  name: string;
  type: 'station' | 'shuttle';
  latitude: number;
  longitude: number;
  loadPercentage: number;
  capacityPerHour: number;
  currentPerHour: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface Hotel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  availableRooms: number;
  totalRooms: number;
  vacancyRate: number; // percentage
  status: 'AVAILABLE' | 'HIGH_DEMAND' | 'FULL';
}

export interface AIAction {
  id: string;
  title: string;
  targetZone: string;
  description: string;
  confidence: number;
  expectedPressureReduction: number;
  queueReductionMin: number;
  whyExplanation: string;
  status: 'recommended' | 'simulated' | 'applied';
  impactText: string;
}

export interface SystemAlert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'CAPACITY' | 'INFO';
  title: string;
  subtitle: string;
  zoneId?: string;
  timestamp: string;
  actionText: string;
}

export interface OptimizerConstraints {
  maxAllowableWalkMeters: number;
  maxShuttleFleet: number;
  maxGateTurnstileTolerance: number; // percentage
  maxBufferCapacity: number; // attendees
  minFeasibilityThreshold: number; // percentage
}

export interface ConstraintAuditCheck {
  name: string;
  status: 'PASSED' | 'WARNING' | 'VIOLATED';
  detail: string;
  limit: string;
  current: string;
}

export interface PrescribedIntervention {
  id: string;
  rank: number;
  title: string;
  category: 'gate_diversion' | 'transit_headway' | 'holding_buffer' | 'multi_agency';
  agencyLever: 'Venue Ingress Gates' | 'Public Transit & Headways' | 'Peripheral Holding Zones' | 'Cross-Agency Joint Policy';
  actionSummary: string;
  targetEntity: string;
  quantitativeDivert: string;
  flowVolumeRate: number; // people / min
  totalAttendeesAffected: number;
  reliefImpact: string;
  estimatedReliefPercent: number;
  walkingDistanceMeters: number;
  shuttlesRequired: number;
  turnstileDemandPerMin: number;
  turnstileCapacityPerMin: number;
  constraintChecks: ConstraintAuditCheck[];
  feasibilityScore: number; // 0 - 100
  mathematicalRationale: string;
  applied: boolean;
}

export interface MILPSolverResult {
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  solveTimeMs: number;
  simplexPivots: number;
  branchBoundNodes: number;
  objectiveCost: number;
  interventions: PrescribedIntervention[];
  solverSummary: string;
  activeConstraintsCount: number;
  feasibleInterventionsCount: number;
}

export type TabType = 'home' | 'map' | 'alerts' | 'actions' | 'more';
export type AttendeeTabType = 'home' | 'map' | 'guidance' | 'alerts' | 'more';
