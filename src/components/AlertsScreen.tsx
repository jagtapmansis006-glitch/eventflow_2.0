import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SystemAlert, Zone } from '../types';

interface AlertsScreenProps {
  alerts: SystemAlert[];
  onRespondToAlert: (alert: SystemAlert) => void;
  onSelectZoneById?: (zoneId: string) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onRespondToAlert,
  onSelectZoneById,
}) => {
  return (
    <div
      id="mobile-alerts-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            System Alerts
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Real-time threshold triggers & crowd anomalies
          </p>
        </div>
        <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-xs font-mono font-bold">
          {alerts.filter((a) => a.level === 'CRITICAL').length} Critical
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mt-1">
        {alerts.map((alert) => {
          const isCritical = alert.level === 'CRITICAL';
          const isWarning = alert.level === 'WARNING';
          const isCapacity = alert.level === 'CAPACITY';

          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`p-5 rounded-2xl border backdrop-blur-xl transition shadow-xl ${
                isCritical
                  ? 'bg-black/60 border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
                  : isWarning
                  ? 'bg-black/60 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1.5 ${
                    isCritical
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {alert.level}
                </span>
                <span className="text-xs font-mono text-white/40">
                  {alert.timestamp}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {alert.title}
                </h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {alert.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/40">
                  {isCritical ? 'Immediate action required' : 'Monitoring telemetry'}
                </span>
                <button
                  id={`btn-alert-action-${alert.id}`}
                  onClick={() => onRespondToAlert(alert)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-lg min-h-[42px] ${
                    isCritical
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                      : isWarning
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  <span>{alert.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
