import React, { useState, useEffect } from 'react';
import {
  Shield,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  User,
  ChevronDown,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import {
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendPasswordResetEmail,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { soundManager } from '../../utils/audio';

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', dial: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dial: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dial: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', dial: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dial: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', dial: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'DE', dial: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dial: '+33', name: 'France', flag: '🇫🇷' },
];

interface AuthScreenProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onSkip,
  initialMode = 'signin',
}) => {
  const { showToast } = useSafety();

  // Mode: 'email' or 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');

  // Email form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  // Phone OTP form state
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // UI status
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Clean full phone number in E.164 format
  const getFullPhoneE164 = (): string => {
    const rawDigits = phoneNumber.replace(/\D/g, '');
    const cleanDigits = rawDigits.startsWith('0') ? rawDigits.slice(1) : rawDigits;
    return `${selectedCountry.dial}${cleanDigits}`;
  };

  // 1. Handle Email / Password Login & Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    soundManager.triggerHaptic(20);

    try {
      if (isSignUp) {
        const { user, session, error, requiresEmailConfirmation } = await signUpWithEmail(
          cleanEmail,
          password,
          { name: name.trim() || cleanEmail.split('@')[0] }
        );

        if (error) {
          setErrorMessage(error.message || 'Failed to create account.');
          setLoading(false);
          return;
        }

        if (requiresEmailConfirmation) {
          setInfoMessage(
            'Account created! A confirmation link has been sent to your email. Please verify your email before signing in.'
          );
          setIsSignUp(false);
        } else if (session || user) {
          showToast('Welcome to SafeSaathi!');
          onSuccess?.();
        }
      } else {
        const { user, session, error } = await signInWithEmail(cleanEmail, password);

        if (error) {
          setErrorMessage(error.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        if (session || user) {
          showToast('Welcome back to SafeSaathi!');
          onSuccess?.();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication encountered an unexpected issue.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Password Reset Email
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive reset instructions.');
      return;
    }

    setLoading(true);
    soundManager.triggerHaptic(20);

    try {
      const { error } = await sendPasswordResetEmail(cleanEmail);
      if (error) {
        setErrorMessage(error.message || 'Could not send password reset email.');
      } else {
        setInfoMessage('Password reset instructions sent. Please check your inbox.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process password reset.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Send Phone OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    const fullPhone = getFullPhoneE164();
    setLoading(true);
    soundManager.triggerHaptic(20);

    try {
      const { error } = await sendPhoneOtp(fullPhone);
      if (error) {
        setErrorMessage(error.message || 'Failed to dispatch SMS verification code.');
      } else {
        setOtpSent(true);
        setCooldownSeconds(60);
        setInfoMessage(`Verification code dispatched to ${fullPhone}. Please enter the 6-digit code below.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send verification SMS.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const fullPhone = getFullPhoneE164();
    setLoading(true);
    soundManager.triggerHaptic(20);

    try {
      const { session, user, error } = await verifyPhoneOtp(fullPhone, cleanOtp);
      if (error) {
        setErrorMessage(error.message || 'Invalid or expired OTP code. Please retry.');
      } else if (session || user) {
        showToast('Phone verified. Welcome to SafeSaathi!');
        onSuccess?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not verify code.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-md editorial-card rounded-[36px] p-6 sm:p-8 shadow-xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/90 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#702E46] to-[#45263F] text-white flex items-center justify-center mx-auto mb-3 shadow-md border border-white/20">
            <Shield className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#29252D] dark:text-[#FAF5EF]">
            SafeSaathi
          </h2>
          <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">
            Autonomous Women's Safety &amp; Journey Companion
          </p>
        </div>

        {/* Supabase status warning if not fully configured */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-2xl bg-[#C5A36A]/15 border border-[#C5A36A]/30 text-xs text-[#29252D] dark:text-[#FAF5EF] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A36A] shrink-0" />
            <div className="leading-tight">
              <span className="font-extrabold block">Autonomous Local Storage</span>
              <span className="text-[11px] text-[#625B63] dark:text-[#E9DFD2]/80">
                You can test without cloud credentials, or sign in to sync with Supabase.
              </span>
            </div>
          </div>
        )}

        {/* Skip button for rapid preview */}
        <div className="flex justify-end mb-2">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
            >
              Continue Offline &rarr;
            </button>
          )}
        </div>

        {/* Auth Method Tabs (Tactile Claymorphic Tab Dock) */}
        {!isForgotPassword && (
          <div className="grid grid-cols-2 gap-2 clay-tab-dock mb-6">
            <button
              type="button"
              onClick={() => {
                soundManager.triggerHaptic(15);
                setAuthMethod('email');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2.5 px-3 clay-tab-btn text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer ${
                authMethod === 'email'
                  ? 'clay-tab-active'
                  : 'clay-tab-inactive'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.triggerHaptic(15);
                setAuthMethod('phone');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2.5 px-3 clay-tab-btn text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer ${
                authMethod === 'phone'
                  ? 'clay-tab-active'
                  : 'clay-tab-inactive'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone SMS OTP</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#C86650]/15 text-[#C86650] border border-[#C86650]/30 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-extrabold">{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-[#7E927B]/20 text-[#7E927B] border border-[#7E927B]/40 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#7E927B]" />
            <span className="leading-relaxed font-extrabold">{infoMessage}</span>
          </div>
        )}

        {/* VIEW 1: EMAIL & PASSWORD FLOW */}
        {authMethod === 'email' && !isForgotPassword && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aanya Sharma"
                    required={isSignUp}
                    className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF]">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="text-[11px] font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#625B63] hover:text-[#29252D] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition disabled:opacity-50 cursor-pointer border border-white/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isSignUp ? (
                <>
                  <span>Create Protected Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-3 border-t border-[#E9DFD2] dark:border-[#45263F]">
              <span className="text-xs text-[#625B63] dark:text-[#E9DFD2]/80">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: PHONE SMS OTP FLOW */}
        {authMethod === 'phone' && !isForgotPassword && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF] mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const c = COUNTRY_CODES.find((x) => x.code === e.target.value);
                          if (c) setSelectedCountry(c);
                        }}
                        className="w-full h-11 pl-2.5 pr-6 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.dial}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#625B63] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-mono font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#625B63] dark:text-[#E9DFD2]/80 mt-1 block">
                    Full E.164: <strong className="font-mono text-[#702E46] dark:text-[#E99583]">{getFullPhoneE164()}</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldownSeconds > 0}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition disabled:opacity-50 cursor-pointer border border-white/20"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit SMS Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF]">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      autoFocus
                      className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-center font-mono text-base font-extrabold tracking-widest text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition disabled:opacity-50 cursor-pointer border border-white/20"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={cooldownSeconds > 0 || loading}
                    onClick={handleSendPhoneOtp}
                    className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {cooldownSeconds > 0 ? `Resend Code in ${cooldownSeconds}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD FLOW */}
        {isForgotPassword && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-left mb-2">
              <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                Reset SafeSaathi Password
              </h3>
              <p className="text-xs text-[#625B63] dark:text-[#E9DFD2]/80 mt-0.5">
                Enter your email address and we will dispatch a secure recovery link.
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#625B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] focus:outline-hidden focus:ring-2 focus:ring-[#702E46]/40 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition disabled:opacity-50 cursor-pointer border border-white/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] hover:underline cursor-pointer"
              >
                &larr; Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
