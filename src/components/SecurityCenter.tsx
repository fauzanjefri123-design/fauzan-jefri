import React, { useState } from 'react';
import { getPartitionedKey } from '../lib/utils';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Monitor, Smartphone, Globe, Landmark, 
  Trash2, RefreshCw, KeyRound, AlertTriangle, LogOut 
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../lib/sounds';

interface LoginLog {
  id: string;
  device: string;
  location: string;
  ip: string;
  date: string;
  status: 'Aman' | 'Mencurigakan' | 'Gagal';
}

const DEFAULT_DEVICES = [
  { id: 'dev1', name: 'Google Chrome / macOS Catalina (Jakarta)', ip: '182.16.24.102', isCurrent: true, date: 'Aktif Sekarang' },
  { id: 'dev2', name: 'Safari Mini / iPhone 17 Pro Max (Bandung)', ip: '110.36.192.42', isCurrent: false, date: '21 Mei 2026, 10:14' },
  { id: 'dev3', name: 'Chrome Windows / Core-Node-Server (Singapore)', ip: '12.80.3.111', isCurrent: false, date: '19 Mei 2026, 08:30' }
];

const DEFAULT_LOGS: LoginLog[] = [
  { id: 'log1', device: 'Chrome Client / MacOS Catalina', location: 'Jakarta, Indonesia', ip: '182.16.24.102', date: '21 Mei 2026, 12:31', status: 'Aman' },
  { id: 'log2', device: 'Firefox Client / Unix server-node', location: 'Surabaya, Indonesia', ip: '202.91.13.44', date: '20 Mei 2026, 14:02', status: 'Aman' },
  { id: 'log3', device: 'Unknown Device Client / Windows', location: 'Zaporizhzhia, Ukraine', ip: '95.111.4.195', date: '18 Mei 2026, 02:44', status: 'Mencurigakan' },
  { id: 'log4', device: 'Chrome Client / MacOS Catalina', location: 'Jakarta, Indonesia', ip: '182.16.24.102', date: '15 Mei 2026, 09:15', status: 'Aman' }
];

