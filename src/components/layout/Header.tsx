import React from 'react';
import {
  MapPin,
  Shield,
  Siren,
  VolumeX,
  ShieldAlert,
  Compass,
  Users,
  Wrench,
  FileText,
  Clock,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  LogIn,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';

export const Header: React.FC = () => {
  const {
    user,
    activeJourney,
    triggerSos,
    isSirenPlaying,
    toggleSiren,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    deviceView,
    setDeviceView,
    setShowAuthModal,
  } = useSafety();

  const handleQuickSos = () => {
    soundManager.triggerHaptic([50, 100, 50]);
    triggerSos('Top Header Emergency SOS');
  };

  const navLinks = [
    { id: 'dashboard', label: 'Command Hub', icon: Shield },
    { id: 'journey', label: 'Journey Guard', icon: Compass },
    { id: 'map', label: 'Safety Radar', icon: MapPin },
    { id: 'contacts', label: 'Trusted Circle', icon: Users },
    { id: 'tools', label: 'Safety Tools', icon: Wrench },
    { id: 'evidence', label: 'Evidence Vault', icon: FileText },
    { id: 'history', label: 'Audit Trail', icon: Clock },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EF]/95 dark:bg-[#1A0C18]/95 backdrop-blur-2xl border-b border-[#E9DFD2] dark:border-[#E99583]/20 shadow-xs transition-colors select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
              title="SafeSaathi — Return to Command Hub"
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-[#E99583] via-[#C86650] to-[#702E46] shadow-md border border-white/60 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img
                  src="/src/assets/images/safesaathi_app_icon_1792355765489.jpg"
                  alt="SafeSaathi Logo"
                  className="w-full h-full object-cover rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#45263F] dark:text-[#FAF5EF] block leading-tight">
                  SafeSaathi
                </span>
                <span className="text-[11px] font-semibold text-[#62566F] dark:text-[#E99583] block leading-none mt-0.5">
                  Proactive Journey Guard
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, High-Contrast) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/80 dark:bg-[#2C1529]/80 border border-[#E9DFD2] dark:border-[#E99583]/25 shadow-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasJourneyIndicator = item.id === 'journey' && activeJourney;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.triggerHaptic(15);
                    setActiveTab(item.id as typeof activeTab);
                  }}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white shadow-sm'
                      : 'text-[#29252D] dark:text-[#FAF5EF] hover:text-[#702E46] dark:hover:text-[#E99583] hover:bg-[#FAF5EF] dark:hover:bg-[#45263F]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#62566F] dark:text-[#E99583]'}`} />
                  <span className="tracking-wide">{item.label}</span>
                  {hasJourneyIndicator && (
                    <span className="w-2 h-2 rounded-full bg-[#C86650] ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Right Controls & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Dual Web / Mobile View Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl clay-card border border-[#E9DFD2] dark:border-[#E9DFD2]/20 shadow-xs">
              <button
                onClick={() => {
                  soundManager.triggerHaptic(15);
                  setDeviceView('web');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  deviceView === 'web'
                    ? 'bg-[#702E46] text-white shadow-xs'
                    : 'text-[#62566F] dark:text-[#FAF5EF] hover:text-[#702E46]'
                }`}
                title="Full Web Application"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Web</span>
              </button>
              <button
                onClick={() => {
                  soundManager.triggerHaptic(15);
                  setDeviceView('mobile');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  deviceView === 'mobile'
                    ? 'bg-[#702E46] text-white shadow-xs'
                    : 'text-[#62566F] dark:text-[#FAF5EF] hover:text-[#702E46]'
                }`}
                title="Mobile Phone Simulation"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            </div>

            {/* Dark/Light Mood Toggle */}
            <button
              onClick={() => {
                soundManager.triggerHaptic(20);
                setTheme(isDark ? 'light' : 'dark');
              }}
              className="w-10 h-10 rounded-2xl clay-card flex items-center justify-center text-[#29252D] dark:text-[#FAF5EF] shadow-xs hover:scale-105 transition cursor-pointer border border-[#E9DFD2] dark:border-[#E9DFD2]/20"
              title={isDark ? 'Switch to Warm Porcelain Light Mode' : 'Switch to Rich Plum Evening Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#C5A36A]" /> : <Moon className="w-4 h-4 text-[#702E46]" />}
            </button>

            {/* Siren Alarm Trigger */}
            <button
              onClick={toggleSiren}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
                isSirenPlaying
                  ? 'bg-[#BA223C] text-white animate-bounce shadow-md border-rose-300'
                  : 'clay-card text-[#62566F] dark:text-[#FAF5EF] hover:text-[#702E46] border-[#E9DFD2] dark:border-[#E9DFD2]/20'
              }`}
              title={isSirenPlaying ? 'Mute Siren Alarm' : 'Sound Deterrent Siren'}
              aria-label="Toggle Siren"
            >
              {isSirenPlaying ? <Siren className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency SOS Button (Crimson Genuine Action) */}
            <button
              onClick={handleQuickSos}
              className="clay-btn-emergency h-10 px-4 flex items-center gap-1.5 text-xs font-black tracking-wider whitespace-nowrap"
              aria-label="Emergency SOS"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>SOS</span>
            </button>

            {/* User Profile Avatar / Sign In Button */}
            {user.isLoggedIn ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1 rounded-2xl clay-card hover:border-[#C86650] transition shadow-xs group cursor-pointer border border-[#E9DFD2] dark:border-[#E9DFD2]/20"
                title="View Profile & Settings"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#702E46] to-[#45263F] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/30">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0) || 'U'
                  )}
                </div>
                <span className="hidden xl:inline text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] pr-2">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.triggerHaptic(20);
                  setShowAuthModal(true);
                }}
                className="clay-btn-berry h-10 px-3.5 flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
                title="Sign In to Sync Journeys & Evidence"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
