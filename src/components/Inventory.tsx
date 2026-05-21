import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Package, Plus, Trash2, Edit2, Search, Filter, AlertCircle, ShoppingCart, History, Upload } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { translations } from '../lib/translations';
import SalesHistory from './SalesHistory';
import Papa from 'papaparse';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [view, setView] = useState<'inventory' | 'sales'>('inventory');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { language, theme } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language][key];
  
  useEffect(() => {
    fetchProducts();
  }, [auth.currentUser]);

  const fetchProducts = async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'products'), where('ownerId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addProduct = async () => {
    if (!auth.currentUser || !name || !price || !stock) return;
    await addDoc(collection(db, 'products'), {
      ownerId: auth.currentUser.uid,
      name,
      price: Number(price),
      stock: Number(stock),
      category: category || 'Uncategorized',
      createdAt: new Date().toISOString()
    });
    fetchProducts();
    setName(''); setPrice(''); setStock(''); setCategory('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const data of results.data as any[]) {
          await addDoc(collection(db, 'products'), {
            ownerId: auth.currentUser!.uid,
            name: data.name,
            price: Number(data.price),
            stock: Number(data.stock),
            category: data.category || 'Uncategorized',
            createdAt: new Date().toISOString()
          });
        }
        fetchProducts();
      }
    });
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !quantity) return;
    const qty = Number(quantity);
    const newStock = modalType === 'buy' ? selectedProduct.stock + qty : Math.max(0, selectedProduct.stock - qty);
    
    await updateDoc(doc(db, 'products', selectedProduct.id), { stock: newStock });
    
    if (modalType === 'sell') {
        await addDoc(collection(db, 'sales'), {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: qty,
            pricePerUnit: selectedProduct.price,
            total: qty * selectedProduct.price,
            date: new Date().toISOString(),
            ownerId: auth.currentUser?.uid,
            cashier: auth.currentUser?.email || 'N/A'
        });
    }
    
    fetchProducts();
    setIsModalOpen(false);
    setQuantity('');
  };

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10);

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (filterCategory === 'All' || p.category === filterCategory)
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Habis', color: 'bg-red-500' };
    if (stock < 10) return { label: 'Menipis', color: 'bg-yellow-500' };
    return { label: 'Aman', color: 'bg-emerald-500' };
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
         <button onClick={() => setView('inventory')} className={`px-4 py-2 rounded-xl flex items-center gap-2 ${view === 'inventory' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-white/5 hover:bg-violet-600/20'}`}>
             <Package size={18}/> Inventory
         </button>
         <button onClick={() => setView('sales')} className={`px-4 py-2 rounded-xl flex items-center gap-2 ${view === 'sales' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-white/5 hover:bg-violet-600/20'}`}>
             <History size={18}/> Sales History
         </button>
      </div>

      {view === 'inventory' ? (
          <>
            {lowStockProducts.length > 0 && (
                <div className="mb-8 p-6 bg-red-950/20 border border-red-500/50 rounded-3xl backdrop-blur-xl flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                    <div>
                        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2"><AlertCircle size={20}/> Stock Hampir Habis!</h3>
                        <p className="text-sm opacity-80">{lowStockProducts.map(p => p.name).join(', ')} perlu segera diisi ulang.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold">Cek Stok</button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold tracking-tight">{t('inventory')}</h2>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 opacity-50" size={18}/>
                        <input placeholder={t('search')} className="w-full p-3 pl-10 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors duration-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors duration-500"><Filter size={18}/></button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 holo-card p-6 transition-colors duration-500">
                <input placeholder={t('name')} className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors duration-500" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder={t('price')} type="number" className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors duration-500" value={price} onChange={e => setPrice(e.target.value)} />
                <input placeholder={t('stock')} type="number" className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors duration-500" value={stock} onChange={e => setStock(e.target.value)} />
                <button onClick={addProduct} className="col-span-1 md:col-span-4 px-6 py-3 bg-violet-600 rounded-xl hover:bg-violet-700 font-bold flex items-center justify-center gap-2">
                    <Plus size={18}/> {t('addProduct')}
                </button>
                <div className="col-span-1 md:col-span-4">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full px-6 py-3 bg-gray-200 dark:bg-white/10 rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 font-bold flex items-center justify-center gap-2">
                        <Upload size={18}/> Bulk Import (CSV)
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => {
                    const status = getStockStatus(p.stock);
                    return (
                        <div key={p.id} className={`holo-card p-6 space-y-4 hover:border-violet-500/50 transition bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 ${p.stock < 10 && p.stock > 0 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : p.stock === 0 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
                            <div className="w-full h-40 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                                <Package size={48} className="opacity-20" />
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-violet-400">{p.name}</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full text-white ${status.color}`}>{status.label}</span>
                            </div>
                            <p className="text-2xl font-bold">Rp{p.price.toLocaleString()}</p>
                            <div className="flex justify-between text-sm opacity-60">
                                <span>Stock: {p.stock}</span>
                                <span>{p.category}</span>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button 
                                  onClick={() => { setSelectedProduct(p); setModalType('buy'); setIsModalOpen(true); }}
                                  className="flex-1 py-2 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <Plus size={16}/> Buy
                                </button>
                                <button 
                                  onClick={() => { setSelectedProduct(p); setModalType('sell'); setIsModalOpen(true); }}
                                  className="flex-1 py-2 bg-rose-500/20 text-rose-500 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={16}/> Sell
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center gap-2"><Edit2 size={16}/> Edit</button>
                                <button onClick={async () => { await deleteDoc(doc(db, 'products', p.id)); fetchProducts(); }} className="px-3 py-2 bg-red-950/20 text-red-400 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    )
                })}
            </div>
          </>
      ) : (
          <SalesHistory />
      )}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#110B1B] p-6 rounded-3xl w-full max-w-sm border border-gray-200 dark:border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 capitalize">{modalType} {selectedProduct?.name}</h3>
                    <input 
                        type="number" 
                        placeholder="Quantity" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full p-3 bg-gray-100 dark:bg-white/5 rounded-xl mb-4"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-200 dark:bg-white/10 rounded-xl">Cancel</button>
                        <button onClick={handleUpdateStock} className="flex-1 py-3 bg-violet-600 rounded-xl text-white">Confirm</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
