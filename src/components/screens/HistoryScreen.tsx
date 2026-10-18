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
      <div className="clay-card p-5 sm:p-6 rounded-3xl border border-[#E8DEF3] shadow-sm bg-[#FFFDFB] dark:bg-purple-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="h-10 px-4 rounded-2xl clay-card flex items-center gap-1.5 text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] hover:bg-purple-50/70 active:scale-95 transition shadow-xs border border-[#E8DEF3] cursor-pointer"
              title="Return to Command Hub"
            >
              <ChevronLeft className="w-4 h-4 text-[#6C3A82]" />
              <span>Command Hub</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2A1637] dark:text-[#FAF4FE]">
                  Audit &amp; Security History
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#6C3A82] dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200">
                  Cryptographic Log
                </span>
              </div>
              <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 mt-0.5">
                Tamper-evident record of safety confirmations, GPS deviations, and emergency dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-[#FFF8F4] dark:bg-purple-900/50 border border-[#E8DEF3] text-xs font-bold text-[#6C3A82] dark:text-purple-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6C3A82]" />
              <span>{allEvents.length} Recorded Events</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-[#E8DEF3]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'EMERGENCY', label: 'Emergency SOS' },
              { id: 'SAFETY_CHECK', label: 'Confirmations' },
              { id: 'AUDIT', label: 'System Audits' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as typeof filterType)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  filterType === btn.id
                    ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white shadow-xs'
                    : 'bg-white dark:bg-purple-900/40 hover:bg-purple-50 text-[#62566F] dark:text-purple-300 border border-[#E8DEF3]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6588]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-[#2A1637] dark:text-white placeholder:text-[#7A6588] focus:outline-none focus:ring-2 focus:ring-[#6C3A82]/40"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="clay-card p-10 rounded-3xl border border-[#E8DEF3] text-center bg-[#FFFDFB] dark:bg-purple-950/40">
            <Clock className="w-12 h-12 text-[#7A6588] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-[#2A1637] dark:text-white">No Audit Records Found</h3>
            <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 max-w-sm mx-auto mt-1">
              Events will be logged automatically as journeys are tracked, safety checks are confirmed, or emergencies are broadcast.
            </p>
          </div>
        ) : (
          filteredEvents.map((item) => {
            const isEmergency = item.type === 'EMERGENCY';
            const isSafety = item.type === 'SAFETY_CHECK';
            const isDuress = isSafety && (item.raw as any).isDuress;

            return (
              <div
                key={item.id}
                className={`clay-card p-4 sm:p-5 rounded-2xl border transition-all ${
                  isEmergency
                    ? 'border-red-300 bg-red-50/60 dark:bg-red-950/20'
                    : isDuress
                    ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/20'
                    : 'border-[#E8DEF3] bg-[#FFFDFB] dark:bg-purple-950/40 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEmergency
                          ? 'bg-[#C62845] text-white shadow-md'
                          : isDuress
                          ? 'bg-amber-500 text-[#2A1637]'
                          : isSafety
                          ? 'bg-gradient-to-br from-[#6C3A82] to-[#55276B] text-white shadow-sm'
                          : 'bg-purple-100 text-[#6C3A82] dark:bg-purple-900/60 dark:text-purple-300'
                      }`}
                    >
                      {isEmergency ? (
                        <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                      ) : isDuress ? (
                        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                      ) : isSafety ? (
                        <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <FileText className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#2A1637] dark:text-[#FAF4FE] capitalize">
                          {item.title}
                        </span>
                        {isDuress && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Duress Protocol
                          </span>
                        )}
                        {isEmergency && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C62845] text-white">
                            Active Dispatch
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 mt-1 leading-relaxed">
                        {item.details}
                      </p>

                      {/* If emergency, render notification dispatch badges */}
                      {isEmergency && (item.raw as any).notificationAttempts && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {(item.raw as any).notificationAttempts.map((attempt: any, idx: number) => (
                            <div
                              key={idx}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-purple-950 border flex items-center gap-1 ${
                                attempt.status === 'PROVIDER_UNCONFIGURED'
                                  ? 'border-amber-300 text-amber-800'
                                  : 'border-[#E8DEF3] text-[#2A1637] dark:text-purple-200'
                              }`}
                            >
                              <Send className="w-2.5 h-2.5 text-[#6C3A82]" />
                              <span>{attempt.contactName}:</span>
                              <span
                                className={`font-bold ${
                                  attempt.status === 'PROVIDER_UNCONFIGURED'
                                    ? 'text-amber-700'
                                    : 'text-[#6C3A82] dark:text-purple-300'
                                }`}
                              >
                                {attempt.status === 'PROVIDER_UNCONFIGURED'
                                  ? 'Provider Not Configured'
                                  : attempt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[11px] font-bold text-[#7A6588] dark:text-purple-300 block whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-semibold text-[#7A6588] dark:text-purple-400 block">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
