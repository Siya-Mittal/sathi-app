import React, { useState } from 'react';
import {
  Shield,
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  Sparkles,
  Navigation,
  Compass,
  Lock,
  HeartHandshake,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { SwipeButton } from '../common/SwipeButton';
import { soundManager } from '../../utils/audio';
import { SafeSaathiClay3DShield } from '../3d/SafeSaathiClay3DShield';

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateUser, theme } = useSafety();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const slides = [
    {
      titleLine1: 'Autonomous Protection',
      titleLine2: 'Empowered Transit',
      titleLine3: 'Always Protected',
      tagline:
        'Proactive AI journey sentry, verified safe corridors, and emergency circle escalation for complete peace of mind on Web & Mobile.',
      badge: 'Proactive Journey Guard',
      icon: <Shield className="w-6 h-6 text-[#702E46] dark:text-[#E99583]" />,
    },
    {
      titleLine1: 'Instant Verification',
      titleLine2: 'Before Escalation',
      titleLine3: 'Tamper Evident',
      tagline:
        'If your route departs by >500m or makes an unexplained stop, an automated 30-second “Are you safe?” countdown activates immediately.',
      badge: '30s Anomaly Verification',
      icon: <Navigation className="w-6 h-6 text-[#C86650]" />,
    },
    {
      titleLine1: 'Private Data',
      titleLine2: 'Zero Tracking Abuse',
      titleLine3: 'Cryptographically Sealed',
      tagline:
        'Your coordinates are never broadcast outside an active transit escort or distress beacon. Encrypted local evidence vault keeps you in control.',
      badge: 'Encrypted Evidence Vault',
      icon: <Lock className="w-6 h-6 text-[#7E927B]" />,
    },
  ];

  const current = slides[activeSlide];

  const handleFinish = () => {
    soundManager.triggerHaptic(30);
    updateUser({ onboardingCompleted: true });
    onComplete();
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-fadeIn ${
        isDark ? 'ambient-bg-dark text-[#FAF5EF]' : 'ambient-bg-light text-[#29252D]'
      }`}
    >
      {/* 1. Status Bar */}
      <div className="px-6 pt-3 flex items-center justify-between text-xs font-extrabold max-w-lg mx-auto w-full text-[#702E46] dark:text-[#E99583]">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Top Header & Typography */}
      <div className="px-6 pt-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#702E46] to-[#45263F] flex items-center justify-center text-white shadow-sm border border-white/20">
              <Shield className="w-5 h-5 fill-white/20 stroke-[2.4]" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-[#29252D] dark:text-[#FAF5EF]">
              SafeSaathi
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] hover:text-[#702E46] dark:hover:text-white transition cursor-pointer"
          >
            Skip Intro
          </button>
        </div>

        {/* Big Bold Headline with editorial contrast */}
        <div className="mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29252D] dark:text-[#FAF5EF] tracking-tight leading-tight">
            {current.titleLine1}
            <br />
            {current.titleLine2}
            <br />
            <span className="inline-flex items-center gap-2 text-[#702E46] dark:text-[#E99583]">
              <span>{current.titleLine3}</span>
              <Sparkles className="w-5 h-5 text-[#C5A36A]" />
            </span>
          </h1>

          <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-2 leading-relaxed max-w-md">
            {current.tagline}
          </p>
        </div>

        {/* 3 Dot indicators */}
        <div className="flex items-center gap-1.5 mt-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundManager.triggerHaptic(15);
                setActiveSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeSlide
                  ? 'w-7 bg-gradient-to-r from-[#702E46] to-[#C86650]'
                  : 'w-1.5 bg-[#E9DFD2] dark:bg-[#45263F] hover:bg-[#C86650]/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Center 3D Showcase */}
      <div className="relative flex-1 flex items-center justify-center px-4 overflow-hidden max-w-lg mx-auto w-full">
        {/* Ambient Warm Blur */}
        <div className="absolute w-72 h-72 rounded-full bg-[#E99583]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[340px] flex items-center justify-center">
          <SafeSaathiClay3DShield
            size="lg"
            interactive={true}
            showControls={false}
            status="safe"
          />
        </div>
      </div>

      {/* 4. Bottom Controls */}
      <div className="px-6 pb-8 pt-2 max-w-lg mx-auto w-full space-y-4">
        {activeSlide < slides.length - 1 ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#625B63] dark:text-[#E9DFD2]/80">
              Slide {activeSlide + 1} of {slides.length}
            </span>
            <button
              onClick={() => {
                soundManager.triggerHaptic(20);
                setActiveSlide((prev) => prev + 1);
              }}
              className="h-11 px-6 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
            >
              Next Step &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <SwipeButton
              label="Swipe to Enter SafeSaathi"
              onSuccess={handleFinish}
            />
            <button
              onClick={handleFinish}
              className="w-full text-center text-xs font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
            >
              Or tap here to launch dashboard &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
