import React, { useState } from 'react';
import { AlertTriangle, Lock, Delete, Siren } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';

export const CountdownDialog: React.FC = () => {
  const {
    isDeviationAlertActive,
    deviationCountdown,
    deviationReason,
    confirmSafetyAction,
    triggerSos,
    settings,
  } = useSafety();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<'SAFE' | 'DEACTIVATE'>('SAFE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isDeviationAlertActive) return null;

  const totalSeconds = settings.countdownSeconds || 30;
  const progressPercent = Math.max(0, Math.min(100, (deviationCountdown / totalSeconds) * 100));

  const handleDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      soundManager.triggerHaptic(25);
      const next = enteredPin + digit;
      setEnteredPin(next);
      setErrorMsg(null);

      if (next.length === 4) {
        const res = confirmSafetyAction(next, selectedAction);
        if (!res.success) {
          setErrorMsg(res.message);
          setEnteredPin('');
        }
      }
    }
  };

  const handleManualSos = () => {
    triggerSos('Manual SOS triggered during Journey Guard countdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/85 backdrop-blur-xl animate-fadeIn">
      <div className="clay-card-elevated w-full max-w-sm rounded-[32px] p-6 shadow-2xl border-2 border-[#E9DFD2] dark:border-[#E9DFD2]/25 overflow-hidden">
        {/* Urgent Alert Banner */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#BA223C]/15 flex items-center justify-center text-[#BA223C] shrink-0 border border-[#BA223C]/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#45263F] dark:text-[#FAF5EF] leading-tight">Are You Safe?</h2>
            <p className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">Journey Guard Anomaly Verification</p>
          </div>
        </div>

        {/* Reason card */}
        <div className="p-3.5 mb-3 rounded-2xl bg-[#FAF5EF] dark:bg-[#3A1F33] border border-[#E9DFD2] dark:border-[#E9DFD2]/25">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#702E46] dark:text-[#E99583] block mb-0.5">
            PROACTIVE TRIGGER
          </span>
          <p className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF]">{deviationReason}</p>
        </div>

        {/* 30s Countdown Display */}
        <div className="text-center py-1 mb-2">
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-[#BA223C]/30 bg-white dark:bg-[#3A1F33] shadow-inner">
              <span className="text-2xl font-black text-[#BA223C] tabular-nums tracking-tight">
                {deviationCountdown}
              </span>
              <span className="text-[9px] uppercase font-extrabold text-[#62566F] dark:text-[#E9DFD2] tracking-wider">
                seconds
              </span>
            </div>
          </div>
          <div className="w-full bg-[#E9DFD2] dark:bg-[#45263F] h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#BA223C] h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Selector: Action A vs Action B */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => {
              setSelectedAction('SAFE');
              setEnteredPin('');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              selectedAction === 'SAFE'
                ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white border-[#702E46] shadow-xs'
                : 'clay-card text-[#29252D] dark:text-[#FAF5EF] border-[#E9DFD2]'
            }`}
          >
            Action A: I Am Safe
          </button>
          <button
            onClick={() => {
              setSelectedAction('DEACTIVATE');
              setEnteredPin('');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              selectedAction === 'DEACTIVATE'
                ? 'bg-gradient-to-r from-[#702E46] to-[#45263F] text-white border-[#702E46] shadow-xs'
                : 'clay-card text-[#29252D] dark:text-[#FAF5EF] border-[#E9DFD2]'
            }`}
          >
            Action B: Deactivate Trip
          </button>
        </div>

        {/* PIN Entry Prompt */}
        <div className="mb-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#702E46] dark:text-[#E99583] font-bold mb-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Enter PIN to Authorize {selectedAction === 'SAFE' ? '"I am safe"' : '"Deactivate"'}</span>
          </div>

          <div className="flex justify-center gap-3 mb-2.5">
            {[0, 1, 2, 3].map((idx) => {
              const filled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    filled ? 'bg-[#C86650] scale-110 shadow-sm' : 'bg-[#E9DFD2] dark:bg-[#45263F]'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <p className="text-xs text-center text-[#BA223C] font-extrabold mb-2">{errorMsg}</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleDigit(n)}
                className="pin-digit-btn h-12 rounded-2xl text-[18px] font-bold text-[#29252D] dark:text-white flex items-center justify-center active:scale-95 transition shadow-xs cursor-pointer select-none"
                aria-label={`Digit ${n}`}
              >
                <span>{n}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                soundManager.triggerHaptic(20);
                setEnteredPin('');
                setErrorMsg(null);
              }}
              className="pin-control-btn h-12 rounded-2xl text-xs font-bold flex items-center justify-center active:scale-95 cursor-pointer select-none"
              aria-label="Clear PIN"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="pin-digit-btn h-12 rounded-2xl text-[18px] font-bold text-[#29252D] dark:text-white flex items-center justify-center active:scale-95 transition shadow-xs cursor-pointer select-none"
              aria-label="Digit 0"
            >
              <span>0</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.triggerHaptic(20);
                setEnteredPin((prev) => prev.slice(0, -1));
                setErrorMsg(null);
              }}
              className="pin-control-btn h-12 rounded-2xl text-xs font-bold flex items-center justify-center active:scale-95 cursor-pointer select-none"
              aria-label="Backspace delete last digit"
            >
              <Delete className="w-5 h-5 stroke-[2.4]" />
            </button>
          </div>
        </div>

        {/* Bottom Immediate Escalation */}
        <div className="pt-2 border-t border-[#E9DFD2] dark:border-[#E9DFD2]/25">
          <button
            onClick={handleManualSos}
            className="clay-btn-emergency w-full h-11 flex items-center justify-center gap-2 text-xs font-black"
          >
            <Siren className="w-4 h-4" />
            <span>In Immediate Danger? Escalate SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
