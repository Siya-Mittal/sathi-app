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
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Building,
  CheckCircle2,
  Wrench,
  Lock,
  Radio,
  Activity,
  Share2,
  Sparkles,
  Volume2,
  Check,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    simulateStop,
    showToast,
    isSirenPlaying,
    toggleSiren,
  } = useSafety();

  const [selectedSafetyMode, setSelectedSafetyMode] = useState<string>('solo_cab');
  const [sosConfirming, setSosConfirming] = useState<boolean>(false);
  const [selectedTip, setSelectedTip] = useState<(typeof SAFETY_TIPS)[0] | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [heroVisualMode, setHeroVisualMode] = useState<'clay3d' | 'webgl' | 'art'>('clay3d');

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
      
      {/* ================= 1. BESPOKE CLAYMORPHIC 3D & ART HERO ================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="clay-card-elevated relative overflow-hidden p-6 sm:p-8 lg:p-10 border-2 border-[#E8DDFB]"
      >
        {/* Soft atmospheric ambient pools */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F6D3E2]/40 via-[#E8DDFB]/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-[#C9C5FA]/30 via-[#F8F0F8]/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols): Brand Copy, Value Proposition & Raised Action Controls */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Status Kicker - High Contrast Clay Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#E8DDFB] shadow-xs text-xs font-bold text-[#542A70]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Autonomous Escort Active</span>
              <span aria-hidden="true" className="text-[#D99AB9]">·</span>
              <span className="text-[#62566F]">Sensors Calibrated</span>
              <span aria-hidden="true" className="text-[#D99AB9]">·</span>
              <span className="text-[#542A70]">30s Deviation Guard</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#351B4D] leading-[1.12]">
                Your Peaceful Journey,{' '}
                <span className="bg-gradient-to-r from-[#542A70] via-[#85459E] to-[#DF4B5E] bg-clip-text text-transparent">
                  Intelligently Guarded.
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#62566F] font-medium leading-relaxed max-w-xl">
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

              {/* Secondary Action Button */}
              <button
                onClick={handleQuickCheckIn}
                disabled={justCheckedIn}
                className={`clay-btn-secondary h-12 px-5 flex items-center gap-2 text-xs font-bold whitespace-nowrap active:scale-97 ${
                  justCheckedIn ? 'border-emerald-300 text-emerald-800' : ''
                }`}
              >
                {justCheckedIn ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-800 font-extrabold">Checked In &amp; Safe!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#542A70]" />
                    <span>Quick "I Am Safe" Check-In</span>
                  </>
                )}
              </button>

              {/* Tertiary Action Button */}
              <button
                onClick={() => setActiveTab('tools')}
                className="clay-btn-secondary h-12 px-4 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap active:scale-97 text-[#62566F] hover:text-[#351B4D]"
                title="Tactical alibis, Fake Call & Safe-Walk timer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#542A70]" />
                <span>Safety Tools</span>
              </button>
            </div>

            {/* Micro Live Metrics Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#62566F]">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#542A70]" />
                <span className="font-mono tabular-nums text-[#29213B] font-bold">
                  {currentLocation.lat.toFixed(3)}°, {currentLocation.lng.toFixed(3)}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#542A70]" />
                <span className="font-bold text-[#29213B]">{contacts.length} Guardians</span>
                <span>on standby</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[#351B4D] font-bold">Corridor Sentry Active</span>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Genuine Claymorphic 3D Protective Sculpture & Alternate Views */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-[380px] flex flex-col items-center justify-center">
              
              {/* Visual Mode Selector: Claymorphic 3D Emblem vs. WebGL Studio vs. Editorial Art */}
              <div className="mb-2 flex items-center gap-1 p-1 bg-white/90 border border-[#E8DDFB] rounded-2xl shadow-xs">
                <button
                  onClick={() => setHeroVisualMode('clay3d')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    heroVisualMode === 'clay3d'
                      ? 'bg-[#542A70] text-white shadow-xs'
                      : 'text-[#62566F] hover:text-[#351B4D]'
                  }`}
                >
                  Clay 3D Shield
                </button>
                <button
                  onClick={() => setHeroVisualMode('webgl')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    heroVisualMode === 'webgl'
                      ? 'bg-[#542A70] text-white shadow-xs'
                      : 'text-[#62566F] hover:text-[#351B4D]'
                  }`}
                >
                  Studio Glass
                </button>
                <button
                  onClick={() => setHeroVisualMode('art')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    heroVisualMode === 'art'
                      ? 'bg-[#542A70] text-white shadow-xs'
                      : 'text-[#62566F] hover:text-[#351B4D]'
                  }`}
                >
                  Artwork
                </button>
              </div>

              {heroVisualMode === 'clay3d' ? (
                /* High-Fidelity Claymorphic 3D SafeSaathi Shield Emblem using CSS 3D transforms */
                <div className="w-full flex flex-col items-center">
                  <SafeSaathiClay3DShield
                    size="hero"
                    status={activeJourney ? 'active_journey' : 'safe'}
                    interactive={true}
                    showControls={true}
                    enableExplode={true}
                  />
                </div>
              ) : heroVisualMode === 'webgl' ? (
                /* Alternate WebGL Shield Object */
                <div className="flex flex-col items-center">
                  <SafeSaathi3DShield
                    size="lg"
                    status={activeJourney ? 'active_journey' : 'safe'}
                    interactive={true}
                    showLayerControls={true}
                    className="mx-auto"
                  />
                  <span className="text-[11px] font-semibold text-[#62566F] mt-1.5 pointer-events-none">
                    Studio Glass Physical Model · Drag to rotate
                  </span>
                </div>
              ) : (
                /* Editorial Storytelling Illustration */
                <div className="relative w-full rounded-3xl overflow-hidden border-2 border-[#E8DDFB] shadow-lg group">
                  <img
                    src="/src/assets/images/safesaathi_hero_empowerment_1792356790225.jpg"
                    alt="SafeSaathi Confident Woman Protected"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#351B4D]/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        Walk Free &amp; Confident
                      </span>
                      <span className="text-[11px] text-purple-200 block">
                        Autonomous digital escort protecting every step
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </motion.div>

      {/* ================= 2. ACTIVE JOURNEY CORRIDOR (CLAYMORPHIC PLUM) ================= */}
      {activeJourney && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card-plum p-6 lg:p-7 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 p-1 border border-purple-300/40 flex items-center justify-center text-white shrink-0 shadow-inner">
                <Navigation className="w-7 h-7 text-purple-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                    Active Escort Corridor Engaged
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
                  Heading to: {activeJourney.destination}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-purple-200/90 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
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
                Test Deviation Trigger
              </button>
              <button
                onClick={() => setActiveTab('journey')}
                className="h-11 px-5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer border border-white/30"
              >
                <Compass className="w-4 h-4 text-purple-200" />
                <span>Live Route Radar</span>
              </button>
            </div>
          </div>

          {/* Route progress track */}
          <div className="mt-5 pt-4 border-t border-purple-400/20">
            <div className="flex items-center justify-between text-[11px] text-purple-200 font-medium mb-1.5">
              <span>Origin: {activeJourney.origin}</span>
              <span className="text-white font-bold">Deviation bound: 500m</span>
              <span>{activeJourney.destination}</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-purple-300/30">
              <div className="w-3/5 h-full bg-gradient-to-r from-[#D99AB9] via-[#C9C5FA] to-white rounded-full shadow-sm" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= 3. TACTICAL ESCORT PROTOCOLS (CLAYMORPHIC) ================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#351B4D]">
              Tactical Escort Protocols
            </h3>
            <p className="text-[11px] font-medium text-[#62566F]">
              Tailored autonomous monitoring modes for your specific transit scenario
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tools')}
            className="text-xs font-bold text-[#542A70] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Tools</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { id: 'solo_cab', label: 'Solo Cab Guard', desc: '500m deviation alert', icon: Car },
            { id: 'night_walk', label: 'Night Safe Walk', desc: 'Illuminated safe havens', icon: Footprints },
            { id: 'transit', label: 'Transit Escort', desc: 'Metro & bus check-in', icon: Bus },
            { id: 'safe_walk', label: 'Safe-Walk Timer', desc: 'Countdown auto-dispatch', icon: Timer },
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
                className={`p-4 rounded-3xl text-left transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#542A70] to-[#351B4D] text-white border-purple-900 shadow-md scale-102'
                    : 'clay-card hover:bg-white border-[#E8DDFB]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E8DDFB] text-[#542A70]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold block text-inherit">{mode.label}</span>
                <span
                  className={`text-[11px] block mt-1 font-medium ${
                    isSelected ? 'text-purple-200' : 'text-[#62566F]'
                  }`}
                >
                  {mode.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 4. TWO-COLUMN OPERATIONAL GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Helplines, Playbooks & Safe Haven Previews */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Direct Toll-Free Helpline Dials */}
          <div className="clay-card p-6 border-2 border-[#E8DDFB]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#351B4D]">
                  24/7 Government Emergency Hotlines
                </h3>
                <p className="text-[11px] font-medium text-[#62566F]">
                  Zero-balance 1-touch telephone connection to police and distress response
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E8DDFB] text-[#542A70] border border-purple-200/80">
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
                  <div className="w-10 h-10 rounded-full bg-[#E8DDFB] group-hover:bg-[#542A70] group-hover:text-white flex items-center justify-center text-[#542A70] mb-2 transition-colors">
                    <PhoneCall className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-lg font-extrabold text-[#29213B]">{hl.number}</span>
                  <span className="text-[10px] font-semibold text-[#62566F] mt-0.5 leading-tight">
                    {hl.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Expert Safety Playbooks & Legal Rights */}
          <div className="clay-card p-6 border-2 border-[#E8DDFB]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#351B4D]">
                  Safety Protocols &amp; Legal Knowledge
                </h3>
                <p className="text-[11px] font-medium text-[#62566F]">
                  Zero FIR legal provisions, digital evidence validity, and de-escalation
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#542A70]">Vetted Legal Guidance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SAFETY_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  onClick={() => setSelectedTip(tip)}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-[#E8DDFB] hover:border-[#D99AB9] active:scale-98 transition flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-purple-50 relative border border-[#E8DDFB]/60">
                      <img
                        src={tip.imageUrl}
                        alt={tip.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-[#542A70] font-extrabold uppercase tracking-wider block">
                      {tip.category} · {tip.readTime}
                    </span>
                    <h4 className="text-xs font-bold text-[#29213B] mt-1 leading-snug">
                      {tip.title}
                    </h4>
                    <p className="text-[11px] font-medium text-[#62566F] line-clamp-2 mt-1 leading-relaxed">
                      {tip.summary}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#F0E8F8] flex items-center justify-between text-[11px] text-[#542A70] font-bold">
                    <span>Read Guidance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Emergency SOS Activator, Guardian Circle & Safe Havens */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Emergency SOS High-Alert Action (Claymorphic Coral-Crimson) */}
          <div className="clay-card p-6 border-2 border-rose-200/90 bg-gradient-to-br from-[#FFF5F8] via-[#FFF9FA] to-[#FEEDF0]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-600/15 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-xs font-extrabold text-[#351B4D]">
                  Instant SOS Beacon
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">
                Emergency
              </span>
            </div>

            <p className="text-xs text-[#62566F] mb-4 leading-relaxed font-medium">
              Immediately alerts your trusted circle with real-time GPS coordinates, triggers optional deterrent siren, and cryptographically records evidence.
            </p>

            {sosConfirming ? (
              <div className="p-4 rounded-2xl bg-rose-100/80 border border-rose-300 animate-fadeIn">
                <p className="text-xs font-extrabold text-rose-900 text-center mb-3">
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
                    className="h-12 px-4 rounded-full bg-white text-xs font-bold text-[#29213B] hover:bg-slate-50 cursor-pointer border border-rose-200"
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

          {/* Trusted Circle Card with Cohesive Connection Illustration */}
          <div className="clay-card p-6 border-2 border-[#E8DDFB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#542A70]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#351B4D]">
                  Trusted Circle ({contacts.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('contacts')}
                className="text-xs font-bold text-[#542A70] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* Generated Connection Storytelling Illustration */}
            <div className="w-full h-32 rounded-2xl overflow-hidden mb-3.5 relative border border-[#E8DDFB] shadow-xs">
              <img
                src="/src/assets/images/safesaathi_trusted_circle_art_1792356790748.jpg"
                alt="Connected Guardians"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#351B4D]/75 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">
                  Mutual Protection Network
                </span>
              </div>
            </div>

            {/* Primary Contact Showcase */}
            {primaryContact && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DDFB] shadow-xs flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#29213B] truncate">
                      {primaryContact.name}
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                      Primary
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#62566F] block truncate">
                    {primaryContact.relationship} · {primaryContact.phone}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQuickWhatsAppAlert(primaryContact)}
                    className="p-2 rounded-xl bg-[#E8DDFB] hover:bg-[#D99AB9] text-[#542A70] transition active:scale-95 cursor-pointer"
                    title="Send WhatsApp Beacon"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="p-2 rounded-xl bg-[#351B4D] text-white hover:bg-[#542A70] transition active:scale-95 cursor-pointer shadow-xs"
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
                  className="p-3 rounded-xl bg-[#F8F0F8] border border-[#E8DDFB] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#29213B] block">{c.name}</span>
                    <span className="text-[11px] font-medium text-[#62566F]">{c.relationship}</span>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-xs text-[#542A70] font-bold hover:underline"
                  >
                    Call
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Verified Safe Havens */}
          <div className="clay-card p-6 border-2 border-[#E8DDFB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#542A70]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#351B4D]">
                  Nearby Safe Havens
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-bold text-[#542A70] hover:underline cursor-pointer"
              >
                Open Map
              </button>
            </div>

            <div className="space-y-2.5">
              {NEARBY_SAFE_PLACES.slice(0, 3).map((place) => (
                <div
                  key={place.id}
                  onClick={() => setActiveTab('map')}
                  className="p-3 rounded-2xl bg-white hover:bg-purple-50/50 border border-[#E8DDFB] cursor-pointer flex items-center justify-between transition shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-[#29213B] truncate">{place.name}</h5>
                    <span className="text-[11px] font-medium text-[#62566F] block truncate">{place.address}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#542A70] px-2.5 py-1 rounded-full bg-[#E8DDFB] shrink-0 border border-purple-200">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="clay-card-elevated w-full max-w-md p-6 shadow-2xl border-2 border-[#E8DDFB]">
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-purple-50">
              <img
                src={selectedTip.imageUrl}
                alt={selectedTip.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#542A70]">
              {selectedTip.category} · {selectedTip.readTime}
            </span>
            <h3 className="text-lg font-bold text-[#351B4D] mt-1 mb-2">
              {selectedTip.title}
            </h3>
            <p className="text-xs font-medium text-[#62566F] leading-relaxed mb-6">
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
