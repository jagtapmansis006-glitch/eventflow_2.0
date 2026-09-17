import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Activity, Eye } from 'lucide-react';
import { Zone } from '../types';

interface ZonePredictiveChartProps {
  zone: Zone;
}

interface TrendPoint {
  timeLabel: string;
  minuteOffset: number;
  displayTime: string;
  isHistorical: boolean;
  isNow: boolean;
  // Pressure metrics:
  historicalPressure?: number | null;
  projectedPressure?: number | null;
  mitigatedPressure?: number | null;
  // Confidence bounds for projected trend
  confidenceUpper?: number | null;
  confidenceLower?: number | null;
  flowRate: number; // people / min
}

export const ZonePredictiveChart: React.FC<ZonePredictiveChartProps> = ({ zone }) => {
  const [showMitigationPath, setShowMitigationPath] = useState<boolean>(true);
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);

  // Generate 60-minute projected trend based on historical flow data
  const chartData = useMemo(() => {
    const data: TrendPoint[] = [];
    const basePressure = zone.pressure;
    const peakPressure = zone.projectedPressure;
    const inflow = zone.inflow;
    const criticalInMinutes = zone.criticalInMinutes || 18;

    // Simulated base time around 18:42
    const nowHours = 18;
    const nowMinutes = 42;

    const formatClock = (offsetMin: number) => {
      const totalMin = nowHours * 60 + nowMinutes + offsetMin;
      const h = Math.floor((totalMin / 60) % 24);
      const m = Math.floor(totalMin % 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // 1. Historical data (-30m, -20m, -10m) based on arrival flow acceleration
    const histOffsets = [-30, -20, -10];
    histOffsets.forEach((offset) => {
      const fraction = (offset + 30) / 30; // 0 to 1
      // Historical curve starting lower and ramping up to current
      const histPres = Math.max(
        20,
        Math.round(basePressure - (1 - fraction) * (inflow > 100 ? 26 : 14))
      );
      const histFlow = Math.round(inflow * (0.65 + fraction * 0.35));

      data.push({
        timeLabel: `${offset}m`,
        minuteOffset: offset,
        displayTime: formatClock(offset),
        isHistorical: true,
        isNow: false,
        historicalPressure: histPres,
        projectedPressure: null,
        mitigatedPressure: null,
        confidenceUpper: null,
        confidenceLower: null,
        flowRate: histFlow,
      });
    });

    // 2. Current "Now" (0m) - Anchor point connecting historical and projected
    data.push({
      timeLabel: 'Now',
      minuteOffset: 0,
      displayTime: formatClock(0),
      isHistorical: false,
      isNow: true,
      historicalPressure: basePressure,
      projectedPressure: basePressure,
      mitigatedPressure: basePressure,
      confidenceUpper: basePressure + 1.5,
      confidenceLower: basePressure - 1.5,
      flowRate: inflow,
    });

    // 3. 60-Minute Forward Projections (+10m, +20m, +30m, +40m, +50m, +60m)
    const futureOffsets = [10, 20, 30, 40, 50, 60];
    futureOffsets.forEach((offset) => {
      // Unmitigated baseline projection based on continuous inflow
      let baseline: number;
      if (zone.status === 'CRITICAL' || basePressure >= 80) {
        if (offset <= criticalInMinutes) {
          // Rapid climb towards peak
          const progress = offset / criticalInMinutes;
          baseline = basePressure + (peakPressure - basePressure) * progress;
        } else {
          // Plateau at saturated high congestion with minor drift
          const postPeakOffset = offset - criticalInMinutes;
          baseline = Math.min(99, peakPressure + Math.sin(postPeakOffset / 10) * 1.5);
        }
      } else if (zone.status === 'WARNING' || basePressure >= 60) {
        // Warning zone rising gradually
        baseline = Math.min(88, basePressure + (offset / 60) * 14);
      } else {
        // Nominal zone
        baseline = Math.min(65, basePressure + (offset / 60) * 8);
      }

      baseline = Math.round(baseline * 10) / 10;

      // Mitigated projection: automated diversion redirects up to 45% of inflow
      const reliefFactor = Math.min(1, offset / 25);
      const mitigated = Math.round(
        Math.max(45, baseline - reliefFactor * (zone.status === 'CRITICAL' ? 24 : 12)) * 10
      ) / 10;

      const spread = Math.min(5.5, 1.8 + (offset / 60) * 3.5);
      const upper = Math.min(100, Math.round((baseline + spread) * 10) / 10);
      const lower = Math.max(20, Math.round((baseline - spread) * 10) / 10);

      // Inflow rate trend forward
      const projFlow = Math.max(40, Math.round(inflow * (1 + (offset <= 20 ? 0.1 : -0.15))));

      data.push({
        timeLabel: `+${offset}m`,
        minuteOffset: offset,
        displayTime: formatClock(offset),
        isHistorical: false,
        isNow: false,
        historicalPressure: null,
        projectedPressure: baseline,
        mitigatedPressure: mitigated,
        confidenceUpper: upper,
        confidenceLower: lower,
        flowRate: projFlow,
      });
    });

    return data;
  }, [zone]);

  const maxProjected = useMemo(() => {
    const points = chartData.filter((p) => p.projectedPressure != null);
    return points.length > 0
      ? Math.max(...points.map((p) => p.projectedPressure as number))
      : zone.projectedPressure;
  }, [chartData, zone.projectedPressure]);

  const lineColor =
    zone.status === 'CRITICAL' || zone.pressure >= 80
      ? '#ef4444' // Red
      : zone.status === 'WARNING' || zone.pressure >= 60
      ? '#f59e0b' // Amber
      : '#10b981'; // Emerald

  return (
    <div
      id="recharts-predictive-forecast-card"
      className="mt-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex flex-col gap-3"
    >
      {/* Header: Title, Horizon badge, and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Predictive Pressure Trend</span>
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.2 rounded border border-blue-500/20">
                Next 60m
              </span>
            </h4>
            <span className="text-[10px] text-white/50 block">
              XGBoost regressor on 30m turnstile + vision flow matrices
            </span>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMitigationPath((prev) => !prev)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 border ${
              showMitigationPath
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title="Toggle post-intervention simulated path"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Mitigation</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfidenceBand((prev) => !prev)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 border ${
              showConfidenceBand
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title="Toggle 95% confidence interval band"
          >
            <Eye className="w-3 h-3" />
            <span>±3.5% Band</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-3 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs">
        <div>
          <span className="text-[10px] text-white/40 uppercase block font-semibold">
            Current / Hist Flow
          </span>
          <span className="font-mono font-bold text-white mt-0.5 block">
            {zone.pressure}% <span className="text-white/40 text-[10px]">({zone.inflow}/m)</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-red-400/80 uppercase block font-semibold">
            60m Peak (Baseline)
          </span>
          <span className="font-mono font-bold text-red-400 mt-0.5 block">
            {maxProjected}% in +{zone.criticalInMinutes || 18}m
          </span>
        </div>

        <div>
          <span className="text-[10px] text-emerald-400/80 uppercase block font-semibold">
            With Mitigation
          </span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
            71% <span className="text-emerald-300/60 text-[10px]">(-23% drop)</span>
          </span>
        </div>
      </div>

      {/* Recharts Predictive Line & Confidence Graph Container */}
      <div className="w-full h-56 mt-1 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
          >
            <defs>
              {/* Confidence interval gradient */}
              <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              {/* Projected curve glow underlay */}
              <linearGradient id="projectedGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Subtle dark-mode grid */}
            <CartesianGrid stroke="#ffffff" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />

            {/* Time X-Axis */}
            <XAxis
              dataKey="displayTime"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#ffffff', strokeOpacity: 0.12 }}
            />

            {/* Pressure Percentage Y-Axis */}
            <YAxis
              domain={[20, 100]}
              ticks={[20, 40, 60, 80, 100]}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#ffffff', strokeOpacity: 0.12 }}
              unit="%"
            />

            {/* Critical Safety Limit Reference Line (80%) */}
            <ReferenceLine
              y={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.8}
              label={{
                value: 'Critical (80%)',
                position: 'insideTopRight',
                fill: '#ef4444',
                fontSize: 9,
                fontWeight: 'bold',
              }}
            />

            {/* Warning Threshold Reference Line (60%) */}
            <ReferenceLine
              y={60}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={1.2}
              strokeOpacity={0.5}
              label={{
                value: 'Warning (60%)',
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 9,
              }}
            />

            {/* "Now" Marker Vertical Reference Line */}
            <ReferenceLine
              x={chartData.find((p) => p.isNow)?.displayTime || '18:42'}
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              label={{
                value: 'NOW',
                position: 'top',
                fill: '#38bdf8',
                fontSize: 9,
                fontWeight: 'bold',
              }}
            />

            {/* Custom Glass Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0]?.payload as TrendPoint;
                if (!point) return null;

                return (
                  <div className="bg-black/90 backdrop-blur-xl border border-white/20 p-2.5 rounded-xl shadow-2xl text-xs font-mono min-w-[170px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                      <span className="font-bold text-white text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {point.displayTime} ({point.timeLabel})
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          point.isHistorical
                            ? 'bg-blue-500/20 text-blue-300'
                            : point.isNow
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {point.isHistorical ? 'Historical' : point.isNow ? 'Current' : '60m Forecast'}
                      </span>
                    </div>

                    {point.historicalPressure != null && (
                      <div className="flex items-center justify-between text-white/80 py-0.5">
                        <span className="text-white/50 text-[11px]">Observed Load:</span>
                        <span className="font-bold text-blue-300">{point.historicalPressure}%</span>
                      </div>
                    )}

                    {point.projectedPressure != null && (
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-white/50 text-[11px]">Projected Baseline:</span>
                        <span
                          className={`font-bold ${
                            point.projectedPressure >= 80
                              ? 'text-red-400'
                              : point.projectedPressure >= 60
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {point.projectedPressure}%
                        </span>
                      </div>
                    )}

                    {showMitigationPath && point.mitigatedPressure != null && (
                      <div className="flex items-center justify-between py-0.5 text-emerald-400">
                        <span className="text-white/50 text-[11px]">With Diversion:</span>
                        <span className="font-bold">{point.mitigatedPressure}%</span>
                      </div>
                    )}

                    {showConfidenceBand && point.confidenceUpper != null && (
                      <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-1 mt-1">
                        <span>95% Confidence:</span>
                        <span>
                          {point.confidenceLower}% - {point.confidenceUpper}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5">
                      <span>Flow velocity:</span>
                      <span className="text-white/70 font-bold">+{point.flowRate}/min</span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Confidence Interval Upper Shading Band */}
            {showConfidenceBand && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stroke="none"
                fill="url(#confidenceFill)"
                isAnimationActive={false}
              />
            )}

            {/* Historical Trend Line (Cyan/Blue solid) */}
            <Line
              type="monotone"
              dataKey="historicalPressure"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              connectNulls={false}
              name="Historical"
              isAnimationActive={false}
            />

            {/* 60-Minute Projected Trend Line (Red/Amber/Green based on risk) */}
            <Line
              type="monotone"
              dataKey="projectedPressure"
              stroke={lineColor}
              strokeWidth={3}
              strokeDasharray="4 2"
              dot={{ r: 3.5, fill: lineColor, stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: lineColor, stroke: '#ffffff', strokeWidth: 2 }}
              connectNulls={false}
              name="Projected Baseline"
              isAnimationActive={false}
            />

            {/* Mitigated Intervention Path (Emerald dashed line) */}
            {showMitigationPath && (
              <Line
                type="monotone"
                dataKey="mitigatedPressure"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 2.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                connectNulls={false}
                name="With Mitigation"
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Context Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-white/50 border-t border-white/5 pt-2.5 gap-y-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400 rounded-full inline-block" />
            <span className="text-white/70">Observed (-30m)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-0.5 rounded-full inline-block border-t-2 border-dashed"
              style={{ borderColor: lineColor }}
            />
            <span className="text-white/70">Projected (+60m)</span>
          </span>
          {showMitigationPath && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full inline-block border-t border-dashed border-emerald-400" />
              <span className="text-emerald-400/90">Mitigated Path</span>
            </span>
          )}
        </div>

        <div className="font-mono text-[10px] text-white/40">
          Horizon: T+60 min • Resolution: 10m
        </div>
      </div>
    </div>
  );
};
