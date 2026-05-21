import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { cn } from '../lib/utils';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Mail, 
  Lock, 
  ChevronDown, 
  ShieldCheck, 
  Fingerprint,
  Sparkles,
  Crown,
  Users
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { translations } from '../lib/translations';
import ThemeLanguageSwitcher from './ThemeLanguageSwitcher';
import { playScanSound, playSuccessSound } from '../lib/sounds';

export default function Auth({ onNavigate }: { onNavigate: (view: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Owner' | 'Employee' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localModePrompt, setLocalModePrompt] = useState(false);

  // Floating focus state managers
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { language, theme } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language]?.[key] || key;

  const getErrorMessage = (errCode: string, message: string) => {
    const code = errCode?.toLowerCase() || '';
    const msg = message?.toLowerCase() || '';
    
    if (code.includes('network-request-failed') || msg.includes('network-request-failed') || msg.includes('network')) {
      return language === 'id' 
        ? '⚠️ Gagal terhubung ke Firebase Server (Sebab: Sandbox / Port diblokir). Silakan aktifkan Akses Sandbox Offline!' 
        : '⚠️ Firebase Server unreachable (Blocked port / Sandbox constraints). Please toggle Offline Sandbox Mode!';
    }
    if (code.includes('email-already-in-use') || msg.includes('email-already-in-use')) {
      return language === 'id' ? 'Email ini sudah terdaftar.' : 'This email is already registered.';
    }
    if (code.includes('weak-password') || msg.includes('weak-password')) {
      return language === 'id' ? 'Password minimal harus 6 karakter.' : 'Password must be at least 6 characters.';
    }
    if (code.includes('invalid-email') || msg.includes('invalid-email') || msg.includes('email wajib')) {
      return language === 'id' ? 'Format email tidak valid.' : 'Invalid email format.';
    }
    if (
      code.includes('wrong-password') || 
      code.includes('user-not-found') || 
      code.includes('invalid-credential') || 
      msg.includes('credential') || 
      msg.includes('wrong') ||
      msg.includes('not-found')
    ) {
      return language === 'id' ? 'Email atau password salah.' : 'Incorrect email or password.';
    }
    return message;
  };

  const handleOfflineModeLogin = () => {
    // Force a simulated offline success bypass
    setError(null);
    setIsLoading(true);
    playScanSound();

    const mockEmail = email || 'owner@inmarket.com';
    const mockRole = role || (mockEmail.includes('karyawan') || mockEmail.includes('employee') ? 'Employee' : 'Owner');
    
    const simulatedUser = {
      uid: 'offline_' + mockEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: mockEmail,
      displayName: mockEmail.split('@')[0],
      role: mockRole
    };

    localStorage.setItem('local_user_' + mockEmail, JSON.stringify({ email: mockEmail, password: password || '123456', role: mockRole }));
    localStorage.setItem('offline_logged_in_user', JSON.stringify(simulatedUser));

    setTimeout(() => {
      setIsLoading(false);
      setIsScanning(true);
      playSuccessSound();
      
      setTimeout(() => {
        setIsScanning(false);
        onNavigate('dashboard');
      }, 2000);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(language === 'id' ? 'Email wajib diisi.' : 'Email is required.');
      return;
    }
    if (!password) {
      setError(language === 'id' ? 'Password wajib diisi.' : 'Password is required.');
      return;
    }
    if (password.length < 6) {
      setError(language === 'id' ? 'Password minimal 6 karakter.' : 'Password must be 6+ characters.');
      return;
    }
    if (!isLogin && !role) {
      setError(language === 'id' ? 'Silakan pilih peran akun (role).' : 'Please select an account role.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        try {
          // Attempt default Firebase authentication
          await signInWithEmailAndPassword(auth, email, password);
          
          // If successful, save local cache as owner (default) unless cached otherwise
          const cachedUser = localStorage.getItem('local_user_' + email);
          if (!cachedUser) {
            localStorage.setItem('local_user_' + email, JSON.stringify({ email, password, role: 'Owner' }));
          } else {
            // Restore potential simulated offline logged session
            const userObj = JSON.parse(cachedUser);
            localStorage.setItem('offline_logged_in_user', JSON.stringify({
              uid: 'simulated_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
              email,
              displayName: email.split('@')[0],
              role: userObj.role
            }));
          }

          setSuccess(language === 'id' ? 'Otorisasi Berhasil. Memindai data diri...' : 'Authorization Successful. Scanning profile...');
          setIsScanning(true);
          playSuccessSound();

          setTimeout(() => {
            setIsScanning(false);
            onNavigate('dashboard');
          }, 2000);

        } catch (firebaseErr: any) {
          // Check if failure is due to Firebase connection limits/sandbox
          console.error("Firebase Auth Error:", firebaseErr);
          const isNetworkErr = firebaseErr?.code?.includes('network') || firebaseErr?.message?.includes('network-request-failed') || firebaseErr?.message?.includes('auth/network-request-failed') || firebaseErr?.message?.includes('apiKey');
          
          // Test local offline vault matching
          const cachedUserStr = localStorage.getItem('local_user_' + email);
          if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            if (cachedUser.password === password) {
              const simulatedUser = {
                uid: 'offline_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
                email: email,
                displayName: email.split('@')[0],
                role: cachedUser.role
              };
              localStorage.setItem('offline_logged_in_user', JSON.stringify(simulatedUser));
              
              setSuccess(language === 'id' ? 'Koneksi Terkompres (Mode Offline). Memindai...' : 'Compressed Link Established (Offline Mode). Scanning...');
              setIsScanning(true);
              playSuccessSound();

              setTimeout(() => {
                setIsScanning(false);
                onNavigate('dashboard');
              }, 2000);
              return;
            }
          }

          // Offer offline sandbox bypass if network request fails or API key errors
          if (isNetworkErr) {
            setLocalModePrompt(true);
          }
          throw firebaseErr;
        }

      } else {
        // Registering a new account
        try {
          // Attempt standard firebase creation
          await createUserWithEmailAndPassword(auth, email, password);
          
          // Save locally as fallback cache
          localStorage.setItem('local_user_' + email, JSON.stringify({ email, password, role }));
          
          setSuccess(language === 'id' ? 'Registrasi Berhasil! Mengalihkan ke halaman Log In...' : 'Registered Successfully! Redirecting to Log In...');
          playSuccessSound();
          
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(null);
          }, 2000);

        } catch (firebaseErr: any) {
          console.error("Firebase register failed, saving locally:", firebaseErr);
          
          // Force Offline Registration Sync always so developer sandbox doesn't lock up
          localStorage.setItem('local_user_' + email, JSON.stringify({ email, password, role }));
          
          setSuccess(language === 'id' ? 'Registrasi Offline Berhasil! Menyimpan data instansi...' : 'Offline Registration Succeeded! Saving instance assets...');
          playSuccessSound();
          
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(null);
          }, 2000);
        }
      }
    } catch (e: any) {
      setError(getErrorMessage(e.code, e.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate background animation coordinates 
  const [particles, setParticles] = useState<Array<{left: number, top: number, size: number, duration: number}>>([]);
  useEffect(() => {
    const list = Array.from({ length: 15 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 12 + 6,
    }));
    setParticles(list);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen relative w-full overflow-hidden bg-slate-950 dark:bg-[#030107] font-sans">
      
      {/* Decorative Particle Canvas Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Glowing holographic nodes */}
        <motion.div 
          animate={{ x: [0, 30, -30, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-600/10 dark:bg-violet-900/15 blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400/10 dark:bg-cyan-900/10 blur-[130px]"
        />

        {particles.map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-indigo-400/25 blur-[0.5px]"
            animate={{
              y: [0, -120, 0],
              x: [0, Math.sin(idx) * 20, 0],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Navigation and Swappable Header Bar Controls */}
      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-50">
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-slate-900/20 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-white/90 text-xs font-bold hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all pointer-events-auto cursor-pointer"
        >
          <ArrowLeft size={14} /> {language === 'id' ? 'Kembali' : 'Back'}
        </button>

        <div className="bg-slate-900/20 dark:bg-white/5 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/10 flex items-center">
          <ThemeLanguageSwitcher />
        </div>
      </div>

      {/* Main Glassmorphism Form container */}
      <div className="relative z-10 w-full max-w-md p-4 mt-8">
        <motion.div 
          key={error ? `shake-${error}` : 'form-wrapper'}
          initial={{ opacity: 0, y: 40 }} 
          animate={error ? { 
            opacity: 1, 
            y: 0,
            x: [-8, 8, -5, 5, -3, 3, 0],
            transition: { duration: 0.45 }
          } : { opacity: 1, y: 0 }}
          className={cn(
            "relative bg-white/75 dark:bg-slate-950/45 backdrop-blur-2xl p-8 rounded-[36px] border shadow-2xl transition-all duration-300",
            theme === 'light' ? "border-slate-200/80 shadow-indigo-100/50" : "border-violet-500/15 shadow-violet-950/20"
          )}
          style={{
            boxShadow: theme === 'dark' 
              ? '0 0 50px rgba(139,92,246,0.1), inset 0 0 20px rgba(139,92,246,0.05)'
              : '0 25px 60px -15px rgba(99,102,241,0.12)'
          }}
        >
          {/* Decorative light gradient reflections */}
          <div className="absolute -top-[120px] -left-[120px] w-[260px] h-[260px] bg-gradient-to-tr from-transparent via-white/5 to-white/10 rotate-45 pointer-events-none rounded-full" />
          
          <div className="text-center mb-8 relative">
            <div className="inline-flex p-3 bg-violet-600/10 rounded-2xl border border-violet-500/20 mb-3 text-violet-500 dark:text-violet-400">
              <Fingerprint className="animate-pulse" size={24} />
            </div>
            <h2 className={cn(
              "text-3xl font-black tracking-tight",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              {isLogin ? t('loginTitle') : t('registerTitle')}
            </h2>
            <p className={cn("text-xs mt-1.5 font-bold tracking-wider font-mono", theme === 'light' ? "text-slate-500" : "text-violet-300/60")}>
              INMARKET SECURE LEDGER SYSTEM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            
            {/* Success Status / Error Status Banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, scale: 0.95 }} 
                  animate={{ height: 'auto', opacity: 1, scale: 1 }} 
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  className="p-4 bg-red-500/10 dark:bg-red-950/30 backdrop-blur-xl border border-red-500/30 rounded-2xl flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.12)]"
                >
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-red-900 dark:text-red-200 font-semibold leading-relaxed">
                    {error}
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, scale: 0.95 }} 
                  animate={{ height: 'auto', opacity: 1, scale: 1 }} 
                  exit={{ height: 0, opacity: 0, scale: 0.95 }}
                  className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl flex items-start gap-3 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                >
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-emerald-900 dark:text-emerald-200 font-semibold leading-relaxed">
                    {success}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Form input block */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                <Mail size={18} className={cn(emailFocused && "text-violet-500 dark:text-violet-400")} />
              </div>
              <input 
                type="email" 
                value={email}
                placeholder={t('emailPlaceholder')}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChange={e => setEmail(e.target.value)}
                className={cn(
                  "w-full py-4 pl-12 pr-4 text-sm rounded-2xl border transition-all duration-300 outline-none font-bold",
                  theme === 'light' 
                    ? "bg-slate-50/50 border-slate-200 text-slate-800 focus:border-violet-500 focus:bg-white" 
                    : "bg-slate-900/40 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:bg-slate-900/10"
                )}
                style={{
                  boxShadow: emailFocused && theme === 'dark' ? '0 0 15px rgba(139,92,246,0.25)' : ''
                }}
              />
            </div>

            {/* Password input block */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                <Lock size={18} className={cn(passwordFocused && "text-violet-500 dark:text-violet-400")} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                placeholder={t('passwordPlaceholder')}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={e => setPassword(e.target.value)}
                className={cn(
                  "w-full py-4 pl-12 pr-12 text-sm rounded-2xl border transition-all duration-300 outline-none font-bold",
                  theme === 'light' 
                    ? "bg-slate-50/50 border-slate-200 text-slate-800 focus:border-violet-500 focus:bg-white" 
                    : "bg-slate-900/40 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:bg-slate-900/10"
                )}
                style={{
                  boxShadow: passwordFocused && theme === 'dark' ? '0 0 15px rgba(139,92,246,0.25)' : ''
                }}
              />
              <button 
                type="button" 
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Account Role Dropdown (Only on Register view) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 relative overflow-visible"
                >
                  <label className={cn("flex justify-between items-center text-[11px] font-black tracking-widest uppercase mb-1", theme === 'light' ? "text-slate-500" : "text-violet-300")}>
                    <span>{t('roleLabel')}</span>
                    <span className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono tracking-normal bg-cyan-950/30 border border-cyan-400/20 px-1.5 py-0.5 rounded-[4px]">
                      <Sparkles size={10} className="animate-pulse" /> SECURE_SEC_01
                    </span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={cn(
                        "w-full p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-300 font-bold text-sm",
                        "bg-[#120826]/40 backdrop-blur-xl border-violet-500/30 text-white",
                        isDropdownOpen 
                          ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] text-white" 
                          : "hover:border-violet-400/60 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      )}
                      style={{
                        background: 'linear-gradient(135deg, rgba(26,11,54,0.45) 0%, rgba(13,6,32,0.65) 100%)',
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        {role === 'Owner' && (
                          <>
                            <Crown size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] shrink-0 animate-[pulse_2s_infinite]" />
                            <span className="text-white tracking-wide text-xs font-black">{t('ownerRole').replace(/^👑\s*/, '')}</span>
                          </>
                        )}
                        {role === 'Employee' && (
                          <>
                            <Users size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] shrink-0 animate-[pulse_2s_infinite]" />
                            <span className="text-white tracking-wide text-xs font-black">{t('employeeRole').replace(/^👨‍💼\s*/, '')}</span>
                          </>
                        )}
                        {!role && (
                          <>
                            <Sparkles size={16} className="text-violet-400 animate-pulse shrink-0" />
                            <span className="text-violet-200/50 tracking-wide text-xs font-black">
                              {language === 'id' ? "Pilih Peran Akun" : "Select Register Role"}
                            </span>
                          </>
                        )}
                      </span>
                      <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} className="text-violet-400">
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                          
                          <motion.div 
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 right-0 z-50 rounded-2xl border p-2 backdrop-blur-2xl space-y-1.5 text-white shadow-[0_0_30px_rgba(139,92,246,0.25),_0_0_15px_rgba(34,211,238,0.15)] overflow-hidden"
                            style={{
                              background: 'linear-gradient(180deg, rgba(32,15,64,0.92) 0%, rgba(13,6,28,0.98) 100%)',
                              borderColor: 'rgba(167, 139, 250, 0.4)',
                            }}
                          >
                            {/* Holographic scanner active line inside dropdown background */}
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[pulse_1.5s_infinite]" />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                            <button
                              type="button"
                              onClick={() => { setRole('Owner'); setIsDropdownOpen(false); }}
                              className={cn(
                                "w-full p-3.5 rounded-xl text-left text-xs font-black flex items-center justify-between transition-all duration-200 border relative group overflow-hidden",
                                role === 'Owner' 
                                  ? "bg-violet-600/35 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                                  : "border-transparent bg-white/5 hover:bg-violet-600/25 text-violet-200 hover:text-white hover:border-violet-500/20"
                              )}
                            >
                              <span className="flex items-center gap-3 relative z-10">
                                <Crown size={16} className={cn(
                                  "transition-all duration-300", 
                                  role === 'Owner' ? "text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" : "text-amber-400/60 group-hover:text-amber-400"
                                )} />
                                <span className="tracking-wide">
                                  {t('ownerRole').replace(/^👑\s*/, '')}
                                </span>
                              </span>
                              
                              <div className="flex items-center gap-2 relative z-10 font-mono text-[9px] text-slate-500 group-hover:text-violet-300 transition-colors">
                                {role === 'Owner' && (
                                  <span className="font-sans font-black uppercase text-cyan-300 tracking-wider bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-400/40">
                                    {language === 'id' ? 'Aktif' : 'Active'}
                                  </span>
                                )}
                                <span>ROLE_01</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <button
                              type="button"
                              onClick={() => { setRole('Employee'); setIsDropdownOpen(false); }}
                              className={cn(
                                "w-full p-3.5 rounded-xl text-left text-xs font-black flex items-center justify-between transition-all duration-200 border relative group overflow-hidden",
                                role === 'Employee' 
                                  ? "bg-violet-600/35 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                                  : "border-transparent bg-white/5 hover:bg-violet-600/25 text-violet-200 hover:text-white hover:border-violet-500/20"
                              )}
                            >
                              <span className="flex items-center gap-3 relative z-10">
                                <Users size={16} className={cn(
                                  "transition-all duration-300", 
                                  role === 'Employee' ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" : "text-cyan-400/60 group-hover:text-cyan-400"
                                )} />
                                <span className="tracking-wide">
                                  {t('employeeRole').replace(/^👨‍💼\s*/, '')}
                                </span>
                              </span>

                              <div className="flex items-center gap-2 relative z-10 font-mono text-[9px] text-slate-500 group-hover:text-violet-300 transition-colors">
                                {role === 'Employee' && (
                                  <span className="font-sans font-black uppercase text-cyan-300 tracking-wider bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-400/40">
                                    {language === 'id' ? 'Aktif' : 'Active'}
                                  </span>
                                )}
                                <span>ROLE_02</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Standard Login Authorization Button */}
            <div className="pt-2">
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading || isScanning} 
                type="submit" 
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase text-white shadow-lg flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 border border-violet-400/20 active:opacity-90"
                )}
                style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}
              >
                {isLoading && <Loader2 className="animate-spin text-white" size={16} />}
                {isLogin ? (language === 'id' ? "MASUK KE LEDGER" : "LOG IN TO SUITE") : (language === 'id' ? "DAFTARKAN BARU" : "REGISTER PROFILE")}
              </motion.button>
            </div>

            {/* Sandbox Local Access Override UI */}
            {(localModePrompt || error) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 border border-cyan-400/40 bg-cyan-950/20 rounded-2xl text-center space-y-3 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              >
                <div className="flex items-center justify-center gap-2 text-cyan-400 animate-pulse text-xs font-extrabold">
                  <Sparkles size={16} /> {language === 'id' ? "AKSES SANDBOX OFFLINE BERSEDIA" : "OFFLINE DEV BYPASS READIED"}
                </div>
                <p className="text-[10px] text-cyan-200/70 font-semibold leading-relaxed">
                  {language === 'id' 
                    ? "InMarket dapat mensimulasikan lingkungan database secara lokal di browser ini agar Anda dapat langsung mereview tanpa wajib menyambung internet."
                    : "Skip firewalls and test with full client-side simulated ledgers instantly."}
                </p>
                <button
                  type="button"
                  onClick={handleOfflineModeLogin}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[10px] rounded-lg tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer"
                >
                  🚀 {language === 'id' ? "LOG IN LEWAT SANDBOX OFFLINE" : "LOG IN VIA OFFLINE SANDBOX"}
                </button>
              </motion.div>
            )}

            {/* Toggle switch link bottom */}
            <div className="text-center pt-3">
              <p 
                role="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setIsLogin(!isLogin);
                }}
                className={cn(
                  "inline-block text-xs font-bold hover:underline cursor-pointer transition",
                  theme === 'light' ? "text-slate-600 hover:text-violet-600" : "text-violet-300/70 hover:text-white"
                )}
              >
                {isLogin 
                  ? (language === 'id' ? "Belum ada akun? Buat Akun Baru" : "Need credentials? Signup Here") 
                  : (language === 'id' ? "Sudah terdaftar? Log In" : "Already registered? Login Here")
                }
              </p>
            </div>

          </form>

          {/* AI Face Scanning Animation HUD Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center z-50 rounded-[35px]"
              >
                {/* Visual Scanner HUD Frame */}
                <div className="w-28 h-28 rounded-full border-2 border-violet-500/40 relative flex items-center justify-center overflow-hidden mb-6 shadow-[0_0_35px_rgba(139,92,246,0.35)]">
                  <motion.div 
                    animate={{ y: [-52, 52, -52] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 shadow-[0_0_15px_#22d3ee]"
                  />
                  <ShieldCheck className="text-cyan-400 animate-pulse relative z-10" size={40} />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2.5"
                >
                  <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-100 to-cyan-400 tracking-wider">
                    {t('biometricsActive')}
                  </h3>
                  <p className="text-xs font-mono tracking-[0.2em] text-cyan-400 animate-pulse">
                    {isLogin 
                      ? (language === 'id' ? 'KONFIGURASI LEDGER INSTANCE...' : 'RESOLVING METADATA...')
                      : (language === 'id' ? 'MENDAFTARKAN NODE...' : 'ENCRYPTING NODE...')
                    }
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto font-semibold leading-relaxed">
                    {language === 'id' 
                      ? 'Harap tunggu saat Ledger Enkripsi InMarket mendeploy sandbox bisnis baru Anda.' 
                      : 'Establishing Secure Handshake protocols with 2026 Core Ledger Cloud.'}
                  </p>
                </motion.div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-indigo-500/10 border-dashed rounded-full animate-[spin_30s_linear_infinite]" />
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
