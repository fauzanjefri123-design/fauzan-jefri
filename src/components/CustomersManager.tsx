import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Phone, Mail, MapPin, Award, Trash2, Search, Zap, 
  QrCode, Ticket, Percent, Sparkles, Trophy, Plus, ArrowUpRight
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../lib/sounds';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  photoUrl: string;
  totalSpent: number;
  points: number;
  memberLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  shoppingHistory: { id: string; date: string; amount: number; items: string }[];
  cashbackBalance: number;
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Ahmad Fauzi',
    phone: '081234567890',
    email: 'ahmadf@gmail.com',
    address: 'Jl. Sudirman No. 45, Jakarta',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalSpent: 1250000,
    points: 450,
    memberLevel: 'Platinum',
    shoppingHistory: [
      { id: 'h1', date: '2026-05-19 14:20', amount: 450000, items: 'Original Premium Espresso x5, Croissant' },
      { id: 'h2', date: '2026-05-15 09:30', amount: 800000, items: 'Smart Watch 2026 Pro x1' }
    ],
    cashbackBalance: 75000
  },
  {
    id: 'c2',
    name: 'Siti Rahma',
    phone: '085799887766',
    email: 'siti.rahma@yahoo.com',
    address: 'Dago Elok Blok B-4, Bandung',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    totalSpent: 350000,
    points: 120,
    memberLevel: 'Gold',
    shoppingHistory: [
      { id: 'h3', date: '2026-05-18 16:45', amount: 250000, items: 'Matcha Latte x3, Burger x2' },
      { id: 'h4', date: '2026-05-10 11:15', amount: 100000, items: 'Cokelat Lava Meltdown x2' }
    ],
    cashbackBalance: 15000
  },
  {
    id: 'c3',
    name: 'Budi Santoso',
    phone: '081922334455',
    email: 'budi.santoso@outlook.com',
    address: 'Kertajaya Indah No. 12, Surabaya',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalSpent: 85000,
    points: 25,
    memberLevel: 'Bronze',
    shoppingHistory: [
      { id: 'h5', date: '2026-05-12 10:00', amount: 85000, items: 'Matcha Latte x1, Croissant x1' }
    ],
    cashbackBalance: 2000
  }
];

