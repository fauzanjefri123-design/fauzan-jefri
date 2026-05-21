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
  Crown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { translations } from '../lib/translations';
import ThemeLanguageSwitcher from './ThemeLanguageSwitcher';
import { 
  playScanSound, 
  playSuccessSound, 
  playCashRegisterSound, 
  playSalaryRewardSound 
} from '../lib/sounds';

export default function DashboardPage({ currentView: initialView, onNavigate }: { currentView: string; onNavigate: (view: any) => void }) {
  const { language, theme } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language]?.[key] || key;

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
  const [userRole, setUserRole] = useState<'Owner' | 'Employee'>('Owner');

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
      setCurrentUser({ email: 'sandbox_owner@inmarket.com', displayName: 'Mock Boss' });
      setUserRole('Owner');
    }
  }, []);

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

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard, test: true },
              { id: 'stock', name: t('products'), icon: Package, test: userRole === 'Owner' },
              { id: 'kasir', name: t('kasir'), icon: ShoppingCart, test: true },
              { id: 'absensi', name: t('absensi'), icon: ClipboardCheck, test: true },
              { id: 'grafik', name: t('settings'), icon: BarChart3, test: userRole === 'Owner' },
              { id: 'chat', name: `${t('chat')} (${chatMessages.length})`, icon: MessageCircle, test: true },
              { id: 'ai', name: t('aiAssistant'), icon: Bot, test: true }
            ].map(item => {
              if (!item.test) return null;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all transform hover:translate-x-1",
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-violet-600/15 to-transparent border-l-4 border-violet-500 dark:text-white" 
                      : "opacity-60 hover:opacity-100 dark:text-violet-200"
                  )}
                >
                  <span className="flex items-center space-x-3">
                    <item.icon size={16} /> 
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
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#eaeaff]/30 dark:bg-violet-950/10 border border-violet-500/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="md:col-span-8 space-y-1.5">
                  <h2 className="text-xl md:text-2xl font-black">{language === 'id' ? `Selamat Datang di ${shopData.businessName}` : `Welcome to ${shopData.businessName}`}</h2>
                  <p className="text-xs opacity-75">
                    {language === 'id' 
                      ? 'InMarket siap mempercepat pengelolaan kasir, sinkronisasi inventaris ganda, dan absensi swafoto.' 
                      : 'InMarket coordinates secure checkout registries, double image catalogs, and digital proof metrics.'}
                  </p>
                </div>

                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="text-[9px] font-mono opacity-50 text-right uppercase tracking-widest">{t('storeStatus')}</label>
                  <button 
                    onClick={handleToggleStore}
                    className={cn(
                      "py-3.5 px-6 rounded-2xl font-black text-xs tracking-widest uppercase text-white shadow-xl flex items-center justify-center gap-2 transition-all duration-300",
                      isStoreOpen 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/10 border border-emerald-400/20" 
                        : "bg-gradient-to-r from-red-500 to-rose-600 shadow-rose-500/10 border border-rose-400/20"
                    )}
                  >
                    {isStoreOpen ? t('openStore') : t('closeStore')}
                  </button>
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
            </div>
          )}

          {/* TAB 2: INVENTORY STOCK MANAGER */}
          {activeTab === 'stock' && userRole === 'Owner' && (
            <div className="space-y-6">
              
              {/* Product insert card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0816]/90 border border-indigo-100/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-4">{t('addProduct')}</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input required placeholder={t('name')} value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" />
                  <input required type="number" placeholder={`${t('price')} (Rp)`} value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" />
                  <input required type="number" placeholder={t('stock')} value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" />
                  <select value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} className="p-3 bg-slate-900 text-white border border-indigo-100/10 rounded-xl text-xs font-bold outline-none">
                    <option value="Minuman">Minuman (Drinks)</option>
                    <option value="Makanan">Makanan (Food)</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Lainnya">Lainnya (Other)</option>
                  </select>

                  <input placeholder={language === 'id' ? 'Supplier (Opsional)' : 'Supplier (Optional)'} value={prodForm.supplier} onChange={e => setProdForm({...prodForm, supplier: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" />
                  <input placeholder={language === 'id' ? 'Barcode (Opsional)' : 'Barcode (Optional)'} value={prodForm.barcode} onChange={e => setProdForm({...prodForm, barcode: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none" />
                  <input placeholder={language === 'id' ? 'URL Foto Produk (Opsional)' : 'Product Photo URL (Optional)'} value={prodForm.photoUrl} onChange={e => setProdForm({...prodForm, photoUrl: e.target.value})} className="p-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold col-span-1 md:col-span-2 outline-none" />
                  
                  <button type="submit" className="md:col-span-4 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition cursor-pointer">
                    <Plus size={16} /> {t('addProduct')}
                  </button>
                </form>
              </div>

              {/* Products list grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => {
                  // Determine stock color rules
                  const isRed = p.stock < 5;
                  const isYellow = p.stock >= 5 && p.stock < 15;
                  
                  return (
                    <div 
                      key={p.id} 
                      className={cn(
                        "p-5 rounded-3xl border transition bg-white dark:bg-black/20 text-slate-800 dark:text-violet-100 space-y-4 hover:-translate-y-1 duration-300",
                        isRed ? "border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.12)]" : isYellow ? "border-amber-500" : "border-indigo-100/10"
                      )}
                    >
                      <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-indigo-100/10 group relative">
                        <img 
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop'} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                        />
                        <span className={cn(
                          "absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full text-white font-black",
                          isRed ? "bg-rose-500" : isYellow ? "bg-amber-500" : "bg-emerald-500"
                        )}>
                          {isRed ? (language === 'id' ? 'HAMPIR HABIS' : 'CRITICAL') : isYellow ? (language === 'id' ? 'MENIPIS' : 'LOW') : (language === 'id' ? 'AMAN' : 'SAFE')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black truncate text-indigo-600 dark:text-violet-400">{p.name}</h4>
                        <div className="text-[10px] opacity-40 font-mono mt-0.5">BARCODE: {p.barcode}</div>
                      </div>

                      <div className="flex justify-between items-baseline border-b border-indigo-100/5 pb-2">
                        <span className="text-xs font-extrabold">Rp{p.price.toLocaleString()}</span>
                        <span className="text-[10px] opacity-50 block">{language === 'id' ? `Stok: ${p.stock}` : `Stock: ${p.stock}`}</span>
                      </div>

                      <div className="text-[10px] opacity-60 leading-relaxed font-semibold truncate hover:text-clip">{p.desc}</div>

                      <div className="flex gap-2 items-center">
                        <div className="text-[9px] opacity-40 uppercase truncate max-w-[120px]">SUPPLIER: {p.supplier}</div>
                        <div className="ml-auto flex items-center gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => handleOpenEditModal(p)} 
                            className="text-violet-500 dark:text-violet-400 p-1.5 hover:bg-violet-500/15 rounded-lg transition duration-200"
                            title={language === 'id' ? 'Edit Produk' : 'Edit Product'}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteProduct(p.id)} 
                            className="text-rose-500 p-1.5 hover:bg-rose-500/15 rounded-lg transition duration-200"
                            title={language === 'id' ? 'Hapus Produk' : 'Delete Product'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: POS PAYMENT POINT CASHIER */}
          {activeTab === 'kasir' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Product catalog picker */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-2">{language === 'id' ? 'Katalog Pembelian Kasir' : 'POS Cashier Catalog'}</h3>
                
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 rounded-[28px] bg-white border border-gray-100 text-slate-800 w-full max-w-sm font-sans relative shadow-2xl"
            >
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <Crown className="text-violet-600 mx-auto mb-2" size={32} />
                <h3 className="text-base font-black uppercase text-indigo-950 font-mono">INMARKET RECEIPT</h3>
                <p className="text-[10px] opacity-60">MEMBERSHIP NODE: CLOUD_POS_2026</p>
              </div>

              <div className="py-4 space-y-2.5 text-xs border-b border-dashed border-slate-200">
                <div className="flex justify-between font-mono text-[9px] opacity-50">
                  <span>TX_ID: {receipt.id}</span>
                  <span>DATE: {receipt.date}</span>
                </div>

                <div className="space-y-1">
                  {receipt.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between font-semibold text-slate-700">
                      <span>{item.name} x{item.qty}</span>
                      <span>Rp{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-extrabold text-[#7c3aed]">
                  <span>PAYMENT METHOD</span>
                  <span>{receipt.meth}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-wider opacity-60">TOTAL BILL</span>
                <span className="text-xl font-black text-rose-500">Rp{receipt.total.toLocaleString()}</span>
              </div>

              <button 
                onClick={() => setReceipt(null)}
                className="w-full mt-6 py-3 bg-violet-600 text-white rounded-xl text-xs font-black uppercase hover:bg-violet-700 transition tracking-widest cursor-pointer"
              >
                OKE, LANJUTKAN
              </button>
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

    </div>
  );
}
