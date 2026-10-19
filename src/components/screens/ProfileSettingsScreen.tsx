import React, { useState, useEffect } from 'react';
import {
  Lock,
  Sliders,
  Trash2,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';
import { checkSupabaseHealth, isSupabaseConfigured, getCleanSupabaseUrl } from '../../lib/supabase';

const SupabaseStatusCard: React.FC = () => {
  const [checking, setChecking] = useState<boolean>(false);
  const [health, setHealth] = useState<{
    configured: boolean;
    url: string;
    reachable: boolean;
    statusText: string;
    tables: Record<string, boolean>;
  } | null>(null);

  const runCheck = async () => {
    setChecking(true);
    try {
      const res = await checkSupabaseHealth();
      setHealth(res);
    } catch {
      setHealth({
        configured: isSupabaseConfigured,
        url: getCleanSupabaseUrl(),
        reachable: false,
        statusText: 'Could not reach server',
        tables: {},
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const cleanUrl = getCleanSupabaseUrl();
  const anyTableMissing = health?.tables && Object.values(health.tables).some((v) => !v);

  return (
    <div className="editorial-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-4 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
      <div className="flex items-center justify-between pb-2 border-b border-[#E9DFD2] dark:border-[#45263F]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] flex items-center justify-center border border-[#702E46]/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
              Supabase Cloud Connection
            </h3>
            <span className="text-[11px] font-bold text-[#625B63] dark:text-[#E9DFD2]/80">
              Live status &amp; schema validation
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={checking}
          className="h-8 px-3 rounded-xl editorial-card text-xs font-extrabold text-[#702E46] dark:text-[#E99583] flex items-center gap-1.5 hover:bg-[#E9DFD2]/50 transition active:scale-95 disabled:opacity-50 cursor-pointer border border-[#E9DFD2] dark:border-[#45263F]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking...' : 'Check'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Status indicator row */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40">
          <span className="text-xs font-bold text-[#625B63] dark:text-[#E9DFD2]/80">
            Project Endpoint
          </span>
          <span className="text-xs font-mono font-bold text-[#702E46] dark:text-[#E99583] truncate max-w-[200px]">
            {cleanUrl || 'Local in-memory fallback'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40">
          <span className="text-xs font-bold text-[#625B63] dark:text-[#E9DFD2]/80">
            Connection State
          </span>
          <div className="flex items-center gap-1.5">
            {health?.reachable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#7E927B]/20 text-[#7E927B] border border-[#7E927B]/40">
                <CheckCircle className="w-3 h-3" />
                <span>Cloud Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#C5A36A]/20 text-[#C5A36A] border border-[#C5A36A]/40">
                <AlertTriangle className="w-3 h-3" />
                <span>Offline / Local Only</span>
              </span>
            )}
          </div>
        </div>

        {/* Database Tables Verification */}
        {health?.tables && Object.keys(health.tables).length > 0 && (
          <div className="p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 space-y-2">
            <span className="text-xs font-bold text-[#625B63] dark:text-[#E9DFD2]/80 block">
              Schema Tables (Postgres Cache)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(health.tables).map(([tbl, ok]) => (
                <div key={tbl} className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white dark:bg-[#29252D] text-[11px] border border-[#E9DFD2] dark:border-[#702E46]/30">
                  <span className="font-mono text-[#29252D] dark:text-[#FAF5EF]">{tbl}</span>
                  {ok ? (
                    <span className="text-[#7E927B] font-extrabold">✓ OK</span>
                  ) : (
                    <span className="text-[#C86650] font-extrabold">Missing</span>
                  )}
                </div>
              ))}
            </div>

            {anyTableMissing && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#C86650]/15 border border-[#C86650]/30 text-[#C86650] text-[11px] leading-relaxed font-bold">
                Some cloud tables have not yet been migrated. Local IndexedDB cache ensures zero data loss.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileSettingsScreen: React.FC = () => {
  const { user, updateUser, theme, setTheme, deviceView, setDeviceView, setActiveTab, showToast } = useSafety();

  const [name, setName] = useState<string>(user.name || 'Aanya Sharma');
  const [phone, setPhone] = useState<string>(user.phone || '+91 98765 43210');
  const [pin, setPin] = useState<string>(user.pin || '1234');
  const [duressPin, setDuressPin] = useState<string>(user.duressPin || '9999');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || isNaN(Number(pin))) {
      showToast('PIN must be exactly 4 digits');
      return;
    }
    if (duressPin.length !== 4 || isNaN(Number(duressPin))) {
      showToast('Duress PIN must be exactly 4 digits');
      return;
    }
    if (pin === duressPin) {
      showToast('Safety PIN and Duress PIN must be distinct');
      return;
    }

    updateUser({
      name,
      phone,
      pin,
      duressPin,
    });

    soundManager.triggerHaptic(25);
    setSavedSuccess(true);
    showToast('Profile and security credentials saved');
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearAllData = () => {
    if (confirm('Warning: This will clear all local journey logs, cached evidence, and reset settings. Continue?')) {
      try {
        localStorage.clear();
      } catch {}
      showToast('Local application storage purged.');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-10 px-4 rounded-2xl editorial-card flex items-center gap-1.5 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] hover:bg-[#E9DFD2]/40 active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
            <span>Command Hub</span>
          </button>
          <div>
            <h1 className="text-base lg:text-xl font-extrabold text-[#29252D] dark:text-[#FAF5EF] tracking-tight">
              Profile &amp; Security Settings
            </h1>
            <span className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 hidden sm:inline">
              Personal credentials, security PIN, duress codes, and display mode
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Personal Info */}
          <div className="editorial-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-4 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-[#702E46] dark:text-[#E99583]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF]">
                Personal Profile
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-none focus:ring-2 focus:ring-[#702E46]/40 shadow-xs"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Phone Number (E.164)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-mono font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-none focus:ring-2 focus:ring-[#702E46]/40 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Security & Duress PINs */}
          <div className="editorial-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-4 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-[#C86650]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF]">
                Security &amp; Duress PINs
              </h3>
            </div>

            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 leading-relaxed">
              Your 4-digit PIN authenticates deactivation. Entering your <strong>Duress PIN</strong> appears normal but secretly triggers an emergency broadcast.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Normal Safety PIN
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-mono text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-none focus:ring-2 focus:ring-[#702E46]/40 shadow-xs"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#C86650] block mb-1">
                  Duress PIN (Silent SOS)
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  value={duressPin}
                  onChange={(e) => setDuressPin(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#C86650]/40 font-mono text-sm font-extrabold text-[#C86650] focus:outline-none focus:ring-2 focus:ring-[#C86650]/40 shadow-xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-xs text-[#625B63] dark:text-[#E9DFD2] hover:text-[#702E46] dark:hover:text-white font-extrabold mt-2 flex items-center gap-1.5 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPin ? 'Hide PIN numbers' : 'Reveal PIN numbers'}</span>
            </button>
          </div>

          {/* Card 3: Experience & Display Preferences */}
          <div className="editorial-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-4 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-[#702E46] dark:text-[#E99583]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF]">
                Display &amp; Viewport Preferences
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-2">
                  Theme Appearance &amp; Mood
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white border-transparent shadow-md'
                        : 'bg-[#FFFDF9] dark:bg-[#381B34] text-[#625B63] dark:text-[#E9DFD2] border-[#E9DFD2] dark:border-[#E99583]/30'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-[#C5A36A]" />
                    <span className="font-extrabold">Warm Ivory (Light)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#702E46] to-[#C86650] text-white border-transparent shadow-md'
                        : 'bg-[#FFFDF9] dark:bg-[#381B34] text-[#625B63] dark:text-[#E9DFD2] border-[#E9DFD2] dark:border-[#E99583]/30'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-[#E99583]" />
                    <span className="font-extrabold">Dark Warm Colours</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-2">
                  Device Layout Mode
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeviceView('web')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      deviceView === 'web'
                        ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white border-transparent shadow-md'
                        : 'bg-[#FFFDF9] dark:bg-[#45263F]/60 text-[#625B63] dark:text-[#E9DFD2] border-[#E9DFD2] dark:border-[#702E46]/40'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="font-extrabold">Web Platform</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceView('mobile')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      deviceView === 'mobile'
                        ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white border-transparent shadow-md'
                        : 'bg-[#FFFDF9] dark:bg-[#45263F]/60 text-[#625B63] dark:text-[#E9DFD2] border-[#E9DFD2] dark:border-[#702E46]/40'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="font-extrabold">Mobile App Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Supabase Cloud Integration Status */}
          <SupabaseStatusCard />

          {/* Card 4: Data Management */}
          <div className="editorial-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-4 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="w-5 h-5 text-[#C86650]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#C86650]">
                Privacy &amp; Data Wipe
              </h3>
            </div>

            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 leading-relaxed">
              Purges all local incident caches, trusted contact records, and journey history from this browser storage.
            </p>

            <button
              type="button"
              onClick={handleClearAllData}
              className="h-11 px-5 rounded-2xl bg-[#C86650]/15 text-[#C86650] hover:bg-[#C86650]/25 font-extrabold text-xs transition cursor-pointer border border-[#C86650]/30"
            >
              Reset App Data &amp; Cache
            </button>
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="h-12 px-8 rounded-full bg-gradient-to-r from-[#702E46] to-[#C86650] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:opacity-95 active:scale-95 transition cursor-pointer border border-white/20"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
