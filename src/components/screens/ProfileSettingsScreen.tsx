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
    <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E8DEF3] space-y-4 bg-[#FFFDFB] dark:bg-purple-950/40">
      <div className="flex items-center justify-between pb-2 border-b border-[#E8DEF3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C3A82] dark:bg-purple-900/50 dark:text-purple-300 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2A1637] dark:text-[#FAF4FE]">
              Supabase Cloud Connection
            </h3>
            <span className="text-[11px] font-semibold text-[#7A6588] dark:text-purple-300">
              Live status &amp; schema validation
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={checking}
          className="h-8 px-3 rounded-xl clay-card text-xs font-bold text-[#6C3A82] dark:text-purple-300 flex items-center gap-1.5 hover:bg-purple-50 transition active:scale-95 disabled:opacity-50 cursor-pointer border border-[#E8DEF3]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking...' : 'Check'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Status indicator row */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8F4] dark:bg-purple-900/40 border border-[#E8DEF3]">
          <span className="text-xs font-semibold text-[#62566F] dark:text-purple-300">
            Project Endpoint
          </span>
          <span className="text-xs font-mono font-bold text-[#6C3A82] dark:text-purple-200 truncate max-w-[200px]">
            {cleanUrl || 'Not configured'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8F4] dark:bg-purple-900/40 border border-[#E8DEF3]">
          <span className="text-xs font-semibold text-[#62566F] dark:text-purple-300">
            Connection State
          </span>
          <div className="flex items-center gap-1.5">
            {health?.reachable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                <span>Reachable</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Offline / Local Only</span>
              </span>
            )}
          </div>
        </div>

        {/* Database Tables Verification */}
        {health?.tables && Object.keys(health.tables).length > 0 && (
          <div className="p-3 rounded-2xl bg-[#FFF8F4] dark:bg-purple-900/40 border border-[#E8DEF3] space-y-2">
            <span className="text-xs font-semibold text-[#62566F] dark:text-purple-300 block">
              Schema Tables (Postgres Cache)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(health.tables).map(([tbl, ok]) => (
                <div key={tbl} className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white dark:bg-purple-950 text-[11px] border border-[#E8DEF3]">
                  <span className="font-mono text-[#2A1637] dark:text-purple-200">{tbl}</span>
                  {ok ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ OK</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Missing</span>
                  )}
                </div>
              ))}
            </div>

            {anyTableMissing && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <strong>Table setup needed:</strong> Run the migration SQL in your Supabase SQL Editor (`supabase/migrations/20261015000000_safejourney_core.sql`) so these tables exist.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfileSettingsScreen: React.FC = () => {
  const {
    user,
    updateUser,
    setActiveTab,
    showToast,
    theme,
    setTheme,
    deviceView,
    setDeviceView,
    setShowAuthModal,
    signOutAction,
  } = useSafety();

  const [name, setName] = useState<string>(user.name);
  const [phone, setPhone] = useState<string>(user.phone);
  const [bloodGroup, setBloodGroup] = useState<string>(user.bloodGroup || 'B+');
  const [emergencyNote, setEmergencyNote] = useState<string>(user.emergencyNote || '');
  const [pin, setPin] = useState<string>(user.pin);
  const [duressPin, setDuressPin] = useState<string>(user.duressPin || '9999');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone);
    if (user.bloodGroup) setBloodGroup(user.bloodGroup);
    if (user.emergencyNote) setEmergencyNote(user.emergencyNote);
    if (user.pin) setPin(user.pin);
    if (user.duressPin) setDuressPin(user.duressPin);
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      bloodGroup,
      emergencyNote,
      pin,
      duressPin,
    });
    setSavedSuccess(true);
    soundManager.triggerHaptic(30);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast('Profile & security preferences updated');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to erase all cached journey logs and reset settings?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-10 px-4 rounded-2xl clay-card flex items-center gap-1.5 text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] hover:bg-purple-50/70 active:scale-95 transition shadow-xs border border-[#E8DEF3] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#6C3A82]" />
            <span>Command Hub</span>
          </button>
          <div>
            <h1 className="text-base lg:text-xl font-extrabold text-[#2A1637] dark:text-[#FAF4FE] tracking-tight">
              Profile &amp; Security Configurations
            </h1>
            <span className="text-xs font-medium text-[#7A6588] dark:text-purple-300 hidden sm:inline">
              Personal emergency credentials, duress PINs, and automated thresholds
            </span>
          </div>
        </div>
      </div>

      {/* Cloud Authentication Session Banner */}
      <div className="clay-card-elevated rounded-[28px] p-5 shadow-sm border border-[#E8DEF3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFDFB] dark:bg-purple-950/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#6C3A82] dark:bg-purple-900/50 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A6588] dark:text-purple-300">
                Supabase Identity
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  user.isLoggedIn
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-purple-100 text-[#6C3A82] dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200'
                }`}
              >
                {user.isLoggedIn ? 'Authenticated' : 'Local Offline / Guest'}
              </span>
            </div>
            <p className="text-sm font-bold text-[#2A1637] dark:text-[#FAF4FE] mt-0.5">
              {user.isLoggedIn
                ? user.email || user.phone || 'Cloud Account Connected'
                : 'Not signed in to Supabase'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {user.isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="h-9 px-3.5 rounded-xl clay-card text-xs font-bold text-[#62566F] dark:text-purple-200 hover:text-[#6C3A82] transition cursor-pointer border border-[#E8DEF3]"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={signOutAction}
                className="h-9 px-3.5 rounded-xl bg-red-50 text-[#C62845] dark:bg-red-950/40 dark:text-red-300 text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 active:scale-95 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Responsive Grid: 2 columns on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: User Identity */}
          <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E8DEF3] space-y-4 bg-[#FFFDFB] dark:bg-purple-950/40">
            <div className="flex items-center gap-4 pb-4 border-b border-[#E8DEF3]">
              <div className="w-16 h-16 rounded-3xl overflow-hidden clay-card border border-[#E8DEF3] shadow-sm shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#6C3A82] to-[#55276B] text-white font-extrabold text-xl flex items-center justify-center">
                    {user.name.charAt(0) || 'S'}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2A1637] dark:text-[#FAF4FE]">{user.name}</h2>
                <span className="text-xs font-semibold text-[#62566F] dark:text-purple-300">
                  {user.email || user.phone || 'No email configured'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#6C3A82] dark:text-purple-300 font-bold mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {user.isLoggedIn ? 'Cloud Synced SafeSaathi Profile' : 'Local Sandbox Mode'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-xs font-bold text-[#2A1637] dark:text-white focus:ring-2 focus:ring-[#6C3A82]/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-xs font-bold text-[#2A1637] dark:text-white focus:ring-2 focus:ring-[#6C3A82]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-xs font-bold text-[#2A1637] dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-1">
                    Emergency Medical Note
                  </label>
                  <input
                    type="text"
                    value={emergencyNote}
                    onChange={(e) => setEmergencyNote(e.target.value)}
                    placeholder="e.g. Inhaler in bag"
                    className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-xs font-bold text-[#2A1637] dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Duress PINs */}
          <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E8DEF3] space-y-4 bg-[#FFFDFB] dark:bg-purple-950/40">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-[#6C3A82] dark:text-purple-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2A1637] dark:text-[#FAF4FE]">
                Security PIN &amp; Duress Protocol
              </h3>
            </div>

            <p className="text-xs font-medium text-[#62566F] dark:text-purple-300 leading-relaxed">
              Standard PIN silences and cancels alarms. If coerced under threat, entering your <strong>Duress PIN</strong> appears to dismiss the alarm on-screen while silently broadcasting an emergency distress beacon.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-1">
                  Standard PIN (Safe)
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] font-mono text-sm font-bold text-[#2A1637] dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#C62845] block mb-1">
                  Duress PIN (Silent SOS)
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  value={duressPin}
                  onChange={(e) => setDuressPin(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] font-mono text-sm font-bold text-[#2A1637] dark:text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-xs text-[#62566F] dark:text-purple-300 hover:text-[#6C3A82] dark:hover:text-white font-bold mt-2 flex items-center gap-1.5 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPin ? 'Hide PIN numbers' : 'Reveal PIN numbers'}</span>
            </button>
          </div>

          {/* Card 3: Experience & Display Preferences */}
          <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E8DEF3] space-y-4 bg-[#FFFDFB] dark:bg-purple-950/40">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-[#6C3A82] dark:text-purple-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2A1637] dark:text-[#FAF4FE]">
                Display &amp; Viewport Preferences
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-2">
                  Theme Appearance &amp; Mood
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-purple-900/60 text-[#62566F] dark:text-purple-300 border-[#E8DEF3]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span className="font-bold">Warm Ivory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-purple-900/60 text-[#62566F] dark:text-purple-300 border-[#E8DEF3]'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-purple-300" />
                    <span className="font-bold">Deep Plum</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#2A1637] dark:text-[#FAF4FE] block mb-2">
                  Device Layout Mode
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeviceView('web')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      deviceView === 'web'
                        ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-purple-900/60 text-[#62566F] dark:text-purple-300 border-[#E8DEF3]'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="font-bold">Web Platform</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceView('mobile')}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition cursor-pointer ${
                      deviceView === 'mobile'
                        ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-purple-900/60 text-[#62566F] dark:text-purple-300 border-[#E8DEF3]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="font-bold">Mobile App Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Supabase Cloud Integration Status */}
          <SupabaseStatusCard />

          {/* Card 4: Data Management */}
          <div className="clay-card rounded-[32px] p-6 lg:p-7 shadow-sm border border-[#E8DEF3] space-y-4 bg-[#FFFDFB] dark:bg-purple-950/40">
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="w-5 h-5 text-[#C62845]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C62845]">
                Privacy &amp; Data Wipe
              </h3>
            </div>

            <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 leading-relaxed">
              Purges all local incident caches, trusted contact records, and journey history from this browser storage.
            </p>

            <button
              type="button"
              onClick={handleClearAllData}
              className="h-11 px-5 rounded-2xl bg-red-50 text-[#C62845] hover:bg-red-100 font-bold text-xs transition cursor-pointer"
            >
              Reset App Data &amp; Cache
            </button>
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="h-12 px-8 rounded-full bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/20 hover:opacity-95 active:scale-95 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
