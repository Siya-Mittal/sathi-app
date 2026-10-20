import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  MapPin,
  Users,
  PhoneCall,
  ChevronRight,
  Navigation,
  Car,
  Footprints,
  Bus,
  Timer,
  Clock,
  Phone,
  MessageSquare,
  Building,
  CheckCircle2,
  Wrench,
  Radio,
  Activity,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSafety } from '../../context/SafetyContext';
import { HELPLINE_SHORTCUTS, SAFETY_TIPS, NEARBY_SAFE_PLACES } from '../../data/mockData';
import { soundManager } from '../../utils/audio';
import { createWhatsAppDistressUrl } from '../../utils/geolocation';
import { SafeSaathi3DShield } from '../3d/SafeSaathi3DShield';
import { SafeSaathiClay3DShield } from '../3d/SafeSaathiClay3DShield';

export const DashboardScreen: React.FC = () => {
  const {
    user,
    activeJourney,
    contacts,
    currentLocation,
    setActiveTab,
    triggerSos,
    simulateDeviation,
    showToast,
  } = useSafety();

  const [selectedSafetyMode, setSelectedSafetyMode] = useState<string>('solo_cab');
  const [sosConfirming, setSosConfirming] = useState<boolean>(false);
  const [selectedTip, setSelectedTip] = useState<(typeof SAFETY_TIPS)[0] | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [heroVisualMode, setHeroVisualMode] = useState<'clay3d' | 'webgl'>('clay3d');

  const handleSosHoldTrigger = () => {
    soundManager.triggerHaptic([60, 120, 60]);
    triggerSos('Dashboard Immediate SOS Action');
    setSosConfirming(false);
  };

  const handleQuickCheckIn = () => {
    soundManager.triggerHaptic([30, 60]);
    setJustCheckedIn(true);
    showToast('Check-in confirmed: Safe location logged & shared with Trusted Circle');
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const handleQuickWhatsAppAlert = (contact: (typeof contacts)[0]) => {
    soundManager.triggerHaptic(20);
    const url = createWhatsAppDistressUrl(
      contact.phone,
      user.name,
      currentLocation.lat,
      currentLocation.lng,
      'Live GPS Check-in'
    );
    window.open(url, '_blank');
    showToast(`Check-in link opened for ${contact.name}`);
  };

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  return (
    <div className="space-y-6 animate-fadeIn select-none pb-6">
      
      {/* ================= 1. PROMINENT 3D PROTECTIVE SHIELD HERO ================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="clay-card-elevated relative overflow-hidden p-6 sm:p-8 lg:p-10 border-2 border-[#E9DFD2] dark:border-[#E99583]/25"
      >
        {/* Soft atmospheric ambient pools with terracotta & sage warmth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E99583]/20 via-[#C5A36A]/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-[#7E927B]/15 via-[#FAF5EF]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols): Brand Copy, Value Proposition & Actions */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* System Status Label (Clean unboxed metadata, verified contrast) */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#702E46] dark:text-[#E99583]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7E927B]" />
              <span>Autonomous Escort Ready</span>
              <span aria-hidden="true" className="text-[#C5A36A]">·</span>
              <span className="text-[#62566F] dark:text-[#FAF5EF]">GPS Geofence Armed</span>
              <span aria-hidden="true" className="text-[#C5A36A]">·</span>
              <span className="font-semibold text-[#C86650]">30s Deviation Sentry</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#45263F] dark:text-[#FAF5EF] leading-[1.12]">
                Your journey.{' '}
                <span className="bg-gradient-to-r from-[#702E46] via-[#C86650] to-[#E99583] bg-clip-text text-transparent">
                  Your people. Your safety.
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#62566F] dark:text-[#E9DFD2] font-medium leading-relaxed max-w-xl">
                SafeSaathi proactively monitors transit corridors, verifies route deviations within 30 seconds, cryptographically seals incident evidence, and keeps your trusted circle connected.
              </p>
            </div>

            {/* Raised Claymorphic Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Action Button */}
              <button
                onClick={() => setActiveTab('journey')}
                className="clay-btn-primary h-12 px-6 flex items-center gap-2 text-xs font-bold whitespace-nowrap active:scale-97"
              >
                <Navigation className="w-4 h-4 stroke-[2.2]" />
                <span>{activeJourney ? 'Resume Active Journey' : 'Start Protected Journey'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>

              {/* Secondary Safe Check-In Button */}
              <button
                onClick={handleQuickCheckIn}
                disabled={justCheckedIn}
                className={`clay-btn-secondary h-12 px-5 flex items-center gap-2 text-xs font-bold whitespace-nowrap active:scale-97 ${
                  justCheckedIn ? 'border-[#7E927B] text-[#3D6B4E]' : ''
                }`}
              >
                {justCheckedIn ? (
                  <>
                    <Check className="w-4 h-4 text-[#7E927B] stroke-[2.5]" />
                    <span className="text-[#3D6B4E] font-extrabold">Checked In &amp; Safe!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
                    <span>Quick "I Am Safe" Check-In</span>
                  </>
                )}
              </button>

              {/* Tertiary Safety Tools Button */}
              <button
                onClick={() => setActiveTab('tools')}
                className="clay-btn-secondary h-12 px-4 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap active:scale-97 text-[#62566F] hover:text-[#45263F]"
                title="Tactical fake call, safe-walk timer & camera recorder"
              >
                <Wrench className="w-3.5 h-3.5 text-[#C86650]" />
                <span>Safety Tools</span>
              </button>
            </div>

            {/* Micro Live Metrics Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#62566F] dark:text-[#FAF5EF]">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#C86650]" />
                <span className="font-mono tabular-nums text-[#29252D] dark:text-[#FAF5EF] font-bold">
                  {currentLocation.lat.toFixed(3)}°, {currentLocation.lng.toFixed(3)}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#702E46] dark:text-[#E99583]" />
                <span className="font-bold text-[#29252D] dark:text-[#FAF5EF]">{contacts.length} Guardians</span>
                <span>on standby</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#7E927B]" />
                <span className="text-[#45263F] dark:text-[#E9DFD2] font-bold">Corridor Sentry Active</span>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Prominent Dimensional 3D Shield Sculpture */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-[390px] flex flex-col items-center justify-center">
              
              {/* 3D Visual Mode Selector (Claymorphic Segmented Tabs) */}
              <div className="mb-2 flex items-center p-1 clay-tab-dock">
                <button
                  onClick={() => {
                    soundManager.triggerHaptic(15);
                    setHeroVisualMode('clay3d');
                  }}
                  className={`px-3.5 py-1.5 clay-tab-btn text-xs font-extrabold cursor-pointer ${
                    heroVisualMode === 'clay3d'
                      ? 'clay-tab-active'
                      : 'clay-tab-inactive'
                  }`}
                >
                  Clay 3D Shield
                </button>
                <button
                  onClick={() => {
                    soundManager.triggerHaptic(15);
                    setHeroVisualMode('webgl');
                  }}
                  className={`px-3.5 py-1.5 clay-tab-btn text-xs font-extrabold cursor-pointer ${
                    heroVisualMode === 'webgl'
                      ? 'clay-tab-active'
                      : 'clay-tab-inactive'
                  }`}
                >
                  Three.js Studio Glass
                </button>
              </div>

              {heroVisualMode === 'clay3d' ? (
                /* High-Fidelity Claymorphic 3D SafeSaathi Shield Sculpture */
                <div className="w-full flex flex-col items-center">
                  <SafeSaathiClay3DShield
                    size="hero"
                    status={activeJourney ? 'active_journey' : 'safe'}
                    interactive={true}
                    showControls={true}
                    enableExplode={true}
                  />
                </div>
              ) : (
                /* Alternate WebGL Three.js Physical Glass Shield Object */
                <div className="flex flex-col items-center">
                  <SafeSaathi3DShield
                    size="lg"
                    status={activeJourney ? 'active_journey' : 'safe'}
                    interactive={true}
                    showLayerControls={true}
                    className="mx-auto"
                  />
                  <span className="text-[11px] font-semibold text-[#62566F] dark:text-[#E9DFD2] mt-1.5 pointer-events-none">
                    Interactive Physical Glass Model · Drag to orbit
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>
      </motion.div>

      {/* ================= 2. ACTIVE JOURNEY CORRIDOR BANNER ================= */}
      {activeJourney && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card-plum p-6 lg:p-7 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 p-1 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <Navigation className="w-7 h-7 text-[#E99583] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7E927B] shadow-sm" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FAF5EF]">
                    Active Escort Corridor Engaged
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
                  Heading to: {activeJourney.destination}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-1">
                  <Clock className="w-3.5 h-3.5 text-[#C5A36A]" />
                  <span className="font-bold text-white">ETA {activeJourney.estimatedArrival}</span>
                  <span>·</span>
                  <span>{activeJourney.distanceKm} km remaining</span>
                  <span>·</span>
                  <span className="capitalize">{activeJourney.transportMode} Mode</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2.5 shrink-0">
              <button
                onClick={simulateDeviation}
                className="clay-btn-secondary h-11 px-5 rounded-full text-xs font-bold flex items-center justify-center active:scale-95"
              >
                Test 30s Deviation Trigger
              </button>
              <button
                onClick={() => setActiveTab('journey')}
                className="h-11 px-5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer border border-white/30"
              >
                <Compass className="w-4 h-4 text-[#E99583]" />
                <span>Live Route Radar</span>
              </button>
            </div>
          </div>

          {/* Route progress track */}
          <div className="mt-5 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-[11px] text-[#FAF5EF] font-medium mb-1.5">
              <span>Origin: {activeJourney.origin}</span>
              <span className="text-white font-bold">Deviation bound: 500m</span>
              <span>{activeJourney.destination}</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div className="w-3/5 h-full bg-gradient-to-r from-[#C86650] via-[#E99583] to-white rounded-full shadow-sm" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= 3. JOURNEY-MODE SELECTOR ================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
              Transit Protection Protocols
            </h3>
            <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">
              Tailored autonomous monitoring modes for your specific transit scenario
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tools')}
            className="text-xs font-bold text-[#702E46] dark:text-[#E99583] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Tools</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { id: 'solo_cab', label: 'Solo Cab Guard', desc: '500m deviation sentry & driver alibi', icon: Car },
            { id: 'night_walk', label: 'Night Safe Walk', desc: 'Illuminated safe havens & audio monitor', icon: Footprints },
            { id: 'transit', label: 'Transit Escort', desc: 'Metro/bus line checkpoint escort', icon: Bus },
            { id: 'safe_walk', label: 'Safe-Walk Timer', desc: 'Silent countdown auto-dispatch', icon: Timer },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedSafetyMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  soundManager.triggerHaptic(15);
                  setSelectedSafetyMode(mode.id);
                  if (mode.id === 'safe_walk') setActiveTab('tools');
                }}
                className={`p-4 rounded-3xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'clay-card-plum scale-102 ring-2 ring-[#C86650]/50 shadow-xl'
                    : 'clay-card hover:bg-white dark:hover:bg-[#3A1F33]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF5EF] text-[#702E46] dark:bg-[#45263F] dark:text-[#E99583]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold block text-inherit">{mode.label}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#E99583] uppercase tracking-wider">Active</span>
                  )}
                </div>
                <span
                  className={`text-[11px] block mt-1 font-medium ${
                    isSelected ? 'text-[#FAF5EF]' : 'text-[#62566F] dark:text-[#E9DFD2]'
                  }`}
                >
                  {mode.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 4. TWO-COLUMN SUPPORTING SECTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Helplines & Safety Playbooks */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Direct Toll-Free Helpline Dials */}
          <div className="clay-card p-6 border-2 border-[#E9DFD2] dark:border-[#E99583]/25">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  24/7 National Emergency Helplines
                </h3>
                <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">
                  Direct zero-balance phone connection to police, women's distress helpline and emergency services
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAF5EF] dark:bg-[#281324] text-[#702E46] dark:text-[#E99583] border border-[#E9DFD2]">
                Toll Free 24/7
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {HELPLINE_SHORTCUTS.map((hl) => (
                <a
                  key={hl.number}
                  href={`tel:${hl.number}`}
                  className="clay-btn-secondary p-4 rounded-2xl flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FAF5EF] dark:bg-[#45263F] group-hover:bg-[#702E46] group-hover:text-white flex items-center justify-center text-[#702E46] dark:text-[#E99583] mb-2 transition-colors">
                    <PhoneCall className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-lg font-extrabold text-[#29252D] dark:text-[#FAF5EF]">{hl.number}</span>
                  <span className="text-[10px] font-semibold text-[#62566F] dark:text-[#E9DFD2] mt-0.5 leading-tight">
                    {hl.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Expert Safety Playbooks & Legal Knowledge */}
          <div className="clay-card p-6 border-2 border-[#E9DFD2] dark:border-[#E99583]/25">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Safety Protocols &amp; Legal Knowledge
                </h3>
                <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">
                  Zero FIR legal provisions, evidence admissibility, and de-escalation strategies
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#702E46] dark:text-[#E99583]">Verified Legal Guidance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SAFETY_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  onClick={() => setSelectedTip(tip)}
                  className="bg-white dark:bg-[#281324] rounded-3xl p-4 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 hover:border-[#C86650] active:scale-98 transition flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-[#FAF5EF] dark:bg-[#231622] relative border border-[#E9DFD2]/60">
                      <img
                        src={tip.imageUrl}
                        alt={tip.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-[#702E46] dark:text-[#E99583] font-extrabold uppercase tracking-wider block">
                      {tip.category} · {tip.readTime}
                    </span>
                    <h4 className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] mt-1 leading-snug">
                      {tip.title}
                    </h4>
                    <p className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2] line-clamp-2 mt-1 leading-relaxed">
                      {tip.summary}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E9DFD2]/60 dark:border-[#E9DFD2]/15 flex items-center justify-between text-[11px] text-[#702E46] dark:text-[#E99583] font-bold">
                    <span>Read Guidance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Emergency SOS, Trusted Circle & Safe Havens */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Emergency SOS High-Alert Action */}
          <div className="clay-card p-6 border-2 border-rose-300/80 bg-gradient-to-br from-[#FFF5F6] via-[#FFF9FA] to-[#FEEDF0] dark:from-[#351620] dark:to-[#251017]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#BA223C]/15 flex items-center justify-center text-[#BA223C]">
                  <ShieldAlert className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-xs font-extrabold text-[#45263F] dark:text-[#FAF5EF]">
                  Instant SOS Beacon
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-[#BA223C] uppercase tracking-wider">
                Emergency
              </span>
            </div>

            <p className="text-xs text-[#62566F] dark:text-[#E9DFD2] mb-4 leading-relaxed font-medium">
              Immediately alerts your trusted circle with real-time GPS coordinates, triggers optional deterrent siren, and cryptographically records evidence.
            </p>

            {sosConfirming ? (
              <div className="p-4 rounded-2xl bg-rose-100/90 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 animate-fadeIn">
                <p className="text-xs font-extrabold text-rose-900 dark:text-rose-200 text-center mb-3">
                  Confirm Immediate Distress Broadcast?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSosHoldTrigger}
                    className="clay-btn-emergency flex-1 h-12 flex items-center justify-center gap-2 text-xs font-extrabold"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>CONFIRM SOS</span>
                  </button>
                  <button
                    onClick={() => setSosConfirming(false)}
                    className="h-12 px-4 rounded-full bg-white dark:bg-[#281324] text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] hover:bg-slate-50 cursor-pointer border border-rose-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSosConfirming(true)}
                className="clay-btn-emergency w-full h-14 flex items-center justify-center gap-2.5 text-xs font-extrabold"
              >
                <ShieldAlert className="w-5 h-5 stroke-[2.4]" />
                <span className="tracking-wide">ACTIVATE EMERGENCY SOS</span>
              </button>
            )}
          </div>

          {/* Trusted Circle Card with Connection Artwork */}
          <div className="clay-card p-6 border-2 border-[#E9DFD2] dark:border-[#E99583]/25">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Trusted Circle ({contacts.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('contacts')}
                className="text-xs font-bold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* Connection Storytelling Illustration */}
            <div className="w-full h-32 rounded-2xl overflow-hidden mb-3.5 relative border border-[#E9DFD2] shadow-xs">
              <img
                src="/src/assets/images/safesaathi_trusted_circle_art_1792356790748.jpg"
                alt="Connected Guardians"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#45263F]/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">
                  Mutual Protection Network
                </span>
              </div>
            </div>

            {/* Primary Contact Showcase */}
            {primaryContact && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#281324] border border-[#E9DFD2] dark:border-[#E99583]/25 shadow-xs flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] truncate">
                      {primaryContact.name}
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FAF5EF] text-[#702E46] border border-[#E9DFD2] rounded">
                      Primary
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2] block truncate">
                    {primaryContact.relationship} · {primaryContact.phone}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQuickWhatsAppAlert(primaryContact)}
                    className="p-2 rounded-xl bg-[#FAF5EF] dark:bg-[#45263F] hover:bg-[#E9DFD2] text-[#702E46] dark:text-[#E99583] transition active:scale-95 cursor-pointer"
                    title="Send WhatsApp Beacon"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="p-2 rounded-xl bg-[#702E46] text-white hover:bg-[#582136] transition active:scale-95 cursor-pointer shadow-xs"
                    title="Call Guardian"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Other Contacts Mini List */}
            <div className="space-y-2">
              {contacts.filter((c) => c.id !== primaryContact?.id).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FAF5EF] dark:bg-[#2D1828] border border-[#E9DFD2] dark:border-[#E99583]/25 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] block">{c.name}</span>
                    <span className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2]">{c.relationship}</span>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-xs text-[#702E46] dark:text-[#E99583] font-bold hover:underline"
                  >
                    Call
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Verified Safe Havens Preview */}
          <div className="clay-card p-6 border-2 border-[#E9DFD2] dark:border-[#E99583]/25">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#45263F] dark:text-[#FAF5EF]">
                  Nearby Safe Havens
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-bold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
              >
                Open Map
              </button>
            </div>

            <div className="space-y-2.5">
              {NEARBY_SAFE_PLACES.slice(0, 3).map((place) => (
                <div
                  key={place.id}
                  onClick={() => setActiveTab('map')}
                  className="p-3 rounded-2xl bg-white dark:bg-[#281324] hover:bg-[#FAF5EF] dark:hover:bg-[#45263F] border border-[#E9DFD2] dark:border-[#E99583]/25 cursor-pointer flex items-center justify-between transition shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] truncate">{place.name}</h5>
                    <span className="text-[11px] font-medium text-[#62566F] dark:text-[#E9DFD2] block truncate">{place.address}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#702E46] dark:text-[#E99583] px-2.5 py-1 rounded-full bg-[#FAF5EF] dark:bg-[#231622] shrink-0 border border-[#E9DFD2]">
                    {place.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Safety Tip Modal */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/75 backdrop-blur-md animate-fadeIn">
          <div className="clay-card-elevated w-full max-w-md p-6 shadow-2xl border-2 border-[#E9DFD2]">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#702E46] dark:text-[#E99583]">
                {selectedTip.category} · {selectedTip.readTime}
              </span>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-1 rounded-full text-[#62566F] hover:text-[#BA223C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#FAF5EF] dark:bg-[#231622]">
              <img
                src={selectedTip.imageUrl}
                alt={selectedTip.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold text-[#45263F] dark:text-[#FAF5EF] mb-2">
              {selectedTip.title}
            </h3>
            <p className="text-xs font-medium text-[#62566F] dark:text-[#E9DFD2] leading-relaxed mb-6">
              {selectedTip.detail}
            </p>
            <button
              onClick={() => setSelectedTip(null)}
              className="clay-btn-primary w-full h-12 flex items-center justify-center text-xs font-bold"
            >
              Understood Guidance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
