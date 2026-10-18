import React, { useState } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface PinDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onSuccess: (pin: string) => { success: boolean; message: string; isDuress: boolean };
  onCancel: () => void;
  actionLabel?: string;
}

export const PinDialog: React.FC<PinDialogProps> = ({
  isOpen,
  title,
  subtitle = 'Enter your 4-digit security PIN to proceed',
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      soundManager.triggerHaptic(30);
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg(null);
      if (newPin.length === 4) {
        const res = onSuccess(newPin);
        if (!res.success) {
          setErrorMsg(res.message);
          setPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    soundManager.triggerHaptic(20);
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel-elevated w-full max-w-sm rounded-[32px] p-6 lg:p-7 shadow-2xl border border-slate-200 dark:border-indigo-900/60">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">{subtitle}</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-600 scale-110 shadow-sm'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 text-center text-xs font-black text-red-600 bg-red-100 dark:bg-red-950/60 py-2 px-3 rounded-xl border border-red-200 dark:border-red-900 animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="pin-digit-btn h-13 rounded-2xl text-[18px] font-semibold text-[#1E2B5B] bg-[#F0F2FF] border border-[#D8DDF0] flex items-center justify-center hover:bg-[#E2E7FC] active:scale-95 transition shadow-xs cursor-pointer select-none"
              style={{
                backgroundColor: '#F0F2FF',
                borderColor: '#D8DDF0',
                color: '#1E2B5B',
                WebkitTextFillColor: '#1E2B5B',
                fontSize: '18px',
                fontWeight: 600,
                opacity: 1,
                visibility: 'visible',
              }}
              aria-label={`Digit ${digit}`}
            >
              <span style={{ color: '#1E2B5B', WebkitTextFillColor: '#1E2B5B', fontWeight: 600, fontSize: '18px' }}>
                {digit}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="pin-control-btn h-13 rounded-2xl text-xs font-bold text-[#1E2B5B] bg-[#F4F6FF] border border-[#D8DDF0] flex items-center justify-center hover:bg-[#E8ECFB] active:scale-95 transition cursor-pointer select-none"
            style={{
              backgroundColor: '#F4F6FF',
              borderColor: '#D8DDF0',
              color: '#1E2B5B',
              WebkitTextFillColor: '#1E2B5B',
              fontWeight: 700,
              opacity: 1,
              visibility: 'visible',
            }}
            aria-label="Clear PIN"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="pin-digit-btn h-13 rounded-2xl text-[18px] font-semibold text-[#1E2B5B] bg-[#F0F2FF] border border-[#D8DDF0] flex items-center justify-center hover:bg-[#E2E7FC] active:scale-95 transition shadow-xs cursor-pointer select-none"
            style={{
              backgroundColor: '#F0F2FF',
              borderColor: '#D8DDF0',
              color: '#1E2B5B',
              WebkitTextFillColor: '#1E2B5B',
              fontSize: '18px',
              fontWeight: 600,
              opacity: 1,
              visibility: 'visible',
            }}
            aria-label="Digit 0"
          >
            <span style={{ color: '#1E2B5B', WebkitTextFillColor: '#1E2B5B', fontWeight: 600, fontSize: '18px' }}>
              0
            </span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="pin-control-btn h-13 rounded-2xl text-xs font-bold text-[#1E2B5B] bg-[#F4F6FF] border border-[#D8DDF0] flex items-center justify-center hover:bg-[#E8ECFB] active:scale-95 transition cursor-pointer select-none"
            style={{
              backgroundColor: '#F4F6FF',
              borderColor: '#D8DDF0',
              color: '#1E2B5B',
              WebkitTextFillColor: '#1E2B5B',
              fontWeight: 700,
              opacity: 1,
              visibility: 'visible',
            }}
            aria-label="Backspace delete last digit"
          >
            <Delete className="w-5 h-5 stroke-[2.4]" style={{ color: '#1E2B5B' }} />
          </button>
        </div>

        <div className="text-center pt-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Default verification PIN is <strong className="text-indigo-700 dark:text-indigo-400 font-black">1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
