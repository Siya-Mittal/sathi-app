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
      titleLine1: 'Trusted Protection',
      titleLine2: 'Autonomous Journey',
      titleLine3: 'Always',
      tagline:
        'Proactive AI journey sentry, verified safe corridors, and emergency circle escalation for complete peace of mind on Web & Mobile.',
      badge: 'Proactive Journey Guard',
      icon: <Shield className="w-6 h-6 text-[#6C3A82]" />,
    },
    {
      titleLine1: 'Instant Alert',
      titleLine2: 'Before Escalation',
      titleLine3: 'Guaranteed',
      tagline:
        'If your ride departs by >500m or makes an unexplained stop, an automated 30-second “Are you safe?” countdown activates immediately.',
      badge: '30s Anomaly Verification',
      icon: <Navigation className="w-6 h-6 text-[#6C3A82]" />,
    },
    {
      titleLine1: 'Private Data',
      titleLine2: 'Zero Tracking Abuse',
      titleLine3: 'Protected',
      tagline:
        'Your coordinates are never broadcast outside an active transit escort or distress beacon. Encrypted local evidence vault keeps you in control.',
      badge: 'Encrypted Evidence Vault',
      icon: <Lock className="w-6 h-6 text-[#6C3A82]" />,
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
        isDark ? 'ambient-bg-dark text-[#FAF4FE]' : 'ambient-bg-light text-[#2A1637]'
      }`}
    >
      {/* 1. Status Bar */}
      <div className="px-6 pt-3 flex items-center justify-between text-xs font-bold max-w-lg mx-auto w-full text-[#6C3A82] dark:text-purple-300">
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
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#6C3A82] to-[#55276B] flex items-center justify-center text-white shadow-sm border border-purple-200/40">
              <Shield className="w-5 h-5 fill-white/20 stroke-[2.4]" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-[#2A1637] dark:text-[#FAF4FE]">
              SafeSaathi
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs font-bold text-[#62566F] dark:text-purple-300 hover:text-[#6C3A82] dark:hover:text-white transition cursor-pointer"
          >
            Skip Intro
          </button>
        </div>

        {/* Big Bold Headline */}
        <div className="mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A1637] dark:text-[#FAF4FE] tracking-tight leading-tight">
            {current.titleLine1}
            <br />
            {current.titleLine2}
            <br />
            <span className="inline-flex items-center gap-2 text-[#6C3A82] dark:text-purple-300">
              <span>{current.titleLine3}</span>
              <Sparkles className="w-5 h-5 text-[#D99AB9]" />
            </span>
          </h1>

          <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 mt-2 leading-relaxed max-w-md">
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
                  ? 'w-7 bg-gradient-to-r from-[#6C3A82] to-[#55276B]'
                  : 'w-1.5 bg-purple-200 dark:bg-purple-800 hover:bg-purple-300'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. Center 3D Showcase */}
      <div className="relative flex-1 flex items-center justify-center px-4 overflow-hidden max-w-lg mx-auto w-full">
        {/* Ambient Blur */}
        <div className="absolute w-72 h-72 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />

        {/* Floating badge */}
        <div className="absolute top-2 left-6 z-20 clay-card px-3.5 py-1.5 rounded-2xl shadow-md border border-[#E8DEF3] flex items-center gap-2 bg-white/90">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6C3A82] animate-ping" />
          <span className="text-xs font-bold text-[#6C3A82]">{current.badge}</span>
        </div>

        <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
          <SafeSaathiClay3DShield
            size="md"
            interactive={true}
            showControls={false}
          />
        </div>
      </div>

      {/* 4. Bottom Interactive "Swipe To Start" slider */}
      <div className="p-6 pt-2 pb-8 max-w-lg mx-auto w-full">
        <SwipeButton
          onSuccess={handleFinish}
          label="Swipe To Enter SafeSaathi"
        />

        <div className="text-center mt-3">
          <button
            onClick={handleFinish}
            className="text-xs font-bold text-[#62566F] dark:text-purple-300 hover:text-[#6C3A82] dark:hover:text-white transition cursor-pointer"
          >
            Or tap here to enter SafeSaathi directly
          </button>
        </div>
      </div>
    </div>
  );
};
