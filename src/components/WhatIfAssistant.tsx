import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Zap,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Zone, Gate, TransportHub, AIAction } from '../types';

interface WhatIfAssistantProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  onSimulate?: (actionId?: string) => void;
  onOpenMap?: () => void;
  isAttendeeMode?: boolean;
  onSelectRecommendedGate?: (gateName: string) => void;
}

interface WhatIfResult {
  recommendation: string;
  recommendedGate: string;
  reason: string;
  confidence: number;
  routeAdvice: string;
  impactSummary: string;
  actionIdToSimulate?: string;
  status: 'optimal' | 'caution' | 'warning';
}

export const WhatIfAssistant: React.FC<WhatIfAssistantProps> = ({
  zones,
  gates,
  transports,
  onSimulate,
  onOpenMap,
  isAttendeeMode = false,
  onSelectRecommendedGate,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('Which gate should I use?');
  const [customInput, setCustomInput] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('Which gate should I use?');

  const suggestedQuestions = [
    'Which gate should I use?',
    'Should I use Gate 3?',
    'Should I wait?',
    'Is another route better?',
    'Is it safe to enter Zone A?',
    'What happens if I enter now?',
  ];

  const zoneA = zones.find((z) => z.id === 'zone-a') || zones[0];
  const gate1 = gates.find((g) => g.id === 'gate-1') || gates[0];
  const gate2 = gates.find((g) => g.id === 'gate-2') || gates[1] || gates[0];
  const gate3 = gates.find((g) => g.id === 'gate-3') || gates[2] || gates[0];
  const gate4 = gates.find((g) => g.id === 'gate-4') || gates[3] || gates[0];
  const station = transports.find((t) => t.type === 'station') || transports[0];

  // Dynamically evaluate what-if query based on current event state
  const result = useMemo<WhatIfResult>(() => {
    const q = activeQuery.toLowerCase();

    // 1. Determine optimal gate based on current live queue and capacity
    const sortedGates = [...gates].sort((a, b) => {
      // Balance queue length and capacity
      const scoreA = a.queueMin * 1.5 + a.capacity * 0.5;
      const scoreB = b.queueMin * 1.5 + b.capacity * 0.5;
      return scoreA - scoreB;
    });
    const bestGate = sortedGates[0] || gate3;
    const isGate3Optimal = bestGate.id === gate3.id;

    // Deterministic confidence score calculation:
    // Factors: queue delta between worst and best gate, spare capacity, zone stability
    const queueDelta = Math.max(0, gate1.queueMin - bestGate.queueMin);
    const capacityScore = Math.max(0, 100 - bestGate.capacity);
    const pressurePenalty = zoneA.pressure > 90 ? 2 : 0;
    const computedConfidence = Math.min(
      98,
      Math.max(82, 85 + Math.round(queueDelta * 0.4) + Math.round(capacityScore * 0.05) - pressurePenalty)
    );

    // Context analysis
    if (q.includes('gate 3') || q.includes('use gate 3')) {
      if (gate3.queueMin <= 12 && gate3.capacity < 75) {
        return {
          recommendation: 'Use Gate 3 (South Express)',
          recommendedGate: 'Gate 3',
          reason: `Gate 1 currently has ${gate1.queueMin} min queue pressure (${gate1.capacity}% load). Gate 3 has lower queue pressure (${gate3.queueMin} min) and spare capacity (${gate3.capacity}% load).`,
          confidence: computedConfidence,
          routeAdvice: 'Take South Express Corridor via Avenue 4 (approx. 6 min walk)',
          impactSummary: `Saves ~${Math.max(10, gate1.queueMin - gate3.queueMin)} min vs Gate 1`,
          actionIdToSimulate: 'action-1',
          status: 'optimal',
        };
      } else {
        return {
          recommendation: `Gate 3 is busy (${gate3.queueMin}m). Use ${bestGate.name} instead`,
          recommendedGate: bestGate.name,
          reason: `Gate 3 queue has temporarily expanded to ${gate3.queueMin} min. ${bestGate.name} currently has lowest turnaround (${bestGate.queueMin} min).`,
          confidence: 89,
          routeAdvice: `Follow signs toward ${bestGate.name}`,
          impactSummary: `Quickest clearance: ${bestGate.queueMin} min queue`,
          actionIdToSimulate: 'action-1',
          status: 'caution',
        };
      }
    }

    if (q.includes('which gate') || q.includes('where should i go') || q.includes('best gate')) {
      return {
        recommendation: `Use ${bestGate.name}`,
        recommendedGate: bestGate.name,
        reason: `Gate 1 currently has ${gate1.queueMin} min queue. ${bestGate.name} currently has shortest queue (${bestGate.queueMin} min) and ${bestGate.capacity}% capacity.`,
        confidence: computedConfidence,
        routeAdvice: isGate3Optimal ? 'Use South Express Corridor via Avenue 4' : `Head directly to ${bestGate.name}`,
        impactSummary: `Avoids ${gate1.queueMin} min bottleneck at North Gate`,
        actionIdToSimulate: 'action-1',
        status: 'optimal',
      };
    }

    if (q.includes('wait') || q.includes('should i wait')) {
      if (zoneA.pressure >= 80) {
        return {
          recommendation: 'Do NOT wait at North Concourse — Reroute to Gate 3 now',
          recommendedGate: 'Gate 3',
          reason: `Zone A inflow is high (+${zoneA.inflow}/min). Waiting at Gate 1 will increase queue time from ${gate1.queueMin}m to 35m+. Moving to Gate 3 clears you in ${gate3.queueMin} min.`,
          confidence: 93,
          routeAdvice: 'Depart concourse immediately toward South Gate 3 corridor',
          impactSummary: 'Prevents 20+ minute queue delay',
          actionIdToSimulate: 'action-1',
          status: 'warning',
        };
      } else {
        return {
          recommendation: 'Flow is balanced — Proceed through Gate 3 now',
          recommendedGate: 'Gate 3',
          reason: `Zone A pressure is currently stable at ${zoneA.pressure}%. Gate 3 throughput is high (${gate3.flowRate} people/min) with no wait surges.`,
          confidence: 96,
          routeAdvice: 'Direct entry via Gate 3 South turnstiles',
          impactSummary: 'Immediate entry within 8 min',
          actionIdToSimulate: 'action-1',
          status: 'optimal',
        };
      }
    }

    if (q.includes('route') || q.includes('fastest') || q.includes('another route')) {
      return {
        recommendation: 'Take South Express Corridor via Avenue 4',
        recommendedGate: 'Gate 3',
        reason: `Central Station skywalk is heavily congested (${station.loadPercentage}% transit load). Avenue 4 bypasses commuter choke points directly to Gate 3.`,
        confidence: 94,
        routeAdvice: 'Exit Skywalk at Ramp C → Walk south 350m along Avenue 4',
        impactSummary: '6 min walk time vs 28 min corridor standstill',
        actionIdToSimulate: 'action-1',
        status: 'optimal',
      };
    }

    if (q.includes('safe') || q.includes('zone a') || q.includes('crowd')) {
      if (zoneA.pressure >= 80) {
        return {
          recommendation: 'Caution: Zone A is at Critical Density (Avoid North Entrance)',
          recommendedGate: 'Gate 3',
          reason: `Zone A is at ${zoneA.pressure}% capacity (+${zoneA.inflow}/min inflow). Entry via North Gate 1 is bottlenecked. Enter via Gate 3 South or visit Festival Village first.`,
          confidence: 92,
          routeAdvice: 'Use South Gate 3 express entrance or wait 15 min at Food Village',
          impactSummary: 'Mitigates surge exposure before headline countdown',
          actionIdToSimulate: 'action-1',
          status: 'caution',
        };
      } else {
        return {
          recommendation: 'Zone A is Safe & Normal (Density Stabilized)',
          recommendedGate: 'Gate 3',
          reason: `Zone A crowd density is safely managed at ${zoneA.pressure}% capacity. Gate queues are moving steadily with normal turnaround.`,
          confidence: 95,
          routeAdvice: 'Enter freely via South Gate 3 Express lane',
          impactSummary: 'Normal crowd circulation in effect',
          actionIdToSimulate: 'action-1',
          status: 'optimal',
        };
      }
    }

    // Default catch-all
    return {
      recommendation: `Use ${bestGate.name}`,
      recommendedGate: bestGate.name,
      reason: `Gate 1 currently has higher queue pressure (${gate1.queueMin} min). ${bestGate.name} has lower queue pressure (${bestGate.queueMin} min) and spare capacity.`,
      confidence: computedConfidence,
      routeAdvice: 'Proceed via East/South Corridor for fastest turnaround',
      impactSummary: `${bestGate.queueMin} min queue • ${bestGate.capacity}% capacity`,
      actionIdToSimulate: 'action-1',
      status: 'optimal',
    };
  }, [activeQuery, gates, zones, transports, gate1, gate2, gate3, gate4, zoneA, station]);

  const handleAsk = (questionText: string) => {
    setActiveQuery(questionText);
    setSelectedQuestion(questionText);
    if (onSelectRecommendedGate) {
      onSelectRecommendedGate(result.recommendedGate);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleAsk(customInput.trim());
    setCustomInput('');
  };

  return (
    <div
      id="ai-what-if-container"
      className="w-full bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl flex flex-col gap-4 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">
              AI What-If Assistant
            </h3>
            <span className="text-[10px] text-white/50 mt-0.5 block">
              Predictive crowd decision engine for Mumbai MegaFest
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-600/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
          ● REAL-TIME DATA
        </span>
      </div>

      {/* Suggested Questions Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-white/60">
          Suggested questions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border transition active:scale-95 text-left ${
                activeQuery === q
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input Bar */}
      <form onSubmit={handleCustomSubmit} className="relative flex items-center">
        <input
          id="what-if-custom-input"
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ask EventFlow (e.g. Which gate should I use?)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 pr-10"
        />
        <button
          type="submit"
          aria-label="Ask Question"
          className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition active:scale-90"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Output Response Block */}
      <div
        id="what-if-result-card"
        className="bg-white/5 rounded-2xl border border-white/10 p-4 flex flex-col gap-3 backdrop-blur-md transition-all"
      >
        {/* Active Query Echo */}
        <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/5 pb-2">
          <span className="font-mono flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Query: "{activeQuery}"
          </span>
        </div>

        {/* Recommendation & Confidence */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              AI RECOMMENDATION
            </span>
            <h4 className="text-base font-bold text-white mt-0.5 leading-snug">
              {result.recommendation}
            </h4>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              CONFIDENCE
            </span>
            <div className="flex items-center gap-1 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-mono font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{result.confidence}%</span>
            </div>
            <span className="text-[9px] text-white/40 font-mono mt-0.5">
              High Confidence
            </span>
          </div>
        </div>

        {/* Reason Explanation */}
        <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-xs text-white/80 leading-relaxed">
          <span className="font-bold text-white/90 block mb-1">Reason:</span>
          {result.reason}
        </div>

        {/* Route / Impact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-bold">Best Route</span>
              <span className="text-white/90 font-medium">{result.routeAdvice}</span>
            </div>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-bold">Estimated Benefit</span>
              <span className="text-emerald-300 font-mono font-bold">{result.impactSummary}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Connects to existing simulation flow or map */}
        <div className="flex items-center gap-2 pt-1">
          {onSimulate && (
            <button
              id="btn-what-if-simulate"
              onClick={() => onSimulate(result.actionIdToSimulate || 'action-1')}
              className="flex-1 py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>SIMULATE THIS RECOMMENDATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenMap && (
            <button
              id="btn-what-if-open-map"
              onClick={onOpenMap}
              className="py-3 px-3 bg-white/5 hover:bg-white/10 text-white/90 rounded-xl text-xs font-bold border border-white/10 transition active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>VIEW ROUTE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
