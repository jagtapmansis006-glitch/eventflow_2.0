import React from 'react';
import { Bell, ShieldAlert, Sparkles, RefreshCw, Users, Compass, Shield } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadAlertCount: number;
  liveTime: string;
  isSimulating: boolean;
  onToggleSimulating?: () => void;
  userMode?: 'operator' | 'attendee';
  onOpenAttendeeAccess?: () => void;
  onSwitchToOperator?: () => void;
  onOpenZPIEngine?: () => void;
  criticalZPI?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onTabChange,
  unreadAlertCount,
  liveTime,
  isSimulating,
  onToggleSimulating,
  userMode = 'operator',
  onOpenAttendeeAccess,
  onSwitchToOperator,
  onOpenZPIEngine,
  criticalZPI = 0.87,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 sm:px-5 py-3 transition-all"
      style={{ minHeight: '68px' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left branding block: Frosted Glass styling with blue-indigo gradient title */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              EventFlow AI
            </span>
            {userMode === 'attendee' && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                ATTENDEE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Mumbai MegaFest • {liveTime} IST
            </span>
            {isSimulating && (
              <span className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] rounded font-mono">
                TELEMETRY ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Right side: Attendee Mode Switcher, Telemetry, and Alerts */}
        <div className="flex items-center gap-2">
          {/* ZPI Engine Launcher Button */}
          {userMode === 'operator' && onOpenZPIEngine && (
            <button
              id="header-zpi-engine-btn"
              onClick={onOpenZPIEngine}
              className="py-1.5 px-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-blue-500/40 hover:border-blue-400 transition active:scale-95 text-xs flex items-center gap-1.5 font-bold shadow-md shadow-blue-500/10 backdrop-blur-md"
              title="Open Multi-Modal Event State Fusion & ZPI Engine"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-mono text-blue-300 uppercase tracking-wider">
                ZPI: <strong className="text-white">{criticalZPI.toFixed(2)}</strong>
              </span>
            </button>
          )}

          {/* Attendee / Operator switch button */}
          {userMode === 'operator' && onOpenAttendeeAccess && (
            <button
              id="header-attendee-mode-btn"
              onClick={onOpenAttendeeAccess}
              className="py-1.5 px-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 transition active:scale-95 text-xs flex items-center gap-1.5 font-bold shadow-md shadow-blue-600/20"
              title="Open Attendee Guidance view"
            >
              <Compass className="w-3.5 h-3.5 text-white" />
              <span className="text-[11px] uppercase tracking-wider">Attendee View</span>
            </button>
          )}

          {userMode === 'attendee' && onSwitchToOperator && (
            <button
              id="header-operator-mode-btn"
              onClick={onSwitchToOperator}
              className="py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition active:scale-95 text-xs flex items-center gap-1.5 font-bold"
              title="Return to Command Center"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px]">Operator</span>
            </button>
          )}

          {onToggleSimulating && (
            <button
              id="header-live-pulse-btn"
              onClick={onToggleSimulating}
              title={isSimulating ? "Pause live telemetry" : "Resume live telemetry"}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition active:scale-95 text-xs flex items-center gap-1.5 backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'text-blue-400 animate-spin' : 'text-white/40'}`} style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline text-[11px] font-medium text-white/80">Live</span>
            </button>
          )}

          <div className="relative">
            <button
              id="header-alerts-btn"
              onClick={() => onTabChange('alerts')}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center transition active:scale-95 backdrop-blur-md"
              aria-label="View alerts"
            >
              <Bell className="w-4.5 h-4.5 text-white/80" />
            </button>
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-[#0a0a0c] shadow-lg shadow-red-600/50">
                {unreadAlertCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

