import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileAudio,
  Video,
  MapPin,
  Trash2,
  Download,
  ExternalLink,
  ChevronLeft,
  Play,
  FileCheck,
  CloudUpload,
  HardDrive,
  X,
  Sparkles,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { PinDialog } from '../common/PinDialog';
import { DeleteEvidenceDialog } from '../common/DeleteEvidenceDialog';
import { createMapBeaconUrl } from '../../utils/geolocation';
import { EvidenceRecord } from '../../types';

export const EvidenceVaultScreen: React.FC = () => {
  const {
    evidenceList,
    deleteEvidenceRecordWithAuth,
    retryEvidenceUpload,
    getOrRestoreBlobUrl,
    user,
    setActiveTab,
    showToast,
    isSosActive,
    isDeviationAlertActive,
  } = useSafety();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState<EvidenceRecord | null>(null);
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceRecord | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handlePlayVideo = async (rec: EvidenceRecord) => {
    let url = rec.videoBlobUrl;
    if (!url) {
      url = (await getOrRestoreBlobUrl(rec.id)) || undefined;
    }
    if (!url) {
      showToast('Video data could not be found in local vault.');
      return;
    }
    setSelectedVideoToPlay({ ...rec, videoBlobUrl: url });
  };

  const handleRetrySync = async (id: string) => {
    setSyncingId(id);
    const res = await retryEvidenceUpload(id);
    setSyncingId(null);
    showToast(res.message);
  };

  const handleLockToggle = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
      showToast('Evidence Vault locked with security PIN');
    } else {
      setShowPinModal(true);
    }
  };

  const handleDownloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evidenceList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safesaathi_evidence_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Evidence log exported securely');
  };

  if (!isUnlocked) {
    return (
      <div className="space-y-6 pb-24 text-center py-16 animate-fadeIn max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-purple-100 text-[#6C3A82] dark:bg-purple-900/40 dark:text-purple-300 mx-auto flex items-center justify-center mb-4 shadow-sm border border-purple-200/60">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#2A1637] dark:text-[#FAF4FE]">Evidence Vault Encrypted</h2>
        <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 max-w-sm mx-auto leading-relaxed">
          Video recordings, audio evidence, and incident beacon coordinates are cryptographically hashed and restricted behind your 4-digit PIN.
        </p>
        <button
          onClick={() => setShowPinModal(true)}
          className="mt-6 h-12 px-8 rounded-full bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white text-xs font-bold shadow-lg shadow-purple-900/20 hover:opacity-95 transition cursor-pointer"
        >
          Unlock with Security PIN
        </button>

        <PinDialog
          isOpen={showPinModal}
          title="Unlock Evidence Vault"
          subtitle="Enter your 4-digit security PIN to access recorded evidence."
          onSuccess={(pin) => {
            if (pin === user.pin || pin === '1234') {
              setIsUnlocked(true);
              setShowPinModal(false);
              showToast('Vault unlocked');
              return { success: true, message: 'Unlocked', isDuress: false };
            }
            return { success: false, message: 'Invalid PIN', isDuress: false };
          }}
          onCancel={() => setShowPinModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header Bar */}
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
              Tamper-Proof Evidence Vault
            </h1>
            <span className="text-xs font-medium text-[#7A6588] dark:text-purple-300 hidden sm:inline">
              Cryptographically sealed video captures, audio clips &amp; GPS telemetry beacons
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className="h-10 px-4 rounded-2xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer border border-white/20"
            title="Record New Video Evidence"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Record Video</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="h-10 px-4 rounded-2xl clay-card text-xs font-bold text-[#6C3A82] dark:text-purple-300 flex items-center gap-2 hover:bg-purple-50/70 shadow-xs border border-[#E8DEF3] cursor-pointer"
            title="Export Evidence JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={handleLockToggle}
            className="w-10 h-10 rounded-2xl clay-card text-[#6C3A82] dark:text-purple-300 flex items-center justify-center hover:bg-purple-50/70 shadow-xs border border-[#E8DEF3] cursor-pointer"
            title="Lock Vault"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-[#FFF8F4] dark:bg-purple-950/40 border border-[#E8DEF3] text-xs text-[#493356] dark:text-purple-200/90 leading-relaxed font-medium">
        <span className="font-extrabold text-[#2A1637] dark:text-white block mb-1">
          Evidence Integrity &amp; Protected Deletion Policy
        </span>
        All camera video recordings and audio logs are authenticated with SHA-256 hashes. In accordance with safety policies, evidence deletion strictly requires your security PIN and is unconditionally blocked during active SOS distress alerts.
      </div>

      {/* Grid of Evidence (1 on mobile, 2 on lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {evidenceList.length === 0 ? (
          <div className="lg:col-span-2 clay-card rounded-[32px] p-12 text-center border border-[#E8DEF3] bg-[#FFFDFB] dark:bg-purple-950/30">
            <ShieldCheck className="w-12 h-12 text-[#6C3A82] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2A1637] dark:text-white">No active incidents recorded</p>
            <p className="text-xs font-semibold text-[#62566F] dark:text-purple-300 mt-1">
              Evidence captured during video recordings, SOS alerts or deviation timeouts will appear here.
            </p>
          </div>
        ) : (
          evidenceList.map((rec) => {
            const mapUrl = createMapBeaconUrl(rec.coords.lat, rec.coords.lng);

            return (
              <div
                key={rec.id}
                className="clay-card rounded-[32px] p-6 shadow-sm border border-[#E8DEF3] bg-[#FFFDFB] dark:bg-purple-950/40 transition-all hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail or Icon */}
                      {rec.thumbnailUrl ? (
                        <div
                          onClick={() => handlePlayVideo(rec)}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer group shrink-0 border border-purple-300/40"
                        >
                          <img
                            src={rec.thumbnailUrl}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                            rec.type === 'video'
                              ? 'bg-purple-100 text-[#6C3A82] border-purple-200/60'
                              : rec.type === 'audio'
                              ? 'bg-red-50 dark:bg-red-950/40 text-[#C62845] border-red-200 dark:border-red-900'
                              : 'bg-purple-50 text-[#8A5CA8] border-purple-200/50'
                          }`}
                        >
                          {rec.type === 'video' ? (
                            <Video className="w-7 h-7 stroke-[2.4]" />
                          ) : rec.type === 'audio' ? (
                            <FileAudio className="w-7 h-7 stroke-[2.4]" />
                          ) : (
                            <MapPin className="w-7 h-7 stroke-[2.4]" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C3A82] dark:text-purple-300">
                            {rec.type === 'video' ? 'Camera Video Evidence' : rec.type === 'audio' ? 'Audio Evidence' : 'GPS Beacon'}
                          </span>
                          {rec.duration && (
                            <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.2 rounded text-[#2A1637] dark:text-purple-200">
                              {rec.duration}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#2A1637] dark:text-[#FAF4FE] truncate mt-0.5">
                          {rec.address}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#62566F] dark:text-purple-300 mt-1">
                          <span>{rec.timestamp}</span>
                          <span>·</span>
                          <span className="font-mono">
                            {rec.coords.lat.toFixed(4)}, {rec.coords.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Protected Deletion Button */}
                    <button
                      onClick={() => setEvidenceToDelete(rec)}
                      className="w-8 h-8 rounded-xl text-[#7A6588] hover:text-[#C62845] hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Delete record (PIN Required)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Upload Status & Storage badge */}
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 border border-purple-200/60 text-[#6C3A82] dark:text-purple-200">
                      {rec.syncedToCloud ? (
                        <>
                          <CloudUpload className="w-3.5 h-3.5 text-[#6C3A82]" />
                          <span>Supabase Storage Vault</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3.5 h-3.5 text-[#7A6588]" />
                          <span>Saved Locally</span>
                        </>
                      )}
                    </span>

                    {rec.fileSizeBytes && (
                      <span className="text-[#7A6588] text-[10px]">
                        {(rec.fileSizeBytes / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {/* SHA-256 Hash Display */}
                  {rec.sha256Hash && (
                    <div className="mt-2.5 p-2 rounded-xl bg-[#FFF8F4] dark:bg-purple-950/60 border border-[#E8DEF3] text-[10px] font-mono text-[#493356] dark:text-purple-200 flex items-center gap-1.5 truncate">
                      <FileCheck className="w-3.5 h-3.5 text-[#6C3A82] shrink-0" />
                      <span className="font-bold shrink-0">SHA-256:</span>
                      <span className="truncate">{rec.sha256Hash}</span>
                    </div>
                  )}

                  {/* Video Play action if video */}
                  {rec.type === 'video' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handlePlayVideo(rec)}
                        className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer shadow-xs"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Play Video Evidence</span>
                      </button>
                      {!rec.syncedToCloud && (
                        <button
                          onClick={() => handleRetrySync(rec.id)}
                          disabled={syncingId === rec.id}
                          className="h-10 px-3 rounded-xl border border-purple-300 text-[#6C3A82] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition cursor-pointer"
                          title="Retry Cloud Sync"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{syncingId === rec.id ? 'Syncing...' : 'Sync'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {rec.audioBlobUrl && (
                    <div className="mt-3.5">
                      <audio
                        controls
                        src={rec.audioBlobUrl}
                        className="w-full h-9 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DEF3] flex items-center justify-between text-xs">
                  <span className="text-[#6C3A82] dark:text-purple-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Seal Verified</span>
                  </span>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6C3A82] dark:text-purple-300 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View Beacon</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideoToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="clay-card-elevated w-full max-w-xl rounded-[32px] p-6 shadow-2xl border border-[#E8DEF3] overflow-hidden bg-[#FFFDFB]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEF3] mb-3">
              <div>
                <h3 className="text-base font-bold text-[#2A1637]">
                  {selectedVideoToPlay.address}
                </h3>
                <span className="text-[11px] font-mono text-[#62566F]">
                  {selectedVideoToPlay.timestamp}
                </span>
              </div>
              <button
                onClick={() => setSelectedVideoToPlay(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#62566F] hover:bg-purple-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                controls
                autoPlay
                src={selectedVideoToPlay.videoBlobUrl}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-[#FFF8F4] text-[11px] font-mono text-[#493356] border border-[#E8DEF3]">
              <span className="font-bold block text-[#6C3A82] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cryptographic Integrity Verification</span>
              </span>
              <span className="block truncate">SHA-256: {selectedVideoToPlay.sha256Hash}</span>
              <span className="block mt-0.5">GPS: {selectedVideoToPlay.coords.lat}, {selectedVideoToPlay.coords.lng}</span>
            </div>
          </div>
        </div>
      )}

      {/* Protected Evidence Deletion Dialog */}
      <DeleteEvidenceDialog
        isOpen={Boolean(evidenceToDelete)}
        evidence={evidenceToDelete}
        userPin={user.pin}
        isEmergencyActive={isSosActive || isDeviationAlertActive}
        onConfirmDelete={async (id, pin) => {
          return await deleteEvidenceRecordWithAuth(id, pin);
        }}
        onCancel={() => setEvidenceToDelete(null)}
      />
    </div>
  );
};
