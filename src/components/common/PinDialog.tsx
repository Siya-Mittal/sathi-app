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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-xl animate-fadeIn">
      <div className="clay-card-elevated w-full max-w-sm rounded-[32px] p-6 lg:p-7 shadow-2xl border-2 border-[#E9DFD2] dark:border-[#E9DFD2]/25">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#702E46]/15 text-[#702E46] dark:text-[#E99583] flex items-center justify-center border border-[#702E46]/20">
              <Lock className="w-4 h-4 stroke-[2.4]" />
            </div>
            <h3 className="text-base font-extrabold text-[#45263F] dark:text-[#FAF5EF]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#62566F] dark:text-[#FAF5EF] hover:bg-[#FAF5EF] dark:hover:bg-[#45263F] active:scale-95 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2] mb-5 leading-relaxed">{subtitle}</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#C86650] scale-110 shadow-sm ring-2 ring-[#C86650]/40'
                    : 'bg-[#E9DFD2] dark:bg-[#45263F]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 text-center text-xs font-black text-[#BA223C] bg-red-50 dark:bg-red-950/60 py-2 px-3 rounded-xl border border-red-200 dark:border-red-900 animate-shake">
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
              className="pin-digit-btn h-13 rounded-2xl text-[18px] font-bold text-[#29252D] dark:text-white flex items-center justify-center active:scale-95 transition shadow-xs cursor-pointer select-none"
              aria-label={`Digit ${digit}`}
            >
              <span>{digit}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="pin-control-btn h-13 rounded-2xl text-xs font-extrabold flex items-center justify-center active:scale-95 transition cursor-pointer select-none"
            aria-label="Clear PIN"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="pin-digit-btn h-13 rounded-2xl text-[18px] font-bold text-[#29252D] dark:text-white flex items-center justify-center active:scale-95 transition shadow-xs cursor-pointer select-none"
            aria-label="Digit 0"
          >
            <span>0</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="pin-control-btn h-13 rounded-2xl text-xs font-bold flex items-center justify-center active:scale-95 transition cursor-pointer select-none"
            aria-label="Backspace delete last digit"
          >
            <Delete className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        <div className="text-center pt-2">
          <span className="text-[11px] font-semibold text-[#62566F] dark:text-[#E9DFD2]">
            Default verification PIN is <strong className="text-[#702E46] dark:text-[#E99583] font-black">1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
