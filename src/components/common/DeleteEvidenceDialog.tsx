import React, { useState, useEffect } from 'react';
import { Trash2, Lock, AlertTriangle, ShieldAlert, X, CheckCircle2, Clock, Delete } from 'lucide-react';
import { EvidenceRecord } from '../../types';
import { soundManager } from '../../utils/audio';

interface DeleteEvidenceDialogProps {
  isOpen: boolean;
  evidence: EvidenceRecord | null;
  userPin: string;
  isEmergencyActive: boolean;
  onConfirmDelete: (evidenceId: string, enteredPin: string) => Promise<{ success: boolean; message: string }>;
  onCancel: () => void;
}

export const DeleteEvidenceDialog: React.FC<DeleteEvidenceDialogProps> = ({
  isOpen,
  evidence,
  userPin,
  isEmergencyActive,
  onConfirmDelete,
  onCancel,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  if (!isOpen || !evidence) return null;

  const handleDigit = (digit: string) => {
    if (lockoutSeconds > 0 || isDeleting) return;
    if (enteredPin.length < 4) {
      soundManager.triggerHaptic(25);
      setEnteredPin((prev) => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleDeleteDigit = () => {
    if (lockoutSeconds > 0 || isDeleting) return;
    soundManager.triggerHaptic(15);
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleExecuteDelete = async () => {
    if (lockoutSeconds > 0) return;

    if (isEmergencyActive) {
      setErrorMsg('Deletion blocked: Evidence cannot be deleted while an emergency or journey deviation is active.');
      soundManager.playBeep(440, 0.3);
      return;
    }

    if (enteredPin.length !== 4) {
      setErrorMsg('Please enter your complete 4-digit security PIN.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    const res = await onConfirmDelete(evidence.id, enteredPin);
    setIsDeleting(false);

    if (!res.success) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setEnteredPin('');

      if (nextFailures >= 3) {
        setLockoutSeconds(30);
        setErrorMsg('Too many invalid attempts. Deletion interface locked for 30 seconds.');
      } else {
        setErrorMsg(`${res.message} (${3 - nextFailures} attempts remaining before temporary lockout).`);
      }
    } else {
      setEnteredPin('');
      setFailedAttempts(0);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#C86650]/40 max-h-[92vh] overflow-y-auto bg-[#FAF5EF] dark:bg-[#341B2F]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C86650]/15 text-[#C86650] flex items-center justify-center border border-[#C86650]/30 shadow-xs">
              <Trash2 className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Protected Evidence Deletion</h3>
              <span className="text-[11px] font-extrabold text-[#C86650] uppercase tracking-wider">PIN Authentication Required</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 dark:hover:bg-[#45263F] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if emergency is currently active */}
        {isEmergencyActive && (
          <div className="mt-3 p-3.5 rounded-2xl bg-[#C86650]/15 border border-[#C86650]/40 text-xs font-bold text-[#C86650] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 animate-pulse text-[#C86650]" />
            <span>Active emergency in progress. Incident evidence cannot be deleted until emergency is safely resolved.</span>
          </div>
        )}

        {/* Evidence Card Preview */}
        <div className="my-4 p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 flex items-center gap-3">
          {evidence.thumbnailUrl ? (
            <img
              src={evidence.thumbnailUrl}
              alt="Thumbnail"
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E9DFD2]"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#702E46]/15 text-[#702E46] dark:text-[#E99583] flex items-center justify-center shrink-0 border border-[#702E46]/20">
              <Lock className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase text-[#702E46] dark:text-[#E99583] block tracking-wider">
              {evidence.type.toUpperCase()} EVIDENCE
            </span>
            <h4 className="text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] truncate mt-0.5">{evidence.address}</h4>
            <span className="text-[10px] font-mono font-bold text-[#625B63] dark:text-[#E9DFD2]/80 block mt-0.5">
              {evidence.timestamp} · {evidence.sha256Hash ? `${evidence.sha256Hash.slice(0, 12)}...` : 'Hashed'}
            </span>
          </div>
        </div>

        {/* Lockout status banner */}
        {lockoutSeconds > 0 ? (
          <div className="p-4 rounded-2xl bg-[#C86650]/15 border border-[#C86650]/40 text-center my-3">
            <Clock className="w-6 h-6 text-[#C86650] mx-auto mb-1 animate-spin" />
            <span className="text-xs font-extrabold text-[#C86650] block">
              Brute-Force Lockout Active
            </span>
            <span className="text-sm font-extrabold text-[#702E46] dark:text-[#FAF5EF] mt-1 block">
              Retry available in {lockoutSeconds}s
            </span>
          </div>
        ) : (
          <div>
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] block mb-2">
                Enter your 4-digit Security PIN to permanently delete:
              </span>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = enteredPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all ${
                        filled ? 'bg-[#C86650] scale-110 shadow-sm' : 'bg-[#E9DFD2] dark:bg-[#45263F]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-[#C86650]/15 border border-[#C86650]/40 text-xs font-bold text-[#C86650] text-center mb-3">
                {errorMsg}
              </div>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleDigit(n)}
                  disabled={lockoutSeconds > 0 || isDeleting}
                  className="pin-digit-btn h-12 rounded-2xl text-[18px] font-extrabold text-[#29252D] dark:text-[#FAF5EF] bg-[#FAF5EF] dark:bg-[#45263F] border border-[#E9DFD2] dark:border-[#702E46]/50 hover:bg-[#E9DFD2]/60 active:scale-95 transition cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  aria-label={`Digit ${n}`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  soundManager.triggerHaptic(20);
                  setEnteredPin('');
                  setErrorMsg(null);
                }}
                disabled={lockoutSeconds > 0 || isDeleting}
                className="pin-control-btn h-12 rounded-2xl text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] bg-[#FAF5EF] dark:bg-[#45263F] border border-[#E9DFD2] dark:border-[#702E46]/50 hover:bg-[#E9DFD2]/60 active:scale-95 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                aria-label="Clear PIN"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                disabled={lockoutSeconds > 0 || isDeleting}
                className="pin-digit-btn h-12 rounded-2xl text-[18px] font-extrabold text-[#29252D] dark:text-[#FAF5EF] bg-[#FAF5EF] dark:bg-[#45263F] border border-[#E9DFD2] dark:border-[#702E46]/50 hover:bg-[#E9DFD2]/60 active:scale-95 transition cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                aria-label="Digit 0"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeleteDigit}
                disabled={lockoutSeconds > 0 || isDeleting}
                className="pin-control-btn h-12 rounded-2xl text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] bg-[#FAF5EF] dark:bg-[#45263F] border border-[#E9DFD2] dark:border-[#702E46]/50 hover:bg-[#E9DFD2]/60 active:scale-95 cursor-pointer select-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                aria-label="Backspace delete last digit"
              >
                <Delete className="w-5 h-5 stroke-[2.4] text-[#702E46] dark:text-[#E99583]" />
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#E9DFD2] dark:border-[#45263F]">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-full border border-[#E9DFD2] dark:border-[#45263F] text-xs font-bold text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/40 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteDelete}
            disabled={lockoutSeconds > 0 || isDeleting || isEmergencyActive || enteredPin.length !== 4}
            className={`flex-1 h-12 rounded-full text-xs font-extrabold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
              lockoutSeconds > 0 || isEmergencyActive || enteredPin.length !== 4
                ? 'bg-[#E9DFD2] dark:bg-[#45263F] text-[#625B63] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#C86650] to-[#702E46] text-white hover:opacity-95 shadow-[#C86650]/30 active:scale-95'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Verifying...' : 'Authorize Deletion'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
