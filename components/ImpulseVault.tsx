
import React, { useState } from 'react';
import { VaultItem } from '../types';
import { Lock, Unlock, Trash2, ShoppingBag, Plus, Clock, Info } from 'lucide-react';

interface ImpulseVaultProps {
  items: VaultItem[];
}

export const ImpulseVault: React.FC<ImpulseVaultProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const handleAddItem = () => {
      if (!newItemName || !newItemAmount) return;
      
      const today = new Date();
      const unlockDate = new Date();
      unlockDate.setDate(today.getDate() + 30); // 30 Day Rule

      const newItem: VaultItem = {
          id: `v_${Date.now()}`,
          name: newItemName,
          amount: parseFloat(newItemAmount),
          dateAdded: today.toISOString().split('T')[0],
          unlockDate: unlockDate.toISOString().split('T')[0],
          status: 'locked',
          image: '🎁'
      };

      setItems([newItem, ...items]);
      setNewItemName('');
      setNewItemAmount('');
  };

  const handleAbandon = (id: string) => {
      // "Abandoning" means deleting the desire, effectively saving the money.
      if (window.confirm("Delete this item? You are choosing to keep your money instead!")) {
          setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'abandoned' } : i));
      }
  };

  const handlePurchase = (id: string) => {
      // In a real app, this would move to transactions
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'purchased' } : i));
  };

  const getDaysLeft = (dateStr: string) => {
      const today = new Date();
      const unlock = new Date(dateStr);
      const diffTime = Math.abs(unlock.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return today > unlock ? 0 : diffDays;
  };

  const totalSaved = items.filter(i => i.status === 'abandoned').reduce((acc, i) => acc + i.amount, 0);
  const activeVaultValue = items.filter(i => i.status === 'locked').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Impulse Vault</h1>
        <p className="text-slate-500">The 30-Day "Cool Down" Zone. Stop impulse buying, start building wealth.</p>
      </header>

      {/* STATS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 rounded-full blur-2xl opacity-20"></div>
             <p className="text-slate-400 font-medium mb-1">Total Money Saved (Abandoned)</p>
             <h2 className="text-4xl font-bold text-emerald-400">${totalSaved.toLocaleString()}</h2>
             <p className="text-xs text-slate-500 mt-4">Money you almost spent, but didn't.</p>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white rounded-full blur-2xl opacity-20"></div>
             <p className="text-indigo-200 font-medium mb-1">Currently In Vault (Locked)</p>
             <h2 className="text-4xl font-bold">${activeVaultValue.toLocaleString()}</h2>
             <p className="text-xs text-indigo-200 mt-4">Items currently cooling down.</p>
          </div>
      </div>

      {/* ADD ITEM INPUT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">I want to buy...</label>
              <input 
                type="text" 
                placeholder="e.g. New Gaming Console" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
              />
          </div>
          <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost ($)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
              />
          </div>
          <button 
            onClick={handleAddItem}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 mt-2 md:mt-0"
          >
              <Lock size={18} />
              <span>Vault It</span>
          </button>
      </div>

      {/* VAULT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.filter(i => i.status !== 'abandoned' && i.status !== 'purchased').map((item) => {
              const daysLeft = getDaysLeft(item.unlockDate);
              const isUnlocked = daysLeft === 0;

              return (
                  <div key={item.id} className={`rounded-2xl p-6 border transition-all group relative overflow-hidden ${isUnlocked ? 'bg-white border-emerald-200 shadow-md' : 'bg-slate-50 border-slate-200 opacity-90 hover:opacity-100'}`}>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                          {isUnlocked ? (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                  <Unlock size={12} className="mr-1" /> Unlocked
                              </span>
                          ) : (
                              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                  <Clock size={12} className="mr-1" /> {daysLeft} Days Left
                              </span>
                          )}
                      </div>

                      <div className="text-4xl mb-4">{item.image}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                      <p className="text-lg font-medium text-slate-600 mb-6">${item.amount.toFixed(2)}</p>

                      {isUnlocked ? (
                          <div className="flex space-x-2">
                              <button 
                                onClick={() => handlePurchase(item.id)}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              >
                                  <ShoppingBag size={16} className="mr-2" /> Buy Now
                              </button>
                              <button 
                                onClick={() => handleAbandon(item.id)}
                                className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 rounded-lg font-medium text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center"
                              >
                                  <Trash2 size={16} className="mr-2" /> Save Money
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${((30 - daysLeft) / 30) * 100}%` }}></div>
                              </div>
                              <p className="text-xs text-center text-slate-400">Locked until {item.unlockDate}</p>
                              <button 
                                onClick={() => handleAbandon(item.id)}
                                className="w-full border border-slate-300 text-slate-500 py-2 rounded-lg font-medium text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                              >
                                  Cancel & Save Money
                              </button>
                          </div>
                      )}
                  </div>
              );
          })}

          {/* Placeholder for empty state */}
          {items.filter(i => i.status === 'locked' || i.status === 'unlocked').length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl text-slate-400">
                  <Lock size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-slate-600">Vault is Empty</h3>
                  <p>Next time you want to impulse buy, add it here instead.</p>
              </div>
          )}
      </div>
      
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start space-x-3">
          <Info className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
              <h4 className="font-bold text-indigo-900 text-sm">Why 30 Days?</h4>
              <p className="text-indigo-700 text-xs mt-1">Psychological studies show that the dopamine rush of wanting an item fades after 48 hours. A 30-day cooling period ensures you only buy things you truly value, drastically reducing financial waste.</p>
          </div>
      </div>
    </div>
  );
};
