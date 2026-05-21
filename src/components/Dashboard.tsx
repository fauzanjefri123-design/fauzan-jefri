import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  ArrowUpRight, 
  Package, 
  Users, 
  Wallet, 
  ClipboardCheck, 
  Menu, 
  X, 
  User, 
  Sparkles, 
  CheckCircle, 
  ScanBarcode, 
  MessageSquare, 
  MessageCircle, 
  Bot, 
  Play, 
  Square, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit,
  ShoppingCart, 
  FileText, 
  Send, 
  Image, 
  HelpCircle, 
  TrendingUp,
  Award,
  Crown,
  Calendar,
  Cloud,
  RefreshCw,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Download,
  Search,
  Activity,
  CheckSquare,
  Globe,
  Camera,
  Tv,
  Sun,
  CloudRain,
  Sparkle,
  Truck,
  ShieldCheck,
  Ticket,
  Flame
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import Inventory from './Inventory';
import CustomersManager from './CustomersManager';
import ExpensesManager from './ExpensesManager';
import SuppliersManager from './SuppliersManager';
import PromoManager from './PromoManager';
import SecurityCenter from './SecurityCenter';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { translations } from '../lib/translations';
import ThemeLanguageSwitcher from './ThemeLanguageSwitcher';
import { 
  playScanSound, 
  playSuccessSound, 
  playCashRegisterSound, 
  playSalaryRewardSound,
  playClickSound,
  playNotificationSound,
  startFuturisticAmbience,
  stopFuturisticAmbience
} from '../lib/sounds';

