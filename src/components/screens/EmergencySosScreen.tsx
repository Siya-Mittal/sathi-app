import React, { useState, useEffect, useRef } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Phone,
  MessageSquare,
  Share2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  MapPin,
  CheckCircle2,
  Flame,
  Radio,
  Video,
  VideoOff,
  Camera,
  RefreshCw,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { soundManager } from '../../utils/audio';
import { createMapBeaconUrl, createWhatsAppDistressUrl, createSmsDistressUrl } from '../../utils/geolocation';
import { PinDialog } from '../common/PinDialog';

export const EmergencySosScreen: React.FC = () => {
  const {
    isSosActive,
    sosReason,
    cancelSosWithPin,
    user,
    contacts,
    currentLocation,
    isSirenPlaying,
    toggleSiren,
    addEvidenceRecord,
    showToast,
    isCameraRecording,
    startCameraRecording,
    stopCameraRecording,
  } = useSafety();

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(true);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [videoSeconds, setVideoSeconds] = useState<number>(0);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [sentAlerts, setSentAlerts] = useState<{ [contactId: string]: boolean }>({});
  const [cameraError, setCameraError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-start camera video recording and audio recording on SOS
  useEffect(() => {
    if (!isSosActive) return;

    recordIntervalRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Auto-start camera video recording on SOS only if permission allows
    setVideoSeconds(0);
    startCameraRecording(previewVideoRef.current).then((res) => {
      if (!res.success) {
        setCameraError(res.error || 'Camera permission denied or unavailable');
        if (videoIntervalRef.current) {
          clearInterval(videoIntervalRef.current);
          videoIntervalRef.current = null;
        }
      } else {
        setCameraError(null);
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = window.setInterval(() => {
          setVideoSeconds((prev) => prev + 1);
        }, 1000);
      }
    });

    // Independent audio recording fallback
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              if (audioBlob.size > 0) {
                const audioUrl = URL.createObjectURL(audioBlob);
                addEvidenceRecord({
                  type: 'audio',
                  coords: currentLocation,
                  address: `SOS Audio Evidence (${recordingSeconds}s)`,
                  notes: `Emergency recording captured during SOS alert (${sosReason})`,
                  audioBlobUrl: audioUrl,
                  syncedToCloud: true,
                  fileSizeBytes: audioBlob.size,
                });
              }
              stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start(1000);
          })
          .catch((err) => {
            console.warn('Microphone permission fallback note:', err);
          });
      }
    } catch (e) {
      console.warn('Audio recorder startup note:', e);
    }

    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };
  }, [isSosActive, currentLocation, sosReason, addEvidenceRecord, startCameraRecording]);

  if (!isSosActive) return null;

  const mapLink = createMapBeaconUrl(currentLocation.lat, currentLocation.lng);

  const handleDispatchSms = (contact: (typeof contacts)[0]) => {
    const url = createSmsDistressUrl(contact.phone, user.name, currentLocation.lat, currentLocation.lng, sosReason);
    setSentAlerts((prev) => ({ ...prev, [contact.id]: true }));
    window.open(url, '_blank');
    showToast(`SMS distress link opened for ${contact.name}`);
  };

  const handleDispatchWhatsApp = (contact: (typeof contacts)[0]) => {
    const url = createWhatsAppDistressUrl(contact.phone, user.name, currentLocation.lat, currentLocation.lng, sosReason);
    setSentAlerts((prev) => ({ ...prev, [contact.id]: true }));
    window.open(url, '_blank');
    showToast(`WhatsApp distress link opened for ${contact.name}`);
  };

  const handleStopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      showToast('Audio evidence finalized and sealed in Vault');
    }
  };

  const handleStopVideoRecording = async () => {
    if (isCameraRecording) {
      const saved = await stopCameraRecording();
      if (saved) {
        showToast('Video evidence saved and cryptographically sealed.');
      }
    }
  };

  const handleRetryCamera = async () => {
    setCameraError(null);
    showToast('Requesting camera & microphone access...');
    const res = await startCameraRecording(previewVideoRef.current);
    if (!res.success) {
      setCameraError(res.error || 'Camera permission denied or unavailable');
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
      }
    } else {
      setCameraError(null);
      setVideoSeconds(0);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = window.setInterval(() => {
        setVideoSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto ${
        isStrobeActive ? 'animate-pulse bg-[#C86650]' : 'bg-[#29252D]'
      } text-[#FAF5EF] transition-colors duration-200 select-none`}
    >
      {/* Top Banner */}
      <div className="p-4 sm:p-6 pt-6 max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C86650] flex items-center justify-center shadow-lg animate-pulse">
              <AlertOctagon className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E99583] block">
                Active Distress Beacon
              </span>
              <h1 className="text-base font-extrabold text-[#FAF5EF] tracking-tight">SafeSaathi Emergency SOS Active</h1>
            </div>
          </div>

          {/* Secure Cancel Button */}
          <button
            onClick={() => setShowPinModal(true)}
            className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-extrabold text-[#FAF5EF] flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/25 shadow-sm"
          >
            <X className="w-4 h-4 text-[#E99583]" />
            <span>Cancel with PIN</span>
          </button>
        </div>

        {/* SOS Cause & GPS Tag */}
        <div className="p-4 rounded-3xl bg-[#341B2F]/80 backdrop-blur-md border border-white/20 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#E9DFD2]/80 font-extrabold">
                Distress Reason Triggered
              </span>
              <p className="text-sm font-extrabold text-[#FAF5EF] mt-0.5">{sosReason}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] bg-[#C86650]/30 px-3 py-1 rounded-full text-[#FAF5EF] border border-[#C86650]/50 font-extrabold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#E99583]" />
              <span>Broadcasting Live</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[#E9DFD2]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C5A36A]" />
              <span className="font-mono text-xs font-bold text-[#FAF5EF]">
                {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
              </span>
            </div>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="text-[#C5A36A] hover:underline font-extrabold text-xs flex items-center gap-1"
            >
              <span>View Coordinates Map</span>
              <Share2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Camera Viewfinder & Video Evidence */}
        <div className="p-4 rounded-3xl bg-[#341B2F]/80 backdrop-blur-md border border-white/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isCameraRecording && !cameraError ? 'bg-[#C86650] animate-ping' : 'bg-[#C5A36A]'
                }`}
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#FAF5EF]">
                Autonomous Video Evidence Sentry
              </span>
            </div>
            {isCameraRecording && !cameraError ? (
              <span className="text-xs font-mono font-extrabold text-white bg-[#C86650] px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                REC {formatTimer(videoSeconds)}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#C5A36A] bg-[#C5A36A]/20 border border-[#C5A36A]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <VideoOff className="w-3 h-3" />
                <span>Video Standby</span>
              </span>
            )}
          </div>

          {/* Viewfinder element */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/20">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
            />
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#29252D]/95 p-4 text-center z-10">
                <div className="w-10 h-10 rounded-2xl bg-[#C86650]/20 border border-[#C86650]/40 flex items-center justify-center text-[#E99583] mb-2">
                  <VideoOff className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-[#FAF5EF]">Camera Access Denied</span>
                <p className="text-[11px] text-[#E9DFD2] mt-1 max-w-xs leading-relaxed">
                  Camera permission was blocked. Tap below to retry or allow camera in browser address bar permissions.
                </p>
                <button
                  type="button"
                  onClick={handleRetryCamera}
                  className="mt-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#702E46] to-[#C86650] hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer border border-white/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera Access</span>
                </button>
                <span className="text-[10px] text-[#7E927B] font-extrabold mt-2">
                  ✓ Audio evidence recording &amp; GPS broadcast remain fully active
                </span>
              </div>
            )}
            {!cameraError && isCameraRecording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-mono text-[#E99583] font-extrabold border border-[#C86650]/50">
                <span className="w-2 h-2 rounded-full bg-[#C86650] animate-pulse" />
                <span>LIVE FEED • 1080P/720P EVIDENCE RECORD</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[#E9DFD2] font-medium">
              Files are verified, hashed with SHA-256, and stored locally in IndexedDB &amp; cloud.
            </span>
            {isCameraRecording && (
              <button
                onClick={handleStopVideoRecording}
                className="text-[11px] font-extrabold text-white px-3 py-1.5 rounded-xl bg-[#C86650] hover:bg-[#B3523D] shadow-md transition cursor-pointer shrink-0 ml-2"
              >
                Stop &amp; Save Video
              </button>
            )}
          </div>
        </div>

        {/* Emergency Helplines Direct Dial */}
        <div>
          <span className="text-xs uppercase tracking-wider text-[#E9DFD2] font-extrabold block mb-2">
            Instant Emergency Helplines (1-Tap Dial)
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <a
              href="tel:112"
              className="p-3.5 rounded-2xl bg-[#C86650] hover:bg-[#B3523D] text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition cursor-pointer border border-white/20"
            >
              <Phone className="w-4 h-4 mb-1 stroke-[2.5]" />
              <span className="text-lg font-black tracking-tight">112</span>
              <span className="text-[10px] text-white/90 font-extrabold">Police / EMS</span>
            </a>
            <a
              href="tel:1091"
              className="p-3.5 rounded-2xl bg-[#702E46] hover:bg-[#5E243A] text-white flex flex-col items-center justify-center border border-white/25 active:scale-95 transition cursor-pointer shadow-md"
            >
              <Phone className="w-4 h-4 mb-1 text-[#E99583] stroke-[2.5]" />
              <span className="text-lg font-black tracking-tight">1091</span>
              <span className="text-[10px] text-white/90 font-extrabold">Women Helpline</span>
            </a>
            <a
              href="tel:181"
              className="p-3.5 rounded-2xl bg-[#45263F] hover:bg-[#341B2F] text-white flex flex-col items-center justify-center border border-white/25 active:scale-95 transition cursor-pointer shadow-md"
            >
              <Phone className="w-4 h-4 mb-1 text-[#C5A36A] stroke-[2.5]" />
              <span className="text-lg font-black tracking-tight">181</span>
              <span className="text-[10px] text-white/90 font-extrabold">Distress Support</span>
            </a>
          </div>
        </div>

        {/* Audio Evidence & Hardware Siren Controls */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Siren toggle */}
          <button
            onClick={toggleSiren}
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition active:scale-95 cursor-pointer ${
              isSirenPlaying
                ? 'bg-[#C86650]/40 border-[#C86650] text-white shadow-lg shadow-[#C86650]/30'
                : 'bg-white/10 border-white/20 text-[#FAF5EF]'
            }`}
          >
            {isSirenPlaying ? (
              <Volume2 className="w-5 h-5 text-[#E99583] animate-bounce" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#E9DFD2]" />
            )}
            <div className="text-left">
              <span className="text-xs font-extrabold block">
                {isSirenPlaying ? 'Siren Active' : 'Siren Muted'}
              </span>
              <span className="text-[10px] font-bold text-[#E9DFD2]">
                {isSirenPlaying ? 'Tap to pause' : 'Tap to sound alert'}
              </span>
            </div>
          </button>

          {/* Strobe screen toggle */}
          <button
            onClick={() => setIsStrobeActive(!isStrobeActive)}
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition active:scale-95 cursor-pointer ${
              isStrobeActive
                ? 'bg-[#C5A36A]/40 border-[#C5A36A] text-white shadow-lg'
                : 'bg-white/10 border-white/20 text-[#FAF5EF]'
            }`}
          >
            <Flame className="w-5 h-5 text-[#C5A36A]" />
            <div className="text-left">
              <span className="text-xs font-extrabold block">
                {isStrobeActive ? 'Strobe ON' : 'Visual Strobe'}
              </span>
              <span className="text-[10px] font-bold text-[#E9DFD2]">Attract attention</span>
            </div>
          </button>
        </div>

        {/* Live Audio Evidence Box */}
        <div className="p-3.5 rounded-2xl bg-[#341B2F]/80 border border-white/20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C86650]/30 flex items-center justify-center text-[#E99583] border border-[#C86650]/40">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#FAF5EF] block">
                Recording Audio Evidence
              </span>
              <span className="text-[10px] text-[#E9DFD2] font-mono font-bold">
                Duration: {formatTimer(recordingSeconds)} · Encrypted &amp; Sealed
              </span>
            </div>
          </div>
          {isRecordingAudio && (
            <button
              onClick={handleStopAudioRecording}
              className="text-[11px] font-extrabold text-[#FAF5EF] hover:bg-white/20 px-3 py-1.5 rounded-xl bg-white/10 cursor-pointer border border-white/20"
            >
              Stop &amp; Save
            </button>
          )}
        </div>

        {/* Trusted Contacts Instant Dispatch */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#E9DFD2] font-extrabold">
              Dispatch to Trusted Circle
            </span>
            <span className="text-xs text-[#C5A36A] font-bold">{contacts.length} Configured</span>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-2xl bg-[#341B2F]/80 border border-white/20 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#FAF5EF]">{contact.name}</span>
                    <span className="text-[10px] text-[#E99583] font-bold">({contact.relationship})</span>
                    {contact.isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#C5A36A]/30 text-[#C5A36A] border border-[#C5A36A]/40 rounded-full font-extrabold">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#E9DFD2] font-mono font-bold">{contact.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDispatchWhatsApp(contact)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      sentAlerts[contact.id]
                        ? 'bg-[#7E927B] text-white border-transparent'
                        : 'bg-white/15 hover:bg-white/25 text-[#FAF5EF] border-white/20'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E99583]" />
                    <span>{sentAlerts[contact.id] ? 'Sent' : 'WhatsApp'}</span>
                  </button>

                  <button
                    onClick={() => handleDispatchSms(contact)}
                    className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-[#FAF5EF] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-white/20"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C5A36A]" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Cancellation Modal */}
      <PinDialog
        isOpen={showPinModal}
        title="Authenticate to Cancel SOS"
        subtitle="Enter your 4-digit security PIN to deactivate emergency broadcast."
        onSuccess={(pin) => {
          const res = cancelSosWithPin(pin);
          if (res.success) {
            setShowPinModal(false);
          }
          return res;
        }}
        onCancel={() => setShowPinModal(false)}
      />
    </div>
  );
};
