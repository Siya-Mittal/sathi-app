import React, { useState } from 'react';
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Navigation,
  Compass,
  MapPin,
  Car,
  Footprints,
  Bus,
  Bike,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';
import { createWhatsAppDistressUrl } from '../../utils/geolocation';
import { SafeSaathi3DCorridor } from '../3d/SafeSaathi3DCorridor';

const SCHEDULE_DAYS = [
  { day: 'Mon', num: 20 },
  { day: 'Tue', num: 21 },
  { day: 'Wed', num: 22 },
  { day: 'Thu', num: 23 },
  { day: 'Fri', num: 24 },
  { day: 'Sat', num: 25 },
];

const PRESET_DESTINATIONS = [
  { name: 'Home', address: '48 Maple Avenue, Sector 14', distance: '3.4 km', time: '14 min' },
  { name: 'Office Campus', address: 'Cyber City Tech Tower B', distance: '7.8 km', time: '28 min' },
  { name: 'University Campus', address: 'Gate 2, North University Road', distance: '5.1 km', time: '20 min' },
  { name: 'Central Metro Hub', address: 'Station Exit 4, Main Plaza', distance: '1.8 km', time: '8 min' },
];

export const JourneyScreen: React.FC = () => {
  const {
    activeJourney,
    startJourney,
    endJourney,
    simulateDeviation,
    simulateStop,
    contacts,
    currentLocation,
    settings,
    updateSettings,
    setActiveTab,
    user,
    showToast,
  } = useSafety();

  const [destinationInput, setDestinationInput] = useState<string>('Cyber City Campus Tower B');
  const [selectedTransportMode, setSelectedTransportMode] = useState<'walk' | 'cab' | 'transit' | 'bike'>('cab');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(21);
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    contacts.map((c) => c.id)
  );

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  const handleStart = async () => {
    if (!destinationInput.trim()) {
      showToast('Please specify a destination');
      return;
    }
    soundManager.triggerHaptic(30);
    await startJourney(destinationInput, selectedTransportMode, selectedContactIds);
  };

  const handleCallEscort = () => {
    if (primaryContact) {
      window.location.href = `tel:${primaryContact.phone}`;
    }
  };

  const handleWhatsAppEscort = () => {
    if (primaryContact) {
      const url = createWhatsAppDistressUrl(
        primaryContact.phone,
        user.name,
        currentLocation.lat,
        currentLocation.lng,
        'Live Route Escort'
      );
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none pb-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="h-10 px-4 rounded-2xl clay-card flex items-center gap-1.5 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] hover:border-[#C86650] active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#E99583]/25 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
          <span>Command Hub</span>
        </button>

        <h1 className="text-base lg:text-lg font-extrabold text-[#45263F] dark:text-[#FAF5EF] tracking-tight">
          {activeJourney ? 'Journey Guard Autonomous Monitor' : 'Journey Setup & Route Escort'}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppEscort}
            className="w-10 h-10 rounded-2xl clay-card flex items-center justify-center text-[#702E46] dark:text-[#E99583] hover:border-[#C86650] active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#E99583]/25 cursor-pointer"
            title="Message Primary Contact"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={handleCallEscort}
            className="w-10 h-10 rounded-2xl clay-card flex items-center justify-center text-[#702E46] dark:text-[#E99583] hover:border-[#C86650] active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#E99583]/25 cursor-pointer"
            title="Call Primary Contact"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive 12-Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN (col-span-12 lg:col-span-7) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Destination Setup Card */}
          <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 relative overflow-hidden bg-white dark:bg-[#281324]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#702E46] dark:text-[#E99583] mb-3">
                  <span>Verified Safe Corridor</span>
                  <span aria-hidden="true" className="text-[#C5A36A]">·</span>
                  <span>Autonomous Sentry Active</span>
                </div>

                {activeJourney ? (
                  <div>
                    <span className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2] block">Current En-Route Destination</span>
                    <h2 className="text-2xl font-extrabold text-[#45263F] dark:text-[#FAF5EF] leading-tight mt-0.5">
                      {activeJourney.destination}
                    </h2>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-extrabold text-[#45263F] dark:text-[#FAF5EF] uppercase tracking-wider block mb-1.5">
                      Target Destination
                    </label>
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      placeholder="Enter destination address..."
                      className="w-full h-12 px-4 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] dark:border-[#E9DFD2]/30 text-sm font-bold text-[#29252D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C86650]/40"
                    />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C86650]" />
                    <span>3.4 km corridor</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C5A36A]" />
                    <span>Est. 18 min</span>
                  </span>
                </div>
              </div>

              {/* Escort Emblem Badge */}
              <div className="w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-br from-[#E99583] via-[#C86650] to-[#702E46] border border-white/60 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/src/assets/images/safesaathi_app_icon_1792355765489.jpg"
                  alt="SafeSaathi Escort"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
            </div>

            {/* Presets if configuring */}
            {!activeJourney && (
              <div className="mt-5 pt-4 border-t border-[#E9DFD2] dark:border-[#E9DFD2]/15">
                <span className="text-xs font-extrabold text-[#45263F] dark:text-[#FAF5EF] block mb-2.5">
                  Frequent Verified Safe Havens:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESET_DESTINATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setDestinationInput(preset.name)}
                      className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                        destinationInput === preset.name
                          ? 'bg-gradient-to-br from-[#702E46] to-[#45263F] text-white border-[#702E46] shadow-sm'
                          : 'bg-[#FAF5EF] dark:bg-[#231622] hover:bg-white text-[#29252D] dark:text-[#FAF5EF] border-[#E9DFD2] dark:border-[#E99583]/25'
                      }`}
                    >
                      <span className="text-xs font-extrabold block truncate">{preset.name}</span>
                      <span
                        className={`text-[11px] block mt-0.5 font-medium ${
                          destinationInput === preset.name ? 'text-[#FAF5EF]' : 'text-[#62566F] dark:text-[#E9DFD2]'
                        }`}
                      >
                        {preset.distance} · {preset.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Autonomous Protocol Details */}
          <div className="clay-card rounded-[32px] p-6 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 bg-white dark:bg-[#281324]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#702E46] dark:text-[#E99583] mb-2">
              Autonomous Surveillance Protocol
            </h3>
            <p className="text-xs font-medium text-[#62566F] dark:text-[#E9DFD2] leading-relaxed">
              Journey Guard continuously benchmarks your coordinates against the pre-cleared corridor every 8 seconds. If your vehicle departs from the verified path by more than {settings.deviationThresholdMeters} meters or stops unexpectedly for &gt;{settings.stopTimeoutSeconds}s, the 30-second “Are you safe?” countdown engages immediately.
              {showFullDetails && (
                <span className="block mt-2 text-[#29252D] dark:text-white font-bold">
                  If the prompt is not acknowledged via your 4-digit security PIN, the system automatically transmits distress broadcasts with your live coordinate beacon to your trusted circle, sounds the alarm siren, and locks incident logs into the encrypted Evidence Vault.
                </span>
              )}
            </p>
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-xs font-bold text-[#702E46] dark:text-[#E99583] mt-2 hover:underline inline-block cursor-pointer"
            >
              {showFullDetails ? 'Show less' : 'Read full protocol'}
            </button>
          </div>

          {/* Departure Schedule & Transit Mode Selection */}
          <div className="clay-card rounded-[32px] p-6 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 bg-white dark:bg-[#281324]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Departure Schedule
                </h3>
                <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">Synchronize timing with trusted circle</p>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF5EF] dark:bg-[#231622] text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] border border-[#E9DFD2]">
                <span>Depart Immediately</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#702E46] dark:text-[#E99583]" />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {SCHEDULE_DAYS.map((item) => {
                const isSelected = selectedDayNum === item.num;
                return (
                  <button
                    key={item.num}
                    onClick={() => {
                      soundManager.triggerHaptic(15);
                      setSelectedDayNum(item.num);
                    }}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#702E46] to-[#45263F] text-white shadow-sm font-extrabold scale-102 ring-2 ring-[#C86650]/50'
                        : 'bg-[#FAF5EF] dark:bg-[#231622] hover:bg-white text-[#29252D] dark:text-[#FAF5EF] border border-[#E9DFD2] dark:border-[#E99583]/25 font-bold'
                    }`}
                  >
                    <span className="text-[10px] uppercase">{item.day}</span>
                    <span className="text-sm font-extrabold mt-0.5">{item.num}</span>
                  </button>
                );
              })}
            </div>

            {/* Transit Mode Selection */}
            <div className="mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#E9DFD2]/15">
              <span className="text-xs font-extrabold text-[#45263F] dark:text-[#FAF5EF] block mb-2">
                Transit Vehicle Mode
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cab', label: 'Solo Cab', icon: Car },
                  { id: 'walk', label: 'Walk', icon: Footprints },
                  { id: 'transit', label: 'Transit', icon: Bus },
                  { id: 'bike', label: 'Bike', icon: Bike },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedTransportMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedTransportMode(m.id as typeof selectedTransportMode)}
                      className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#702E46] to-[#45263F] text-white border-[#702E46] shadow-sm'
                          : 'bg-[#FAF5EF] dark:bg-[#231622] text-[#29252D] dark:text-[#FAF5EF] border-[#E9DFD2] dark:border-[#E99583]/25 hover:bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 stroke-[2.2]" />
                      <span className="text-xs font-extrabold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {activeJourney ? (
              <button
                onClick={endJourney}
                className="clay-btn-secondary w-full h-14 flex items-center justify-center gap-2 text-xs font-extrabold tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4 text-[#7E927B]" />
                <span>I HAVE ARRIVED SAFELY (END JOURNEY)</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="clay-btn-primary w-full h-14 flex items-center justify-center gap-2 text-xs font-extrabold tracking-wider"
              >
                <Navigation className="w-4 h-4" />
                <span>START PROTECTED JOURNEY</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (col-span-12 lg:col-span-5) ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 3D Autonomous Corridor Radar */}
          <div className="clay-card rounded-[32px] p-6 shadow-sm relative overflow-hidden border border-[#E9DFD2] dark:border-[#E99583]/25 bg-white dark:bg-[#281324]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#E9DFD2]/15">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  3D Corridor Radar
                </h3>
                <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">
                  Autonomous deviation perimeter &amp; live waypoint guidance
                </p>
              </div>
              <span className="text-[10px] font-mono tabular-nums font-bold text-[#702E46] dark:text-[#E99583] bg-[#FAF5EF] dark:bg-[#231622] px-2.5 py-0.5 rounded-full border border-[#E9DFD2]">
                ±{settings.deviationThresholdMeters}m Bound
              </span>
            </div>

            {/* WebGL 3D Interactive Corridor Canvas */}
            <div className="mt-3 flex items-center justify-center">
              <SafeSaathi3DCorridor
                progress={activeJourney ? 0.6 : 0.2}
                deviationMeters={activeJourney ? activeJourney.deviationMeters : 0}
                thresholdMeters={settings.deviationThresholdMeters}
                size="lg"
                transportMode={selectedTransportMode}
                className="w-full"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-[#E9DFD2] dark:border-[#E9DFD2]/15 flex items-center justify-between text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">
              <span>Status: Strict Safe Corridor</span>
              <span className="text-[#702E46] dark:text-[#E99583] font-bold">Waypoint Active</span>
            </div>
          </div>

          {/* Anomaly Test Lab Controls */}
          <div className="clay-card rounded-[32px] p-6 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 bg-white dark:bg-[#281324]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Proactive Anomaly Verification
                </h3>
                <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">
                  Verify 30-second countdown and PIN verification dialog
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={simulateDeviation}
                className="w-full p-4 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] hover:bg-white text-left transition border border-[#E9DFD2] dark:border-[#E99583]/25 active:scale-98 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] mb-1">
                  <AlertTriangle className="w-4 h-4 text-[#C86650] group-hover:scale-110 transition-transform" />
                  <span>Simulate Route Deviation (&gt;500m)</span>
                </div>
                <span className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2] block leading-tight">
                  Simulates vehicle departure off the safe route for &gt;60s.
                </span>
              </button>

              <button
                onClick={simulateStop}
                className="w-full p-4 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] hover:bg-white text-left transition border border-[#E9DFD2] dark:border-[#E99583]/25 active:scale-98 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] mb-1">
                  <Clock className="w-4 h-4 text-[#702E46] dark:text-[#E99583] group-hover:scale-110 transition-transform" />
                  <span>Simulate Unexplained Stop (&gt;60s)</span>
                </div>
                <span className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2] block leading-tight">
                  Simulates vehicle remaining stationary at unknown location.
                </span>
              </button>
            </div>
          </div>

          {/* Threshold Configurations */}
          <div className="clay-card rounded-[32px] p-6 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 bg-white dark:bg-[#281324]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Parameters &amp; Thresholds
                </h3>
              </div>
              <button
                onClick={() => setShowThresholdConfig(!showThresholdConfig)}
                className="text-xs font-bold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
              >
                {showThresholdConfig ? 'Close' : 'Adjust'}
              </button>
            </div>

            {showThresholdConfig ? (
              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-[#29252D] dark:text-[#FAF5EF] mb-1">
                    <span>Deviation Tolerance:</span>
                    <span>{settings.deviationThresholdMeters} meters</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    step="50"
                    value={settings.deviationThresholdMeters}
                    onChange={(e) =>
                      updateSettings({ deviationThresholdMeters: Number(e.target.value) })
                    }
                    className="w-full accent-[#C86650]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#29252D] dark:text-[#FAF5EF] mb-1">
                    <span>Confirmation Countdown:</span>
                    <span>{settings.countdownSeconds} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={settings.countdownSeconds}
                    onChange={(e) =>
                      updateSettings({ countdownSeconds: Number(e.target.value) })
                    }
                    className="w-full accent-[#C86650]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] dark:border-[#E99583]/25">
                  <span className="text-[10px] font-medium text-[#62566F] dark:text-[#E9DFD2] block">Deviation Max</span>
                  <span className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] text-sm tabular-nums">{settings.deviationThresholdMeters}m</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] dark:border-[#E99583]/25">
                  <span className="text-[10px] font-medium text-[#62566F] dark:text-[#E9DFD2] block">Stop Timeout</span>
                  <span className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] text-sm tabular-nums">{settings.stopTimeoutSeconds}s</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] dark:border-[#E99583]/25">
                  <span className="text-[10px] font-medium text-[#62566F] dark:text-[#E9DFD2] block">Countdown</span>
                  <span className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] text-sm tabular-nums">{settings.countdownSeconds}s</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