export default function DashboardPage({ currentView: initialView, onNavigate }: { currentView: string; onNavigate: (view: any) => void }) {
  const { language, theme } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language]?.[key] || key;

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Selamat Pagi';
    if (hours < 17) return 'Selamat Siang';
    if (hours < 21) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const liveChartData = [
    { name: '08:00', sales: 1200 },
    { name: '10:00', sales: 4500 },
    { name: '12:00', sales: 8900 },
    { name: '14:00', sales: 7400 },
    { name: '16:00', sales: 13200 },
    { name: '18:00', sales: 19800 },
    { name: '20:00', sales: 24500 }
  ];

  // Active sub-view within dashboard
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine user login state (standard or offline fallback)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'Owner' | 'Admin' | 'Manager' | 'Supervisor' | 'Kasir' | 'Karyawan'>(() => {
    return (localStorage.getItem('inmarket_user_role') as any) || 'Owner';
  });

  // Business Open/Close State
  const [isStoreOpen, setIsStoreOpen] = useState(() => {
    return localStorage.getItem('inmarket_store_open') !== 'closed';
  });

  // Shop metadata details
  const [shopData, setShopData] = useState(() => {
    const cached = localStorage.getItem('inmarket_business');
    return cached ? JSON.parse(cached) : { businessName: 'InMarket Lounge', ownerName: 'Admin Boss', businessType: 'Caffe' };
  });

  // Employee First-Time Onboarding Profile
  const [showEmployeeProfileModal, setShowEmployeeProfileModal] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState(() => {
    const cached = localStorage.getItem('inmarket_employee_profile');
    return cached ? JSON.parse(cached) : { fullName: '', photoUrl: '', gender: 'Male', exp: 40 };
  });

  // Gaji Karyawan State
  const [isSalaryPaid, setIsSalaryPaid] = useState(() => {
    return localStorage.getItem('inmarket_salary_paid') === 'yes';
  });
  const [salaryAnim, setSalaryAnim] = useState(false);

  // Attendance Code State (Shared via localStorage)
  const [attendanceCode, setAttendanceCode] = useState(() => {
    return localStorage.getItem('inmarket_attendance_code') || 'PLX487';
  });
  const [employeeInputCode, setEmployeeInputCode] = useState('');
  const [attendanceProofUrl, setAttendanceProofUrl] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // Chat message logs
  const [chatMessages, setChatMessages] = useState<any[]>(() => {
    const cached = localStorage.getItem('inmarket_chats');
    return cached ? JSON.parse(cached) : [
      { id: 1, sender: 'System AI', text: 'Secure 2026 Lobby Chat initiated.', time: '11:00', file: null },
      { id: 2, sender: 'Boss Owner', text: 'Halo tim, mari kita penuhi target transaksi hari ini!', time: '11:01', file: null },
      { id: 3, sender: 'Karyawan', text: 'Siap Boss, stok kopi dan barista dalam kondisi prima!', time: '11:03', file: null }
    ];
  });
  const [chatInp, setChatInp] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // AI Assistant Chat Logs
  const [aiChat, setAiChat] = useState<any[]>([
    { role: 'assistant', text: 'Halo! Saya InMarket AI, asisten analis Anda. Beritahu saya kendala bisnis Anda atau tanyakan rekomendasi optimal produk!' }
  ]);
  const [aiInp, setAiInp] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Product Database list
  const [products, setProducts] = useState<any[]>(() => {
    const cached = localStorage.getItem('inmarket_products');
    return cached ? JSON.parse(cached) : [
      { id: 'p1', name: 'Original Premium Espresso', price: 28000, stock: 45, category: 'Minuman', supplier: 'Sumatra Roast Node', barcode: '8993213002', desc: 'Espresso murni 100% Arabika.' },
      { id: 'p2', name: 'Fresh Milk Matcha Latte', price: 32000, stock: 4, category: 'Minuman', supplier: 'Uji Farms', barcode: '8993213054', desc: 'Susu segar dengan matcha kualitas impor.' },
      { id: 'p3', name: 'Salted Caramel Croissant', price: 35000, stock: 2, category: 'Pastry', supplier: 'Bon Appetit Bakery', barcode: '8993213099', desc: 'Croissant renyah berlapis mentega gourmet.' },
      { id: 'p4', name: 'Vegan Charcoal Burger', price: 58000, stock: 18, category: 'Makanan', supplier: 'Earth Kitchen', barcode: '8993213101', desc: 'Roti arang kelapa dengan daging vegan sehat.' }
    ];
  });

  // Add Product Form State
  const [prodForm, setProdForm] = useState({
    name: '', price: '', stock: '', category: 'Minuman', supplier: '', barcode: '', desc: '', photoUrl: ''
  });

  // Editing Product State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', price: '', stock: '', category: 'Minuman', supplier: '', barcode: '', desc: '', photoUrl: ''
  });

  // Cashier Shopping Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [payMethod, setPayMethod] = useState<'Cash' | 'QRIS' | 'Transfer' | 'E-wallet'>('Cash');
  const [receipt, setReceipt] = useState<any | null>(null);

  // Sales Transactions history
  const [salesHistory, setSalesHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem('inmarket_sales');
    return cached ? JSON.parse(cached) : [
      { id: 't1', total: 60000, itemQty: 2, meth: 'QRIS', date: 'Today, 10:14', dateStr: 'May 21' },
      { id: 't2', total: 28000, itemQty: 1, meth: 'Cash', date: 'Yesterday, 14:02', dateStr: 'May 20' },
      { id: 't3', total: 116000, itemQty: 3, meth: 'E-wallet', date: '2 days ago', dateStr: 'May 19' }
    ];
  });

  // ==========================================
  // PREMIUM 2026 STARTUP FEATURE STATES
  // ==========================================
  const [systemSplashActive, setSystemSplashActive] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  
  const [exportModal, setExportModal] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastBackupTime, setLastBackupTime] = useState("Just now");
  
  // Customization Themes
  const [accentColor, setAccentColor] = useState<'violet' | 'cyan' | 'emerald' | 'rose'>('violet');
  const [backgroundTheme, setBackgroundTheme] = useState<'cyber-matrix' | 'cosmic-neon' | 'deep-obsidian'>('cyber-matrix');
  const [neonIntensity, setNeonIntensity] = useState<'high' | 'medium' | 'hologram'>('high');
  
  // Multi Store
  const [currentStore, setCurrentStore] = useState('s1');
  const [stores, setStores] = useState([
    { id: 's1', name: 'InMarket Lounge (Jakarta)', type: 'Lounge', baseRevenue: 0 },
    { id: 's2', name: 'InMarket Bistro (Bandung)', type: 'Bistro', baseRevenue: 1540000 },
    { id: 's3', name: 'InMarket Cyber-Pods (Surabaya)', type: 'Cyber-Pods', baseRevenue: -420000 }
  ]);

  // Business Target Metrics
  const [targets, setTargets] = useState({
    salesTarget: 5000000,
    salesCurrent: 1450000,
    profitTarget: 3000000,
    profitCurrent: 870000,
    transTarget: 30,
    transCurrent: 16,
    developmentProgress: 72
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);

  // Badges and Achievements
  const [badges, setBadges] = useState([
    { id: 'b1', name: 'Rajin Masuk', desc: 'Melakukan absensi QR 5 hari berturut-turut.', unlocked: true, tier: 'uncommon', icon: 'ClipboardCheck' },
    { id: 'b2', name: 'Penjualan Tertinggi', desc: 'Mencapai omset harian > Rp 2.000.000.', unlocked: true, tier: 'rare', icon: 'TrendingUp' },
    { id: 'b3', name: 'Best Employee', desc: 'Rating performa staf sempurna 5.0 dari AI.', unlocked: false, tier: 'epic', icon: 'Award' },
    { id: 'b4', name: 'King Seller', desc: 'Melayani 100+ transaksi kasir digital.', unlocked: false, tier: 'legendary', icon: 'Crown' },
    { id: 'b5', name: 'Loyal Worker', desc: 'Mengabdi di instansi > 6 bulan durasi.', unlocked: true, tier: 'common', icon: 'Users' },
    { id: 'b6', name: 'Business Master', desc: 'Membuka 3 cabang toko mandiri di Indonesia.', unlocked: false, tier: 'legendary', icon: 'Sparkles' }
  ]);
  const [activeBadgePopup, setActiveBadgePopup] = useState<any | null>(null);

  // Business Calendar Reminders
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 'cl1', date: '21', title: 'Restock Espresso Arabica', type: 'warning' },
    { id: 'cl2', date: '23', title: 'Pemeriksaan Shift Barista', type: 'info' },
    { id: 'cl3', date: '25', title: 'Hari Pembayaran Gaji Karyawan', type: 'payout' },
    { id: 'cl4', date: '28', title: 'Evaluasi Omset & AI Forecasting', type: 'event' }
  ]);
  const [selectedDate, setSelectedDate] = useState('21');

  // Voice AI Assistant
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [waveformHeight, setWaveformHeight] = useState<number[]>(Array(16).fill(5));

  // CCTV Simulator details
  const [cctvTime, setCctvTime] = useState("");
  const [cctvActiveCam, setCctvActiveCam] = useState("CAM_01_KASIR");

  // Realtime Active Activity History logs
  const [activityHistory, setActivityHistory] = useState<any[]>([
    { id: 'act1', user: 'Boss Fauzan', action: 'Mengubah parameter metrik Matcha Latte', time: '11:24', date: 'Hari Ini' },
    { id: 'act2', user: 'System Sync', action: 'Auto-Backup ke InMarket Cloud selesai', time: '11:20', date: 'Hari Ini' },
    { id: 'act3', user: 'Karyawan', action: 'Verifikasi Absensi via QR Code PLX487', time: '11:02', date: 'Hari Ini' },
    { id: 'act4', user: 'Boss Fauzan', action: 'Inisialisasi Outlet InMarket Jakarta', time: '08:00', date: 'Hari Ini' }
  ]);

  const [showQuickFAB, setShowQuickFAB] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isExportingActive, setIsExportingActive] = useState(false);
  const [exportProgressVal, setExportProgressVal] = useState(0);
  const [exportProgressName, setExportProgressName] = useState('laporan_usaha.pdf');

  // ==========================================
  // PREMIUM INTEGRATIVE METHODS
  // ==========================================

  // Dynamic Theme Styling Helper
  const getAccentColorClass = (type: 'text' | 'bg' | 'border' | 'shadow' | 'gradient' | 'text-hover' | 'border-focus' | 'badge') => {
    switch (accentColor) {
      case 'cyan':
        if (type === 'text') return 'text-cyan-400';
        if (type === 'bg') return 'bg-cyan-500';
        if (type === 'border') return 'border-cyan-500/40';
        if (type === 'border-focus') return 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)]';
        if (type === 'shadow') return 'shadow-[0_0_20px_rgba(34,211,238,0.35)]';
        if (type === 'gradient') return 'from-cyan-600 to-blue-500';
        if (type === 'badge') return 'bg-cyan-950/50 border border-cyan-400/30 text-cyan-400';
        return 'hover:text-cyan-300';
      case 'emerald':
        if (type === 'text') return 'text-emerald-400';
        if (type === 'bg') return 'bg-emerald-500';
        if (type === 'border') return 'border-emerald-500/40';
        if (type === 'border-focus') return 'focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(16,185,129,0.3)]';
        if (type === 'shadow') return 'shadow-[0_0_20px_rgba(16,185,129,0.35)]';
        if (type === 'gradient') return 'from-emerald-600 to-teal-500';
        if (type === 'badge') return 'bg-emerald-950/50 border border-emerald-400/30 text-emerald-400';
        return 'hover:text-emerald-300';
      case 'rose':
        if (type === 'text') return 'text-rose-400';
        if (type === 'bg') return 'bg-rose-500';
        if (type === 'border') return 'border-rose-500/40';
        if (type === 'border-focus') return 'focus:border-rose-400 focus:shadow-[0_0_12px_rgba(244,63,94,0.3)]';
        if (type === 'shadow') return 'shadow-[0_0_20px_rgba(244,63,94,0.35)]';
        if (type === 'gradient') return 'from-rose-600 to-pink-500';
        if (type === 'badge') return 'bg-rose-950/50 border border-rose-400/30 text-rose-400';
        return 'hover:text-rose-300';
      case 'violet':
      default:
        if (type === 'text') return 'text-violet-400';
        if (type === 'bg') return 'bg-violet-500';
        if (type === 'border') return 'border-violet-500/40';
        if (type === 'border-focus') return 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(34,211,238,0.3)]';
        if (type === 'shadow') return 'shadow-[0_0_20px_rgba(139,92,246,0.35)]';
        if (type === 'gradient') return 'from-violet-600 to-cyan-500';
        if (type === 'badge') return 'bg-cyan-950/50 border border-cyan-400/30 text-cyan-400';
        return 'hover:text-violet-300';
    }
  };

  // Add Live System Notification
  const triggerNotification = (type: string, message: string) => {
    playNotificationSound();
    const id = 'notif_' + Date.now();
    setNotifications(prev => [{ id, type, message, time: new Date().toLocaleTimeString().slice(0, 5) }, ...prev].slice(0, 5));
    
    // Automatically dismiss after 4.5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Record action in activity logs
  const logSystemActivity = (actionText: string) => {
    const act = {
      id: 'act_' + Date.now(),
      user: userRole === 'Owner' ? 'Boss Fauzan' : 'Karyawan',
      action: actionText,
      time: new Date().toLocaleTimeString().slice(0, 5),
      date: 'Hari Ini'
    };
    setActivityHistory(prev => [act, ...prev].slice(0, 15));
  };

  // Run dynamic confetti for targets met
  const triggerConfettiRain = () => {
    playSalaryRewardSound();
    setShowConfetti(true);
    const newConfetti = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 40,
      size: 5 + Math.random() * 10,
      color: ['#A78BFA', '#22D3EE', '#34D399', '#FB7185', '#FBBF24'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    }));
    setConfettiParticles(newConfetti);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5500);
  };

  // Multi-Store Swapper
  const handleSwitchStore = (storeId: string) => {
    playScanSound();
    setCurrentStore(storeId);
    const targetStore = stores.find(s => s.id === storeId);
    if (targetStore) {
      triggerNotification('toko', `Sistem beralih ke Cabang: ${targetStore.name}`);
      logSystemActivity(`Beralih pengelolaan ke outlet ${targetStore.name}`);
      
      // Slightly shift stat values for realism
      const revenueModifier = storeId === 's1' ? 0 : storeId === 's2' ? 1540000 : -420000;
      setTargets(prev => ({
        ...prev,
        salesCurrent: Math.max(800000, 1450000 + revenueModifier)
      }));
    }
  };

  // Holographic download generator with decrypter visualization
  const handleExportDataFile = (type: string) => {
    playScanSound();
    setExportModal(type);
    setExportProgress(10);
    
    // Animate loader
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportModal(null);
            triggerNotification('transaksi', `Unduhan file ${type.toUpperCase()} sukses terenkripsi.`);
            logSystemActivity(`Mengekspor laporan data: ${type}`);
            
            // Generate real download URI
            let contentStr = "=== INMARKET 2026 DIGITAL LEDGER REPORT ===\n";
            contentStr += `Export Date: ${new Date().toLocaleDateString()}\n`;
            contentStr += `Topic: ${type.toUpperCase()}\n`;
            contentStr += `Source Node ID: ${currentStore}\n\n`;
            
            if (type === 'laporan_usaha') {
              contentStr += "Parameter,Value\nTotal Omset,Rp 1.450.000\nTarget Target Bisnis,Rp 5.000.000\nEfisiensi Staff,98%";
            } else if (type === 'stock_barang') {
              products.forEach(p => {
                contentStr += `${p.name}, Rp ${p.price}, Stock: ${p.stock}, Barcode: ${p.barcode}\n`;
              });
            } else {
              contentStr += "Audit Log,Sign,Status\nSystem Onlined,0x29ef,Verified\nAttendance Verified,0x2f91,Success";
            }
            
            const blob = new Blob([contentStr], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inmarket_${type}_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  // Voice AI Motivational reader
  const handleTriggerVoiceAI = () => {
    if (isVoiceSpeaking) {
      window.speechSynthesis?.cancel();
      setIsVoiceSpeaking(false);
      return;
    }
    
    playSuccessSound();
    setIsVoiceSpeaking(true);
    
    // Build AI Speech
    const overallRevenue = formattedStatSales + (currentStore === 's1' ? 0 : currentStore === 's2' ? 1540000 : -420000);
    const textToSpeak = language === 'id' 
      ? `Halo Boss Fauzan! Total penjualan real-time hari ini adalah ${overallRevenue} Rupiah. Kinerja barista dan stok Matcha Latte membutuhkan atensi Anda karena tersisa ${products.find(p=>p.id==='p2')?.stock || 4} unit. Tetap semangat, mari raih target omset lima juta rupiah kita hari ini!`
      : `Hello Boss Fauzan! Today's real-time total sales reached ${overallRevenue} Rupiahs. Matcha latte stock has only ${products.find(p=>p.id==='p2')?.stock || 4} left. Let's push hard and smash our five million goal today!`;
      
    setVoiceTranscript(textToSpeak);
    
    // Synthesis check
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      
      utterance.onend = () => {
        setIsVoiceSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Simulate speech visualizer if speech synthesis missing
      setTimeout(() => {
        setIsVoiceSpeaking(false);
      }, 6000);
    }
  };

  // Music toggle handler
  const handleToggleBackgroundMusic = () => {
    if (isMusicOn) {
      stopFuturisticAmbience();
      setIsMusicOn(false);
    } else {
      startFuturisticAmbience();
      setIsMusicOn(true);
      triggerNotification('toko', 'Cyber Lounge Drone ambient musik diaktifkan.');
    }
  };

  // On mount check currentUser profile
  useEffect(() => {
    const offlineUser = localStorage.getItem('offline_logged_in_user');
    const liveUser = auth.currentUser;

    if (offlineUser) {
      const u = JSON.parse(offlineUser);
      setCurrentUser(u);
      setUserRole(u.role === 'Employee' || u.role === 'Karyawan' ? 'Employee' : 'Owner');
      
      // If employee, trigger onboarding check if profile not complete
      if (u.role === 'Employee' || u.role === 'Karyawan') {
        const empProf = localStorage.getItem('inmarket_employee_profile');
        if (!empProf) {
          setShowEmployeeProfileModal(true);
        }
      }
    } else if (liveUser) {
      setCurrentUser(liveUser);
      const isEmp = liveUser.email?.includes('karyawan') || liveUser.email?.includes('employee');
      setUserRole(isEmp ? 'Employee' : 'Owner');
      if (isEmp && !localStorage.getItem('inmarket_employee_profile')) {
        setShowEmployeeProfileModal(true);
      }
    } else {
      // Default sandbox role is Owner
      setCurrentUser({ email: 'fauzanjefri123@gmail.com', displayName: 'Fauzan' });
      setUserRole('Owner');
    }

    // 1. Splash Screen Auto Ticker Loader
    const splashInterval = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(splashInterval);
          setTimeout(() => {
            setSystemSplashActive(false);
            triggerNotification('toko', 'Sistem InMarket Premium Suite v2026 Aktif.');
          }, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    // 2. Mock CCTV Time updater
    const cctvInterval = setInterval(() => {
      const pad = (n: number) => String(n).padStart(2, '0');
      const now = new Date();
      setCctvTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    }, 1000);

    // 3. Auto cloud-sync simulation (every 90s)
    const backupInterval = setInterval(() => {
      setLastBackupTime("Just now");
      triggerNotification('toko', 'Sinkronisasi awan sukses! Seluruh instansi aman tercadangkan.');
      logSystemActivity('Auto Cloud-Backup berhasil mengekspor basis data transaksi & absensi');
    }, 90000);

    return () => {
      clearInterval(splashInterval);
      clearInterval(cctvInterval);
      clearInterval(backupInterval);
    };
  }, []);

  // 4. Voice wave simulator loop
  useEffect(() => {
    let interval: any;
    if (isVoiceSpeaking) {
      interval = setInterval(() => {
        setWaveformHeight(Array.from({ length: 16 }).map(() => 5 + Math.random() * 45));
      }, 100);
    } else {
      setWaveformHeight(Array(16).fill(5));
    }
    return () => clearInterval(interval);
  }, [isVoiceSpeaking]);

  // Save states to local storage on modification
  const persistProducts = (list: any[]) => {
    setProducts(list);
    localStorage.setItem('inmarket_products', JSON.stringify(list));
  };

  const persistSales = (list: any[]) => {
    setSalesHistory(list);
    localStorage.setItem('inmarket_sales', JSON.stringify(list));
  };

  // Toggle Shop Open / Closed Status
  const handleToggleStore = () => {
    playScanSound();
    const targetStatus = !isStoreOpen;
    setIsStoreOpen(targetStatus);
    localStorage.setItem('inmarket_store_open', targetStatus ? 'open' : 'closed');
  };

  // 1-Click Salary payout triggering custom reward synth Audio on employee
  const handlePaySalary = () => {
    playSalaryRewardSound();
    setIsSalaryPaid(true);
    localStorage.setItem('inmarket_salary_paid', 'yes');
    setSalaryAnim(true);
    setTimeout(() => {
      setSalaryAnim(false);
    }, 4500);
  };

  // Attendance Code generation (Boss side)
  const handleGenerateAttendanceCode = () => {
    playScanSound();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let codeStr = '';
    for (let i = 0; i < 3; i++) codeStr += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 3; i++) codeStr += nums.charAt(Math.floor(Math.random() * nums.length));
    
    setAttendanceCode(codeStr);
    localStorage.setItem('inmarket_attendance_code', codeStr);
  };

  // Employee Check In
  const handleEmployeeCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeInputCode.trim().toUpperCase() === attendanceCode) {
      playSuccessSound();
      setAttendanceSuccess(true);
      
      // Update employee stats / EXP
      const updated = {
        ...employeeProfile,
        exp: employeeProfile.exp + 25
      };
      setEmployeeProfile(updated);
      localStorage.setItem('inmarket_employee_profile', JSON.stringify(updated));

      setTimeout(() => {
        setAttendanceSuccess(false);
        setEmployeeInputCode('');
        setAttendanceProofUrl('');
      }, 4000);
    } else {
      playScanSound();
      alert(language === 'id' ? '❌ Kode absensi salah!' : '❌ Incorrect attendance code!');
    }
  };

  // Product addition
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.stock) return;

    const newProd = {
      id: 'p_' + Date.now(),
      name: prodForm.name,
      price: Number(prodForm.price),
      stock: Number(prodForm.stock),
      category: prodForm.category,
      supplier: prodForm.supplier || 'N/A',
      barcode: prodForm.barcode || '899' + Math.floor(Math.random() * 10000000),
      desc: prodForm.desc || 'No description listed.',
      photoUrl: prodForm.photoUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop'
    };

    const newList = [newProd, ...products];
    persistProducts(newList);

    // Reset Form
    setProdForm({ name: '', price: '', stock: '', category: 'Minuman', supplier: '', barcode: '', desc: '', photoUrl: '' });
    playSuccessSound();
  };

  const handleDeleteProduct = (id: string) => {
    const list = products.filter(p => p.id !== id);
    persistProducts(list);
    playScanSound();
  };

  // Open Edit Modal with current product details loaded
  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name || '',
      price: p.price !== undefined ? String(p.price) : '',
      stock: p.stock !== undefined ? String(p.stock) : '',
      category: p.category || 'Minuman',
      supplier: p.supplier || '',
      barcode: p.barcode || '',
      desc: p.desc || '',
      photoUrl: p.photoUrl || ''
    });
    playScanSound();
  };

  // Save the updated product detail variations
  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editForm.name || !editForm.price || !editForm.stock) return;

    const updatedList = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editForm.name,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          category: editForm.category,
          supplier: editForm.supplier || 'N/A',
          barcode: editForm.barcode || 'N/A',
          desc: editForm.desc || 'No description listed.',
          photoUrl: editForm.photoUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop'
        };
      }
      return p;
    });

    persistProducts(updatedList);
    setEditingProduct(null);
    playSuccessSound();
  };

  // Cashier shopping block
  const addToCart = (p: any) => {
    playScanSound();
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      if (existing.qty + 1 > p.stock) {
        alert(language === 'id' ? '⚠️ Stok tidak mencukupi!' : '⚠️ Insufficient stock!');
        return;
      }
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      if (p.stock < 1) {
        alert(language === 'id' ? '⚠️ Produk habis!' : '⚠️ Out of stock!');
        return;
      }
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    playScanSound();
    setCart(cart.filter(item => item.id !== id));
  };

  const executeCheckout = () => {
    if (cart.length === 0) return;
    playCashRegisterSound();

    let totalVal = 0;
    let qtyVal = 0;

    // Deduct quantity from stock
    const updatedProducts = products.map(p => {
      const itemCart = cart.find(item => item.id === p.id);
      if (itemCart) {
        totalVal += itemCart.price * itemCart.qty;
        qtyVal += itemCart.qty;
        return { ...p, stock: Math.max(0, p.stock - itemCart.qty) };
      }
      return p;
    });

    persistProducts(updatedProducts);

    const newSale = {
      id: 'tx_26_' + Math.floor(Math.random() * 89999 + 10000),
      total: totalVal,
      itemQty: qtyVal,
      meth: payMethod,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: 'May ' + new Date().getDate(),
      items: cart
    };

    persistSales([newSale, ...salesHistory]);

    // Employee gains EXP inside cashier checkout
    if (userRole === 'Employee') {
      const updated = {
        ...employeeProfile,
        exp: employeeProfile.exp + (qtyVal * 10)
      };
      setEmployeeProfile(updated);
      localStorage.setItem('inmarket_employee_profile', JSON.stringify(updated));
    }

    setReceipt(newSale);
    setCart([]);
  };

  // Lobby chat systems with simulated responses
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInp.trim() && !uploadedFileUrl) return;

    playSuccessSound();
    const newMsg = {
      id: Date.now(),
      sender: userRole === 'Owner' ? 'Boss Owner' : 'Karyawan',
      text: chatInp,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: uploadedFileUrl
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    localStorage.setItem('inmarket_chats', JSON.stringify(updated));
    setChatInp('');
    setUploadedFileUrl(null);

    // Auto simulated response after 2.5 seconds
    setTimeout(() => {
      playScanSound();
      const botResponse = {
        id: Date.now() + 1,
        sender: userRole === 'Owner' ? '👨‍💼 Staff Karyawan' : '👑 Boss Owner',
        text: userRole === 'Owner' 
          ? 'Ok boss! Sudah saya cek stok produk, beberapa hampir habis dan sistem AI sudah merekomendasikan restock.'
          : 'Luar biasa! Lanjutkan transaksi yang mantap. Nanti malam saya cek bonus harian Anda.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: null
      };
      const nestedUpdated = [...updated, botResponse];
      setChatMessages(nestedUpdated);
      localStorage.setItem('inmarket_chats', JSON.stringify(nestedUpdated));
    }, 2800);
  };

  // Custom AI Query responses tailored accurately
  const handleSendAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInp.trim()) return;

    playScanSound();
    const userMsg = { role: 'user', text: aiInp };
    const history = [...aiChat, userMsg];
    setAiChat(history);
    setAiInp('');
    setAiTyping(true);

    setTimeout(() => {
      playSuccessSound();
      setAiTyping(false);

      let responseText = '';
      const inp = aiInp.toLowerCase();

      // Check current stocks that are depleted
      const depleted = products.filter(p => p.stock < 5);

      if (inp.includes('analisa') || inp.includes('stok') || inp.includes('produk')) {
        responseText = `Menganalisa data inventaris sistem... Berdasarkan ledger stok saat ini: Produk '${depleted[0]?.name || products[0]?.name}' memiliki sisa unit kritis (${depleted[0]?.stock || products[0]?.stock} unit). Pelanggan Anda sangat menyukai produk ini pada rentang jam 16:00 - 18:00. Saya sarankan Anda menambah pasokan minimal +20 unit untuk mengamankan trend kualifikasi laba kotor.`;
      } else if (inp.includes('keuntungan') || inp.includes('prediksi') || inp.includes('laba')) {
        responseText = `Menghitung proyeksi margin 2026... Berdasarkan tren harian omset Rp${salesHistory.reduce((sum, s) => sum + s.total, 0).toLocaleString()}, rasio laba bersih bisnis Anda stabil pada rentang +18.2%. Diperkirakan pada akhir bulan, akumulasi saldo e-wallet Anda menyentuh Rp45.000.000 dengan korelasi minim pengeluaran operasional.`;
      } else {
        responseText = `Terima kasih atas pertanyaannya! Rekomendasi strategis hari ini: 
        1. Segera restock item berkategori Minuman terpopuler untuk mencegah missed sales.
        2. Tawarkan program loyalitas untuk pembeli di jam sibuk kafe Anda.
        3. Selalu pantau check-in absensi staf agar efisiensi terjaga. Ada pertanyaan lain?`;
      }

      setAiChat([...history, { role: 'assistant', text: responseText }]);
    }, 1800);
  };

  // Determine Gamified Employee Tiers
  const getEmployeeTier = (exp: number) => {
    if (exp >= 250) return { name: 'King 👑', color: 'text-rose-500 border-rose-500 shadow-rose-500/20' };
    if (exp >= 150) return { name: 'Suhu 🌟', color: 'text-amber-500 border-amber-500 shadow-amber-555/20' };
    if (exp >= 80) return { name: 'Pro Player ⚡', color: 'text-cyan-400 border-cyan-400 shadow-cyan-400/20' };
    return { name: 'Amatir 🌱', color: 'text-emerald-400 border-emerald-400' };
  };

  // Onboarding employee submit
  const handleEmployeeOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeProfile.fullName) return;

    playSuccessSound();
    localStorage.setItem('inmarket_employee_profile', JSON.stringify(employeeProfile));
    setShowEmployeeProfileModal(false);
  };

  // Clean-up logout
  const triggerAppLogout = () => {
    signOut(auth).then(() => {
      localStorage.removeItem('offline_logged_in_user');
      onNavigate('splash');
    });
  };

  // Simulated financials for owner
  const formattedStatSales = salesHistory.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#030107] text-slate-800 dark:text-violet-100 font-sans overflow-hidden transition-colors duration-500 relative">
      
      {/* Background soft space particles */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/5 dark:bg-violet-950/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/5 dark:bg-cyan-950/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar navigation */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:static w-76 h-full flex flex-col justify-between border-r border-[#6366f11c] bg-[#ffffffea] dark:bg-[#06040d]/90 backdrop-blur-2xl p-6 z-50 lg:translate-x-0 transition-all duration-300 shadow-xl"
      >
        <div>
          {/* Logo heading */}
          <div className="text-xl font-bold mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white shadow-[0_0_15px_#8b5cf6]">
                M
              </div>
              <div>
                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-cyan-200">
                  InMarket
                </span>
                <span className="text-[9px] block opacity-40 font-mono tracking-widest leading-none">PREMIUM SUITE</span>
              </div>
            </div>
            <button className="lg:hidden p-1.5" onClick={() => setIsSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* User badge */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 overflow-hidden relative">
              <img 
                src={employeeProfile.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.displayName || shopData.ownerName}&background=8B5CF6&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="text-xs font-black truncate max-w-[150px]">{userRole === 'Owner' ? shopData.ownerName : employeeProfile.fullName || currentUser?.displayName || 'Employee'}</div>
              <p className="text-[9px] font-mono opacity-50 block leading-tight mt-0.5">
                {userRole === 'Owner' ? '👑 OWNER BOSS' : `👨‍💼 STAFF • ${getEmployeeTier(employeeProfile.exp).name}`}
              </p>
            </div>
          </div>

          {/* Futuristic Premium Role Switcher Dropdown */}
          <div className="mb-6 p-3 bg-indigo-500/5 dark:bg-[#120f2b] border border-violet-500/10 rounded-2xl relative">
            <span className="text-[8px] font-black uppercase text-violet-500 dark:text-violet-400 block mb-1">OPERATOR SYSTEM ACCESS</span>
            <select
              value={userRole}
              onChange={(e) => {
                const nextRole = e.target.value as any;
                setUserRole(nextRole);
                localStorage.setItem('inmarket_user_role', nextRole);
                playNotificationSound();
                triggerNotification('system', `Akses sistem dialihkan ke Operator: ${nextRole}`);
              }}
              className="w-full text-xs font-black uppercase text-slate-800 dark:text-zinc-200 outline-none bg-transparent cursor-pointer py-1"
            >
              <option value="Owner" className="bg-slate-900 border text-white">👑 Owner Boss</option>
              <option value="Admin" className="bg-slate-900 border text-white">⚡ Admin (Control)</option>
              <option value="Manager" className="bg-slate-900 border text-white">💼 Manager (Operasional)</option>
              <option value="Supervisor" className="bg-slate-900 border text-white">🛡️ Supervisor (Staff)</option>
              <option value="Kasir" className="bg-slate-900 border text-white">🛒 Kasir (POS)</option>
              <option value="Karyawan" className="bg-slate-900 border text-white">👤 Karyawan</option>
            </select>
          </div>

          <nav className="space-y-1 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
            {[
              { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard, test: true },
              { id: 'stock', name: t('products'), icon: Package, test: ['Owner', 'Admin', 'Manager', 'Supervisor'].includes(userRole) },
              { id: 'kasir', name: t('kasir'), icon: ShoppingCart, test: ['Owner', 'Kasir'].includes(userRole) },
              { id: 'customer', name: 'Pelanggan CRM', icon: Users, test: ['Owner', 'Admin', 'Manager', 'Kasir'].includes(userRole) },
              { id: 'supplier', name: 'Supplier', icon: Truck, test: ['Owner', 'Admin', 'Manager'].includes(userRole) },
              { id: 'pengeluaran', name: 'Kas & Usaha', icon: DollarSign, test: ['Owner'].includes(userRole) },
              { id: 'promo', name: 'Promo & Diskon', icon: Flame, test: ['Owner', 'Admin'].includes(userRole) },
              { id: 'absensi', name: t('absensi'), icon: ClipboardCheck, test: ['Owner', 'Supervisor', 'Karyawan'].includes(userRole) },
              { id: 'security', name: 'Keamanan', icon: ShieldCheck, test: ['Owner', 'Admin'].includes(userRole) },
              { id: 'grafik', name: t('settings'), icon: BarChart3, test: ['Owner'].includes(userRole) },
              { id: 'chat', name: `${t('chat')} (${chatMessages.length})`, icon: MessageCircle, test: true },
              { id: 'ai', name: t('aiAssistant'), icon: Bot, test: true }
            ].map(item => {
              if (!item.test) return null;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-xs font-black transition-all transform hover:translate-x-1",
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-violet-600/15 to-transparent border-l-4 border-violet-500 dark:text-white" 
                      : "opacity-60 hover:opacity-100 dark:text-violet-200"
                  )}
                >
                  <span className="flex items-center space-x-3">
                    <item.icon size={15} /> 
                    <span>{item.name}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout bottom */}
        <button 
          onClick={triggerAppLogout} 
          className="flex items-center space-x-3 opacity-60 hover:opacity-100 hover:text-red-400 p-3 text-xs font-bold transition-all"
        >
          <LogOut size={16} /> 
          <span>{t('logout')}</span>
        </button>
      </motion.aside>

      {/* Main page content area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header bar */}
        <header className="h-20 border-b border-[#6366f11a] px-6 flex justify-between items-center bg-[#ffffff8a] dark:bg-[#030107]/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl bg-slate-900/5 dark:bg-white/5" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={18}/>
            </button>
            <h1 className="text-sm font-black uppercase font-mono tracking-wider text-indigo-600 dark:text-violet-400">
              LEDGER NODE: <span className="text-slate-800 dark:text-white">{activeTab.toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeLanguageSwitcher />
            
            {/* Realtime Open/Closed indicator */}
            <div className="hidden md:flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
              <span className="text-[10px] font-black font-mono tracking-widest">{isStoreOpen ? 'STORE_OPEN' : 'STORE_CLOSED'}</span>
            </div>
            
            <button className="p-2 rounded-full hover:bg-slate-500/10 opacity-70 hover:opacity-100 relative">
              <Bell size={18}/>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        {/* Display Banner alerts */}
        {isSalaryPaid && userRole === 'Employee' && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 text-center text-white text-xs font-black tracking-wider flex items-center justify-center gap-2.5 animate-pulse">
            <Crown size={16} /> {t('salaryPaidSuccess')} ⭐
          </div>
        )}

        {/* Dynamic Inner Tab container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none custom-scrollbar pb-16">
          
          {/* TAB 1: EXECUTIVE DASHBOARD REPORT */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Responsive layout owner business status settings banner */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center bg-[#eaeaff]/30 dark:bg-[#070514]/70 border border-violet-500/20 p-6 rounded-3xl backdrop-blur-md shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent pointer-events-none" />
                
                {/* Weather widget & Auto greetings */}
                <div className="xl:col-span-8 space-y-3 relative z-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider", getAccentColorClass('badge'))}>
                      🌌 SYSTEM NODE 2026 ACTIVE
                    </span>
                    <div className="flex items-center gap-1 text-xs opacity-80 font-mono">
                      <Cloud className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Cyber-Grid Weather: 29°C / Cloudy Cyber-Mint</span>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-3xl font-black tracking-tight">
                    {getGreeting() === 'Selamat Malam' ? 'Selamat malam' : getGreeting() === 'Selamat Sore' ? 'Selamat sore' : getGreeting() === 'Selamat Siang' ? 'Selamat siang' : 'Selamat pagi'},{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-300">
                      Fauzan
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    Outlet aktif saat ini: <strong className="text-violet-400 font-mono tracking-wider">{stores.find(s => s.id === currentStore)?.name}</strong>. 
                    Semua modul pencatatan digital kasir, evaluasi bento target, analisis motivasi kecerdasan buatan, dan CCTV tersinkronisasi.
                  </p>
                </div>

                {/* Cloud Auto-Backup state widget & Store toggle */}
                <div className="xl:col-span-4 flex flex-col md:flex-row xl:flex-col gap-3 relative z-10 xl:items-end">
                  <div className="bg-[#120f26]/80 border border-cyan-500/20 rounded-2xl p-3 flex items-center justify-between gap-4 w-full max-w-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                        <Cloud className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[9px] block text-cyan-400 opacity-60 font-mono leading-none font-bold uppercase">CLOUD STATUS</span>
                        <span className="text-xs font-semibold text-slate-200">Last backup {lastBackupTime}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        playScanSound(); 
                        setLastBackupTime("Just now"); 
                        triggerNotification('toko', 'Sinkronisasi awan dipaksa berhasil!');
                        logSystemActivity('Backup manual instansi lokal dipicu oleh Owner');
                      }} 
                      title="Sync Manual"
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={handleToggleStore}
                    className={cn(
                      "py-3 px-5 rounded-2xl font-black text-xs tracking-widest uppercase text-white shadow-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer w-full max-w-sm xl:max-w-none",
                      isStoreOpen 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/10 border border-emerald-400/20" 
                        : "bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-500/10 border border-rose-400/20"
                    )}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStoreOpen ? 'bg-white' : 'bg-rose-300'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isStoreOpen ? 'bg-white' : 'bg-rose-500'}`}></span>
                    </span>
                    {isStoreOpen ? 'TOKO_DI_BUKA' : 'TOKO_DI_TUTUP'}
                  </button>
                </div>
              </div>

              {/* MULTI OUTLET SWITCHER CAPSULE BAR */}
              <div className="bg-[#0b0821]/60 border border-violet-500/10 rounded-2xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
                <span className="text-[10px] font-mono tracking-widest text-[#9333ea] dark:text-violet-400 font-bold uppercase ml-2.5">
                  🏢 CABANG OUTLET SWITCHER :
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {stores.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleSwitchStore(st.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold leading-none tracking-wide transition-all uppercase cursor-pointer flex items-center gap-1.5",
                        currentStore === st.id
                          ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                          : "bg-slate-500/5 hover:bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-transparent hover:border-violet-500/10"
                      )}
                    >
                      <Globe className="w-3.5 h-3.5 opacity-60" />
                      {st.name.split(' ')[2]?.replace('(', '').replace(')', '') || st.type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 hover:border-violet-500/50 transition-all flex flex-col justify-between h-36">
                  <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block">{t('totalProfit')}</span>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500">
                    Rp{(formattedStatSales * 0.45).toLocaleString()}
                  </div>
                  <p className="text-[10px] font-bold text-emerald-400 flex items-center"><TrendingUp size={12} className="mr-1" /> +15% vs yesterday</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 hover:border-violet-500/50 transition-all flex flex-col justify-between h-36">
                  <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block">{t('revenue')}</span>
                  <div className="text-3xl font-black text-indigo-600 dark:text-cyan-400">
                    Rp{formattedStatSales.toLocaleString()}
                  </div>
                  <p className="text-[10px] font-mono opacity-50">Settled via POS Terminal</p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 hover:border-violet-500/50 transition-all flex flex-col justify-between h-36">
                  <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block">{t('expenses')}</span>
                  <div className="text-3xl font-black text-rose-500">
                    Rp{Math.floor(formattedStatSales * 0.2).toLocaleString()}
                  </div>
                  <p className="text-[10px] font-mono opacity-50">Stock acquire & staff ledger</p>
                </div>
              </div>

              {/* Analytics graph row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 h-80">
                  <h4 className="text-xs uppercase tracking-widest font-mono text-indigo-500 mb-6 flex items-center gap-1.5"><TrendingUp size={16} /> LEDGER VALUATIONS HISTORICAL</h4>
                  <div className="h-[80%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liveChartData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090514', border: '1px solid #c084fc', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="sales" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 flex flex-col justify-between">
                  <h4 className="text-xs uppercase tracking-widest font-mono text-indigo-500 border-b border-indigo-100/10 pb-4 mb-2">{t('quickActions')}</h4>
                  
                  {userRole === 'Owner' ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-violet-600/15 border border-violet-500/20">
                        <span className="text-[10px] font-black uppercase block opacity-60 mb-2">{t('salaryFeature')}</span>
                        <button 
                          onClick={handlePaySalary}
                          disabled={isSalaryPaid}
                          className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black uppercase hover:bg-violet-700 transition"
                        >
                          {isSalaryPaid ? '✅ GAJI TELAH DITRANSFER' : t('paySalary')}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setActiveTab('kasir')} className="flex-1 py-3 bg-slate-900 text-white dark:bg-white/10 rounded-xl text-xs font-black uppercase text-center hover:brightness-110 transition">{t('addTransaction')}</button>
                        <button onClick={handleGenerateAttendanceCode} className="flex-1 py-3 bg-slate-900 text-white dark:bg-white/10 rounded-xl text-xs font-black uppercase text-center hover:brightness-110 transition">GEN ABSEN</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                        <Crown className="text-amber-400 mx-auto mb-2" size={24} />
                        <h5 className="text-xs font-black uppercase tracking-wider">{getEmployeeTier(employeeProfile.exp).name}</h5>
                        <p className="text-[10px] opacity-60">Score EXP: {employeeProfile.exp}pts</p>
                      </div>
                      <button onClick={() => setActiveTab('absensi')} className="w-full py-3 bg-violet-600 text-white rounded-xl text-xs font-black uppercase hover:bg-violet-700 transition">CHECK IN ABSEN</button>
                    </div>
                  )}

                  <p className="text-[9px] font-mono opacity-50 mt-4 text-center">InMarket Platform v2.5 Sandbox Instance</p>
                </div>

              </div>

              {/* ================================================= */}
              {/* STARTUP AI PREMIUM MODULES - BENTO SUITE */}
              {/* ================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                
                {/* COLUMN 1: INTERACTION & INTUITION CORE */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* FEATURE: BUSINESS TARGETS & METRICS (Target Bisnis) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl relative overflow-hidden text-slate-800 dark:text-violet-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-500/10 pb-4 mb-4 gap-2">
                      <h4 className="text-sm font-black uppercase tracking-widest font-mono text-violet-400 flex items-center gap-2">
                        <Sparkle className="w-4 h-4 text-violet-400 animate-spin" />
                        TARGET OPERASIONAL DAN REWARD BISNIS
                      </h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            playClickSound();
                            setTargets(prev => {
                              const nextSales = prev.salesCurrent + 500000;
                              if (nextSales >= prev.salesTarget) {
                                triggerConfettiRain();
                                triggerNotification('transaksi', 'Target Penjualan Hari Ini Sukses Tercapai! 🏆');
                                logSystemActivity('Owner mencapai OMSET TARGET harian Rp 5.000.000');
                              }
                              return { ...prev, salesCurrent: Math.min(prev.salesTarget, nextSales) };
                            });
                          }}
                          className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 transition-all cursor-pointer"
                        >
                          + Rp500k Omset
                        </button>
                        <button 
                          onClick={() => {
                            playClickSound();
                            setTargets(prev => {
                              const nextTrans = prev.transCurrent + 2;
                              if (nextTrans >= prev.transTarget) {
                                triggerConfettiRain();
                                triggerNotification('transaksi', 'Target Transaksi Sukses Terpenuhi! ⭐');
                              }
                              return { ...prev, transCurrent: Math.min(prev.transTarget, nextTrans) };
                            });
                          }}
                          className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all cursor-pointer"
                        >
                          +2 Transaksi
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="bg-slate-500/5 border border-violet-500/10 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono opacity-50 block tracking-widest uppercase">TARGET OMSET</span>
                          <span className="text-sm font-black text-violet-400 block mt-1">Rp {targets.salesCurrent.toLocaleString()} / Rp {targets.salesTarget.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                          <div 
                            style={{ width: `${(targets.salesCurrent / targets.salesTarget) * 100}%` }}
                            className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_#6366f1] transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-500/5 border border-violet-500/10 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono opacity-50 block tracking-widest uppercase">TARGET TRANSAKASI</span>
                          <span className="text-sm font-black text-cyan-400 block mt-1">{targets.transCurrent} / {targets.transTarget} POS</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                          <div 
                            style={{ width: `${(targets.transCurrent / targets.transTarget) * 100}%` }}
                            className="bg-cyan-400 h-full rounded-full shadow-[0_0_8px_#22d3ee] transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-500/5 border border-violet-500/10 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono opacity-50 block tracking-widest uppercase">PRESTASI CABANG</span>
                          <span className="text-sm font-black text-emerald-400 block mt-1">{targets.developmentProgress}% EFISIENSI</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                          <div 
                            style={{ width: `${targets.developmentProgress}%` }}
                            className="bg-emerald-400 h-full rounded-full shadow-[0_0_8px_#34d399] transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-gradient-to-r from-violet-950/20 to-indigo-950/30 border border-violet-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Award className="w-5 h-5 text-amber-400 animate-bounce flex-shrink-0" />
                        <span>Mencapai target harian untuk membuka bonus <strong>Holographic Business Master</strong> badge!</span>
                      </div>
                      <button 
                        onClick={triggerConfettiRain}
                        className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] dark:text-cyan-400 font-extrabold hover:underline cursor-pointer"
                      >
                        CELEBRATE 🎉
                      </button>
                    </div>
                  </div>

                  {/* FEATURE: HOLOGRAPHIC GLASS CALENDAR (Calendar Usaha) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl text-slate-800 dark:text-violet-100">
                    <div className="flex items-center justify-between border-b border-slate-500/10 pb-4 mb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        KALENDER & JADWAL OPERASIONAL
                      </h4>
                      <button 
                        onClick={() => {
                          playClickSound();
                          const title = prompt(language==='id' ? "Sebutkan nama agenda baru:" : "Enter new event details:");
                          if (title) {
                            const newEv = { id: 'cl_' + Date.now(), date: selectedDate, title, type: 'event' };
                            setCalendarEvents(prev => [...prev, newEv]);
                            triggerNotification('chat', `Agenda ditambahkan untuk tanggal ${selectedDate}!`);
                            logSystemActivity(`Menambahkan agenda bisnis harian tanggal ${selectedDate}`);
                          }
                        }}
                        className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all cursor-pointer"
                      >
                        + Agenda Baru
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-7 bg-slate-500/5 border border-violet-500/5 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black font-mono tracking-wider uppercase text-slate-600 dark:text-slate-300">MEI 2026</span>
                          <span className="text-[10px] font-mono text-[#a855f7]">CURRENT DATABASE MONTH</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 opacity-60 mb-2">
                          <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {Array.from({ length: 30 }).map((_, idx) => {
                            const day = String(idx + 1);
                            const hasEvent = calendarEvents.some(e => e.date === day);
                            const isSelected = selectedDate === day;
                            return (
                              <button
                                key={idx}
                                onClick={() => { playClickSound(); setSelectedDate(day); }}
                                className={cn(
                                  "aspect-square rounded-xl text-xs font-semibold flex flex-col justify-center items-center transition-all relative cursor-pointer",
                                  isSelected 
                                    ? "bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400"
                                    : "bg-slate-500/5 text-slate-600 dark:text-slate-300 hover:bg-slate-500/15 border border-transparent hover:border-violet-500/10",
                                  hasEvent && !isSelected && "border-b-2 border-emerald-400"
                                )}
                              >
                                {day}
                                {hasEvent && (
                                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="md:col-span-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] dark:text-cyan-400 uppercase block">
                            AGENDA TANGGAL MEI {selectedDate} :
                          </span>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {calendarEvents.filter(e => e.date === selectedDate).length === 0 ? (
                              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-mono">
                                No scheduling node found today.
                              </div>
                            ) : (
                              calendarEvents.filter(e => e.date === selectedDate).map((ev) => (
                                <div key={ev.id} className="p-3 bg-slate-500/5 dark:bg-[#130f2f]/60 border border-slate-500/10 dark:border-violet-500/10 rounded-xl relative group flex justify-between items-center">
                                  <div className="flex gap-2 items-center">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      ev.type === 'warning' ? 'bg-amber-400' :
                                      ev.type === 'info' ? 'bg-cyan-400' :
                                      ev.type === 'payout' ? 'bg-emerald-400' : 'bg-violet-400'
                                    }`} />
                                    <span className="text-xs text-slate-700 dark:text-slate-200">{ev.title}</span>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      playScanSound();
                                      setCalendarEvents(prev => prev.filter(e => e.id !== ev.id));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 hover:underline transition-opacity cursor-pointer"
                                  >
                                    HAPUS
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-500/5 dark:bg-[#120f2b] rounded-xl border border-dashed border-slate-500/20 text-[10.5px] text-slate-500 leading-relaxed font-mono mt-4">
                          ℹ️ Gunakan modal agenda operasional untuk restock barang harian, jadwal libur bersama, reminder gajian staf.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FEATURE: VOICE AI ASSISTANT HUB WITH OSCILLOSCOPE WAVEFORM */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl relative overflow-hidden text-slate-800 dark:text-violet-100">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-500/10 pb-4 mb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                        INMARKET VOICE AI COMPANION
                      </h4>
                      <button
                        onClick={handleToggleBackgroundMusic}
                        className={cn(
                          "px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                          isMusicOn 
                            ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                            : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                        )}
                      >
                        {isMusicOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        {isMusicOn ? 'MUSIC: ON' : 'MUSIC: OFF'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-8 space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                          AI InMarket siap membacakan performa finansial toko, memotivasi staf, serta melakukan forecasting inventaris via asisten suara premium.
                        </p>
                        
                        <div className="bg-slate-500/5 dark:bg-[#120f28]/70 border border-slate-500/10 dark:border-violet-500/10 rounded-2xl p-4 min-h-[50px] relative">
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <span className={cn("inline-block w-2 h-2 rounded-full", isVoiceSpeaking ? "bg-emerald-400 animate-ping" : "bg-slate-500")} />
                            <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest">{isVoiceSpeaking ? "SPEAKING_AI" : "STANDBY_NODE"}</span>
                          </div>
                          
                          <span className="text-[8px] block font-mono text-cyan-400 mb-1 font-bold uppercase">AI ANALYST TRANSCRIPT:</span>
                          <span className="text-xs text-slate-700 dark:text-slate-200 block font-mono leading-relaxed">
                            {voiceTranscript || "Klik 'VOICE BRIEFING EXECUTIVE' untuk menyalakan suara panduan analis instan AI..."}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col items-center gap-4">
                        <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-[200px]">
                          {waveformHeight.map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: isVoiceSpeaking ? h : 5 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 12 }}
                              className="w-1.5 bg-gradient-to-t from-cyan-500 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                              style={{ height: '5px' }}
                            />
                          ))}
                        </div>

                        <button
                          onClick={handleTriggerVoiceAI}
                          className={cn(
                            "py-3 px-5 w-full rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-white",
                            isVoiceSpeaking 
                              ? "bg-red-600 hover:bg-red-700 shadow-red-500/10 border border-red-500/20" 
                              : "bg-gradient-to-r from-[#9333ea] to-[#4f46e5] hover:brightness-110 shadow-[0_0_15px_rgba(147,51,234,0.45)] border border-violet-500/20"
                          )}
                        >
                          <Bot className="w-4 h-4 text-white" />
                          {isVoiceSpeaking ? 'TERMINATE VOICE' : 'VOICE BRIEFING EXECUTIVE'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FEATURE: CHRONO MATRIX MANUAL CUSTOMIZER (Custom Dashboard) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl text-slate-800 dark:text-violet-100">
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-[#a855f7] dark:text-violet-400 border-b border-slate-500/10 pb-4 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-violet-400 animate-spin" />
                      🌌 MULTI-THEME NEON CUSTOMIZER PANEL
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] dark:text-cyan-400 uppercase">1. ACCENT NEON GLOW</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: 'violet', label: 'Violet', color: 'bg-violet-600' },
                            { name: 'cyan', label: 'Cyan', color: 'bg-cyan-400' },
                            { name: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
                            { name: 'rose', label: 'Rose', color: 'bg-rose-500' }
                          ].map((clr) => (
                            <button
                              key={clr.name}
                              onClick={() => { playClickSound(); setAccentColor(clr.name as any); triggerNotification('toko', `Tema aksen berubah ke ${clr.label}`); }}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border",
                                accentColor === clr.name ? "border-violet-400 dark:border-violet-400 text-slate-800 dark:text-white bg-slate-500/10" : "border-slate-500/10 text-slate-500 bg-transparent"
                              )}
                            >
                              <span className={`w-2 h-2 rounded-full ${clr.color}`} />
                              {clr.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] dark:text-cyan-400 uppercase">2. WALLPAPER BACKGROUND</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'cyber-matrix', label: 'Grid Matrix' },
                            { id: 'cosmic-neon', label: 'Cosmic' },
                            { id: 'deep-obsidian', label: 'Obsidian' }
                          ].map((bgT) => (
                            <button
                              key={bgT.id}
                              onClick={() => { playClickSound(); setBackgroundTheme(bgT.id as any); }}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer border",
                                backgroundTheme === bgT.id ? "text-violet-500 border-violet-500 bg-slate-500/10" : "text-slate-500 border-slate-500/10"
                              )}
                            >
                              {bgT.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] dark:text-cyan-400 uppercase">3. GLOW EFFECT</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'high', label: 'MAX' },
                            { id: 'medium', label: 'MED' },
                            { id: 'hologram', label: 'SPECTRE' }
                          ].map((intens) => (
                            <button
                              key={intens.id}
                              onClick={() => { playClickSound(); setNeonIntensity(intens.id as any); }}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase leading-none tracking-wide transition cursor-pointer border",
                                neonIntensity === intens.id ? "border-cyan-400 bg-cyan-400/5 text-cyan-500" : "text-slate-500 border-transparent bg-slate-500/5 hover:bg-slate-500/10"
                              )}
                            >
                              {intens.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: TELEMETRY & CHRONICLES */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* FEATURE: CCTV LIVE STREAM STORE DEMO MONITOR */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl overflow-hidden relative text-slate-800 dark:text-violet-100">
                    <div className="flex items-center justify-between border-b border-slate-500/10 pb-4 mb-4">
                      <h4 className="text-sm font-black uppercase tracking-widest font-mono text-rose-400 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-rose-400 animate-pulse" />
                        MONITOR CCTV DEMO
                      </h4>
                      <span className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-md animate-pulse">
                        ● LIVE
                      </span>
                    </div>

                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-500/10 dark:border-red-500/15">
                      <div className="absolute inset-0 bg-[#0d140e] opacity-40 select-none pointer-events-none" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,36,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,36,0.35)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/15 animate-[scan_2.8s_linear_infinite] shadow-[0_0_10px_#22c55e]" />

                      <div className="absolute top-3 left-3 font-mono text-[9px] text-[#22c55e] space-y-0.5 pointer-events-none">
                        <div>INMARKET_CCTV_STREAM_MAIN</div>
                        <div>NODE_ID: {currentUser?.email || 'OFF_0019'}</div>
                        <div>ISO_INDX_22026: 800</div>
                      </div>

                      <div className="absolute bottom-3 left-3 text-[10px] text-green-400 bg-black/70 px-2 py-1 rounded border border-green-500/20 font-mono tracking-widest pointer-events-none">
                        CAM: {cctvActiveCam}
                      </div>

                      <div className="absolute bottom-3 right-3 text-[9px] text-[#22c55e] font-mono leading-none pointer-events-none">
                        {cctvTime} UTC
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Tv className="w-8 h-8 text-green-500/30 animate-pulse animate-duration-1000" />
                        <span className="text-[9px] font-mono text-green-400/40 ml-1.5 uppercase">SYSTEM_SECURE_FEED</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { id: 'CAM_01_KASIR', label: 'Area Kasir' },
                        { id: 'CAM_02_LOUNGE', label: 'Lobby Utama' },
                        { id: 'CAM_03_BAR', label: 'Bar Racikan' },
                        { id: 'CAM_04_GUDANG', label: 'Vault Stok' }
                      ].map((cam) => (
                        <button
                          key={cam.id}
                          onClick={() => { playClickSound(); setCctvActiveCam(cam.id); }}
                          className={cn(
                            "px-2 py-1 border rounded-lg text-[9px] font-bold uppercase transition text-left cursor-pointer",
                            cctvActiveCam === cam.id
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400"
                              : "bg-transparent border-slate-500/10 text-slate-500 hover:bg-slate-500/5"
                          )}
                        >
                          🎬 {cam.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FEATURE: HOLOGRAPHIC EXPORT DATA LABELS (Export Data) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl relative overflow-hidden text-slate-800 dark:text-violet-100">
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-emerald-500 dark:text-emerald-400 border-b border-slate-500/10 pb-4 mb-4 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 animate-bounce" />
                      UNDUH DATA & EXPORT
                    </h4>
                    
                    <div className="space-y-2.5">
                      {[
                        { id: 'laporan_usaha', label: 'Laporan Finansial Toko', format: 'PDF Document' },
                        { id: 'stock_barang', label: 'Ledger Riwayat Stok', format: 'Excel Sheet' },
                        { id: 'absensi', label: 'Data Absensi Pegawai', format: 'CSV Ledger' },
                        { id: 'transaksi', label: 'Histori Penjualan POS', format: 'Excel Sheet' }
                      ].map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => handleExportDataFile(exp.id)}
                          className="w-full p-3 rounded-2xl bg-slate-500/5 dark:bg-[#120f26]/40 border border-slate-500/10 dark:border-slate-500/5 hover:border-emerald-500/40 text-left transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 capitalize">
                              <Download className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors uppercase leading-tight">{exp.label}</span>
                              <span className="text-[9px] font-mono text-emerald-400 opacity-80 uppercase">{exp.format}</span>
                            </div>
                          </div>
                          <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FEATURE: ACCREDITED ACHIEVEMENTS & BADGES (Badge & Achievement) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl relative overflow-hidden text-slate-800 dark:text-violet-100">
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400 border-b border-slate-500/10 pb-4 mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" />
                      BADGE & PENCAPAIAN TOKO
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      {badges.map((bdg) => (
                        <div
                          key={bdg.id}
                          onClick={() => { playClickSound(); setActiveBadgePopup(bdg); }}
                          className={cn(
                            "aspect-square p-2 border transition flex flex-col justify-between cursor-pointer relative group rounded-2xl",
                            bdg.unlocked 
                              ? "bg-slate-500/5 border-cyan-500/20 text-cyan-500 dark:text-cyan-400 hover:border-cyan-400" 
                              : "bg-slate-500/5 border-slate-500/15 text-slate-400 dark:text-slate-500 opacity-50"
                          )}
                        >
                          <div className="text-right">
                            <span className={cn(
                              "text-[7px] font-mono font-black uppercase px-1 rounded-sm leading-none",
                              bdg.tier === 'legendary' ? 'bg-amber-400/10 border border-amber-400/20 text-amber-500' :
                              bdg.tier === 'epic' ? 'bg-violet-400/10 border border-violet-400/10 text-violet-500' :
                              bdg.tier === 'rare' ? 'bg-cyan-400/10 border border-cyan-400/10 text-cyan-500' : 'bg-slate-500/10 text-slate-400'
                            )}>
                              {bdg.tier}
                            </span>
                          </div>

                          <div className="flex flex-col items-center text-center justify-center py-1">
                            {bdg.icon === 'Crown' ? <Crown className="w-5 h-5 animate-bounce" /> :
                             bdg.icon === 'Award' ? <Award className="w-5 h-5" /> :
                             bdg.icon === 'TrendingUp' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
                             bdg.icon === 'ClipboardCheck' ? <ClipboardCheck className="w-5 h-5" /> :
                             bdg.icon === 'Users' ? <Users className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-[#a855f7]" />}
                            <span className="text-[8.5px] font-black mt-2 leading-none uppercase tracking-wide group-hover:scale-105 transition-transform">{bdg.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[9px] font-mono opacity-50 text-center mt-3">Klik kartu badge di atas untuk detail kredensial.</p>
                  </div>

                  {/* FEATURE: REAL-TIME ACTIVITY TIMELINE LOG (History Aktivitas) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0c091f]/85 border border-violet-500/15 shadow-xl relative overflow-hidden text-slate-800 dark:text-violet-100">
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-violet-400 border-b border-slate-500/10 pb-4 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-violet-400 animate-spin" />
                      AKTIVITAS TERKINI (REAL-TIME)
                    </h4>

                    <div className="relative border-l border-slate-500/10 ml-3 pl-5 space-y-4 max-h-[290px] overflow-y-auto">
                      {activityHistory.map((act) => (
                        <div key={act.id} className="relative text-xs leading-relaxed">
                          <span className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-950 border border-violet-500/40 shadow-sm flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                          </span>
                          
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <strong className="text-slate-700 dark:text-slate-100 font-bold uppercase tracking-wider">{act.user}</strong>
                            <span className="text-[9px] font-mono text-cyan-500">{act.time}</span>
                          </div>
                          
                          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] leading-tight text-justify">
                            {act.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>


              {/* ================================================= */}
              {/* BRAND ADVISOR PANEL: AI ANALYTICS (AI Analytics) */}
              {/* ================================================= */}
              <div className="p-6 rounded-3xl bg-[#070517]/85 border border-violet-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,rgba(147,51,234,0.08),transparent_100%)]" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-[#c084fc] font-mono font-black text-[10px] tracking-widest rounded-full uppercase">
                      🧬 COGNITIVE ANALYTICS INSIGHTS
                    </span>
                    <h3 className="text-lg md:text-xl font-extrabold text-white">REKOMENDASI PREDIKTIF INMARKET AI</h3>
                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                      "Prediksi omset kuartal menunjukkan peningkatan <strong className="text-indigo-400 font-mono">35%</strong> pada minuman espresso berkat peningkatan pemesanan online dari Sumatra Roast Node. Optimasi supply kopi instan dianjurkan sebelum tanggal gajian karyawan."
                    </p>
                  </div>

                  <div className="bg-[#12102a]/80 p-4 rounded-2xl border border-cyan-500/10 flex flex-wrap gap-4 md:self-center">
                    <div className="text-center">
                      <span className="text-[9px] font-mono opacity-50 block tracking-widest uppercase text-slate-400">PRODUK TRENDING</span>
                      <span className="text-sm font-black text-cyan-400 block pb-1">Espresso Sumatran (+35%)</span>
                    </div>
                    <div className="w-[1px] bg-slate-500/20 self-stretch" />
                    <div className="text-center">
                      <span className="text-[9px] font-mono opacity-50 block tracking-widest uppercase text-slate-400">PREDIKSI LAJU LABA</span>
                      <span className="text-sm font-black text-emerald-400 block">Rp1.450.000 / bln</span>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          )}

          {/* TAB 2: INVENTORY STOCK MANAGER */}
          {activeTab === 'stock' && userRole === 'Owner' && (
            <Inventory />
          )}

          {/* TAB 3: POS PAYMENT POINT CASHIER */}
          {activeTab === 'kasir' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Product catalog picker */}
              <div className="lg:col-span-8 space-y-6">

                {/* ADVANCED HOLOGRAPHIC BARCODE / QR SCANNER WIDGET */}
                <div className="bg-[#0c0822]/85 border border-violet-500/20 p-5 rounded-3xl backdrop-blur-md relative overflow-hidden text-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-500/10 pb-4 mb-4 gap-2">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2">
                        <ScanBarcode className="w-5 h-5 text-cyan-400 animate-pulse" />
                        TERMINAL SCANNER BARCODE & QR HOLOGRAFIS
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">AI MENELUSURI INDEKS STOK SECARA REAL-TIME & MEMASUKKAN PRODUK KE KERANJANG</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          playClickSound();
                          setIsScannerActive(!isScannerActive);
                          if (!isScannerActive) {
                            triggerNotification('toko', 'Sistem Kamera Sensor QR/Barcode Diaktifkan');
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer",
                          isScannerActive 
                            ? "bg-rose-500/20 border border-rose-500/30 text-rose-400" 
                            : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                        )}
                      >
                        {isScannerActive ? 'MATIKAN KAMERA' : 'AKTIFKAN EMULATOR LASER'}
                      </button>
                    </div>
                  </div>

                  {isScannerActive ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      
                      {/* Live scanning video stream simulation */}
                      <div className="md:col-span-6 relative aspect-video bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                        <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />
                        
                        {/* Interactive red scanning laser visual */}
                        <motion.div 
                          animate={{ y: ["0%", "100%", "0%"] }} 
                          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                          className="absolute left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.85)] z-20"
                        />
                        
                        {/* Target reticle overlay */}
                        <div className="absolute inset-6 border border-dashed border-cyan-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                          <div className="border-t-2 border-l-2 border-cyan-400 w-4 h-4 absolute top-0 left-0" />
                          <div className="border-t-2 border-r-2 border-cyan-400 w-4 h-4 absolute top-0 right-0" />
                          <div className="border-b-2 border-l-2 border-cyan-400 w-4 h-4 absolute bottom-0 left-0" />
                          <div className="border-b-2 border-r-2 border-cyan-400 w-4 h-4 absolute bottom-0 right-0" />
                          
                          {/* Fake barcode image simulation */}
                          <div className="w-32 opacity-40 transition duration-500 flex flex-col items-center gap-1">
                            <span className="font-mono text-[9px] text-cyan-400 tracking-[0.2em]">|||| | || ||| ||</span>
                            <span className="text-[7.5px] font-mono text-cyan-400 leading-none">89927651026</span>
                          </div>
                        </div>

                        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-cyan-400 uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          AI_CCTV_APERTURE_FEED
                        </div>
                      </div>

                      {/* Manual mock fast scan buttons */}
                      <div className="md:col-span-6 space-y-3">
                        <p className="text-xs text-slate-300">
                          Tekan produk bersandi barcode di bawah ini untuk mensimulasikan tangkapan sensor scanner fisik secara real-time:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {products.slice(0, 4).map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                playScanSound();
                                addToCart(p);
                                triggerNotification('transaksi', `SCAN SUKSES: ${p.name} [${p.barcode || '8993010'}] masuk keranjang!`);
                                logSystemActivity(`Barcode scanned: ${p.name} dimasukkan otomatis ke slip belanja.`);
                              }}
                              className="px-3 py-2 bg-slate-900/40 hover:bg-violet-950/30 border border-violet-500/10 hover:border-cyan-400/50 rounded-xl text-[11px] font-mono font-black text-left flex flex-col justify-between cursor-pointer leading-tight transition-all"
                            >
                              <div className="truncate text-slate-100">{p.name}</div>
                              <div className="text-[9px] text-cyan-400 mt-1 font-semibold tracking-wider font-mono">BC: {p.barcode || '8992026' + p.id.slice(0, 3)}</div>
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
                          💡 Alat ini memverifikasi barcode serial number, memeriksa ketersediaan stok ganda, dan melacak harga terkini.
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 italic font-mono border border-dashed border-[#6366f131] rounded-2xl">
                      Kamera scanner offline. Klik tombol emulator di atas untuk menyimulasikan tangkapan laser sensor.
                    </div>
                  )}

                </div>

                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-2 mt-6">{language === 'id' ? 'Katalog Pembelian Kasir' : 'POS Cashier Catalog'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => addToCart(p)}
                      className="p-4 rounded-3xl bg-white dark:bg-black/20 border border-indigo-100/10 hover:border-violet-500/50 cursor-pointer transition flex items-center gap-4 hover:-translate-y-0.5 duration-200 shadow-md"
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-indigo-100/10">
                        <img src={p.photoUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate flex-1">
                        <h4 className="text-xs font-black truncate leading-tight dark:text-violet-200">{p.name}</h4>
                        <span className="text-[10px] opacity-40 font-mono mt-0.5 block">Rp{p.price.toLocaleString()}</span>
                        <div className="flex items-center justify-between text-[9px] mt-1 pr-1 font-semibold">
                          <span className={p.stock < 5 ? "text-rose-500" : "text-emerald-500"}>Stok: {p.stock}</span>
                          <span className="opacity-40">{p.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basket cart calculations */}
              <div className="lg:col-span-4 p-6 bg-white dark:bg-[#0a0715] rounded-3xl border border-indigo-100/10 flex flex-col justify-between h-[520px] shadow-xl relative">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 border-b border-indigo-100/10 pb-4 mb-4">{language === 'id' ? 'Keranjang Transaksi' : 'Checkout Cart'}</h4>
                  
                  {cart.length === 0 ? (
                    <div className="text-center py-20 text-xs opacity-40 font-mono">
                      {language === 'id' ? 'KERANJANG KOSONG' : 'CART_VACANT'}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs border-b border-indigo-100/5 pb-2">
                          <div className="truncate flex-1 pr-2">
                            <h5 className="font-extrabold truncate dark:text-violet-200">{item.name}</h5>
                            <span className="text-[10px] opacity-50 block">{item.qty}x • Rp{item.price.toLocaleString()}</span>
                          </div>
                          <span className="font-bold shrink-0 block mr-3">Rp{(item.price * item.qty).toLocaleString()}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-rose-500 block">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t border-indigo-100/10 pt-4">
                  
                  {/* Select Payment Methods */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase opacity-65 font-mono block">DOKUMEN_METODE_BAYAR</label>
                    <div className="grid grid-cols-4 gap-1">
                      {['Cash', 'QRIS', 'Transfer', 'E-wallet'].map(m => (
                        <button 
                          key={m} 
                          onClick={() => setPayMethod(m as any)}
                          className={cn(
                            "py-2 text-[9px] font-black uppercase rounded-lg border text-center transition",
                            payMethod === m 
                              ? "bg-violet-600 text-white border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
                              : "bg-black/5 dark:bg-white/5 border-indigo-100/10 opacity-70"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between font-black text-sm border-t border-indigo-100/5 pt-2">
                    <span className="uppercase opacity-60">TOTAL BILL</span>
                    <span className="text-cyan-500">Rp{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={executeCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:shadow-lg transition cursor-pointer"
                  >
                    🚀 {language === 'id' ? 'BAYAR & SELESAIKAN' : 'FINALIZE CHECKOUT'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SWAFOTO ATTENDANCE PORTAL */}
          {activeTab === 'absensi' && (
            <div className="max-w-xl mx-auto p-6 bg-white dark:bg-[#0b0816]/90 rounded-3xl border border-indigo-100/10 shadow-2xl relative font-sans">
              
              {userRole === 'Owner' ? (
                // Owner generates code
                <div className="text-center space-y-6 py-6">
                  <div className="inline-flex p-3.5 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400">
                    <ClipboardCheck size={36} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{t('attendanceCode')}</h3>
                    <p className="text-xs opacity-60 mt-1">Generate kode absensi agar staf karyawan Anda dapat check-in via swafoto.</p>
                  </div>

                  <div className="text-4xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#ec4899] py-4 bg-slate-900/10 dark:bg-black/30 rounded-2xl max-w-xs mx-auto border border-dashed border-indigo-500/20 font-mono">
                    {attendanceCode}
                  </div>

                  <button 
                    onClick={handleGenerateAttendanceCode}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs tracking-widest uppercase rounded-xl transition cursor-pointer"
                  >
                    🔄 {t('generateCode')}
                  </button>
                </div>
              ) : (
                // Employee inputs code
                <form onSubmit={handleEmployeeCheckIn} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 mb-3">
                      <Users size={28} className="animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black">{t('inputAttendanceCode')}</h3>
                    <p className="text-xs opacity-60 mt-1">Harap input kode 6-digit yang diactivekan oleh Pemilik Toko Anda.</p>
                  </div>

                  {attendanceSuccess && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs font-black text-emerald-400 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> {t('checkInSuccess')}
                    </motion.div>
                  )}

                  <div className="relative">
                    <input 
                      required 
                      type="text" 
                      value={employeeInputCode}
                      onChange={e => setEmployeeInputCode(e.target.value)}
                      placeholder="CONTOH: PLX487" 
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-2xl text-center font-mono font-black text-lg tracking-widest outline-none focus:border-cyan-400" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-60 tracking-wider flex items-center gap-2"><Image size={14} /> {t('uploadWorkProof')}</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/... (Selfie URL)" 
                      value={attendanceProofUrl}
                      onChange={e => setAttendanceProofUrl(e.target.value)}
                      className="w-full p-3.5 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" 
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    🚀 SUBMIT CHECK IN ABSENSI
                  </button>
                </form>
              )}

            </div>
          )}

          {/* TAB 5: ADVANCED RECHARTS GROUP */}
          {activeTab === 'grafik' && userRole === 'Owner' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-2">Modern Ledger Accounting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 h-76">
                  <span className="text-[10px] uppercase font-mono opacity-50 block mb-4">REVENUE VELOCITY TREND (NET)</span>
                  <div className="h-[80%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liveChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#a855f710" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090514', border: '1px solid #c084fc', borderRadius: '12px' }} />
                        <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-black/25 border border-indigo-100/10 h-76">
                  <span className="text-[10px] uppercase font-mono opacity-50 block mb-4">RECURRING PROFIT MULTIPLES</span>
                  <div className="h-[80%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={liveChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#a855f710" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090514', border: '1px solid #c084fc', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="sales" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="space-y-6">
              <CustomersManager />
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-6">
              <SuppliersManager />
            </div>
          )}

          {activeTab === 'pengeluaran' && (
            <div className="space-y-6">
              <ExpensesManager />
            </div>
          )}

          {activeTab === 'promo' && (
            <div className="space-y-6">
              <PromoManager />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <SecurityCenter />
            </div>
          )}

          {/* TAB 6: LOBBY STAFF CHAT WITH ALERTS */}
          {activeTab === 'chat' && (
            <div className="max-w-2xl mx-auto flex flex-col justify-between p-6 bg-white dark:bg-[#0a0714] rounded-3xl border border-indigo-100/10 h-[500px] shadow-2xl relative">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
                
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "p-3.5 rounded-2xl text-xs max-w-sm space-y-1 relative",
                      msg.sender.includes('Boss') 
                        ? "bg-violet-600/15 border border-violet-500/25 ml-auto text-indigo-950 dark:text-violet-100" 
                        : msg.sender.includes('Karyawan') || msg.sender.includes('Staff')
                          ? "bg-cyan-500/10 border border-cyan-400/20 text-indigo-950 dark:text-cyan-200" 
                          : "bg-slate-500/5 text-slate-400 text-center mx-auto max-w-full font-mono text-[10px]"
                    )}
                  >
                    <div className="flex justify-between font-black text-[9px] uppercase tracking-wider opacity-65">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="font-semibold leading-relaxed">{msg.text}</p>
                    
                    {msg.file && (
                      <div className="mt-2 text-[9px] p-2 bg-black/10 rounded border border-white/5 truncate font-mono text-cyan-400">
                        📎 FILE: {msg.file}
                      </div>
                    )}
                  </div>
                ))}

              </div>

              {/* Chat Input block */}
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-indigo-100/10 pt-4">
                
                {/* Upload File Simulator details */}
                <button 
                  type="button" 
                  onClick={() => {
                    const mockUrl = 'https://inmarket.com/assets/proof_' + Math.floor(Math.random() * 899 + 100) + '.png';
                    setUploadedFileUrl(mockUrl);
                    playScanSound();
                  }}
                  className={cn(
                    "p-3 rounded-xl border transition shrink-0 cursor-pointer text-slate-400",
                    uploadedFileUrl ? "bg-cyan-500 border-cyan-400 text-white" : "bg-black/5 dark:bg-white/5 border-indigo-100/10"
                  )}
                  title="Simulate image upload link"
                >
                  <Image size={16} />
                </button>

                <input 
                  type="text" 
                  value={chatInp}
                  onChange={e => setChatInp(e.target.value)}
                  placeholder={language === 'id' ? "Ketik pesan divisi di sini..." : "Type staff lobby messages..."} 
                  className="flex-1 p-3.5 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-white" 
                />
                
                <button type="submit" className="px-4.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition cursor-pointer">
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: HOLOGRAPHIC AI PLANNER BOT */}
          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto flex flex-col justify-between p-6 bg-gradient-to-b from-[#11052c]/50 to-slate-950 border border-violet-500/20 rounded-3xl h-[470px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-rose-500/10 rounded-full blur-xl animate-pulse" />
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
                {aiChat.map((chat, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-4 rounded-2xl text-xs leading-relaxed max-w-lg space-y-1.5",
                      chat.role === 'user' 
                        ? "bg-violet-600 text-white border-l-4 border-violet-400 ml-auto" 
                        : "bg-black/40 border border-violet-500/20 text-violet-100"
                    )}
                  >
                    <div className="text-[9px] font-black tracking-widest font-mono text-cyan-400 uppercase">
                      {chat.role === 'user' ? 'USER QUERY CLIENT' : 'INMARKET AI CO-PILOT'}
                    </div>
                    <p className="font-semibold leading-relaxed">{chat.text}</p>
                  </div>
                ))}

                {aiTyping && (
                  <div className="p-4 rounded-2xl bg-black/30 border border-violet-500/10 text-cyan-400 text-xs font-mono tracking-widest animate-pulse">
                    ⚡ AI ANALYZING LEDGERS IN REAL-TIME...
                  </div>
                )}
              </div>

              {/* Bot preset options helper buttons */}
              <div className="flex flex-wrap gap-2 border-t border-violet-500/10 pt-3 pb-2 text-[10px] font-mono">
                <button onClick={() => setAiInp('Analisa kelayakan stok produk saat ini')} className="px-2.5 py-1.5 rounded-full bg-violet-500/10 hover:bg-violet-500/25 text-violet-300 border border-violet-500/20 transition">📊 ANALYZE STOCKS</button>
                <button onClick={() => setAiInp('Prediksi keuntungan bulanan usaha')} className="px-2.5 py-1.5 rounded-full bg-cyan-400/10 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/25 transition">🔮 PROJECT REVENUES</button>
              </div>

              <form onSubmit={handleSendAiQuery} className="flex gap-2">
                <input 
                  type="text" 
                  value={aiInp}
                  onChange={e => setAiInp(e.target.value)}
                  placeholder={language === 'id' ? "Tanya strategi pengembangan UMKM 2026..." : "Ask business scaling methodologies..."} 
                  className="flex-1 p-3.5 bg-black/40 border border-violet-500/25 rounded-xl text-xs font-bold outline-none text-violet-100 placeholder-violet-400/50" 
                />
                <button type="submit" className="px-4.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 text-white rounded-xl transition cursor-pointer font-bold text-xs uppercase tracking-wider">
                  <Bot size={16} />
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* MODAL 1: Digital payment receipt */}
      <AnimatePresence>
        {receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] uppercase font-bold py-1.5 px-4 rounded-full animate-pulse">
              🖨️ PRINTER POS AUTOMATED SUCCESS SHOWER
            </div>
            
            <motion.div 
              initial={{ y: -80, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              className="rounded-[32px] bg-slate-50 border-4 border-[#cbd5e1] text-slate-800 w-full max-w-sm font-sans relative shadow-2xl overflow-hidden"
            >
              {/* Thermal printer slit card top decorator */}
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 h-4 w-full flex items-center justify-around border-b border-black">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1 bg-neutral-900 border-r border-[#454545]" />
                ))}
              </div>

              <div className="p-6 space-y-4">
                
                <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
                  <div className="inline-flex p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full mb-2">
                    <Crown size={24} className="animate-bounce" />
                  </div>
                  <h3 className="text-base font-black uppercase text-indigo-950 font-serif tracking-tight">☕ InMarket Lounge</h3>
                  <p className="text-[10px] opacity-60 font-medium">CLOUD TERMINAL SECURE POS #4821</p>
                  <p className="text-[9px] font-mono opacity-80 mt-1 uppercase text-violet-600">Operator Kasir: {userRole}</p>
                </div>

                <div className="space-y-2.5 text-xs border-b-2 border-dashed border-slate-300 pb-4">
                  <div className="flex justify-between font-mono text-[9px] opacity-55">
                    <span>TX_ID: {receipt.id}</span>
                    <span>{receipt.date}</span>
                  </div>

                  <div className="space-y-1 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200">
                    {receipt.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between font-semibold text-slate-700 text-[11px]">
                        <span>{item.name} x{item.qty}</span>
                        <span>Rp{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-extrabold text-[#7c3aed] text-xs">
                    <span>PAYMENT METHOD</span>
                    <span>{receipt.meth}</span>
                  </div>
                </div>

                {/* DYNAMIC SHADOW QR CODE FOR INSTANT QRIS PAYMENTS */}
                <div className="flex flex-col items-center justify-center p-2.5 border border-slate-200 rounded-2xl bg-white/80 my-2">
                  <div className="w-20 h-20 bg-neutral-900 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden" title="Simulated Live QR Code for POS Receipts">
                    <div className="flex justify-between w-full h-1/4">
                      <div className="w-5 h-5 border-[3px] border-white rounded-sm" />
                      <div className="w-5 h-5 border-[3px] border-white rounded-sm" />
                    </div>
                    <div className="flex justify-between w-full h-1/4 items-end">
                      <div className="w-5 h-5 border-[3px] border-white rounded-sm" />
                      <div className="w-2 h-2 bg-white" />
                    </div>
                    {/* Pixels pattern blocks */}
                    <div className="absolute inset-x-5 inset-y-5 grid grid-cols-5 gap-0.5 pointer-events-none select-none opacity-85">
                      {[...Array(25)].map((_, i) => (
                        <div key={i} className={i % 3 === 0 || i % 5 === 1 ? "bg-white w-full h-full" : "bg-transparent"} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[7.5px] font-mono font-black text-rose-500 mt-1 uppercase tracking-widest">QRIS BANK ACCOUNT SECURE</span>
                </div>

                {/* INTERACTIVE THIN AND THICK CONTINUOUS BARCODE */}
                <div className="space-y-1">
                  <div className="flex justify-center items-center gap-[1px] py-1 h-7 select-none opacity-85">
                    {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 2, 4, 1, 1].map((w, idx) => (
                      <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="font-mono text-[8px] block text-center tracking-widest text-slate-500">{receipt.id.toUpperCase()}</span>
                </div>

                <div className="pt-2 flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">TOTAL BILL PAID</span>
                  <span className="text-lg font-black text-violet-700">Rp{receipt.total.toLocaleString()}</span>
                </div>

                {/* PREMIUM ACTIONS COMPARTMENT */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <button 
                    onClick={() => {
                      let content = `=============================\n`;
                      content += `       INMARKET LOUNGE       \n`;
                      content += `   Premium POS Suite 2026   \n`;
                      content += `=============================\n`;
                      content += `ID TX    : ${receipt.id}\n`;
                      content += `Waktu    : ${receipt.date}\n`;
                      content += `Kasir    : ${userRole}\n`;
                      content += `Metode   : ${receipt.meth}\n`;
                      content += `-----------------------------\n`;
                      receipt.items?.forEach((i: any) => {
                        content += `${i.name} x${i.qty}  Rp ${(i.price * i.qty).toLocaleString()}\n`;
                      });
                      content += `-----------------------------\n`;
                      content += `TOTAL    : Rp ${receipt.total.toLocaleString()}\n`;
                      content += `=============================\n`;
                      content += `    TERIMA KASIH BELANJA!    \n`;
                      content += `=============================\n`;
                      
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `InMarket_Struk_${receipt.id}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                      playSuccessSound();
                    }}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    💾 DOWNLOAD File
                  </button>

                  <button 
                    onClick={() => {
                      let text = `*☕ STRUK BELANJA INMARKET LOUNGE*\n`;
                      text += `*ID Transaksi:* ${receipt.id}\n`;
                      text += `*Waktu Belanja:* ${receipt.date}\n`;
                      text += `*Kasir:* ${userRole}\n`;
                      text += `-----------------------------\n`;
                      receipt.items?.forEach((i: any) => {
                        text += `- ${i.name} (x${i.qty}): Rp ${(i.price * i.qty).toLocaleString()}\n`;
                      });
                      text += `-----------------------------\n`;
                      text += `*Metode Pembayaran:* ${receipt.meth}\n`;
                      text += `*Total Bill:* *Rp ${receipt.total.toLocaleString()}*\n\n`;
                      text += `_Terima kasih sudah singgah di lounge premium kami!_`;
                      
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    💬 SHARE WHATSAPP
                  </button>
                </div>

                <button 
                  onClick={() => setReceipt(null)}
                  className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase transition tracking-widest cursor-pointer shadow-md"
                >
                  🟢 SELESAI & TUTUP
                </button>

              </div>
              
              {/* Thermal printer wavy cut bottom details */}
              <div className="h-2 w-full flex overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-slate-50 rotate-45 transform origin-top-left -translate-y-2 border-r border-[#cbd5e1]" />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Employee Profile Onboarding First Time login popup */}
      <AnimatePresence>
        {showEmployeeProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-[#0b0816]/95 border border-violet-500/30 p-8 rounded-[36px] w-full max-w-md text-white shadow-[0_0_35px_rgba(139,92,246,0.2)] text-center relative overflow-hidden"
            >
              <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-6">
                <div className="inline-flex p-3 bg-violet-600/15 border border-violet-500/25 rounded-2xl text-violet-400 mb-3">
                  <User size={28} className="animate-pulse" />
                </div>
                <h3 className="text-xl font-black">Lengkapi Data Karyawan</h3>
                <p className="text-xs opacity-60 mt-1">Lengkapi administrasi staf internal sebelum memproses terminal kasir & absensi digital.</p>
              </div>

              <form onSubmit={handleEmployeeOnboardSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    value={employeeProfile.fullName}
                    onChange={e => setEmployeeProfile({...employeeProfile, fullName: e.target.value})}
                    placeholder="Masukkan nama lengkap Anda" 
                    className="w-full p-3.5 bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none text-white focus:border-violet-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-wider">URL Foto Swafoto (Profil)</label>
                  <input 
                    type="text" 
                    value={employeeProfile.photoUrl}
                    onChange={e => setEmployeeProfile({...employeeProfile, photoUrl: e.target.value})}
                    placeholder="https://images.unsplash.com/... (Profil URL)" 
                    className="w-full p-3.5 bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none text-white focus:border-violet-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Gender / Jenis Kelamin</label>
                  <select 
                    value={employeeProfile.gender}
                    onChange={e => setEmployeeProfile({...employeeProfile, gender: e.target.value})}
                    className="w-full p-3.5 bg-slate-900 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none text-white focus:border-violet-500"
                  >
                    <option value="Male">Laki-Laki (Male)</option>
                    <option value="Female">Perempuan (Female)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-xs tracking-widest uppercase rounded-2xl hover:brightness-110 transition cursor-pointer"
                >
                  🚀 SIMPAN DATA & MASUK DASHBOARD
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Payout Celebration Salary Rain screen overlay */}
      <AnimatePresence>
        {salaryAnim && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl text-center p-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              className="space-y-6 max-w-sm"
            >
              <div className="inline-flex p-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 rounded-full shadow-[0_0_35px_#f59e0b] animate-bounce">
                <DollarSign size={48} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 tracking-tight flex items-center justify-center gap-2">
                  DISBURSING COIN SALARY...
                </h3>
                <p className="text-xs font-mono text-cyan-400 uppercase mt-2 font-black">TX_LEDGER STATUS: COMPLETED</p>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed mt-3">
                  {language === 'id' 
                    ? 'Sistem mentransfer gaji ke dompet digital karyawan! Musik sukses gembira dimainkan.'
                    : 'The direct deposit is successfully wired. Upbeat golden success bells synthesised.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Edit Product Modal */}
      <AnimatePresence>
        {editingProduct !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05020c]/85 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-b from-[#160c2e]/90 via-[#0a0518]/95 to-[#120726]/90 border border-violet-500/40 p-8 rounded-[32px] w-full max-w-xl text-white shadow-[0_0_50px_rgba(139,92,246,0.3),_0_0_20px_rgba(34,211,238,0.2)] relative overflow-hidden"
            >
              {/* Holographic Glowing Orbits */}
              <div className="absolute top-[-80px] right-[-80px] w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Holographic scanner active line inside dropdown background */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[pulse_1.5s_infinite]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-65" />

              <div className="mb-6 flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 border border-cyan-400/30 rounded-full text-[10px] text-cyan-400 font-mono tracking-wider mb-2 uppercase text-left block w-fit">
                    <Sparkles size={10} className="animate-pulse" /> INVENTORY_UPDATE_MODE
                  </div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-white via-violet-100 to-cyan-300 bg-clip-text text-transparent text-left">
                    {language === 'id' ? 'Edit Rincian Produk' : 'Edit Product Details'}
                  </h3>
                  <p className="text-xs text-violet-300/70 mt-1 text-left">
                    {language === 'id' ? 'Ubah parameter metrik inventaris internal secara real-time.' : 'Modify catalog parameters and inventory metrics in real-time.'}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition text-violet-300 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-5 relative z-10 text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Nama Produk' : 'Product Name'}
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      placeholder="e.g. Matcha Soft Ice Cream" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Price field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Harga Jual (Rp)' : 'Selling Price (Rp)'}
                    </label>
                    <input 
                      required 
                      type="number" 
                      value={editForm.price}
                      onChange={e => setEditForm({...editForm, price: e.target.value})}
                      placeholder="e.g. 25000" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Stock field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Kuantitas Stok' : 'Stock Quantity'}
                    </label>
                    <input 
                      required 
                      type="number" 
                      value={editForm.stock}
                      onChange={e => setEditForm({...editForm, stock: e.target.value})}
                      placeholder="e.g. 50" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Category field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Kategori Produk' : 'Product Category'}
                    </label>
                    <select 
                      value={editForm.category}
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                      className="w-full p-3 bg-[#0d071c] border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200"
                    >
                      <option value="Minuman">Minuman (Drinks)</option>
                      <option value="Makanan">Makanan (Food)</option>
                      <option value="Pastry">Pastry</option>
                      <option value="Lainnya">Lainnya (Other)</option>
                    </select>
                  </div>

                  {/* Barcode field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Kode Barcode' : 'Barcode SKU'}
                    </label>
                    <input 
                      type="text" 
                      value={editForm.barcode}
                      onChange={e => setEditForm({...editForm, barcode: e.target.value})}
                      placeholder="e.g. 89901928" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Supplier field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Pemasok / Supplier' : 'Supplier Source'}
                    </label>
                    <input 
                      type="text" 
                      value={editForm.supplier}
                      onChange={e => setEditForm({...editForm, supplier: e.target.value})}
                      placeholder="e.g. Global Distributor" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Photo Url field */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'URL Foto Produk' : 'Product Image URL'}
                    </label>
                    <input 
                      type="text" 
                      value={editForm.photoUrl}
                      onChange={e => setEditForm({...editForm, photoUrl: e.target.value})}
                      placeholder="https://images.unsplash.com/... (Image URL)" 
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200" 
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                      {language === 'id' ? 'Deskripsi / Keterangan Produk' : 'Product Description'}
                    </label>
                    <textarea 
                      value={editForm.desc}
                      onChange={e => setEditForm({...editForm, desc: e.target.value})}
                      placeholder="Enter description..." 
                      rows={3}
                      className="w-full p-3 bg-slate-950/60 border border-violet-500/20 rounded-xl text-xs font-bold outline-none text-white focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition duration-200 resize-none animate-none" 
                    />
                  </div>

                </div>

                {/* Form Controls */}
                <div className="flex gap-3 justify-end pt-4 border-t border-violet-500/10">
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct(null)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    {language === 'id' ? 'Batal' : 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
                  >
                    ✨ {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ================================================= */}
      {/* CINEMATIC SYSTEM SPLASH SCREEN */}
      {/* ================================================= */}
      <AnimatePresence>
        {systemSplashActive && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-[#03010c] flex flex-col items-center justify-center z-[9999] overflow-hidden"
          >
            {/* Holographic matrix grids */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,36,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,36,0.5)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
            
            <div className="absolute top-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex flex-col items-center max-w-md text-center p-8 z-10"
            >
              {/* Animated Hologram Logo M */}
              <div className="relative mb-6">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-400 blur-lg opacity-75 animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-violet-500/30 flex items-center justify-center font-black text-4xl text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]">
                  M
                  <span className="absolute text-[8px] tracking-widest bottom-1 font-mono text-cyan-400">2026</span>
                </div>
              </div>

              {/* AI Scanning Line effect */}
              <div className="relative w-64 h-1 border border-violet-500/20 bg-violet-950/30 rounded-full overflow-hidden mb-8">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }} 
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee]"
                />
              </div>

              <h1 className="text-2xl font-black tracking-wider text-slate-100 font-sans mb-2">
                INMARKET <span className="text-cyan-400 font-mono">2026</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-widest mb-10 text-center uppercase">
                PROVISIONING INSTANCE SUITE COGNITIVE...
              </p>

              <div className="w-64">
                <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-1.5">
                  <span>MEMUAT PROTOKOL...</span>
                  <span>{splashProgress}%</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    style={{ width: `${splashProgress}%` }} 
                    className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-100 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ================================================= */}
      {/* REAL-TIME NOTIFICATION POPUP PORTAL */}
      {/* ================================================= */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 80, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto bg-[#0a051d]/90 backdrop-blur-md border border-violet-500/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-start gap-4 relative overflow-hidden"
            >
              {/* Cyber side indicator */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                notif.type === 'stok' ? 'bg-amber-400' :
                notif.type === 'transaksi' ? 'bg-cyan-400' :
                notif.type === 'karyawan' ? 'bg-emerald-400' :
                notif.type === 'chat' ? 'bg-violet-400' : 'bg-rose-400'
              }`} />
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-black">
                    {notif.type.toUpperCase()} STATUS
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-100 font-sans leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* ================================================= */}
      {/* TARGET REWARD CONFETTI RAIN OVERLAY */}
      {/* ================================================= */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          {confettiParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: 0 }}
              animate={{ 
                y: '110vh', 
                rotate: 360,
                x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`]
              }}
              transition={{ 
                duration: p.duration, 
                delay: p.delay, 
                ease: "easeOut",
                repeat: Infinity 
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                backgroundColor: p.color,
                boxShadow: '0 0 8px currentColor'
              }}
            />
          ))}
        </div>
      )}


      {/* ================================================= */}
      {/* BADGES DETAILS POPUP DIALOG */}
      {/* ================================================= */}
      <AnimatePresence>
        {activeBadgePopup && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-[#0e0a26]/95 border border-violet-500/30 rounded-3xl p-6 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-400 to-cyan-400" />
              
              <div className="flex justify-center my-6 text-cyan-400 animate-bounce">
                {activeBadgePopup.icon === 'Crown' ? <Crown className="w-14 h-14" /> :
                 activeBadgePopup.icon === 'Award' ? <Award className="w-14 h-14" /> :
                 activeBadgePopup.icon === 'TrendingUp' ? <TrendingUp className="w-14 h-14" /> :
                 activeBadgePopup.icon === 'ClipboardCheck' ? <ClipboardCheck className="w-14 h-14" /> :
                 activeBadgePopup.icon === 'Users' ? <Users className="w-14 h-14" /> : <Sparkles className="w-14 h-14" />}
              </div>

              <span className="px-2.5 py-1 text-[9px] uppercase font-mono tracking-widest text-[#a855f7] bg-violet-505/10 rounded-md border border-violet-500/20">
                Tier: {activeBadgePopup.tier}
              </span>

              <h3 className="text-lg font-black text-slate-100 uppercase mt-4">{activeBadgePopup.name}</h3>
              <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed px-2">
                {activeBadgePopup.desc}
              </p>

              <div className="bg-[#151136]/50 border border-slate-500/15 rounded-xl p-3 mt-5 text-[10px] font-mono text-cyan-400 uppercase">
                {activeBadgePopup.unlocked ? `Unlocked: 🚀 VERIFIED BY KASIR ENGINE` : `Locked: 🔒 REQUIRED ${activeBadgePopup.target} EXP`}
              </div>

              <button
                onClick={() => { playClickSound(); setActiveBadgePopup(null); }}
                className="w-full py-2.5 mt-6 bg-slate-900 border border-slate-500/20 rounded-xl text-xs font-black uppercase text-white hover:bg-slate-800 transition duration-150 cursor-pointer"
              >
                TUTUP JENDELA
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ================================================= */}
      {/* COGNITIVE DATA EXPORTER SLIDER */}
      {/* ================================================= */}
      <AnimatePresence>
        {isExportingActive && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-md bg-[#0a0621]/95 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-cyan-400" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                  <FileSpreadsheet className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest leading-none font-mono">HOLOGRAPHIC EXPORT COMPILATION</h4>
                  <span className="text-[9px] text-cyan-400 uppercase tracking-wider font-mono">COMPILING FILE: {exportProgressName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Mengompilasi enkripsi baris transaksi, menyusun metadata visual ganda, absensi karyawan, dan mengekspor ke dalam ledger berkas lokal...
              </p>

              {/* Loader ticker */}
              <div className="my-6">
                <div className="flex justify-between text-[10px] font-mono text-[#06b6d4] mb-1.5">
                  <span>ENCRYPTING LEDGER SEGMENTS</span>
                  <span>{exportProgressVal}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
                  <div 
                    style={{ width: `${exportProgressVal}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-100"
                  />
                </div>
              </div>

              {exportProgressVal >= 100 ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-xl text-center text-xs text-emerald-400 font-mono">
                    ✅ EXPORT FILE DITERBITKAN DENGAN AMAN!
                  </div>
                  <button
                    onClick={() => { playSuccessSound(); setIsExportingActive(false); }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase text-xs tracking-wider rounded-xl hover:brightness-110 transition duration-200 cursor-pointer"
                  >
                    UNDUH BERKAS SEKARANG
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  ⚠️ Jangan mematikan koneksi ledger selagi ekspor berlangsung...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ================================================= */}
      {/* QUICK FLOATING ACTIONS SHORTCUT ACTION BUTTONS (FAB) */}
      {/* ================================================= */}
      <div className="fixed bottom-6 right-6 z-[9980] flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Expanded micro actions panels */}
        <AnimatePresence>
          {showQuickFAB && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.8 }}
              className="pointer-events-auto flex flex-col gap-2 bg-[#09051d]/90 backdrop-blur-md border border-violet-500/20 p-3 rounded-2xl shadow-xl w-48"
            >
              <h5 className="text-[8px] font-mono font-black text-slate-400 dark:text-cyan-400 tracking-widest uppercase border-b border-white/5 pb-1.5 mb-1.5">INTELLIGENT HUB</h5>
              
              <button 
                onClick={() => { playClickSound(); setShowQuickFAB(false); setActiveTab('kasir'); }}
                className="w-full text-left py-1 px-2 hover:bg-slate-500/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-cyan-400 transition"
              >
                🛒 POS Kasir Cepat
              </button>

              <button 
                onClick={() => { playClickSound(); setShowQuickFAB(false); setActiveTab('stock'); }}
                className="w-full text-left py-1 px-2 hover:bg-slate-500/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-cyan-300 transition"
              >
                📦 Tambah Produk
              </button>

              {userRole === 'Owner' ? (
                <>
                  <button 
                    onClick={() => { playClickSound(); setShowQuickFAB(false); handlePaySalary(); }}
                    className="w-full text-left py-1 px-2 hover:bg-slate-500/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-emerald-400 transition"
                  >
                    💸 Bayar Gaji Staf
                  </button>
                  <button 
                    onClick={() => { playClickSound(); setShowQuickFAB(false); handleGenerateAttendanceCode(); }}
                    className="w-full text-left py-1 px-2 hover:bg-slate-500/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-orange-400 transition"
                  >
                    🔑 Buat Kode Absen
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { playClickSound(); setShowQuickFAB(false); setActiveTab('absensi'); }}
                  className="w-full text-left py-1 px-2 hover:bg-slate-500/10 rounded-lg text-xs font-semibold text-slate-200 hover:text-violet-400 transition"
                >
                  📷 Swafoto CheckIn
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core trigger button */}
        <button
          onClick={() => { playClickSound(); setShowQuickFAB(!showQuickFAB); }}
          className="pointer-events-auto w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer hover:rotate-45 transition duration-300"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>


    </div>
  );
}
