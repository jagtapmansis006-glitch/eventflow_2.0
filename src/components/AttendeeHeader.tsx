import React from 'react';
import { Bell, Sparkles, LogOut, Compass } from 'lucide-react';

interface AttendeeHeaderProps {
  onNotificationClick: () => void;
  onExitAttendeeView: () => void;
  unreadAlertCount?: number;
}

export const AttendeeHeader: React.FC<AttendeeHeaderProps> = ({
  onNotificationClick,
  onExitAttendeeView,
  unreadAlertCount = 2,
}) => {
  return (
    <header
      id="attendee-header"
      className="sticky top-0 z-30 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 sm:px-5 py-3 transition-all"
      style={{ minHeight: '68px' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left branding block: Pure attendee focus */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Compass className="w-4 h-4 text-blue-400" />
            </span>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              EventFlow AI
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-semibold text-white/80">
              Mumbai MegaFest
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
              ● LIVE
            </span>
          </div>
        </div>

        {/* Right side: Clean Notifications & Exit Button */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            id="attendee-bell-btn"
            onClick={onNotificationClick}
            className="relative w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95"
            aria-label="View Event Alerts"
            title="Event Alerts"
          >
            <Bell className="w-4 h-4 text-white/80" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
            )}
          </button>

          {/* Exit Attendee View Button */}
          <button
            id="attendee-exit-header-btn"
            onClick={onExitAttendeeView}
            className="h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
            title="Exit Attendee View"
          >
            <LogOut className="w-3.5 h-3.5 text-white/60" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
