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
  User,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Sparkles,
  Radio,
  Clock,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';

export const Header: React.FC = () => {
  const {
    user,
    currentLocation,
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
    triggerSos('Top Header Emergency Tap');
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
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#1A1024]/90 backdrop-blur-2xl border-b border-[#E8DFF5]/80 dark:border-purple-950/60 shadow-xs transition-colors select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Protective Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer"
              title="SafeSaathi — Return to Command Hub"
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-rose-200 via-purple-200 to-indigo-200 shadow-sm border border-purple-200/60 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img
                  src="/src/assets/images/safesaathi_app_icon_1792355765489.jpg"
                  alt="SafeSaathi Icon"
                  className="w-full h-full object-cover rounded-[14px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#2A1637] dark:text-[#FAF4FE] block">
                  SafeSaathi
                </span>
                <span className="text-[11px] font-medium text-[#7A6588] dark:text-purple-300 block">
                  Autonomous Journey Escort
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Web Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/70 dark:bg-purple-950/40 border border-[#E8DFF5]/70 shadow-xs">
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
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white shadow-sm'
                      : 'text-[#493356] dark:text-purple-200 hover:text-[#6C3A82] dark:hover:text-white hover:bg-purple-50/70 dark:hover:bg-purple-900/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#7A6588] dark:text-purple-300'}`} />
                  <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                  {hasJourneyIndicator && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Dual Web / Mobile View Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl glass-panel shadow-xs border border-[#E8DFF5]/80">
              <button
                onClick={() => {
                  soundManager.triggerHaptic(15);
                  setDeviceView('web');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deviceView === 'web'
                    ? 'bg-[#6C3A82] text-white shadow-xs'
                    : 'text-[#5E486D] dark:text-purple-300 hover:text-[#6C3A82]'
                }`}
                title="Full Web App Mode"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Web</span>
              </button>
              <button
                onClick={() => {
                  soundManager.triggerHaptic(15);
                  setDeviceView('mobile');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-[#6C3A82] text-white shadow-xs'
                    : 'text-[#5E486D] dark:text-purple-300 hover:text-[#6C3A82]'
                }`}
                title="Interactive Mobile App Simulation"
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
              className="w-9 h-9 rounded-2xl glass-panel flex items-center justify-center text-[#493356] dark:text-purple-200 shadow-xs hover:scale-105 transition cursor-pointer border border-[#E8DFF5]/80"
              title={isDark ? 'Switch to Warm Ivory Light Mode' : 'Switch to Evening Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#6C3A82]" />}
            </button>

            {/* Siren Alarm Trigger */}
            <button
              onClick={toggleSiren}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
                isSirenPlaying
                  ? 'bg-rose-500 text-white animate-bounce shadow-md border-rose-400'
                  : 'glass-panel text-[#5E486D] dark:text-purple-200 hover:text-[#6C3A82] border-[#E8DFF5]/80'
              }`}
              title={isSirenPlaying ? 'Mute Siren Alarm' : 'Sound Deterrent Siren'}
              aria-label="Toggle Siren"
            >
              {isSirenPlaying ? <Siren className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency SOS Button (Coral-Crimson Genuine Action) */}
            <button
              onClick={handleQuickSos}
              className="h-9 px-4 rounded-2xl bg-gradient-to-r from-[#DF4B5E] to-[#C82B3E] hover:from-[#E65669] hover:to-[#D23347] text-white text-xs font-black tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-transform cursor-pointer border border-white/30"
              aria-label="Emergency SOS"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>SOS</span>
            </button>

            {/* User Profile Avatar / Sign In Button */}
            {user.isLoggedIn ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1 rounded-2xl glass-panel hover:bg-purple-50/60 dark:hover:bg-purple-900/40 transition shadow-xs group cursor-pointer border border-[#E8DFF5]/80"
                title="View Profile & Cloud Settings"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#6C3A82] to-[#472656] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-purple-300/40">
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
                <span className="hidden xl:inline text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] pr-2">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.triggerHaptic(20);
                  setShowAuthModal(true);
                }}
                className="h-9 px-3.5 rounded-2xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition cursor-pointer"
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
