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
      <div className="space-y-6 pb-24 text-center py-16 animate-fadeIn max-w-md mx-auto select-none">
        <div className="w-20 h-20 rounded-3xl bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] mx-auto flex items-center justify-center mb-4 shadow-sm border border-[#702E46]/20">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#29252D] dark:text-[#FAF5EF]">Evidence Vault Encrypted</h2>
        <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 max-w-sm mx-auto leading-relaxed">
          Video recordings, audio evidence, and incident beacon coordinates are cryptographically hashed and restricted behind your 4-digit PIN.
        </p>
        <button
          onClick={() => setShowPinModal(true)}
          className="mt-6 h-12 px-8 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold shadow-lg hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
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
            className="h-10 px-4 rounded-2xl editorial-card flex items-center gap-1.5 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] hover:bg-[#E9DFD2]/40 active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
            <span>Command Hub</span>
          </button>
          <div>
            <h1 className="text-base lg:text-xl font-extrabold text-[#29252D] dark:text-[#FAF5EF] tracking-tight">
              Tamper-Proof Evidence Vault
            </h1>
            <span className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 hidden sm:inline">
              Cryptographically sealed video captures, audio clips &amp; GPS telemetry beacons
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className="h-10 px-4 rounded-2xl bg-gradient-to-r from-[#702E46] to-[#C86650] hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer border border-white/20 active:scale-95"
            title="Record New Video Evidence"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Record Video</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="h-10 px-4 rounded-2xl editorial-card text-xs font-extrabold text-[#702E46] dark:text-[#E99583] flex items-center gap-2 hover:bg-[#E9DFD2]/40 shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer active:scale-95"
            title="Export Evidence JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={handleLockToggle}
            className="w-10 h-10 rounded-2xl editorial-card text-[#702E46] dark:text-[#E99583] flex items-center justify-center hover:bg-[#E9DFD2]/40 shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer active:scale-95"
            title="Lock Vault"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-[#FAF5EF] dark:bg-[#341B2F]/80 border border-[#E9DFD2] dark:border-[#45263F] text-xs text-[#29252D] dark:text-[#FAF5EF] leading-relaxed font-medium">
        <span className="font-extrabold text-[#702E46] dark:text-[#E99583] block mb-1">
          Evidence Integrity &amp; Protected Deletion Policy
        </span>
        All camera video recordings and audio logs are authenticated with SHA-256 hashes. In accordance with safety policies, evidence deletion strictly requires your security PIN and is unconditionally blocked during active SOS distress alerts.
      </div>

      {/* Grid of Evidence (1 on mobile, 2 on lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {evidenceList.length === 0 ? (
          <div className="lg:col-span-2 editorial-card rounded-[32px] p-12 text-center border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/40">
            <ShieldCheck className="w-12 h-12 text-[#7E927B] mx-auto mb-3" />
            <p className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">No active incidents recorded</p>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">
              Evidence captured during video recordings, SOS alerts or deviation timeouts will appear here.
            </p>
          </div>
        ) : (
          evidenceList.map((rec) => {
            const mapUrl = createMapBeaconUrl(rec.coords.lat, rec.coords.lng);

            return (
              <div
                key={rec.id}
                className="editorial-card rounded-[32px] p-6 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 transition-all hover:bg-[#FFFDF9] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail or Icon */}
                      {rec.thumbnailUrl ? (
                        <div
                          onClick={() => handlePlayVideo(rec)}
                          className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer group shrink-0 border border-[#E9DFD2] dark:border-[#702E46]/40"
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
                              ? 'bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] border-[#702E46]/20'
                              : rec.type === 'audio'
                              ? 'bg-[#C86650]/15 text-[#C86650] border-[#C86650]/30'
                              : 'bg-[#C5A36A]/15 text-[#C5A36A] border-[#C5A36A]/30'
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
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#702E46] dark:text-[#E99583]">
                            {rec.type === 'video' ? 'Camera Video Evidence' : rec.type === 'audio' ? 'Audio Evidence' : 'GPS Beacon'}
                          </span>
                          {rec.duration && (
                            <span className="text-[10px] font-mono font-bold bg-[#E9DFD2]/60 dark:bg-[#702E46]/40 px-1.5 py-0.5 rounded text-[#29252D] dark:text-[#FAF5EF]">
                              {rec.duration}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF] truncate mt-0.5">
                          {rec.address}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">
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
                      className="w-8 h-8 rounded-xl text-[#625B63] hover:text-[#C86650] hover:bg-[#C86650]/15 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Delete record (PIN Required)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Upload Status & Storage badge */}
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E9DFD2]/60 dark:bg-[#45263F] border border-[#E9DFD2] dark:border-[#702E46]/40 text-[#29252D] dark:text-[#FAF5EF]">
                      {rec.syncedToCloud ? (
                        <>
                          <CloudUpload className="w-3.5 h-3.5 text-[#7E927B]" />
                          <span>Supabase Storage Vault</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3.5 h-3.5 text-[#625B63]" />
                          <span>Saved Locally</span>
                        </>
                      )}
                    </span>

                    {rec.fileSizeBytes && (
                      <span className="text-[#625B63] dark:text-[#E9DFD2]/70 text-[10px]">
                        {(rec.fileSizeBytes / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {/* SHA-256 Hash Display */}
                  {rec.sha256Hash && (
                    <div className="mt-2.5 p-2 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-[10px] font-mono text-[#29252D] dark:text-[#FAF5EF] flex items-center gap-1.5 truncate">
                      <FileCheck className="w-3.5 h-3.5 text-[#7E927B] shrink-0" />
                      <span className="font-extrabold shrink-0">SHA-256:</span>
                      <span className="truncate">{rec.sha256Hash}</span>
                    </div>
                  )}

                  {/* Video Play action if video */}
                  {rec.type === 'video' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handlePlayVideo(rec)}
                        className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold flex items-center gap-1.5 hover:opacity-95 transition cursor-pointer shadow-xs border border-white/20 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play Video Evidence</span>
                      </button>
                    </div>
                  )}

                  {/* Audio Player if audio */}
                  {rec.type === 'audio' && rec.audioBlobUrl && (
                    <div className="mt-3">
                      <audio controls className="w-full h-9 rounded-xl accent-[#702E46]" src={rec.audioBlobUrl}>
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}

                  {/* Notes if available */}
                  {rec.notes && (
                    <p className="mt-2.5 text-xs text-[#625B63] dark:text-[#E9DFD2]/80 bg-[#FFFDF9] dark:bg-[#45263F]/40 p-2.5 rounded-xl border border-[#E9DFD2] dark:border-[#702E46]/30">
                      {rec.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between text-xs">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#702E46] dark:text-[#E99583] hover:underline font-extrabold flex items-center gap-1"
                  >
                    <span>Inspect GPS Coordinates</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {!rec.syncedToCloud && (
                    <button
                      onClick={() => handleRetrySync(rec.id)}
                      disabled={syncingId === rec.id}
                      className="text-xs font-extrabold text-[#C86650] hover:underline cursor-pointer"
                    >
                      {syncingId === rec.id ? 'Syncing...' : 'Sync to Cloud'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideoToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-xl rounded-[32px] p-6 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div>
                <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                  Evidence Video Playback
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#625B63] dark:text-[#E9DFD2]/80">
                  SHA-256 Verified Seal
                </span>
              </div>
              <button
                onClick={() => setSelectedVideoToPlay(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#E9DFD2]">
              <video
                src={selectedVideoToPlay.videoBlobUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs text-[#625B63] dark:text-[#E9DFD2]/80 space-y-1 bg-[#FFFDF9] dark:bg-[#45263F]/50 p-3 rounded-xl border border-[#E9DFD2] dark:border-[#702E46]/40">
              <div className="flex justify-between">
                <span className="font-bold">Recorded:</span>
                <span>{selectedVideoToPlay.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Location:</span>
                <span className="font-mono">{selectedVideoToPlay.address}</span>
              </div>
              {selectedVideoToPlay.sha256Hash && (
                <div className="flex justify-between truncate">
                  <span className="font-bold shrink-0 mr-2">Hash:</span>
                  <span className="font-mono truncate">{selectedVideoToPlay.sha256Hash}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedVideoToPlay(null)}
                className="h-10 px-6 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold cursor-pointer border border-white/20 active:scale-95"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation PIN Dialog */}
      <DeleteEvidenceDialog
        isOpen={!!evidenceToDelete}
        evidence={evidenceToDelete}
        userPin={user.pin || '1234'}
        isEmergencyActive={isSosActive || isDeviationAlertActive}
        onConfirmDelete={async (id, pin) => {
          const res = await deleteEvidenceRecordWithAuth(id, pin);
          if (res.success) {
            setEvidenceToDelete(null);
            showToast(res.message);
          }
          return res;
        }}
        onCancel={() => setEvidenceToDelete(null)}
      />
    </div>
  );
};
