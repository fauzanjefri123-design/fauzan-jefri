import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Mail, 
  Instagram, 
  MessageCircle, 
  ArrowRight, 
  Package, 
  Wallet, 
  LayoutDashboard, 
  BrainCircuit, 
  ShieldCheck, 
  Target, 
  Sun, 
  Moon, 
  HelpCircle, 
  ChevronDown, 
  MessageSquareQuote,
  Star,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import ThemeLanguageSwitcher from './ThemeLanguageSwitcher';
import { translations } from '../lib/translations';
import { playSuccessSound } from '../lib/sounds';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { language, theme } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language]?.[key] || key;

  // Active FAQ index accordions state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated metrics counter effect on load
  const [metricCounts, setMetricCounts] = useState({ transactions: 1200, businesses: 50, satisfaction: 90 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetricCounts(prev => ({
        transactions: prev.transactions < 10000 ? prev.transactions + Math.floor(Math.random() * 250) + 120 : 10000,
        businesses: prev.businesses < 582 ? prev.businesses + 3 : 582,
        satisfaction: 98
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const businessMotivations = [
    {
      id: "“Sistem yang hebat tidak hanya mencatat uang masuk, tetapi menumbuhkan visi masa depan usaha anda.”",
      en: "“A great system doesn't just record income, it cultivates the future vision of your venture.”"
    },
    {
      id: "“Bisnis modern tahun 2026 dijalankan dengan data presisi, AI, dan efisiensi tanpa batas.”",
      en: "“Modern 2026 business is driven by precise data, artificial intelligence, and absolute efficiency.”"
    },
    {
      id: "“Setiap pahlawan UMKM berhak mendapatkan teknologi sehebat korporasi global.”",
      en: "“Every MSME hero deserves technology as powerful as a global enterprise.”"
    }
  ];

  const faqs = [
    {
      q: language === 'id' ? "Apa itu InMarket?" : "What is InMarket?",
      a: language === 'id' 
        ? "InMarket adalah platform AI SaaS revolusioner yang dirancang khusus untuk memotong waktu administrasi bisnis dan meningkatkan keuntungan UMKM menggunakan data analitik, kasir modern, dan asisten AI pintar."
        : "InMarket is a revolutionary AI SaaS platform meticulously designed to cut down administrative business overhead and boost profitability for MSMEs using predictive data, sleek POS, and a clever AI companion."
    },
    {
      q: language === 'id' ? "Apakah sistem InMarket aman?" : "Is the InMarket system secure?",
      a: language === 'id'
        ? "Sangat aman. Seluruh data transaksi dienkripsi menggunakan standar enkripsi termodern, terlindungi di cloud server 2026, dan kami terintegrasi dengan Firebase Security Rules."
        : "Extremely secure. All transaction payloads are encrypted using standard modern encryptions, safeguarded in 2026 cloud instances, and governed by strict Firebase rules."
    },
    {
      q: language === 'id' ? "Bagaimana asisten AI bekerja?" : "How does the AI assistant help?",
      a: language === 'id'
        ? "AI InMarket memprogram tren penjualan Anda, menyarankan rekomendasi harga produk terlaris, memprediksi keuntungan bulanan, serta menyusun resolusi peningkatan omset otomatis."
        : "The InMarket AI charts your weekly sales velocities, suggests optimization algorithms for hot products, forecasts monthly margins, and crafts automated target plans."
    }
  ];

  const testimonials = [
    {
      name: "Andi Wijaya",
      role: language === 'id' ? "Pemilik Kopi Sentosa" : "Owner of Sentosa Coffee",
      text: language === 'id' 
        ? "Setelah pakai InMarket, stok produk saya tidak pernah kacau lagi. AI-nya sangat akurat memprediksi kapan kopi bubuk harus di-restock!"
        : "After deploying InMarket, my coffee beans ledger is flawless. The predictive AI is creepily accurate about when to reorder flour and powder!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Sarah Jenkins",
      role: language === 'id' ? "CEO Glow Bloom Salon" : "CEO Glow Bloom Salon",
      text: language === 'id'
        ? "Membayar gaji karyawan dengan satu klik dan memantau absensi biometrik mereka dari rumah sangat membantu kelola salon cabang saya."
        : "Paying worker salaries with one single tap and checking biometric selfies from home is a lifesaver for managing three different salon locations.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const liveChartData = [
    { name: '08:00', sales: 1200 },
    { name: '10:00', sales: 4500 },
    { name: '12:00', sales: 8900 },
    { name: '14:00', sales: 7400 },
    { name: '16:00', sales: 13200 },
    { name: '18:00', sales: 19800 },
    { name: '20:00', sales: 24500 }
  ];

  return (
    <div className="bg-[#fcfcff] dark:bg-[#030107] text-slate-800 dark:text-violet-100 font-sans min-h-screen transition-colors duration-700 ease-in-out relative select-none">
      
      {/* Space glow mesh backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 dark:bg-violet-900/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/10 dark:bg-indigo-900/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-fuchsia-950/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Futuristic Navbar */}
      <nav className="w-full px-6 md:px-12 h-24 flex justify-between items-center bg-white/45 dark:bg-[#030107]/45 backdrop-blur-2xl border-b border-indigo-100/10 dark:border-white/5 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Logo "M" and Glowing Neon style */}
          <div className="w-11 h-11 bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(139,92,246,0.65)] hover:shadow-[0_0_35px_rgba(139,92,246,0.9)] transition-all cursor-pointer">
            M
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:via-violet-200 dark:to-cyan-200">
              InMarket
            </span>
            <div className="text-[8px] tracking-widest font-mono text-cyan-400 font-bold">ERA 2026 AI SaaS</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeLanguageSwitcher />
          
          <button 
            onClick={() => { playSuccessSound(); onNavigate('auth'); }} 
            className="hidden md:block px-5 py-2.5 bg-violet-600/10 dark:bg-violet-400/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/20 rounded-full font-bold text-xs tracking-wider transition-all"
          >
            {language === 'id' ? "LOGIN ADMIN" : "LOGIN ADMIN"}
          </button>
          
          <button 
            onClick={() => { playSuccessSound(); onNavigate('auth'); }} 
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] rounded-full text-xs font-bold hover:shadow-[0_4px_30px_rgba(139,92,246,0.55)] transition-all flex items-center gap-2 border border-violet-400/30 font-sans"
          >
            {t('getStarted')} <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Cinematic Hero Header Block */}
      <header className="relative pt-24 pb-16 text-center max-w-5xl mx-auto px-6 overflow-hidden">
        {/* Holographic glowing orb background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/15 to-cyan-400/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 text-xs text-indigo-700 dark:text-indigo-300 font-bold tracking-widest font-mono uppercase animate-pulse">
          <Sparkles size={14} /> NEW ERA OF BUSINESS ACCOUNTING • 2026
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-cyan-200"
        >
          {t('welcome')}<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400">
            Holographic FinTech Suite
          </span>
        </motion.h1>

        <p className="text-base md:text-xl opacity-75 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => { playSuccessSound(); onNavigate('auth'); }} 
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-2xl font-bold text-sm text-white shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:shadow-[0_0_55px_rgba(139,92,246,0.55)] flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 border border-violet-500/20"
          >
            {t('getStarted')} <ArrowRight size={18} />
          </button>
          
          <button 
            type="button"
            onClick={() => {
              const elm = document.getElementById("penerapan");
              elm?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-5 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-2xl font-bold text-sm transition-all border border-slate-200 dark:border-white/10"
          >
            {language === 'id' ? "Pelajari Fitur UI" : "Explore UI Specs"}
          </button>
        </div>
      </header>

      {/* Floating Dashboard Preview (High Fidelity Mockup Widget) */}
      <section className="px-6 max-w-6xl mx-auto pb-24 relative z-10" id="penerapan">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 60 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden border border-indigo-100/10 dark:border-violet-500/20 shadow-2xl p-6 md:p-10 backdrop-blur-3xl bg-slate-100/30 dark:bg-slate-950/40"
          style={{
            boxShadow: theme === 'dark' 
              ? '0 0 60px rgba(139,92,246,0.12), inset 0 0 20px rgba(139,92,246,0.06)' 
              : '0 30px 70px -15px rgba(99,102,241,0.1)'
          }}
        >
          {/* Header Bar representing a dashboard top bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-indigo-100/15 pb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="h-4 w-[1px] bg-slate-400 dark:bg-white/20 ml-2" />
              <p className="font-mono text-xs text-sky-400">LEDGER://PREVENTIVE_REVENUE_ANALYTICS_2026.SYS</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">● ACTIVE SYSTEM LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 rounded-2xl bg-black/5 dark:bg-black/30 border border-indigo-100/10 p-5 relative">
                <p className="text-xs uppercase font-bold tracking-wider opacity-60 text-indigo-400 mb-3 font-mono">Real-time Sales Movement</p>
                <div className="h-[80%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveChartData}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#090514', border: '1px solid #c084fc', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="sales" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-indigo-100/5 hover:-translate-y-1 transition duration-300">
                  <h4 className="text-sm font-bold opacity-60 uppercase mb-1">Forecast Margin</h4>
                  <p className="text-2xl font-extrabold text-violet-500">+42.8% YoY</p>
                  <p className="text-[10px] opacity-40 font-mono mt-1">Calculated by MSME-GPT Engine</p>
                </div>
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-indigo-100/5 hover:-translate-y-1 transition duration-300">
                  <h4 className="text-sm font-bold opacity-60 uppercase mb-1">Attendance Integrity</h4>
                  <p className="text-2xl font-extrabold text-emerald-500">99.6% Attendance</p>
                  <p className="text-[10px] opacity-40 font-mono mt-1">Selfie Face ID Match Verified</p>
                </div>
              </div>
            </div>

            {/* AI Assistant Holographic Bubble in the Landing Page Preview */}
            <div className="p-6 bg-gradient-to-br from-violet-950/30 to-slate-900/60 dark:from-violet-950/40 border border-violet-500/30 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden h-full">
              <div className="absolute top-[-50px] right-[-50px] w-[140px] h-[140px] bg-indigo-500/20 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center font-bold text-xs">AI</div>
                  <div>
                    <h5 className="text-xs font-bold font-mono">InMarket AI Bot</h5>
                    <p className="text-[9px] text-cyan-400">Live Prediction Active</p>
                  </div>
                </div>
                <p className="text-xs italic bg-black/25 dark:bg-black/45 p-3.5 rounded-xl border border-white/5 leading-relaxed text-indigo-200">
                  {language === 'id' 
                    ? "“Selamat datang di InMarket. Bisnis Kafe Anda diprediksi mengalami kenaikan omset 15% pada hari Minggu besok karena event lokal di sekitar toko.”" 
                    : "“Welcome to InMarket. Your Cafe Business is predicted to see a 15% revenue surge tomorrow Sunday due to local events near your store coordinates.”"}
                </p>
              </div>
              <div className="bg-violet-600/20 border border-violet-500/20 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold mt-4">
                <span>⚡ Suggested: Increase ice supply +10%</span>
                <Compass size={14} className="text-cyan-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Counter System Growth Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-indigo-100/5 dark:border-white/5 bg-[#f5f5fa] dark:bg-[#07050d] rounded-[42px] my-16">
        <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight text-center mb-16">
          {t('landingMetricsTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 text-center bg-white/40 dark:bg-black/25 backdrop-blur-xl border border-indigo-100/10 dark:border-white/5 rounded-3xl hover:border-violet-500/20 transition-all duration-300">
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-400 mb-3">
              {metricCounts.transactions.toLocaleString()}+
            </div>
            <p className="text-sm font-semibold opacity-80">{language === 'id' ? "Keuangan Diproses Detik Ini" : "Financial Ledgers Settled Today"}</p>
          </div>
          <div className="p-8 text-center bg-white/40 dark:bg-black/25 backdrop-blur-xl border border-indigo-100/10 dark:border-white/5 rounded-3xl hover:border-violet-500/20 transition-all duration-300">
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 mb-3">
              {metricCounts.businesses}+
            </div>
            <p className="text-sm font-semibold opacity-80">{language === 'id' ? "Pelaku Bisnis Aktif 2026" : "MSME Power Houses Synced"}</p>
          </div>
          <div className="p-8 text-center bg-white/40 dark:bg-black/25 backdrop-blur-xl border border-indigo-100/10 dark:border-white/5 rounded-3xl hover:border-violet-500/20 transition-all duration-300">
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
              {metricCounts.satisfaction}%
            </div>
            <p className="text-sm font-semibold opacity-80">{language === 'id' ? "Kepuasan Layanan Konsumen" : "Customer Retention Audit Score"}</p>
          </div>
        </div>
      </section>

      {/* Dynamic Motivations Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative overflow-hidden mb-20 bg-gradient-to-r from-violet-600/5 to-cyan-500/5 border border-indigo-100/5 rounded-3xl">
        <MessageSquareQuote size={40} className="mx-auto text-violet-500 opacity-60 mb-6 animate-bounce" />
        <h4 className="text-xs font-bold tracking-widest font-mono text-indigo-400 uppercase mb-4">{t('motivationTitle')}</h4>
        <div className="h-28 flex items-center justify-center px-4">
          <p className="text-lg md:text-2xl font-medium tracking-tight leading-relaxed italic text-indigo-950 dark:text-indigo-200">
            {language === 'id' ? businessMotivations[0].id : businessMotivations[0].en}
          </p>
        </div>
      </section>

      {/* Futuristic Enterprise Specifications Bento */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-indigo-950 dark:from-white dark:to-violet-200">
          {t('landingFeaturesTitle')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: LayoutDashboard, title: language === 'id' ? "Dashboard Kuantum" : "Quantum Dashboard", desc: "Sistem grafik real-time 2026 yang menyajikan tren laba-rugi, neraca pemasukan, dan pos pengeluaran dalam satu pandangan data." },
            { icon: Package, title: language === 'id' ? "Sistem Stok Inventaris" : "Smart Stock Flow", desc: "Dilengkapi status stok berwarna merah, kuning, dan hijau. Dukungan upload data foto produk ganda plus import bulk file CSV instan." },
            { icon: Users, title: language === 'id' ? "Pemantau Absensi & Tier" : "Holographic Work Force", desc: "Owner men-generate kode unik acak setiap hari. Karyawan menginput kode dan mengupload foto bukti masuk kerja ber-tier khusus." },
            { icon: BarChart3, title: language === 'id' ? "Kasir Multisaluran" : "Omnichannel Terminal POS", desc: "Mendukung transaksi Cash, QRIS statis 2026, transfer bank, dan E-Wallet serta mencetak invoice digital dengan chimes sound." },
            { icon: Zap, title: language === 'id' ? "AI SaaS Planner" : "Predictive AI Planner", desc: "Layanan asisten otomatis yang menjawab chat bisnis, membuat anjuran strategi harga, prediksi pengeluaran musiman, dan tips ekspansi draf." },
            { icon: ShieldCheck, title: language === 'id' ? "Enkripsi Ledger Kuat" : "Military Sandbox Guards", desc: "Seluruh basis data multi-toko terlindung di cloud, terisolasi sempurna pada ID otorisasi lokal agar mencegah pembobolan data." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-[28px] border border-indigo-100/10 dark:border-white/5 bg-white/40 dark:bg-black/20 hover:border-violet-500/50 transition-all duration-300 group shadow-lg">
              <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-violet-500/5 inline-block text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="opacity-70 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tier Plans Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-indigo-100/5 dark:border-white/5">
        <h3 className="text-2xl md:text-4xl font-extrabold text-center mb-16">{t('pricingTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-[28px] border border-indigo-200/10 dark:border-white/5 bg-white/20 dark:bg-black/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 capitalize">STARTER NODE</span>
              <h4 className="text-3xl font-extrabold hover:text-cyan-400 transition-colors mt-2">FREE</h4>
              <p className="text-xs opacity-60 mt-2">{language === 'id' ? "Cocok untuk UMKM rintisan baru" : "Best for brand new local setups"}</p>
              <ul className="space-y-3.5 text-xs font-medium mt-8 border-t border-indigo-100/10 pt-6">
                <li>✓ Max 50 {language === 'id' ? 'Item Produk' : 'Products'}</li>
                <li>✓ {language === 'id' ? '1 Akun Karyawan' : '1 Worker Instance'}</li>
                <li>✓ {language === 'id' ? 'Dashboard Keuangan Dasar' : 'Basic Ledger Boards'}</li>
                <li className="opacity-40">✗ {language === 'id' ? 'Analisa AI Prediktif' : 'Predictive AI Assistant'}</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('auth')} className="w-full mt-8 py-4 rounded-xl font-bold text-xs bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 uppercase tracking-wider">
              {language === 'id' ? "Daftar Gratis" : "Get Free Access"}
            </button>
          </div>

          <div className="p-8 rounded-[28px] border-2 border-violet-500/50 bg-[#f9f9ff] dark:bg-violet-950/10 flex flex-col justify-between relative shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="absolute -top-4 right-6 px-3 py-1 rounded-full bg-violet-600 text-[10px] font-black text-white uppercase tracking-widest animate-pulse">POPULAR PRESET</div>
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-violet-500 uppercase">PROFESSIONAL SAAS</span>
              <h4 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-400 mt-2">Rp199.000 <span className="text-xs font-normal text-slate-400">/ {language === 'id' ? 'bln' : 'mo'}</span></h4>
              <p className="text-xs opacity-80 mt-2 text-violet-600 dark:text-violet-300 font-semibold">{language === 'id' ? "Daya tempur penuh untuk UMKM maju" : "Engineered for scaling MSMEs"}</p>
              <ul className="space-y-3.5 text-xs font-medium mt-8 border-t border-violet-500/10 pt-6">
                <li>✓ {language === 'id' ? 'Item Produk Sepuasnya' : 'Unlimited Product Stock'}</li>
                <li>✓ {language === 'id' ? 'Hingga 15 Akun Karyawan' : 'Up to 15 Workers Logins'}</li>
                <li>✓ {language === 'id' ? 'Absensi Foto & Sistem Gaji' : 'Selfie Check-in & Payroll'}</li>
                <li>✓ {language === 'id' ? 'AI Asisten Analisis Pintar' : 'Full InMarket Prescriptive AI'}</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('auth')} className="w-full mt-8 py-4 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all uppercase tracking-wider">
              {language === 'id' ? "Sewa Sekarang" : "Subscribe Now"}
            </button>
          </div>

          <div className="p-8 rounded-[28px] border border-indigo-200/10 dark:border-white/5 bg-white/20 dark:bg-black/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">ENTERPRISE CLOUD</span>
              <h4 className="text-3xl font-extrabold hover:text-cyan-400 transition-colors mt-2">Rp499.000 <span className="text-xs font-normal text-slate-400">/ {language === 'id' ? 'bln' : 'mo'}</span></h4>
              <p className="text-xs opacity-60 mt-2">{language === 'id' ? "Sistem terdistribusi multi-toko waralaba" : "For multi-store chain operations"}</p>
              <ul className="space-y-3.5 text-xs font-medium mt-8 border-t border-indigo-100/10 pt-6">
                <li>✓ {language === 'id' ? 'Semua fitur Profesional' : 'All Pro Features Included'}</li>
                <li>✓ {language === 'id' ? 'Akun Karyawan Tanpa Batas' : 'Infinite Worker Nodes'}</li>
                <li>✓ {language === 'id' ? 'Kustomisasi API & Barcode scanner' : 'Dedicated APIs & Barcode Integration'}</li>
                <li>✓ {language === 'id' ? 'Layanan Prioritas Premium SLA' : 'Enterprise SLA Priority Support'}</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('auth')} className="w-full mt-8 py-4 rounded-xl font-bold text-xs bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 uppercase tracking-wider">
              {language === 'id' ? "Kontak Sales" : "Contact Sales"}
            </button>
          </div>

        </div>
      </section>

      {/* Military Grade Security Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-indigo-100/5 dark:border-white/5 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 inline-block text-cyan-400 mb-2">
            <Lock size={36} className="animate-pulse" />
          </div>
          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t('landingSecTitle')}</h3>
          <p className="opacity-70 text-sm leading-relaxed max-w-2xl mx-auto">
            {language === 'id'
              ? "Kami memastikan keamanan data keuangan dan katalog bisnis Anda terenkripsi penuh. Didukung otentikasi Firebase modern serta isolasi data aman di Firestore."
              : "We warrant absolute confidentiality for your MSME inventories and financial logs. Backed by Firebase Auth protocols and strict Firestore isolation sandboxes."}
          </p>
        </div>
      </section>

      {/* FAQ Collapse Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-indigo-100/5 dark:border-white/5">
        <h3 className="text-2xl md:text-4xl font-black text-center mb-16 tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="text-cyan-400" /> {t('landingFaqTitle')}
        </h3>
        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border border-indigo-100/10 dark:border-white/5 bg-white/40 dark:bg-black/25 overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} 
                className="w-full flex justify-between items-center text-left font-bold text-sm md:text-base cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronDown size={18} className={`opacity-60 transition-transform ${activeFaq === idx ? 'rotate-180 text-violet-500' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="text-xs md:text-sm opacity-70 leading-relaxed font-semibold border-t border-indigo-100/10 pt-4"
                  >
                    {f.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Futuristic Footer Layout */}
      <footer className="py-20 px-6 md:px-12 border-t border-indigo-100/5 dark:border-white/5 bg-slate-100 dark:bg-[#07040d] transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">M</div>
              <span className="text-xl font-black">InMarket</span>
            </div>
            <p className="text-xs opacity-50 leading-relaxed">
              {language === 'id'
                ? "SaaS FinTech Cerdas 2026 yang mentransformasi ekosistem keuangan waralaba lokal."
                : "The intelligent 2026 SaaS platform reshaping MSME accounting."}
            </p>
          </div>
          <div>
            <h5 className="font-extrabold text-xs tracking-wider uppercase opacity-40 mb-4">PRODUCT COREG</h5>
            <ul className="space-y-2.5 text-xs font-semibold opacity-70">
              <li className="hover:text-cyan-400 cursor-pointer">AI Cashier Desk</li>
              <li className="hover:text-cyan-400 cursor-pointer">Interactive Ledger Docs</li>
              <li className="hover:text-cyan-400 cursor-pointer">Selfie Attendance API</li>
            </ul>
          </div>
          <div>
            <h5 className="font-extrabold text-xs tracking-wider uppercase opacity-40 mb-4 font-sans">LEGAL INTEGRATIVE</h5>
            <ul className="space-y-2.5 text-xs font-semibold opacity-70">
              <li className="hover:text-cyan-400 cursor-pointer">Terms of Ledger</li>
              <li className="hover:text-cyan-400 cursor-pointer">Privacy Sandbox Policy</li>
              <li className="hover:text-cyan-400 cursor-pointer">ISO_27001_2026 Status</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-extrabold text-xs tracking-wider uppercase opacity-40">SOCIAL NETWORKS</h5>
            <div className="flex gap-4 text-xs">
              <div className="hover:text-violet-500 cursor-pointer p-2 bg-slate-200 dark:bg-white/5 rounded-full hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all">
                <Instagram size={18} />
              </div>
              <div className="hover:text-violet-500 cursor-pointer p-2 bg-slate-200 dark:bg-white/5 rounded-full hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all">
                <MessageCircle size={18} />
              </div>
              <div className="hover:text-violet-500 cursor-pointer p-2 bg-slate-200 dark:bg-white/5 rounded-full hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all">
                <Mail size={18} />
              </div>
            </div>
            <p className="text-[10px] opacity-40 font-mono">SUPPORT: tech@inmarket.com</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-indigo-100/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40 font-mono">
          <p>© 2026 InMarket Platform. All systems operational. Made with love for the 2026 global MSME trade.</p>
          <div className="flex gap-6">
            <span>DEEP PURPLE THEME v2.5</span>
            <span>SEO_ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