export default function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('inmarket_customers_data');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // New Customer Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [memberLevel, setMemberLevel] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Bronze');
  const [points, setPoints] = useState('0');
  const [totalSpent, setTotalSpent] = useState('0');
  const [cashback, setCashback] = useState('0');

  // Load selected customer by default if empty
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers, selectedCustomer]);

  // Save to localstorage
  const saveCustomers = (data: Customer[]) => {
    setCustomers(data);
    localStorage.setItem('inmarket_customers_data', JSON.stringify(data));
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      name,
      phone,
      email: email || 'customer@inmarket.com',
      address: address || 'N/A',
      photoUrl: photoUrl || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999999)}?w=150&auto=format&fit=crop&q=80`,
      totalSpent: Number(totalSpent) || 0,
      points: Number(points) || 0,
      memberLevel,
      shoppingHistory: [],
      cashbackBalance: Number(cashback) || 0
    };

    const updated = [...customers, newCust];
    saveCustomers(updated);
    setSelectedCustomer(newCust);
    setShowAddForm(false);
    playSuccessSound();

    // Reset Form
    setName(''); setPhone(''); setEmail(''); setAddress(''); setPhotoUrl('');
    setMemberLevel('Bronze'); setPoints('0'); setTotalSpent('0'); setCashback('0');
  };

  const handleDeleteCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Yakin ingin menghapus data pelanggan ini?')) {
      const filtered = customers.filter(c => c.id !== id);
      saveCustomers(filtered);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(filtered.length > 0 ? filtered[0] : null);
      }
      playClickSound();
    }
  };

  const getLevelBadgeColors = (lvl: string) => {
    switch (lvl) {
      case 'Platinum':
        return 'from-cyan-400 to-indigo-500 bg-clip-text text-transparent shadow-cyan-500/20 shadow-glow border-cyan-400/50';
      case 'Gold':
        return 'from-amber-400 to-yellow-600 bg-clip-text text-transparent shadow-amber-500/20 shadow-glow border-amber-400/50';
      case 'Silver':
        return 'from-slate-300 to-slate-400 text-slate-200 border-slate-350/50';
      case 'Bronze':
      default:
        return 'from-orange-500 to-orange-700 text-orange-400 border-orange-500/40';
    }
  };

  const getLoyaltyAIRecommendation = (c: Customer) => {
    const isLoyal = c.totalSpent > 1000000 || c.points >= 300 || c.shoppingHistory.length > 3;
    if (isLoyal) {
      return {
        loyal: true,
        text: "Pelanggan ini termasuk pelanggan loyal. Berikan voucher khusus atau prioritas antrean pelayanan.",
        badge: "👑 SETIA / LOYAL"
      };
    } else {
      return {
        loyal: false,
        text: "Pelanggan baru atau reguler. Berikan promo cashback member hari ini untuk meningkatkan retensi belanja.",
        badge: "⚡ REGULER"
      };
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="text-violet-500" /> Database Pelanggan & Loyalty Program
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola CRM terintegrasi, QR Keanggotaan, Cashback Wallet, dan Analisis Kesetiaan AI.
          </p>
        </div>
        <button 
          onClick={() => { playClickSound(); setShowAddForm(true); }}
          className="py-2.5 px-4 bg-violet-600 hover:bg-violet-700 rounded-xl text-xs font-black uppercase text-white flex items-center gap-2 transition duration-200 shadow-md transform hover:-translate-y-0.5"
        >
          <UserPlus size={16} /> Tambah Pelanggan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Customer List Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nama, email, atau HP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-indigo-100/10 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-white"
            />
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-[#0c0817]/60 border border-indigo-100/10 max-h-[500px] overflow-y-auto space-y-2 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs opacity-50">Tidak ada data pelanggan.</div>
            ) : (
              filtered.map(c => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { playClickSound(); setSelectedCustomer(c); }}
                    className={`p-3 rounded-2xl border transition duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? "bg-violet-600/15 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-slate-900 dark:text-white" 
                        : "bg-transparent border-indigo-100/5 text-slate-600 dark:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.photoUrl} 
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover border border-violet-500/20"
                      />
                      <div>
                        <h4 className="text-xs font-bold">{c.name}</h4>
                        <span className="text-[9px] opacity-40 font-mono block mt-0.5">{c.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-full font-bold border ${getLevelBadgeColors(c.memberLevel)}`}>
                        {c.memberLevel}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteCustomer(c.id, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Holographic Profiling */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="p-6 rounded-3xl bg-[#090615]/80 text-white border border-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.15)] relative overflow-hidden space-y-6">
              {/* Decorative Hologram grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,10,36,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,10,36,0.15)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
              
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-between relative z-10 border-b border-white/5 pb-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="relative">
                    <img 
                      src={selectedCustomer.photoUrl} 
                      alt={selectedCustomer.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-1.5 border border-slate-950 text-white">
                      <Award size={10} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">{selectedCustomer.name}</h3>
                    <p className="text-[10px] opacity-50 font-mono mt-0.5">{selectedCustomer.email}</p>
                    <p className="text-[10px] opacity-65 flex items-center gap-1.5 mt-1 sm:justify-start justify-center">
                      <MapPin size={10} className="text-rose-400" /> {selectedCustomer.address}
                    </p>
                  </div>
                </div>

                {/* Cyber badge rating */}
                <div className="text-center sm:text-right shrink-0">
                  <span className={`text-[10px] tracking-widest uppercase font-black px-4 py-1 rounded-full border bg-zinc-950/80 block ${getLevelBadgeColors(selectedCustomer.memberLevel)}`}>
                    🛡️ {selectedCustomer.memberLevel} MEMBER
                  </span>
                  <span className="text-[9px] opacity-40 mt-1 block font-mono">ID: {selectedCustomer.id}</span>
                </div>
              </div>

              {/* CRM Stats widget row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/30 transition duration-300">
                  <span className="text-[9px] opacity-50 uppercase block font-mono">TOTAL TRANSAKSI</span>
                  <strong className="text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-300">
                    Rp{selectedCustomer.totalSpent.toLocaleString()}
                  </strong>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/30 transition duration-300">
                  <span className="text-[9px] opacity-50 uppercase block font-mono">LOYALTY POINTS</span>
                  <strong className="text-sm tracking-wide text-emerald-400 flex items-center gap-1">
                    <Trophy size={14} /> {selectedCustomer.points} PTS
                  </strong>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-500/30 transition duration-300">
                  <span className="text-[9px] opacity-50 uppercase block font-mono">CASHBACK BALANCE</span>
                  <strong className="text-sm tracking-wide text-cyan-400">
                    Rp{selectedCustomer.cashbackBalance.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Holographic loyalty & QR system */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-violet-500/20 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-violet-400 flex items-center gap-1.5">
                    <QrCode size={12} /> MEMBER QR / VOUCHER
                  </h4>
                  <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="bg-white p-1 rounded">
                      {/* Placeholder simulation QR code */}
                      <div className="w-14 h-14 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black rounded flex items-center justify-center text-white text-[7px] font-mono leading-none font-bold">
                        [IN_QR_C]
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-300 block font-bold">Member QR-Key</span>
                      <span className="text-[8px] font-mono text-zinc-500 block">SCAN_VAL: CRM-{selectedCustomer.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[8px] text-pink-400 font-bold block flex items-center gap-0.5">
                        <Ticket size={8} /> Cashback: 5% (Diskon Member)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-violet-500/20 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-violet-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> AI CO-PILOT ANALYSIS
                  </h4>
                  <div className="bg-violet-950/20 border border-violet-400/20 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-zinc-400">Kredibilitas Profil</span>
                      <span className="text-[9px] font-mono font-bold text-violet-300">
                        {getLoyaltyAIRecommendation(selectedCustomer).badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-normal italic font-semibold">
                      "{getLoyaltyAIRecommendation(selectedCustomer).text}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopping History tracking */}
              <div className="space-y-3 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-violet-400">RIWAYAT BELANJA REALTIME</h4>
                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {selectedCustomer.shoppingHistory.length === 0 ? (
                    <div className="py-4 text-center text-[10px] opacity-40 italic">Belum ada transaksi terekam.</div>
                  ) : (
                    selectedCustomer.shoppingHistory.map(hist => (
                      <div 
                        key={hist.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:bg-white/10 transition"
                      >
                        <div>
                          <p className="font-bold text-zinc-200 truncate max-w-[200px]">{hist.items}</p>
                          <span className="text-[9px] opacity-40 font-mono block mt-0.5">{hist.date}</span>
                        </div>
                        <span className="font-extrabold text-[#dfb857] shrink-0">Rp{hist.amount.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border border-indigo-100/10 rounded-3xl bg-white/5 text-slate-400">
              <Users size={32} className="animate-pulse mb-3" />
              <p className="text-xs">Pilih pelanggan untuk melihat deatils holographic profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Add Customer Drawer */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 bg-[#090615]/95 rounded-3xl border border-violet-500/30 text-white space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-violet-400">Tambah Pelanggan Baru</h3>
                <button 
                  onClick={() => { playClickSound(); setShowAddForm(false); }}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">NAMA PELANGGAN *</label>
                  <input 
                    required 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Fauzan Jefri"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">NOMOR HP *</label>
                  <input 
                    required 
                    type="text" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0812xxxxxx"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">EMAIL ELIT</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="fauzanjefri123@gmail.com"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">ALAMAT LENGKAP</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Alamat penyerahan/pengiriman"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">MEMBER LEVEL</label>
                  <select 
                    value={memberLevel}
                    onChange={e => setMemberLevel(e.target.value as any)}
                    className="w-full p-3 bg-[#0d0721] border border-white/10 rounded-xl text-sm outline-none text-white focus:border-violet-500"
                  >
                    <option value="Bronze">Bronze (Diskon 0%)</option>
                    <option value="Silver">Silver (Diskon 2%)</option>
                    <option value="Gold">Gold (Diskon 5%)</option>
                    <option value="Platinum">Platinum (Diskon 8%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">INITIAL REWARD POINTS</label>
                  <input 
                    type="number" 
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">TOTAL TRANS (Rp)</label>
                  <input 
                    type="number" 
                    value={totalSpent}
                    onChange={e => setTotalSpent(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">INITIAL CASHBACK (Rp)</label>
                  <input 
                    type="number" 
                    value={cashback}
                    onChange={e => setCashback(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white"
                  />
                </div>

                <button 
                  type="submit"
                  className="col-span-2 py-3.5 bg-violet-600 hover:bg-violet-700 rounded-xl font-bold text-xs uppercase"
                >
                  🚀 SIMPAN PELANGGAN KE GRID CRM
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
