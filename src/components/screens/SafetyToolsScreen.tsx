import React, { useState, useRef, useEffect } from 'react';
import {
  Timer,
  PhoneCall,
  Mic,
  Siren,
  Shield,
  BookOpen,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Volume2,
  X,
  PhoneIncoming,
  ChevronLeft,
  Sparkles,
  Video,
  VideoOff,
  Camera,
  FileCheck,
  RefreshCw,
  PhoneOff,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';

export const SafetyToolsScreen: React.FC = () => {
  const {
    triggerSos,
    currentLocation,
    addEvidenceRecord,
    setActiveTab,
    showToast,
    isCameraRecording,
    startCameraRecording,
    stopCameraRecording,
    isVoiceMonitoringActive,
    toggleVoiceMonitoring,
    voiceStatusMessage,
    settings,
  } = useSafety();

  const [activeToolModal, setActiveToolModal] = useState<
    'safewalk' | 'fakecall' | 'voicetrigger' | 'camerarecord' | 'report' | 'legalguide' | null
  >(null);

  // 1. Safe-Walk Timer
  const [safeWalkDurationMinutes, setSafeWalkDurationMinutes] = useState<number>(15);
  const [safeWalkRemainingSeconds, setSafeWalkRemainingSeconds] = useState<number | null>(null);
  const safeWalkTimerRef = useRef<number | null>(null);

  // 2. Fake Call
  const [fakeCallerName, setFakeCallerName] = useState<string>('Dad (Home)');
  const [fakeCallDelaySeconds, setFakeCallDelaySeconds] = useState<number>(5);
  const [isFakeCallRinging, setIsFakeCallRinging] = useState<boolean>(false);
  const [isFakeCallActive, setIsFakeCallActive] = useState<boolean>(false);
  const [fakeCallDuration, setFakeCallDuration] = useState<number>(0);
  const fakeCallTimerRef = useRef<number | null>(null);

  // 3. Camera Video Evidence Recorder Tool
  const [cameraViewActive, setCameraViewActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [lastSavedVideoId, setLastSavedVideoId] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // 4. Incident Report Form
  const [reportCategory, setReportCategory] = useState<string>('Poor Lighting / Broken Streetlamps');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  // Safe-Walk Timer Logic
  const startSafeWalk = () => {
    const totalSecs = safeWalkDurationMinutes * 60;
    setSafeWalkRemainingSeconds(totalSecs);
    showToast(`Safe-Walk Timer active for ${safeWalkDurationMinutes} mins`);

    if (safeWalkTimerRef.current) clearInterval(safeWalkTimerRef.current);

    safeWalkTimerRef.current = window.setInterval(() => {
      setSafeWalkRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(safeWalkTimerRef.current!);
          safeWalkTimerRef.current = null;
          triggerSos('Safe-Walk Timer Expired Without Check-In');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSafeWalk = () => {
    if (safeWalkTimerRef.current) {
      clearInterval(safeWalkTimerRef.current);
      safeWalkTimerRef.current = null;
    }
    setSafeWalkRemainingSeconds(null);
    showToast('Safe-Walk Timer cleared. Check-in confirmed.');
  };

  // Fake Call Logic
  const scheduleFakeCall = () => {
    showToast(`Incoming call in ${fakeCallDelaySeconds}s...`);
    setActiveToolModal(null);

    setTimeout(() => {
      setIsFakeCallRinging(true);
      soundManager.startRingtone();
    }, fakeCallDelaySeconds * 1000);
  };

  const acceptFakeCall = () => {
    soundManager.stopRingtone();
    setIsFakeCallRinging(false);
    setIsFakeCallActive(true);
    setFakeCallDuration(0);

    fakeCallTimerRef.current = window.setInterval(() => {
      setFakeCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endFakeCall = () => {
    soundManager.stopRingtone();
    setIsFakeCallRinging(false);
    setIsFakeCallActive(false);
    if (fakeCallTimerRef.current) {
      clearInterval(fakeCallTimerRef.current);
      fakeCallTimerRef.current = null;
    }
    showToast('Fake call finished');
  };

  // Camera Video Evidence Recorder Logic
  const handleOpenVideoTool = () => {
    setActiveToolModal('camerarecord');
    setCameraViewActive(true);
  };

  const handleStartManualVideo = async () => {
    setCameraError(null);
    setRecordingSeconds(0);
    showToast('Requesting camera & microphone...');

    const res = await startCameraRecording(cameraVideoRef.current);
    if (!res.success) {
      setCameraError(res.error || 'Camera permission denied or camera device in use');
      return;
    }

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    showToast('Camera Video Recording started');
  };

  const handleStopManualVideo = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const saved = await stopCameraRecording();
    if (saved) {
      setLastSavedVideoId(saved.id);
      showToast('Video evidence saved and cryptographically sealed.');
    }
  };

  const handleCloseVideoModal = () => {
    if (isCameraRecording) {
      handleStopManualVideo();
    }
    setActiveToolModal(null);
    setCameraViewActive(false);
    setCameraError(null);
  };

  // Incident report submission
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    addEvidenceRecord({
      type: 'incident_report',
      coords: currentLocation,
      address: `Incident: ${reportCategory}`,
      notes: reportDescription,
      syncedToCloud: true,
    });

    setReportSubmitted(true);
    soundManager.triggerHaptic(20);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportDescription('');
      setActiveToolModal(null);
      showToast('Hazard report recorded and saved to Vault');
    }, 1800);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
              Safety Tools &amp; Tactical Alibis
            </h1>
            <span className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 hidden sm:inline">
              Tactical alibis, camera video evidence recording, and vocal distress recognition
            </span>
          </div>
        </div>
      </div>

      {/* Active Safe-Walk Banner */}
      {safeWalkRemainingSeconds !== null && (
        <div className="rounded-[32px] p-6 shadow-md bg-gradient-to-br from-[#FAF5EF] via-[#FFFDF9] to-[#E9DFD2] dark:from-[#341B2F] dark:to-[#45263F] border border-[#C86650]/50 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7E927B] animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#702E46] dark:text-[#E99583]">
                Safe-Walk Timer Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#29252D] dark:text-[#FAF5EF] tabular-nums">
              {formatTimer(safeWalkRemainingSeconds)} Left
            </h2>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">
              Check in upon safe arrival. If unstopped, emergency SOS initiates automatically.
            </p>
          </div>

          <button
            onClick={cancelSafeWalk}
            className="h-12 px-6 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition shrink-0 cursor-pointer border border-white/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-[#7E927B]" />
            <span>I Arrived Safely (Stop Timer)</span>
          </button>
        </div>
      )}

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Tool 1: Camera Video Evidence Recorder */}
        <div
          onClick={handleOpenVideoTool}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-[#702E46]/20">
              <Video className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Camera Video Recorder</h3>
              {isCameraRecording && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C86650] text-white animate-pulse">
                  REC
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1.5 leading-relaxed">
              Capture video and audio evidence. Automatically validated for non-zero size, sealed with SHA-256, and stored securely in local IndexedDB and cloud storage.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between">
            <span>{isCameraRecording ? 'Active Recording' : 'Open Camera Recorder'}</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Tool 2: Safe-Walk Timer */}
        <div
          onClick={() => setActiveToolModal('safewalk')}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#C86650]/15 text-[#C86650] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-[#C86650]/30">
              <Timer className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Safe-Walk Timer</h3>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1.5 leading-relaxed">
              Configurable countdown for solo transit. Automatically triggers emergency SOS if check-in fails.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#C86650] mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between">
            <span>Configure Timer</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Tool 3: Fake Call Simulator */}
        <div
          onClick={() => setActiveToolModal('fakecall')}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#C5A36A]/20 text-[#C5A36A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-[#C5A36A]/40">
              <PhoneCall className="w-6 h-6 stroke-[2.4]" />
            </div>
            <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Fake Phone Call</h3>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1.5 leading-relaxed">
              Realistic incoming call with dual ringtone and escape dialogue cues to deter suspicious followers.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#702E46] dark:text-[#C5A36A] mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between">
            <span>Launch Alibi Call</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Tool 4: Voice Keyword Trigger */}
        <div
          onClick={() => setActiveToolModal('voicetrigger')}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-[#702E46]/20">
              <Mic className={`w-6 h-6 stroke-[2.2] ${isVoiceMonitoringActive ? 'text-[#C86650] animate-pulse' : ''}`} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Voice Trigger Sentry</h3>
              {isVoiceMonitoringActive && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7E927B] text-white animate-pulse">
                  Listening
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1.5 leading-relaxed">
              Hands-free microphone detection listening for <strong>"{settings.voicePhrase || 'SafeJourney, Help'}"</strong> even when shouted or distorted.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between">
            <span>{isVoiceMonitoringActive ? 'Active (Tap to Stop)' : 'Start Sentry'}</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Tool 5: Anonymous Incident Reporter */}
        <div
          onClick={() => setActiveToolModal('report')}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#C86650]/15 text-[#C86650] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-[#C86650]/30">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Hazard Reporter</h3>
            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1.5 leading-relaxed">
              Flag harassment hotspots, dark alleys, and broken streetlights with coordinates.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#C86650] mt-4 pt-3 border-t border-[#E9DFD2] dark:border-[#45263F] flex items-center justify-between">
            <span>File Report</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Tool 6: Legal Rights Handbook */}
        <div
          onClick={() => setActiveToolModal('legalguide')}
          className="editorial-card rounded-[32px] p-6 border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]/80 hover:bg-[#FFFDF9] dark:hover:bg-[#341B2F] active:scale-98 transition cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#702E46]/10 text-[#702E46] dark:text-[#E99583] flex items-center justify-center shrink-0 border border-[#702E46]/20">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                Legal Rights &amp; Self-Defense
              </h3>
              <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-1 leading-relaxed max-w-lg">
                Understand Zero FIR provisions, confidential statements, and electronic evidence admissibility.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] shrink-0 self-end sm:self-center">
            Read &rarr;
          </span>
        </div>

      </div>

      {/* MODAL: Camera Video Evidence Recorder */}
      {activeToolModal === 'camerarecord' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-lg rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] overflow-hidden bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                  Camera Video Evidence Recorder
                </h3>
              </div>
              <button
                onClick={handleCloseVideoModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 dark:hover:bg-[#45263F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewfinder Container */}
            <div className="mt-4 relative w-full h-56 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-[#E9DFD2] dark:border-[#45263F]">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#29252D]/95 p-4 text-center z-10">
                  <div className="w-10 h-10 rounded-2xl bg-[#C86650]/20 border border-[#C86650]/40 flex items-center justify-center text-[#E99583] mb-2">
                    <VideoOff className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold text-[#FAF5EF]">Camera Access Denied</span>
                  <p className="text-[11px] text-[#E9DFD2] mt-1 max-w-xs leading-relaxed">
                    Camera access was blocked. Please allow camera and microphone permissions in browser settings to record video evidence.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartManualVideo}
                    className="mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer border border-white/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera Access</span>
                  </button>
                </div>
              )}

              {isCameraRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#C86650] text-white px-3 py-1 rounded-full text-xs font-mono font-extrabold shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>REC {formatTimer(recordingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Status and Diagnostics */}
            <div className="mt-3 p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-bold text-[#625B63] dark:text-[#E9DFD2]">
              <div className="flex items-center justify-between">
                <span>Storage Target:</span>
                <span className="font-mono text-[#702E46] dark:text-[#E99583]">IndexedDB &amp; Supabase Vault</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Cryptographic Proof:</span>
                <span className="font-mono text-[#29252D] dark:text-[#FAF5EF]">SHA-256 Hash Seal</span>
              </div>
            </div>

            {/* Success notification if just recorded */}
            {lastSavedVideoId && !isCameraRecording && (
              <div className="mt-3 p-3 rounded-xl bg-[#7E927B]/20 border border-[#7E927B]/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#7E927B]" />
                  <span>Video saved and sealed</span>
                </div>
                <button
                  onClick={() => {
                    setActiveToolModal(null);
                    setActiveTab('evidence');
                  }}
                  className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] underline cursor-pointer"
                >
                  View in Vault &rarr;
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="mt-5 flex gap-2.5">
              {!isCameraRecording ? (
                <button
                  onClick={handleStartManualVideo}
                  className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] hover:opacity-95 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition cursor-pointer border border-white/20 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Recording Video</span>
                </button>
              ) : (
                <button
                  onClick={handleStopManualVideo}
                  className="flex-1 h-12 rounded-full bg-[#C86650] hover:bg-[#B3523D] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop &amp; Save Video ({formatTimer(recordingSeconds)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Safe-Walk Timer */}
      {activeToolModal === 'safewalk' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-[#C86650]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Safe-Walk Timer</h3>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 dark:hover:bg-[#45263F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-3 leading-relaxed">
              Set estimated walk duration. If you do not tap "I Arrived" before the timer expires, Journey Guard automatically escalates Emergency SOS.
            </p>

            <div className="grid grid-cols-3 gap-2 my-5 p-1 clay-tab-dock">
              {[10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    soundManager.triggerHaptic(15);
                    setSafeWalkDurationMinutes(mins);
                  }}
                  className={`h-12 clay-tab-btn text-xs font-extrabold cursor-pointer ${
                    safeWalkDurationMinutes === mins
                      ? 'clay-tab-active'
                      : 'clay-tab-inactive'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setActiveToolModal(null)}
                className="flex-1 h-12 rounded-full border border-[#E9DFD2] dark:border-[#45263F] text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startSafeWalk();
                  setActiveToolModal(null);
                }}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
              >
                Start Countdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Fake Call Configurator */}
      {activeToolModal === 'fakecall' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#C5A36A]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Fake Call Alibi</h3>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-3 leading-relaxed">
              Discreetly schedule a realistic incoming phone call to give you a natural pretext to walk away or deter suspicious individuals.
            </p>

            <div className="space-y-4 my-5 text-xs">
              <div>
                <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Caller Name / Relationship
                </label>
                <input
                  type="text"
                  value={fakeCallerName}
                  onChange={(e) => setFakeCallerName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-bold text-[#29252D] dark:text-[#FAF5EF]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Delay Before Incoming Call
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 clay-tab-dock">
                  {[5, 15, 30].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        soundManager.triggerHaptic(15);
                        setFakeCallDelaySeconds(s);
                      }}
                      className={`h-11 clay-tab-btn text-xs font-extrabold cursor-pointer ${
                        fakeCallDelaySeconds === s
                          ? 'clay-tab-terracotta-active'
                          : 'clay-tab-inactive'
                      }`}
                    >
                      {s} Seconds
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setActiveToolModal(null)}
                className="flex-1 h-12 rounded-full border border-[#E9DFD2] dark:border-[#45263F] text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={scheduleFakeCall}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
              >
                Schedule Alibi Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE FAKE CALL SCREEN */}
      {(isFakeCallRinging || isFakeCallActive) && (
        <div className="fixed inset-0 z-50 bg-[#29252D] flex flex-col justify-between p-8 text-white select-none animate-fadeIn">
          <div className="text-center pt-12">
            <span className="text-xs uppercase tracking-widest text-[#E99583] font-extrabold block mb-2">
              {isFakeCallRinging ? 'Incoming Call...' : 'Call in Progress'}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">{fakeCallerName}</h2>
            <span className="text-sm text-[#E9DFD2] font-mono mt-1 block">
              {isFakeCallActive ? formatTimer(fakeCallDuration) : 'Mobile · +91 98765 43210'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-8">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#702E46] to-[#45263F] flex items-center justify-center text-white shadow-2xl border-4 border-white/20 animate-pulse">
              <PhoneCall className="w-12 h-12" />
            </div>
          </div>

          <div className="pb-8 max-w-sm mx-auto w-full">
            {isFakeCallRinging ? (
              <div className="flex items-center justify-around">
                <button
                  onClick={endFakeCall}
                  className="w-16 h-16 rounded-full bg-[#C86650] flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={acceptFakeCall}
                  className="w-16 h-16 rounded-full bg-[#7E927B] flex items-center justify-center shadow-lg animate-bounce active:scale-95 transition cursor-pointer"
                >
                  <PhoneIncoming className="w-7 h-7 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={endFakeCall}
                  className="h-14 px-8 rounded-full bg-[#C86650] flex items-center gap-2.5 shadow-lg active:scale-95 transition text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5 text-white" />
                  <span>End Alibi Call</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Voice Keyword Trigger */}
      {activeToolModal === 'voicetrigger' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Voice Keyword Sentry</h3>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#62566F] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-3 leading-relaxed">
              When enabled, your microphone constantly listens for distress keywords even if your phone screen is dark or tucked in your pocket.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#625B63] dark:text-[#E9DFD2]/80 font-extrabold block">
                Target Distress Trigger Phrase
              </span>
              <span className="text-lg font-black text-[#702E46] dark:text-[#E99583] mt-1 block">
                "{settings.voicePhrase || 'SafeJourney, Help'}"
              </span>
              <span className="text-[11px] text-[#625B63] dark:text-[#E9DFD2]/80 mt-1 block">
                Phonetic engine matches accents, shouting, or background street noise.
              </span>
            </div>

            {voiceStatusMessage && (
              <div className="p-3 rounded-xl bg-[#E9DFD2]/60 dark:bg-[#45263F]/70 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] mb-4 text-center">
                {voiceStatusMessage}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => setActiveToolModal(null)}
                className="flex-1 h-12 rounded-full border border-[#E9DFD2] dark:border-[#45263F] text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/40 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toggleVoiceMonitoring();
                  setActiveToolModal(null);
                }}
                className={`flex-1 h-12 rounded-full text-white text-xs font-extrabold shadow-md transition cursor-pointer border border-white/20 active:scale-95 ${
                  isVoiceMonitoringActive ? 'bg-[#C86650]' : 'bg-gradient-to-r from-[#702E46] to-[#45263F]'
                }`}
              >
                {isVoiceMonitoringActive ? 'Stop Listening' : 'Activate Voice Sentry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Incident Reporter */}
      {activeToolModal === 'report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C86650]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">Hazard Incident Report</h3>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#7E927B] mx-auto mb-2" />
                <span className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF] block">Hazard Tagged</span>
                <p className="text-xs text-[#625B63] dark:text-[#E9DFD2]/80 mt-1">Incident saved with GPS coordinates to Vault.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 my-4 text-xs">
                <div>
                  <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                    Hazard Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-bold text-[#29252D] dark:text-[#FAF5EF]"
                  >
                    <option>Poor Lighting / Broken Streetlamps</option>
                    <option>Stalking or Suspicious Individual</option>
                    <option>Aggressive Street Animals</option>
                    <option>Deserted Corridor or Blocked Pathway</option>
                    <option>Verbal Harassment Hotspot</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                    Description &amp; Landmark Notes
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide details to assist community audit..."
                    required
                    className="w-full p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 font-bold text-[#29252D] dark:text-[#FAF5EF]"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveToolModal(null)}
                    className="flex-1 h-12 rounded-full border border-[#E9DFD2] dark:border-[#45263F] text-xs font-extrabold text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/40 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: Legal Rights Handbook */}
      {activeToolModal === 'legalguide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-lg rounded-[32px] p-6 lg:p-7 shadow-2xl border border-[#E9DFD2] dark:border-[#45263F] max-h-[85vh] overflow-y-auto bg-[#FAF5EF] dark:bg-[#341B2F]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#702E46] dark:text-[#E99583]" />
                <h3 className="text-base font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                  Legal Rights &amp; Self-Defense Handbook
                </h3>
              </div>
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#625B63] dark:text-[#E9DFD2] hover:bg-[#E9DFD2]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs font-medium text-[#29252D] dark:text-[#FAF5EF] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40">
                <h4 className="font-extrabold text-[#702E46] dark:text-[#E99583] text-sm mb-1">
                  1. Zero FIR Provision
                </h4>
                <p className="text-[#625B63] dark:text-[#E9DFD2]/80">
                  You can file a First Information Report (FIR) at <em>any</em> police station regardless of jurisdiction. The station is legally mandated to register the incident and transfer it to the competent local station.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40">
                <h4 className="font-extrabold text-[#702E46] dark:text-[#E99583] text-sm mb-1">
                  2. Electronic Evidence Admissibility
                </h4>
                <p className="text-[#625B63] dark:text-[#E9DFD2]/80">
                  Audio recordings, camera video clips, and cryptographic SHA-256 evidence stored in SafeSaathi Vault are valid digital evidence under the Indian Evidence Act / Section 65B guidelines.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40">
                <h4 className="font-extrabold text-[#702E46] dark:text-[#E99583] text-sm mb-1">
                  3. Right to Virtual / Confidential Statement
                </h4>
                <p className="text-[#625B63] dark:text-[#E9DFD2]/80">
                  In sensitive harassment or distress cases, women have the statutory right to have statements recorded in the presence of a female officer, advocate, or family member, including via video teleconference.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveToolModal(null)}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#702E46] to-[#45263F] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer border border-white/20 active:scale-95"
              >
                Close Handbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
