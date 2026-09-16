import React from 'react';
import { Sparkles, Users, ArrowRight, ShieldCheck, X, Compass, CheckCircle2 } from 'lucide-react';

interface AttendeeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsAttendee: () => void;
}

export const AttendeeLoginModal: React.FC<AttendeeLoginModalProps> = ({
  isOpen,
  onClose,
  onContinueAsAttendee,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="attendee-login-card"
        className="relative w-full max-w-sm bg-black/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 overflow-hidden text-white flex flex-col items-center text-center animate-in zoom-in-95"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-white/50 hover:text-white border border-white/10 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand visual badge */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg shadow-blue-500/20">
          <Compass className="w-7 h-7 text-blue-400" />
        </div>

        {/* Title */}
        <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-extrabold">
          EVENTFLOW AI
        </span>
        <span className="text-xs font-semibold text-white/80 mt-0.5">
          Mumbai MegaFest
        </span>
        <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
          ATTENDEE ACCESS
        </h2>
        <p className="text-xs text-white/70 mt-2 max-w-xs leading-relaxed">
          Get live crowd guidance, route recommendations and event updates.
        </p>

        {/* Benefits list */}
        <div className="w-full bg-white/5 rounded-2xl border border-white/10 p-3.5 my-5 text-left flex flex-col gap-2.5 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Recommended Gate 3 (8 min queue)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fastest East Corridor route (6 min walk)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Interactive Ask EventFlow decision assistant</span>
          </div>
        </div>

        {/* Continue as Attendee button */}
        <button
          id="btn-continue-as-attendee"
          onClick={() => {
            onContinueAsAttendee();
            onClose();
          }}
          className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-extrabold tracking-wide uppercase shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>CONTINUE AS ATTENDEE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[10px] text-white/40 mt-3 font-mono">
          Prototype Mode • No password required
        </span>
      </div>
    </div>
  );
};
