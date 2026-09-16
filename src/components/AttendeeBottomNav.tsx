import React from 'react';
import { Home, Map, Compass, Bell, MoreHorizontal } from 'lucide-react';
import { AttendeeTabType } from '../types';

interface AttendeeBottomNavProps {
  currentTab: AttendeeTabType;
  onTabChange: (tab: AttendeeTabType) => void;
  alertBadgeCount?: number;
}

export const AttendeeBottomNav: React.FC<AttendeeBottomNavProps> = ({
  currentTab,
  onTabChange,
  alertBadgeCount = 2,
}) => {
  const navItems: {
    id: AttendeeTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'guidance', label: 'Guidance', icon: Compass },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertBadgeCount },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav
      id="attendee-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-2xl border-t border-white/10 pb-[env(safe-area-inset-bottom,6px)] pt-1 px-2 transition-all"
      style={{ minHeight: '64px' }}
      role="navigation"
      aria-label="Attendee Bottom Navigation"
    >
      <div className="grid grid-cols-5 w-full max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`attendee-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {/* Active top glowing line */}
              {isActive && (
                <span className="absolute -top-1 inset-x-3 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-black text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5 border border-black shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
