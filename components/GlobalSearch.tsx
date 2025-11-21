
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Calendar, FileText } from 'lucide-react';
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
          // Cmd+K or Ctrl+K trigger (handled in App usually, but good backup)
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
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>
        </div>

        {query && (
            <div className="bg-slate-50 max-h-[400px] overflow-y-auto">
                {filtered.length > 0 ? (
                    <div className="py-2">
                        <h4 className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Top Results</h4>
                        {filtered.map(tx => (
                            <div key={tx.id} className="px-4 py-3 hover:bg-white hover:shadow-sm border-y border-transparent hover:border-slate-100 transition-all cursor-pointer group flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {tx.type === 'income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{tx.merchant}</p>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                                            <span className="flex items-center"><Calendar size={10} className="mr-1" />{tx.date}</span>
                                            <span>•</span>
                                            <span>{tx.category}</span>
                                            {tx.notes && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center text-indigo-500"><FileText size={10} className="mr-1" /> Note</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {tx.type === 'income' ? '+' : ''}${tx.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        <Search size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No matching transactions found.</p>
                    </div>
                )}
            </div>
        )}

        {!query && (
            <div className="p-4 bg-slate-50 text-xs text-slate-500 flex justify-between">
                <span>Try searching for "Dinner", "Client", or "$150"</span>
                <span>Pro Tip: You can search Voice Notes too.</span>
            </div>
        )}
      </div>
    </div>
  );
};
