import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Send,
  ChevronLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

export const HistoryScreen: React.FC = () => {
  const { auditList, confirmationsList, emergencyEvents, setActiveTab } = useSafety();
  const [filterType, setFilterType] = useState<'ALL' | 'EMERGENCY' | 'SAFETY_CHECK' | 'AUDIT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine and sort events
  const allEvents = [
    ...emergencyEvents.map((e) => ({
      id: e.id,
      type: 'EMERGENCY' as const,
      title: `SOS Alert: ${e.reason}`,
      timestamp: e.timestamp,
      details: `GPS Accuracy: ±${e.gpsAccuracy}m • Status: ${e.status} • Broadcasted to ${e.notificationAttempts.length} contacts`,
      raw: e,
    })),
    ...confirmationsList.map((c) => ({
      id: c.id,
      type: 'SAFETY_CHECK' as const,
      title: c.confirmationType === 'SAFE_CONFIRMED' ? 'Safety Verified' : 'Journey Deactivated',
      timestamp: c.timestamp,
      details: c.isDuress
        ? '⚠️ Silent Duress Triggered: Stealth protocol executed, emergency contacts alerted quietly.'
        : 'Authenticated safety check passed via secure PIN verification.',
      raw: c,
    })),
    ...auditList.map((a) => ({
      id: a.id,
      type: 'AUDIT' as const,
      title: a.eventType.replace(/_/g, ' '),
      timestamp: a.timestamp,
      details: a.details,
      raw: a,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = allEvents.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (
      searchTerm &&
      !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.details.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12 select-none">
      {/* Top Header Card */}
      <div className="editorial-card p-5 sm:p-6 rounded-3xl border border-[#E9DFD2] dark:border-[#45263F] shadow-sm bg-[#FAF5EF] dark:bg-[#341B2F]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="h-10 px-4 rounded-2xl editorial-card flex items-center gap-1.5 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] hover:bg-[#E9DFD2]/40 active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer"
              title="Return to Command Hub"
            >
              <ChevronLeft className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
              <span>Command Hub</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#29252D] dark:text-[#FAF5EF]">
                  Audit &amp; Security History
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E9DFD2]/60 text-[#702E46] dark:bg-[#702E46]/40 dark:text-[#E99583] border border-[#E9DFD2] dark:border-[#702E46]/40">
                  Cryptographic Log
                </span>
              </div>
              <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-0.5">
                Tamper-evident record of safety confirmations, GPS deviations, and emergency dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#702E46] dark:text-[#FAF5EF] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A36A]" />
              <span>{allEvents.length} Recorded Events</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-[#E9DFD2] dark:border-[#45263F]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 p-1 clay-tab-dock">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'EMERGENCY', label: 'Emergency SOS' },
              { id: 'SAFETY_CHECK', label: 'Confirmations' },
              { id: 'AUDIT', label: 'System Audits' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as typeof filterType)}
                className={`text-xs font-extrabold px-3.5 py-2 clay-tab-btn whitespace-nowrap cursor-pointer ${
                  filterType === btn.id
                    ? 'clay-tab-active'
                    : 'clay-tab-inactive'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#625B63]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-extrabold bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-[#29252D] dark:text-[#FAF5EF] placeholder:text-[#625B63] focus:outline-none focus:ring-2 focus:ring-[#702E46]/40 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="editorial-card p-10 rounded-3xl border border-[#E9DFD2] dark:border-[#45263F] text-center bg-[#FAF5EF] dark:bg-[#341B2F]/40">
            <Clock className="w-12 h-12 text-[#625B63] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">No Audit Records Found</h3>
            <p className="text-xs text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">
              Events will be automatically registered when journeys start, safety checks occur, or emergency signals fire.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isEmergency = event.type === 'EMERGENCY';
            const isSafetyCheck = event.type === 'SAFETY_CHECK';

            return (
              <div
                key={event.id}
                className="editorial-card p-4 sm:p-5 rounded-3xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] transition-all flex items-start gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isEmergency
                      ? 'bg-[#C86650]/15 text-[#C86650] border-[#C86650]/30'
                      : isSafetyCheck
                      ? 'bg-[#7E927B]/15 text-[#7E927B] border-[#7E927B]/30'
                      : 'bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] border-[#702E46]/20'
                  }`}
                >
                  {isEmergency ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : isSafetyCheck ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF] flex items-center gap-2">
                      <span>{event.title}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isEmergency
                            ? 'bg-[#C86650]/20 text-[#C86650]'
                            : isSafetyCheck
                            ? 'bg-[#7E927B]/20 text-[#7E927B]'
                            : 'bg-[#E9DFD2] dark:bg-[#45263F] text-[#625B63] dark:text-[#E9DFD2]'
                        }`}
                      >
                        {event.type}
                      </span>
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-[#625B63] dark:text-[#E9DFD2]/70">
                      {event.timestamp}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1 leading-relaxed">
                    {event.details}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
