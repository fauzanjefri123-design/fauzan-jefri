import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { History, Search, Calendar } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { translations } from '../lib/translations';

export default function SalesHistory() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { language } = useThemeLanguage();
  const t = (key: keyof typeof translations.id) => translations[language][key];
  
  useEffect(() => {
    fetchSales();
  }, [auth.currentUser]);

  const fetchSales = async () => {
    try {
      if (!auth.currentUser) return;
      const q = query(collection(db, 'sales'), where('ownerId', '==', auth.currentUser.uid), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      if (snapshot && snapshot.docs) {
        setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (e) {
      console.warn("Error fetching sales history:", e);
      setSales([]);
    }
  };

  const filteredSales = sales.filter(s => {
    const pName = s.productName || s.name || "";
    return pName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('salesHistory')}</h2>
        <div className="relative">
            <Search className="absolute left-3 top-3 opacity-50" size={18}/>
            <input 
                placeholder={t('searchProductPh')} 
                className="p-3 pl-10 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.length === 0 ? (
          <div className="col-span-full p-12 text-center opacity-50 text-sm font-medium">
            {language === 'id' ? 'Tidak ada data transaksi penjualan.' : 'No sales transaction records found.'}
          </div>
        ) : (
          filteredSales.map(s => (
              <div key={s.id} className="holo-card p-6 space-y-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-3xl">
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-violet-400">{s.productName || s.name || 'Custom Item'}</h3>
                      <span className="text-sm opacity-50">
                        {s.date ? new Date(s.date).toLocaleDateString() : '-'}
                      </span>
                  </div>
                  <p className="text-lg font-bold">Rp {(s.total || 0).toLocaleString()}</p>
                  <div className="text-sm opacity-60">
                    {t('qty')}: {s.quantity || 1} x Rp {(s.pricePerUnit || s.total || 0).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-40 italic">
                    {t('cashierLabel')} {s.cashier || 'System'}
                  </div>
              </div>
          ))
        )}
      </div>
    </div>
  );
}
