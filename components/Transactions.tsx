
import React, { useState } from 'react';
import { Transaction, UserProfile } from '../types';
import { Search, Filter, Upload, Camera, MoreHorizontal, Loader2, Clock, DollarSign, FileText } from 'lucide-react';
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
      return `${type === 'income' ? '+' : ''}$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-500">View, edit, and reconcile your expenses.</p>
        </div>
        <div className="flex items-center space-x-3">
            {/* Time-Cost Toggle */}
            <button 
                onClick={() => setViewAsTime(!viewAsTime)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm border ${viewAsTime ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-700 border-slate-200'}`}
            >
                {viewAsTime ? <DollarSign size={18} /> : <Clock size={18} />}
                <span>{viewAsTime ? 'View in Dollars' : 'View in Hours'}</span>
            </button>

            <label className="cursor-pointer flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                <Camera size={18} />
                <span className="text-sm font-medium hidden md:inline">Snap Receipt</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-lg shadow-indigo-200">
                + Add Manual
            </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
          <div className="flex-1 flex items-center px-3">
              <Search size={20} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search by merchant, amount, category, or notes..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
              />
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <button className="px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
              <Filter size={20} />
          </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          {isUploading && (
              <div className="p-4 bg-indigo-50 flex items-center justify-center text-indigo-700 animate-pulse border-b border-indigo-100">
                  <Loader2 className="animate-spin mr-2" size={18} /> Processing Receipt OCR...
              </div>
          )}
          
          <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Merchant</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Source</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                             {viewAsTime ? 'Cost (Labor)' : 'Amount'}
                          </th>
                          <th className="px-6 py-4"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filtered.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{tx.date}</td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                  {tx.merchant}
                                  {tx.notes && (
                                      <div className="flex items-center mt-0.5 text-xs text-slate-500 font-normal">
                                          <FileText size={10} className="mr-1" />
                                          <span className="truncate max-w-[150px]">{tx.notes}</span>
                                      </div>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                      {tx.category}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 capitalize">{tx.source}</td>
                              <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {viewAsTime && <Clock size={14} className="inline mr-1 opacity-50" />}
                                  {formatAmount(tx.amount, tx.type)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                                      <MoreHorizontal size={18} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {filtered.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                      <Search size={48} className="mx-auto mb-4 text-slate-300" />
                      <h3 className="text-lg font-semibold text-slate-700">No transactions found</h3>
                      <p className="text-sm text-slate-400">Try searching for a different merchant, amount, or date.</p>
                  </div>
              )}
          </div>
          {viewAsTime && (
              <div className="p-3 bg-purple-50 border-t border-purple-100 text-center text-xs text-purple-600 font-medium">
                  Calculating based on hourly wage of ${USER_PROFILE.hourlyWage}/hr
              </div>
          )}
      </div>
    </div>
  );
};
