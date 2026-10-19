import React from 'react';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { JourneyScreen } from './components/screens/JourneyScreen';
import { SafetyMapScreen } from './components/screens/SafetyMapScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { SafetyToolsScreen } from './components/screens/SafetyToolsScreen';
import { EvidenceVaultScreen } from './components/screens/EvidenceVaultScreen';
import { ProfileSettingsScreen } from './components/screens/ProfileSettingsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { EmergencySosScreen } from './components/screens/EmergencySosScreen';
import { CountdownDialog } from './components/common/CountdownDialog';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { Smartphone, Monitor, ShieldCheck, Wifi, Battery, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const MainApp: React.FC = () => {
  const {
    user,
    updateUser,
    activeTab,
    setActiveTab,
    toastMessage,
    theme,
    deviceView,
    setDeviceView,
    showAuthModal,
    setShowAuthModal,
  } = useSafety();
  const showOnboarding = !user.onboardingCompleted;

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => updateUser({ onboardingCompleted: true })} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'journey':
        return <JourneyScreen />;
      case 'map':
        return <SafetyMapScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'tools':
        return <SafetyToolsScreen />;
      case 'evidence':
        return <EvidenceVaultScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileSettingsScreen />;
      case 'auth':
        return (
          <AuthScreen
            onSuccess={() => setActiveTab('dashboard')}
            onSkip={() => setActiveTab('dashboard')}
          />
        );
      default:
        return <DashboardScreen />;
    }
  };

  const isDarkMode = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col selection:bg-[#E99583]/30 selection:text-[#702E46] ${
        isDarkMode ? 'ambient-bg-dark text-[#FAF5EF] font-medium' : 'ambient-bg-light text-[#29252D] font-medium'
      }`}
    >
      {/* Responsive Global Header */}
      <Header />

      {/* Main Responsive Experience */}
      {deviceView === 'mobile' ? (
        /* Mobile Simulator Mode on Desktop */
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
          <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C86650] animate-ping" />
              <span className="text-xs font-extrabold tracking-wide text-[#45263F] dark:text-[#FAF5EF]">
                SafeSaathi Mobile Simulation
              </span>
            </div>
            <button
              onClick={() => setDeviceView('web')}
              className="text-xs font-bold text-[#62566F] hover:text-[#702E46] dark:text-[#FAF5EF] dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl clay-card shadow-xs transition-all cursor-pointer border border-[#E9DFD2]"
            >
              <Monitor className="w-3.5 h-3.5 text-[#C86650]" />
              <span>Full Web</span>
            </button>
          </div>

          {/* Smartphone Frame Container */}
          <div className="w-full max-w-[400px] h-[844px] max-h-[92vh] rounded-[48px] p-3 shadow-2xl border-4 border-[#45263F]/80 bg-[#1E121B] relative flex flex-col overflow-hidden">
            {/* Top Phone Speaker & Dynamic Island */}
            <div className="h-6 w-full flex items-center justify-between px-6 shrink-0 z-30 text-[10px] font-bold text-slate-300">
              <span>9:41</span>
              <div className="w-24 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-[#E99583]" />
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* Inner Phone Screen Content */}
            <div
              className={`flex-1 overflow-y-auto rounded-[36px] relative flex flex-col ${
                isDarkMode ? 'ambient-bg-dark text-[#FAF5EF]' : 'ambient-bg-light text-[#29252D]'
              }`}
            >
              <div className="p-4 pb-24 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {renderActiveScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* In-Frame Mobile Navigation */}
              <Navbar forceShow={true} />
            </div>

            {/* Home Indicator Bar */}
            <div className="h-4 w-full flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-[#E9DFD2]/40 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Desktop / Tablet Web Mode (Responsive down to mobile) */
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-12 transition-all">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* Floating Bottom Navigation Bar for actual mobile viewports */}
      {deviceView === 'web' && <Navbar />}

      {/* Journey Guard 30s Proactive Deviation Countdown Modal */}
      <CountdownDialog />

      {/* Dedicated Emergency SOS Full Screen Interface */}
      <EmergencySosScreen />

      {/* Supabase Authentication Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 z-10 w-9 h-9 rounded-2xl clay-card flex items-center justify-center text-[#62566F] dark:text-[#FAF5EF] hover:text-[#BA223C] active:scale-95 transition cursor-pointer shadow-md"
              aria-label="Close Authentication Modal"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthScreen
              onSuccess={() => setShowAuthModal(false)}
              onSkip={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {/* Tactile Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="glass-panel-elevated px-5 py-2.5 rounded-2xl shadow-xl border border-[#E9DFD2] dark:border-[#C5A36A]/30 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] flex items-center gap-2.5 animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C86650]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );

};

export default function App() {
  return (
    <SafetyProvider>
      <MainApp />
    </SafetyProvider>
  );
}
