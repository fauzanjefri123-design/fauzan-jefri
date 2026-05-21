/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import LandingPage from './components/LandingPage';
import DashboardPage from './components/Dashboard';
import 開啓動畫 from './components/OpeningAnimation';
import OnboardingPopup from './components/OnboardingPopup';
import Auth from './components/Auth';
import { Loader2 } from 'lucide-react';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';

function ThemeAwareApp({
  currentView,
  setCurrentView,
  hasBusiness,
  setHasBusiness,
}: {
  currentView: string;
  setCurrentView: (view: any) => void;
  hasBusiness: boolean;
  setHasBusiness: (val: boolean) => void;
}) {
  const { storeTheme } = useThemeLanguage();

  const getThemeBGClass = () => {
    switch (storeTheme) {
      case 'clean_white':
        return 'bg-slate-50 text-slate-800 font-sans';
      case 'gold_luxury':
        return 'bg-neutral-980 text-amber-100 font-sans';
      case 'blue_fintech':
        return 'bg-[#020917] text-sky-100 font-sans';
      case 'purple_hologram':
        return 'bg-[#080211] text-fuchsia-100 font-sans';
      case 'cyber_neon':
      default:
        return 'bg-[#050208] text-white font-sans';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBGClass()} relative overflow-hidden transition-all duration-700`}>
      {/* Ambient Mesh Gradients based on theme */}
      {storeTheme === 'cyber_neon' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#db2777] rounded-full blur-[100px] opacity-20"></div>
        </>
      )}
      {storeTheme === 'purple_hologram' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#d946ef] rounded-full blur-[130px] opacity-25"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#8b5cf6] rounded-full blur-[110px] opacity-20"></div>
        </>
      )}
      {storeTheme === 'blue_fintech' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#0ea5e9] rounded-full blur-[130px] opacity-20"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#2563eb] rounded-full blur-[110px] opacity-20"></div>
        </>
      )}
      {storeTheme === 'gold_luxury' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#eab308] rounded-full blur-[140px] opacity-10"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#b45309] rounded-full blur-[120px] opacity-10"></div>
        </>
      )}
      {storeTheme === 'clean_white' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#cbd5e1] rounded-full blur-[130px] opacity-35"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#e2e8f0] rounded-full blur-[110px] opacity-30"></div>
        </>
      )}
      
      <div className="relative z-10 h-full">
        {currentView === 'splash' && <開啓動畫 onComplete={() => setCurrentView('landing')} />}
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'auth' && <Auth onNavigate={setCurrentView} />}
        {(currentView === 'dashboard' || currentView === 'products' || currentView === 'attendance' || currentView === 'kasir' || currentView === 'wallet' || currentView === 'profile') && (
           <>
             {!hasBusiness && <OnboardingPopup onComplete={() => setHasBusiness(true)} />}
             <DashboardPage currentView={currentView} onNavigate={setCurrentView} />
           </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'splash' | 'landing' | 'auth' | 'dashboard' | 'products' | 'attendance' | 'kasir' | 'wallet' | 'profile'>('splash');
  const [hasBusiness, setHasBusiness] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Inactivity timeout (e.g., 15 minutes)
  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => {
      setCurrentView('splash');
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let timeoutId: any;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          handleLogout();
        }, INACTIVITY_LIMIT);
      }
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer(); // Initialize timer
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [user, handleLogout, INACTIVITY_LIMIT]);

  const currentViewRef = useRef(currentView);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      const v = currentViewRef.current;
      const isOfflineLoggedIn = localStorage.getItem('offline_logged_in_user');
      
      // Route protection logic
      if ((currentUser || isOfflineLoggedIn) && (v === 'landing' || v === 'auth' || v === 'splash')) {
        setCurrentView('dashboard');
      } else if (!currentUser && !isOfflineLoggedIn && v !== 'landing' && v !== 'splash') {
        setCurrentView('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const businessData = localStorage.getItem('inmarket_business');
    if (businessData) {
      setHasBusiness(true);
    }
  }, []);

  if (authLoading && currentView !== 'splash') {
     return (
      <div className="min-h-screen bg-[#050208] flex items-center justify-center text-violet-500">
         <Loader2 className="animate-spin" size={40} />
      </div>
     )
  }

  return (
    <ThemeLanguageProvider>
      <ThemeAwareApp
        currentView={currentView}
        setCurrentView={setCurrentView}
        hasBusiness={hasBusiness}
        setHasBusiness={setHasBusiness}
      />
    </ThemeLanguageProvider>
  );
}
