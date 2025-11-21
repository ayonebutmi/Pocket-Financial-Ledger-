
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Calendar, StickyNote } from 'lucide-react';
import { Transaction } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, transactions }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
        setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && isOpen) {
              onClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = transactions.filter(t => {
      if (!query) return false;
      const term = query.toLowerCase();
      return (
          t.merchant.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.amount.toString().includes(term) ||
          t.date.includes(term) ||
          (t.notes && t.notes.toLowerCase().includes(term)) ||
          t.type.toLowerCase().includes(term)
      );
  }).slice(0, 5); // Top 5 results

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Search Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="flex items-center border-b border-slate-100 p-4 bg-white">
            <Search className="text-slate-400 mr-3" size={24} />
            <input 
                ref={inputRef}
                type="text" 
                className="flex-1 text-lg outline-none text-slate-800 placeholder:text-slate-400 bg-transparent h-10"
                placeholder="Search transactions, deposits, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-mono">ESC</span>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="bg-slate-50 min-h-[100px]">
            {query && filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    <Search size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No results found.</p>
                </div>
            )}

            {query && filtered.length > 0 && (
                <div className="p-2 space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Transactions</h4>
                    {filtered.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all group">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                                    {tx.type === 'income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{tx.merchant}</p>
                                    <div className="flex items-center text-xs text-slate-500 space-x-2">
                                        <span className="flex items-center"><Calendar size={10} className="mr-1"/> {tx.date}</span>
                                        {tx.source === 'receipt' && <span className="flex items-center"><StickyNote size={10} className="mr-1"/> Receipt</span>}
                                    </div>
                                </div>
                            </div>
                            <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {!query && (
                <div className="p-8 text-center text-slate-400">
                    <div className="inline-flex space-x-4 mb-4">
                        <div className="flex items-center space-x-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs">
                            <ArrowUpRight size={12} /> <span>Expense</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs">
                            <Calendar size={12} /> <span>Date</span>
                        </div>
                    </div>
                    <p className="text-sm">Type to search across your entire financial history.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
