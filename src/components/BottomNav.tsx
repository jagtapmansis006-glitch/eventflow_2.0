import React from 'react';
import { Home, Map, Bell, Zap, MoreHorizontal } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  alertCount: number;
  actionCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  alertCount,
  actionCount,
}) => {
  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount, badgeColor: 'bg-rose-500' },
    { id: 'actions', label: 'Actions', icon: Zap, badge: actionCount, badgeColor: 'bg-amber-500' },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,6px)] pt-2 px-2 transition-all md:hidden"
      style={{ minHeight: '64px' }}
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 w-full max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 min-h-[48px] rounded-xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {/* Active pill background indicator */}
              {isActive && (
                <span className="absolute -top-1.5 inset-x-3 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[9px] font-bold text-white rounded-full min-w-[15px] h-[15px] flex items-center justify-center bg-red-600 border border-[#0a0a0c] shadow-sm"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider leading-none ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
