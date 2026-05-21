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
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';

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
      <div className="min-h-screen bg-white dark:bg-[#050208] text-black dark:text-white font-sans relative overflow-hidden transition-colors duration-500">
        {/* Ambient Mesh Gradients */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-violet-600 dark:bg-[#2D1B4E] rounded-full blur-[120px] opacity-20 dark:opacity-40"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#7C3AED] rounded-full blur-[100px] opacity-30"></div>
        
        <div className="relative z-10">
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
    </ThemeLanguageProvider>
  );
}
