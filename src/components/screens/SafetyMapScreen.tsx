import React, { useState } from 'react';
import {
  Navigation,
  Phone,
  Shield,
  PlusCircle,
  Building,
  RotateCw,
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { NEARBY_SAFE_PLACES } from '../../data/mockData';
import { SafePlace } from '../../types';
import { createMapBeaconUrl } from '../../utils/geolocation';
import { soundManager } from '../../utils/audio';

export const SafetyMapScreen: React.FC = () => {
  const { currentLocation, refreshLocation, activeJourney, setActiveTab, showToast } = useSafety();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<SafePlace | null>(NEARBY_SAFE_PLACES[0]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredPlaces = NEARBY_SAFE_PLACES.filter((place) => {
    const matchesType = selectedType === 'all' || place.type === selectedType;
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleRefresh = async () => {
    soundManager.triggerHaptic(20);
    setIsRefreshing(true);
    await refreshLocation();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('GPS coordinates recalibrated');
    }, 600);
  };

  const getIconForType = (type: SafePlace['type']) => {
    switch (type) {
      case 'police':
        return <Shield className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />;
      case 'hospital':
        return <PlusCircle className="w-4 h-4 text-[#C86650]" />;
      case 'pharmacy':
        return <PlusCircle className="w-4 h-4 text-[#7E927B]" />;
      default:
        return <Building className="w-4 h-4 text-[#C5A36A]" />;
    }
  };

  const mapBeaconUrl = createMapBeaconUrl(currentLocation.lat, currentLocation.lng);

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
              Verified Safe Havens &amp; Radar Map
            </h1>
            <span className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 hidden sm:inline">
              Continuous GPS geolocation radar active
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-10 px-4 rounded-2xl editorial-card text-xs font-extrabold text-[#702E46] dark:text-[#E99583] flex items-center gap-2 hover:bg-[#E9DFD2]/40 active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#45263F] cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Recalibrate GPS</span>
        </button>
      </div>

      {/* Responsive 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= MAP CANVAS (col-span-12 lg:col-span-8) ================= */}
        <div className="lg:col-span-8 space-y-4">
          <div className="editorial-card rounded-[32px] p-4 lg:p-6 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] relative overflow-hidden bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            {/* Search Input */}
            <div className="relative mb-3 z-10">
              <Search className="w-4 h-4 text-[#625B63] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search police stations, hospitals, 24/7 care..."
                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] placeholder:text-[#625B63] focus:outline-none focus:ring-2 focus:ring-[#702E46]/40 shadow-xs"
              />
            </div>

            {/* Map Canvas */}
            <div className="w-full h-72 sm:h-96 rounded-3xl bg-[#E9DFD2]/30 dark:bg-[#29252D]/80 relative overflow-hidden border border-[#E9DFD2] dark:border-[#45263F] shadow-inner flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-map-safe" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#C5A36A" strokeWidth="0.6" strokeOpacity="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-map-safe)" />
                <path d="M 0 160 Q 200 90 700 200" stroke="#C86650" strokeWidth="8" strokeOpacity="0.25" fill="none" />
                <path d="M 220 0 L 380 400" stroke="#702E46" strokeWidth="6" strokeOpacity="0.2" fill="none" />
              </svg>

              {/* Planned Route Line if active */}
              {activeJourney && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 240 180 Q 320 120 460 100"
                    stroke="#702E46"
                    strokeWidth="5"
                    strokeDasharray="8,5"
                    fill="none"
                  />
                </svg>
              )}

              {/* User Location Radar Pin */}
              <div className="absolute left-[45%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#702E46] to-[#45263F] flex items-center justify-center text-white shadow-xl ring-8 ring-[#E99583]/30 animate-pulse border border-white/30">
                  <Navigation className="w-5 h-5 text-white stroke-[2.4]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#29252D] dark:text-[#FAF5EF] bg-white/95 dark:bg-[#29252D]/95 px-3 py-0.5 rounded-full shadow-xs mt-1.5 border border-[#E9DFD2] dark:border-[#702E46]/40">
                  Your Location
                </span>
              </div>

              {/* Safe Place Pins */}
              {filteredPlaces.map((place, idx) => {
                const positions = [
                  { left: '22%', top: '28%' },
                  { left: '75%', top: '22%' },
                  { left: '30%', top: '78%' },
                  { left: '78%', top: '72%' },
                ];
                const pos = positions[idx % positions.length];
                const isSelected = selectedPlace?.id === place.id;

                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      soundManager.triggerHaptic(15);
                    }}
                    style={{ left: pos.left, top: pos.top }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 p-2.5 rounded-2xl shadow-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#702E46] to-[#45263F] text-white ring-4 ring-[#E99583] scale-125 border border-white/20'
                        : 'bg-[#FFFDF9] dark:bg-[#45263F] text-[#29252D] dark:text-[#FAF5EF] hover:scale-110 border border-[#E9DFD2] dark:border-[#702E46]/40'
                    }`}
                    title={place.name}
                  >
                    {getIconForType(place.type)}
                  </button>
                );
              })}

              {/* Map Footer Links */}
              <div className="absolute bottom-3 left-3 z-10 text-[11px] bg-white/90 dark:bg-[#29252D]/90 backdrop-blur-md px-3 py-1 rounded-xl text-[#29252D] dark:text-[#FAF5EF] font-mono font-bold border border-[#E9DFD2] dark:border-[#702E46]/40">
                {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
              </div>

              <a
                href={mapBeaconUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 z-10 text-xs bg-gradient-to-r from-[#702E46] to-[#C86650] text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-extrabold shadow-md hover:opacity-95 transition border border-white/20"
              >
                <span>Google Maps View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Selected Place Detail Box */}
            {selectedPlace && (
              <div className="mt-4 p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#45263F]/50 border border-[#E9DFD2] dark:border-[#702E46]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E9DFD2]/60 dark:bg-[#702E46]/30 flex items-center justify-center shrink-0 border border-[#E9DFD2] dark:border-[#702E46]/40">
                    {getIconForType(selectedPlace.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">
                      {selectedPlace.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#625B63] dark:text-[#E9DFD2]/80 mt-0.5">{selectedPlace.address}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#7E927B] font-extrabold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7E927B]" />
                      <span>24/7 Verified Safe Haven Responder</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-[#702E46] dark:text-[#E99583] bg-[#E9DFD2]/60 dark:bg-[#702E46]/30 px-3 py-1.5 rounded-xl border border-[#E9DFD2] dark:border-[#702E46]/40">
                    {selectedPlace.distance}
                  </span>
                  <a
                    href={`tel:${selectedPlace.phone}`}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#702E46] to-[#C86650] text-white text-xs font-extrabold flex items-center gap-1.5 hover:opacity-95 transition cursor-pointer shadow-xs border border-white/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {selectedPlace.phone}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= DIRECTORY LIST (col-span-12 lg:col-span-4) ================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Havens' },
              { id: 'police', label: 'Police' },
              { id: 'hospital', label: 'Hospitals' },
              { id: 'pharmacy', label: '24/7 Care' },
              { id: 'safe_spot', label: 'Transit Hubs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-gradient-to-r from-[#702E46] to-[#C86650] text-white shadow-xs border border-white/20'
                    : 'editorial-card text-[#625B63] dark:text-[#E9DFD2] hover:text-[#702E46] dark:hover:text-white border border-[#E9DFD2] dark:border-[#45263F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List Cards */}
          <div className="editorial-card rounded-[32px] p-5 shadow-sm border border-[#E9DFD2] dark:border-[#45263F] space-y-2.5 bg-[#FAF5EF] dark:bg-[#341B2F]/80">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9DFD2] dark:border-[#45263F]">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#29252D] dark:text-[#FAF5EF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A36A]" />
                <span>Safe Havens ({filteredPlaces.length})</span>
              </h3>
              <span className="text-[11px] font-bold text-[#625B63] dark:text-[#E9DFD2]/80">Within 1.5 km</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFFDF9] dark:bg-[#45263F] border-[#702E46] dark:border-[#E99583] shadow-md ring-1 ring-[#702E46]'
                        : 'bg-[#FFFDF9]/70 dark:bg-[#45263F]/30 hover:bg-[#FFFDF9] dark:hover:bg-[#45263F]/60 border-[#E9DFD2] dark:border-[#702E46]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#E9DFD2]/60 dark:bg-[#702E46]/30 border border-[#E9DFD2] dark:border-[#702E46]/40 flex items-center justify-center shrink-0">
                        {getIconForType(place.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-[#29252D] dark:text-[#FAF5EF] truncate">
                          {place.name}
                        </h4>
                        <span className="text-[11px] font-bold text-[#625B63] dark:text-[#E9DFD2]/80 block truncate">
                          {place.distance} away · 24/7 Verified
                        </span>
                      </div>
                    </div>

                    <a
                      href={`tel:${place.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-xl bg-[#E9DFD2]/60 hover:bg-[#702E46] hover:text-white text-[#702E46] dark:bg-[#702E46]/40 dark:text-[#E99583] flex items-center justify-center transition shrink-0 cursor-pointer border border-[#E9DFD2] dark:border-[#702E46]/40"
                      title="Direct Dial"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
