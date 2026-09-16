import React, { useState, useRef } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowDown,
  Info,
  Sliders,
  Send,
  CornerDownRight,
  HelpCircle
} from 'lucide-react';
import { Zone, Gate, TransportHub, Hotel, AIAction, AttendeeTabType } from '../types';
import { AttendeeHeader } from './AttendeeHeader';
import { AttendeeBottomNav } from './AttendeeBottomNav';
import { AttendeeMapScreen } from './AttendeeMapScreen';
import { AttendeeGuidanceScreen } from './AttendeeGuidanceScreen';
import { AttendeeAlertsScreen } from './AttendeeAlertsScreen';
import { AttendeeMoreScreen } from './AttendeeMoreScreen';

interface AttendeeDashboardProps {
  zones: Zone[];
  gates: Gate[];
  transports: TransportHub[];
  hotels: Hotel[];
  actions: AIAction[];
  liveTime: string;
  onSwitchToOperator: () => void;
  onSimulateAction?: (actionId: string) => void;
  interventionApplied?: boolean;
}

export const AttendeeDashboard: React.FC<AttendeeDashboardProps> = ({
  zones,
  gates,
  transports,
  hotels,
  actions,
  liveTime,
  onSwitchToOperator,
  onSimulateAction,
  interventionApplied = false,
}) => {
  // Attendee navigation: Home, Map, Guidance, Alerts, More
  const [currentTab, setCurrentTab] = useState<AttendeeTabType>('home');
  // State for dynamic route change simulation (Gate 3 busy -> recommendation becomes Gate 4)
  const [gate3BusySimulated, setGate3BusySimulated] = useState<boolean>(false);

  // Ask EventFlow interactive assistant state
  const [attendeeQuestion, setAttendeeQuestion] = useState<string>('');
  const [activeAnswer, setActiveAnswer] = useState<{
    query: string;
    decision: string;
    explanation: string;
    confidence: number;
    recommendedGate: string;
    queueMin: number;
  } | null>(null);

  const askSectionRef = useRef<HTMLDivElement>(null);

  // Entities from live shared state
  const zoneA = zones.find((z) => z.id === 'zone-a') || zones[0];
  const station = transports.find((t) => t.type === 'station') || transports[0];
  const gate1 = gates.find((g) => g.id === 'gate-1') || gates[0];
  const gate3 = gates.find((g) => g.id === 'gate-3') || gates[2] || gates[0];
  const gate4 = gates.find((g) => g.id === 'gate-4') || gates[3] || gates[0];

  // Dynamic gate recommendation
  const currentRecommendedGate = gate3BusySimulated ? gate4 : gate3;
  const currentConfidence = gate3BusySimulated ? 88 : 94;
  const currentRouteName = gate3BusySimulated ? 'Southwest Connector' : 'East Corridor';
  const currentWalkMinutes = gate3BusySimulated ? 8 : 6;

  // Ask EventFlow Natural Question Handler
  const handleAskEventFlow = (q: string) => {
    const cleanQ = q.trim().toLowerCase();
    setAttendeeQuestion(q);

    if (cleanQ.includes('gate 1') || cleanQ.includes('enter through gate 1')) {
      setActiveAnswer({
        query: q,
        decision: 'Avoid Gate 1.',
        explanation: `Gate 1 currently has severe congestion with a ${gate1.queueMin} min queue. Use ${currentRecommendedGate.name} instead for rapid entry.`,
        confidence: 96,
        recommendedGate: currentRecommendedGate.name,
        queueMin: currentRecommendedGate.queueMin,
      });
    } else if (cleanQ.includes('wait') || cleanQ.includes('should i wait')) {
      setActiveAnswer({
        query: q,
        decision: 'Do not wait—enter now via Gate 3.',
        explanation: 'Headliner starts at 21:00. Main Arena pressure will surge from 78% to 94% within 20 minutes.',
        confidence: 92,
        recommendedGate: currentRecommendedGate.name,
        queueMin: currentRecommendedGate.queueMin,
      });
    } else if (cleanQ.includes('fastest') || cleanQ.includes('route')) {
      setActiveAnswer({
        query: q,
        decision: `Take ${currentRouteName}.`,
        explanation: `Follow Avenue 4 to ${currentRecommendedGate.name}. Estimated walk is only ${currentWalkMinutes} min, completely bypassing central station transit crowds.`,
        confidence: 94,
        recommendedGate: currentRecommendedGate.name,
        queueMin: currentRecommendedGate.queueMin,
      });
    } else if (cleanQ.includes('is gate 3 crowded') || cleanQ.includes('crowded')) {
      if (gate3BusySimulated) {
        setActiveAnswer({
          query: q,
          decision: 'Yes, Gate 3 is becoming busy.',
          explanation: 'Queue wait has increased to 19 minutes. Reroute to Gate 4 (Southwest) where queue is only 11 minutes.',
          confidence: 88,
          recommendedGate: 'Gate 4 (Southwest)',
          queueMin: 11,
        });
      } else {
        setActiveAnswer({
          query: q,
          decision: 'No, Gate 3 has low wait times.',
          explanation: `Gate 3 queue is currently only ${gate3.queueMin} minutes with 6 turnstiles in express fast-track mode.`,
          confidence: 94,
          recommendedGate: 'Gate 3 (South)',
          queueMin: gate3.queueMin,
        });
      }
    } else {
      // Default: "Which gate should I use?" or general "What should I do?"
      if (gate3BusySimulated) {
        setActiveAnswer({
          query: q || 'Which gate should I use?',
          decision: 'Use Gate 4.',
          explanation: 'Gate 3 is experiencing a temporary surge. Gate 4 has open turnstiles and only 11 min wait.',
          confidence: 88,
          recommendedGate: 'Gate 4 (Southwest)',
          queueMin: 11,
        });
      } else {
        setActiveAnswer({
          query: q || 'Which gate should I use?',
          decision: 'Use Gate 3.',
          explanation: 'It currently has the shortest queue and available capacity. Takes approximately 6 min via East Corridor.',
          confidence: 94,
          recommendedGate: 'Gate 3 (South)',
          queueMin: gate3.queueMin,
        });
      }
    }
  };

  const scrollToAsk = () => {
    setCurrentTab('home');
    setTimeout(() => {
      askSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div
      id="attendee-view-wrapper"
      className="relative w-full min-h-screen bg-[#07090e] text-white flex flex-col justify-between overflow-x-hidden selection:bg-blue-500 selection:text-white"
    >
      {/* 1. Attendee Header */}
      <AttendeeHeader
        onNotificationClick={() => setCurrentTab('alerts')}
        onExitAttendeeView={onSwitchToOperator}
        unreadAlertCount={gate3BusySimulated ? 3 : 2}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1">
        {/* ======================================================== */}
        {/* TAB 1: ATTENDEE HOME DASHBOARD */}
        {/* ======================================================== */}
        {currentTab === 'home' && (
          <div
            id="attendee-home-screen"
            className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white animate-in fade-in duration-200"
          >
            {/* Top Greeting */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Hi, Attendee
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  Live personal guidance for Mumbai MegaFest
                </p>
              </div>

              {/* Surge Simulation quick toggle for test verification */}
              <button
                id="btn-quick-toggle-surge"
                onClick={() => setGate3BusySimulated((prev) => !prev)}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl border transition active:scale-95 flex items-center gap-1 ${
                  gate3BusySimulated
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                }`}
                title="Toggle surge test to see recommendation change to Gate 4"
              >
                <Sliders className="w-3 h-3" />
                <span>{gate3BusySimulated ? 'SURGE: ON' : 'TEST SURGE'}</span>
              </button>
            </div>

            {/* DYNAMIC ALERT BANNER: ROUTE UPDATE (When Gate 3 is busy) */}
            {gate3BusySimulated && (
              <section
                id="banner-route-update-alert"
                className="bg-black/70 backdrop-blur-xl rounded-2xl border border-amber-500/40 p-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col gap-2.5 animate-in slide-in-from-top duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    ⚠️ ROUTE UPDATE
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    88% confidence
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gate 3 is becoming crowded.
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                    New recommendation: <strong>Use Gate 4</strong> (Southwest). Queue: 11 min.
                  </p>
                </div>

                <button
                  id="btn-banner-view-new-route"
                  onClick={() => setCurrentTab('guidance')}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md min-h-[44px]"
                >
                  <span>VIEW NEW ROUTE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>
            )}

            {/* 1. PRIMARY CARD: YOUR LIVE GUIDANCE */}
            <section
              id="card-your-live-guidance"
              className="bg-black/60 backdrop-blur-xl rounded-3xl border border-emerald-500/40 p-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  YOUR LIVE GUIDANCE
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentConfidence}% confidence
                </span>
              </div>

              <div>
                <span className="text-[11px] text-white/50 uppercase font-bold tracking-wider block">
                  Recommended Entry
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white tracking-tight">
                      {currentRecommendedGate.name.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    🟢 Available
                  </span>
                </div>
              </div>

              {/* Queue, Capacity & Confidence Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50 uppercase font-medium">Queue</span>
                  <span className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                    {currentRecommendedGate.queueMin} min
                  </span>
                </div>

                <div className="flex flex-col border-x border-white/10">
                  <span className="text-[10px] text-white/50 uppercase font-medium">Capacity</span>
                  <span className="text-lg font-black font-mono text-white mt-0.5">
                    {currentRecommendedGate.capacity}%
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50 uppercase font-medium">Confidence</span>
                  <span className="text-lg font-black font-mono text-blue-400 mt-0.5">
                    {currentConfidence}%
                  </span>
                </div>
              </div>

              {/* Primary Action: [ VIEW ROUTE ] */}
              <button
                id="btn-live-guidance-view-route"
                onClick={() => setCurrentTab('guidance')}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>VIEW ROUTE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>

            {/* 2. YOUR DESTINATION CARD */}
            <section
              id="card-your-destination"
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                  YOUR DESTINATION
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    interventionApplied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {interventionApplied ? '🟢 STABILIZED' : '⚠️ HIGH PRESSURE'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Main Arena
                  </h3>
                  <p className="text-xs text-white/60">
                    Concert bowl & south viewing grounds
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 uppercase block">Current</span>
                    <span className="text-base font-black font-mono text-white">
                      {zoneA.pressure}%
                    </span>
                  </div>
                  <span className="text-white/30">→</span>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 uppercase block">Forecast</span>
                    <span className="text-base font-black font-mono text-red-400">
                      {zoneA.projectedPressure}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. BEST ROUTE CARD */}
            <section
              id="card-best-route"
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  BEST ROUTE
                </span>
                <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Approx. {currentWalkMinutes} min
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {currentRouteName}
                </h3>

                {/* Turn-by-turn path representation */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/80 overflow-x-auto py-1">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap">
                    Current location
                  </span>
                  <span className="text-white/40">↓</span>
                  <span className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 whitespace-nowrap font-semibold">
                    {currentRouteName}
                  </span>
                  <span className="text-white/40">↓</span>
                  <span className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-semibold">
                    {currentRecommendedGate.name}
                  </span>
                  <span className="text-white/40">↓</span>
                  <span className="px-2 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 whitespace-nowrap font-semibold">
                    Main Arena
                  </span>
                </div>
              </div>

              {/* Avoid warning */}
              <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 flex items-start justify-between text-xs">
                <div>
                  <span className="text-red-400 font-bold block">
                    Avoid: Gate 1
                  </span>
                  <span className="text-white/70 text-[11px]">
                    Reason: {gate1.queueMin} min queue bottleneck
                  </span>
                </div>
                <button
                  onClick={() => setCurrentTab('guidance')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 whitespace-nowrap flex items-center gap-1 self-center"
                >
                  <span>VIEW ROUTE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* 4. CROWD STATUS CARD */}
            <section
              id="card-crowd-status"
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/60">
                  CROWD STATUS
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ● Sensor Mesh Live
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/80 font-medium">Main Arena</span>
                  <span className="font-mono font-bold text-red-400 flex items-center gap-1.5">
                    <span>🔴 {zoneA.pressure}%</span>
                    <span className="text-white/30">→</span>
                    <span>{zoneA.projectedPressure}%</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/80 font-medium">Central Station</span>
                  <span className="font-mono font-bold text-amber-400">
                    🟠 {station.loadPercentage}% Load
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/80 font-medium">{currentRecommendedGate.name}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    🟢 {currentRecommendedGate.capacity}% (Available)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-white/80 font-medium">Gate 1</span>
                  <span className="font-mono font-bold text-red-400">
                    🔴 {gate1.queueMin} min queue
                  </span>
                </div>
              </div>
            </section>

            {/* 5. LIVE INSTRUCTION / EVENT UPDATE */}
            <section
              id="card-live-instruction"
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  LIVE INSTRUCTION
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {currentConfidence}% confidence
                </span>
              </div>

              <p className="text-xs text-white/90 leading-relaxed font-medium">
                {gate3BusySimulated
                  ? 'Gate 3 is currently busy. Gate 4 currently has lower queue pressure and available capacity.'
                  : 'Avoid Gate 1 right now. Gate 3 currently has lower queue pressure and available capacity.'}
              </p>

              <div className="mt-1 pt-2 border-t border-white/5 text-[11px] text-white/60">
                <strong className="text-white/80">LIVE EVENT UPDATE: </strong>
                {interventionApplied
                  ? 'Crowd conditions have improved. Main Arena 71%. Recommended entry: Gate 3.'
                  : 'Crowd pressure is increasing near the Main Arena. EventFlow recommends entering through Gate 3.'}
              </div>
            </section>

            {/* 6. BUTTONS: [ OPEN MAP ] & [ ASK EVENTFLOW ] */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="btn-attendee-open-map"
                onClick={() => setCurrentTab('map')}
                className="py-4 px-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px] shadow-lg"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>OPEN MAP</span>
              </button>

              <button
                id="btn-attendee-ask-eventflow"
                onClick={scrollToAsk}
                className="py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ASK EVENTFLOW</span>
              </button>
            </div>

            {/* 7. ASK EVENTFLOW ASSISTANT SECTION */}
            <section
              ref={askSectionRef}
              id="section-ask-eventflow"
              className="bg-black/60 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-5 shadow-2xl flex flex-col gap-3.5 mt-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Ask EventFlow
                    </h3>
                    <span className="text-[10px] text-white/50">
                      Real-time crowd decision assistant
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {currentConfidence}% Confidence
                </span>
              </div>

              {/* Natural question presets matching user requirements */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase text-white/40 font-bold">
                  Quick Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Which gate should I use?',
                    'Is Gate 3 crowded?',
                    'Should I wait?',
                    'Which route is fastest?',
                    'Can I enter through Gate 1?',
                    'What should I do?'
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskEventFlow(q)}
                      className="text-[11px] px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-blue-600/20 text-white/80 hover:text-white border border-white/10 transition active:scale-95 text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural language input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (attendeeQuestion.trim()) {
                    handleAskEventFlow(attendeeQuestion);
                  }
                }}
                className="flex items-center gap-2 mt-1"
              >
                <input
                  type="text"
                  value={attendeeQuestion}
                  onChange={(e) => setAttendeeQuestion(e.target.value)}
                  placeholder="Ask e.g. Which route is fastest?"
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition min-h-[42px]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition active:scale-95 shrink-0 min-h-[42px] flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Answer Card */}
              {activeAnswer && (
                <div
                  id="ask-eventflow-response"
                  className="bg-white/5 rounded-2xl border border-blue-500/30 p-4 flex flex-col gap-2.5 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                      EVENTFLOW AI
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      Confidence: {activeAnswer.confidence}%
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">
                    {activeAnswer.decision}
                  </h4>

                  <p className="text-xs text-white/80 leading-relaxed">
                    {activeAnswer.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {activeAnswer.recommendedGate} • {activeAnswer.queueMin} min queue
                    </span>

                    <button
                      onClick={() => setCurrentTab('guidance')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow-md"
                    >
                      <span>VIEW ROUTE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ATTENDEE MAP */}
        {/* ======================================================== */}
        {currentTab === 'map' && (
          <AttendeeMapScreen
            zones={zones}
            gates={gates}
            transports={transports}
            hotels={hotels}
            onBackToHome={() => setCurrentTab('home')}
            onGetGuidance={() => setCurrentTab('guidance')}
            gate3BusySimulated={gate3BusySimulated}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: ATTENDEE GUIDANCE (Dedicated Screen) */}
        {/* ======================================================== */}
        {currentTab === 'guidance' && (
          <AttendeeGuidanceScreen
            zones={zones}
            gates={gates}
            transports={transports}
            onViewRouteOnMap={() => setCurrentTab('map')}
            onAskEventFlow={scrollToAsk}
            gate3BusySimulated={gate3BusySimulated}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 4: ATTENDEE ALERTS */}
        {/* ======================================================== */}
        {currentTab === 'alerts' && (
          <AttendeeAlertsScreen
            zones={zones}
            gates={gates}
            transports={transports}
            onViewRoute={() => setCurrentTab('guidance')}
            gate3BusySimulated={gate3BusySimulated}
            onToggleGate3Busy={() => setGate3BusySimulated((prev) => !prev)}
            interventionApplied={interventionApplied}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 5: ATTENDEE MORE */}
        {/* ======================================================== */}
        {currentTab === 'more' && (
          <AttendeeMoreScreen
            onExitAttendeeView={onSwitchToOperator}
          />
        )}
      </main>

      {/* 5-Tab Attendee Bottom Navigation (Home, Map, Guidance, Alerts, More) */}
      <AttendeeBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        alertBadgeCount={gate3BusySimulated ? 3 : 2}
      />
    </div>
  );
};
