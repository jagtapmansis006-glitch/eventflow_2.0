import React from 'react';
import {
  Calendar,
  MapPin,
  HelpCircle,
  Sparkles,
  LogOut,
  Shield,
  PhoneCall,
  Droplets,
  HeartPulse,
  Info,
  ExternalLink
} from 'lucide-react';

interface AttendeeMoreScreenProps {
  onExitAttendeeView: () => void;
}

export const AttendeeMoreScreen: React.FC<AttendeeMoreScreenProps> = ({
  onExitAttendeeView,
}) => {
  return (
    <div
      id="attendee-more-screen"
      className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4 pt-3 pb-24 text-white animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="border-b border-white/10 pb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
          FESTIVAL SERVICES & ASSISTANCE
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">
          More
        </h1>
      </div>

      {/* 1. Event Information */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Event Information
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/60">Event</span>
            <span className="font-semibold text-white">Mumbai MegaFest 2026</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/60">Location</span>
            <span className="font-semibold text-white">BKC Arena & Convention Campus</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/60">Gates Open</span>
            <span className="font-semibold text-white">16:00 IST</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-white/60">Headliner Performance</span>
            <span className="font-semibold text-amber-300">21:00 IST (Main Arena)</span>
          </div>
        </div>
      </section>

      {/* 2. Venue Information & Amenities */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Venue Amenities
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Droplets className="w-3.5 h-3.5" />
              <span>Free Water</span>
            </div>
            <span className="text-[11px] text-white/50">Stations at Gate 3 & East Lawn</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>First Aid Tents</span>
            </div>
            <span className="text-[11px] text-white/50">Staffed at Arenas A, C & Gate 3</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Safety Marshals</span>
            </div>
            <span className="text-[11px] text-white/50">Stationed along East Corridor</span>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Lost & Found</span>
            </div>
            <span className="text-[11px] text-white/50">Zone D West Gate Village</span>
          </div>
        </div>
      </section>

      {/* 3. EventFlow Information */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            About EventFlow AI
          </h2>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          EventFlow AI uses live anonymized crowd movement telemetry to forecast chokepoints 15-30 minutes ahead, dynamically recommending the fastest, safest gates and routes to keep everyone moving smoothly.
        </p>
      </section>

      {/* 4. Help & Support */}
      <section className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Festival Help & Safety
          </h2>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          In an emergency, follow illuminated safety marshals or alert festival security immediately. Express accessibility lanes are operating at Gate 3 & Gate 4.
        </p>
      </section>

      {/* 5. Exit Attendee Mode (Prominent) */}
      <div className="pt-2">
        <button
          id="btn-more-exit-attendee-view"
          onClick={onExitAttendeeView}
          className="w-full py-4 px-4 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-2xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-lg min-h-[48px]"
        >
          <LogOut className="w-4 h-4 text-white/70" />
          <span>Exit Attendee View</span>
        </button>
        <p className="text-center text-[10px] text-white/40 mt-2 font-mono">
          Switches back to EventFlow Command Center (Operator Mode)
        </p>
      </div>
    </div>
  );
};
