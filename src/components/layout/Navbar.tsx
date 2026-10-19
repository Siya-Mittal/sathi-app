import React from 'react';
import { Shield, Compass, MapPin, Users, User, Wrench } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';

interface NavItem {
  id: 'dashboard' | 'journey' | 'map' | 'contacts' | 'tools' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Hub', icon: Shield },
  { id: 'journey', label: 'Journey', icon: Compass },
  { id: 'map', label: 'Radar', icon: MapPin },
  { id: 'contacts', label: 'Circle', icon: Users },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Navbar: React.FC<{ forceShow?: boolean }> = ({ forceShow = false }) => {
  const { activeTab, setActiveTab, activeJourney } = useSafety();

  const handleTabClick = (tabId: NavItem['id']) => {
    soundManager.triggerHaptic(20);
    setActiveTab(tabId);
  };

  const containerClass = forceShow
    ? 'absolute bottom-2 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center'
    : 'lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none flex justify-center';

  return (
    <div className={containerClass}>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto w-full max-w-md glass-nav-dock rounded-[28px] p-1.5 shadow-xl border border-[#E9DFD2] dark:border-[#E99583]/30 transition-all duration-300"
      >
        <div className="grid grid-cols-6 items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasJourneyIndicator = item.id === 'journey' && activeJourney;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[48px] rounded-2xl transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white shadow-sm'
                    : 'text-[#29252D] dark:text-[#FAF5EF] hover:text-[#702E46] hover:bg-white/80 dark:hover:bg-[#351A2E]'
                }`}
                aria-label={item.label}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'stroke-[2.5] text-white' : 'stroke-[2] text-[#62566F] dark:text-[#E99583]'
                    }`}
                  />

                  {/* Active journey alert indicator */}
                  {hasJourneyIndicator && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C86650] ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