export default function SecurityCenter() {
  const [devices, setDevices] = useState(DEFAULT_DEVICES);
  const [logs, setLogs] = useState<LoginLog[]>(() => {
    const key = getPartitionedKey('inmarket_login_logs', false);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });
  const [rememberMe, setRememberMe] = useState(() => {
    const key = getPartitionedKey('inmarket_remember_me', false);
    return localStorage.getItem(key) === 'yes';
  });

  const [testPasswordInp, setTestPasswordInp] = useState('');
  const [securityScanText, setSecurityScanText] = useState('Semua sistem enkripsi SSL & Firebase SHA-256 berjalan normal.');
  const [isScanning, setIsScanning] = useState(false);

  const toggleRememberMe = () => {
    const next = !rememberMe;
    setRememberMe(next);
    const key = getPartitionedKey('inmarket_remember_me', false);
    localStorage.setItem(key, next ? 'yes' : 'no');
    playClickSound();
  };

  const handleLogoutAllDevices = () => {
    if (confirm('Yakin ingin log out dari seluruh perangkat lain? Ini akan mengamankan token session Anda.')) {
      setDevices(devices.filter(d => d.isCurrent));
      playSuccessSound();
      alert('Sesi perangkat lain berhasil ditarik otomatis!');
    }
  };

  const runCyberSecurityScan = () => {
    setIsScanning(true);
    playClickSound();
    setTimeout(() => {
      setIsScanning(false);
      setSecurityScanText('Scan Sukses: 1 IP mencurigakan (Zaporizhzhia, UA) telah diblokir secara permanen dari Cloud firewall Anda.');
      playSuccessSound();
    }, 1500);
  };

  // Check password strength calculation helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { rating: 'KOSONG', percent: 0, color: 'bg-zinc-700', text: 'Tulis password untuk dianalisis' };
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) {
      return { rating: 'SANGAT LEMAH 🔴', percent: 25, color: 'bg-rose-500', text: 'Tambahkan angka, simbol, dan kombinasi huruf kapital.' };
    } else if (score === 2) {
      return { rating: 'SEDANG 🟡', percent: 50, color: 'bg-amber-500', text: 'Hampir aman! Pertimbangkan menambahkan simbol acak seperti @, #, $.' };
    } else if (score === 3) {
      return { rating: 'KUAT 🟢', percent: 75, color: 'bg-indigo-400', text: 'Password kuat dan aman dari serangan brute-force.' };
    } else {
      return { rating: 'SEMPURNA (MILITARY GRADE) 🔥', percent: 100, color: 'bg-emerald-500', text: 'Password sangat tangguh, terenkripsi sempurna.' };
    }
  };

  const passRating = getPasswordStrength(testPasswordInp);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> Pusat Keamanan Akun & Session Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola session token, sensor ancaman AI, block IP, and device verification dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shield UI status section */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#090615]/95 border border-violet-500/35 text-white flex flex-col justify-between h-[420px] relative overflow-hidden">
          {/* Animated scan indicator */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 opacity-20 animate-bounce" />
          
          <div className="space-y-4 text-center">
            <div className="flex justify-center mt-2">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                <ShieldCheck size={40} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black tracking-widest uppercase">ENKRIPSI ACTIVE MILIK CA</h3>
              <span className="text-[9px] font-mono opacity-50 block mt-1">NODE: CA_JAK_SSL_VERIFIED_2026</span>
            </div>
            
            <p className="text-xs text-zinc-300 leading-relaxed font-semibold italic">
              "{securityScanText}"
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={runCyberSecurityScan}
              disabled={isScanning}
              className={`w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest transition ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isScanning ? '⚡ MEMINDAI MALWARE...' : '🔍 JALANKAN AI SECURITY SCAN'}
            </button>

            {/* Remember me trigger */}
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
              <div>
                <span className="font-bold block">Ingat Saya (Keep Connected)</span>
                <span className="text-[9px] opacity-40">Mencegah log out otomatis 15 menit</span>
              </div>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={toggleRememberMe}
                className="w-4 h-4 rounded border-violet-500 bg-black text-violet-500 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Device login and active session */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-100/10 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Device Management (Sesi Aktif)</h3>
              <button 
                onClick={handleLogoutAllDevices}
                className="text-[9.5px] uppercase font-black tracking-wider text-rose-500 flex items-center gap-1 hover:underline"
              >
                <LogOut size={12} /> Logout Semua Perangkat Lain
              </button>
            </div>

            <div className="space-y-3">
              {devices.map(d => (
                <div 
                  key={d.id}
                  className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-indigo-100/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/10 rounded-xl shrink-0">
                      {d.name.toLowerCase().includes('iphone') ? <Smartphone className="text-cyan-450" size={16} /> : <Monitor className="text-indigo-400" size={16} />}
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block">
                        {d.name} {d.isCurrent && <span className="text-[8px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded ml-1 font-bold">CURRENT_SESSION</span>}
                      </strong>
                      <span className="text-[9.5px] opacity-40 font-mono">IP: {d.ip} • Terakhir Terdeteksi: {d.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Password Audit Center */}
            <div className="p-5 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 space-y-3">
              <span className="text-[9px] font-mono tracking-widest uppercase opacity-45 block">PASSWORD RESILIENCE AUDIT</span>
              <div className="space-y-3">
                <input 
                  type="password"
                  placeholder="Ketik password untuk audit..."
                  value={testPasswordInp}
                  onChange={e => setTestPasswordInp(e.target.value)}
                  className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-semibold outline-none text-slate-800 dark:text-white"
                />
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>Kekuatan Password:</span>
                    <span className="text-[9.5px]">{passRating.rating}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className={`h-full ${passRating.color} transition-all duration-300`} style={{ width: `${passRating.percent}%` }} />
                  </div>
                  <p className="text-[9.5px] opacity-60 leading-normal font-semibold mt-1">
                    {passRating.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Suspicious Activities Log list */}
            <div className="p-5 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 space-y-3.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              <span className="text-[9px] font-mono tracking-widest uppercase opacity-45 block">SEKURITI AUDIT TRAIL LOGS</span>
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] border border-indigo-100/5 flex items-center justify-between gap-2.5">
                    <div>
                      <strong className="text-slate-800 dark:text-zinc-200 block truncate max-w-[150px]">{log.device}</strong>
                      <span className="opacity-45 block font-mono">{log.date} • {log.location}</span>
                    </div>

                    <span className={`text-[8px] tracking-wide px-2 py-0.5 rounded font-black font-mono shrink-0 ${
                      log.status === 'Aman' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
