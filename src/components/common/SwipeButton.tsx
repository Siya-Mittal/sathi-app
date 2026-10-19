import React, { useState, useRef, useEffect } from 'react';
import { ChevronsRight, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface SwipeButtonProps {
  onSuccess: () => void;
  label?: string;
  className?: string;
}

export const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSuccess,
  label = 'Swipe To Start Journey Guard',
  className = '',
}) => {
  const [dragProgress, setDragProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const deltaX = clientX - startXRef.current;
    const trackWidth = trackRef.current.clientWidth;
    const thumbWidth = 54;
    const maxDrag = trackWidth - thumbWidth;

    const progress = Math.max(0, Math.min(1, deltaX / maxDrag));
    setDragProgress(progress);

    if (progress >= 0.92) {
      setIsDragging(false);
      setDragProgress(1);
      soundManager.triggerHaptic(40);
      soundManager.playBeep(880, 0.15);
      onSuccess();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragProgress < 0.92) {
      setDragProgress(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTouchMove);
      window.addEventListener('mouseup', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragProgress]);

  const thumbOffset = trackRef.current
    ? dragProgress * (trackRef.current.clientWidth - 56)
    : 0;

  return (
    <div
      ref={trackRef}
      className={`relative w-full h-15 rounded-full bg-[#FFFDF9] dark:bg-[#341B2F]/90 backdrop-blur-md border border-[#E9DFD2] dark:border-[#702E46]/50 p-1.5 shadow-[inset_0_2px_4px_rgba(41,37,45,0.06),0_8px_20px_rgba(112,46,70,0.08)] select-none overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Background completed fill with warm terracotta/coral */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#C86650]/20 via-[#E99583]/30 to-[#7E927B]/30 rounded-full transition-all duration-75"
        style={{ width: `${Math.max(12, dragProgress * 100)}%` }}
      />

      {/* Center Label with high contrast Deep Ink */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-xs font-extrabold uppercase tracking-widest text-[#29252D] dark:text-[#FAF5EF] transition-opacity duration-200"
          style={{ opacity: Math.max(0.2, 1 - dragProgress * 1.5) }}
        >
          {dragProgress >= 0.92 ? 'Activating Escort...' : label}
        </span>
      </div>

      {/* Chevrons subtle hint */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[#702E46] dark:text-[#E99583] pointer-events-none opacity-60">
        <ChevronsRight className="w-5 h-5 animate-pulse" />
      </div>

      {/* Draggable Clay Thumb Knob in Deep Berry with gold/terracotta highlight */}
      <div
        onMouseDown={handleTouchStart}
        onTouchStart={handleTouchStart}
        className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[#702E46] to-[#45263F] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(112,46,70,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-grab active:cursor-grabbing active:scale-95 transition-transform border border-white/20"
        style={{
          transform: `translateX(${thumbOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        aria-label="Swipe to activate journey guard"
      >
        {dragProgress >= 0.92 ? (
          <ShieldCheck className="w-5 h-5 text-[#C5A36A]" />
        ) : (
          <ChevronsRight className="w-5 h-5 text-white stroke-[2.5]" />
        )}
      </div>
    </div>
  );
};
