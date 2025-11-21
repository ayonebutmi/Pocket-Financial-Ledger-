
import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, Filter, Upload, Camera, MoreHorizontal, Loader2, Clock, DollarSign, StickyNote, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { USER_PROFILE } from '../constants';

interface TransactionsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, setTransactions }) => {
  const [filter, setFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewAsTime, setViewAsTime] = useState(false); // Toggle state

  // Enhanced Filter Logic
  const filtered = transactions.filter(t => {
    const term = filter.toLowerCase();
    return (
        t.merchant.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term) ||
        t.amount.toString().includes(term) ||
        t.date.includes(term) ||
        (t.notes && t.notes.toLowerCase().includes(term)) ||
        t.type.toLowerCase().includes(term) // Allows searching for "income" or "expense"
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          // Simulate processing delay
          setTimeout(() => {
              setIsUploading(false);
              const newTx: Transaction = {
                  id: `new_${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  merchant: 'Uploaded Receipt Inc.',
                  amount: 88.50,
                  category: 'Uncategorized',
                  type: 'expense',
                  status: 'pending',
                  source: 'receipt',
                  notes: 'Parsed via OCR'
              };
              setTransactions(prev => [newTx, ...prev]);
              alert("Receipt uploaded and parsed! Added to top of list.");
          }, 2000);
      }
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
      if (viewAsTime) {
          const hours = Math.abs(amount) / USER_PROFILE.hourlyWage;
          return `${hours.toFixed(1)} hrs`;
      }
      return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="space-y-8 pb-20 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500">Track spending, upload receipts, and view time-cost.</p>
        </div>
        <div className="flex items-center space-x-3">
            {/* Time vs Money Toggle */}
            <button 
                onClick={() => setViewAsTime(!viewAsTime)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${viewAsTime ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="Toggle between Currency and Life Energy (Hours worked)"
            >
                {viewAsTime ? <Clock size={16} /> : <DollarSign size={16} />}
                <span>{viewAsTime ? 'Time Cost' : 'Currency'}</span>
            </button>

            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center space-x-2 transition-colors">
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                <span>{isUploading ? 'Scanning...' : 'Scan Receipt'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
            </label>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex gap-4 flex-shrink-0">
              <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search merchant, category, or amount..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
                  <Filter size={20} />
              </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 p-2">
              {filtered.length > 0 ? (
                  <div className="space-y-2">
                      {filtered.map(tx => (
                          <div key={tx.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                              <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                      {tx.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900">{tx.merchant}</h4>
                                      <div className="flex items-center text-xs text-slate-500 space-x-2">
                                          <span>{tx.date}</span>
                                          <span>•</span>
                                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{tx.category}</span>
                                          {tx.source === 'receipt' && (
                                              <span className="flex items-center text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                                                  <StickyNote size={10} className="mr-1" /> Receipt
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>

                              <div className="text-right">
                                  <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                      {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, tx.type)}
                                  </div>
                                  <div className="text-xs text-slate-400 capitalize">{tx.status}</div>
                              </div>
                              
                              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all">
                                  <MoreHorizontal size={18} />
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>No transactions found matching "{filter}"</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
