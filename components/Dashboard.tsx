
import React, { useState } from 'react';
import { Account, Transaction, BudgetCategory, Nudge, Subscription, CategoryType } from '../types';
import { INITIAL_SUBSCRIPTIONS } from '../constants';
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Wallet, Zap, Trophy, X, Repeat, AlertOctagon, Sun, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: BudgetCategory[];
  nudges: Nudge[];
}

export const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, budgets, nudges }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [ghostMode, setGhostMode] = useState(false); // Privacy blur
  
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const monthlySpend = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const budgetUtilization = budgets.reduce((acc, b) => acc + (b.spent / b.allocated), 0) / budgets.length * 100;

  // Calculate Total Monthly Subscriptions
  const monthlySubCost = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  // Prepare chart data - Spending by category
  const chartData = budgets.map(b => ({
    name: b.name,
    spent: b.spent,
    allocated: b.allocated
  }));

  const handleCancelSub = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? {...s, status: 'canceling'} : s));
  };

  // Daily Pulse Calculation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  
  const lifestyleBudgets = budgets.filter(b => b.type === CategoryType.LIFESTYLE || b.type === CategoryType.ESSENTIAL);
  const totalAllocated = lifestyleBudgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = lifestyleBudgets.reduce((acc, b) => acc + b.spent, 0);
  const remainingBudget = Math.max(0, totalAllocated - totalSpent);
  const dailySafeSpend = remainingBudget / daysRemaining;

  const displayMoney = (amount: number) => {
      if (ghostMode) return '••••••';
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-500">Welcome back. Here's your financial health today.</p>
        </div>
        <button 
            onClick={() => setGhostMode(!ghostMode)}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Toggle Ghost Mode (Privacy)"
        >
            {ghostMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </header>

      {/* DAILY PULSE WIDGET */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Sun className="text-yellow-200" size={32} />
                </div>
                <div>
                    <p className="text-orange-100 font-medium text-sm uppercase tracking-wider">Daily Pulse</p>
                    <h2 className="text-4xl font-bold">${ghostMode ? '•••' : dailySafeSpend.toFixed(2)}</h2>
                    <p className="text-orange-50 text-sm mt-1">Safe to spend today to hit your monthly goals.</p>
                </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full md:w-auto min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Month Progress</span>
                    <span className="text-sm font-bold">{Math.round((today.getDate() / daysInMonth) * 100)}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                    <div className="bg-white h-2 rounded-full" style={{ width: `${(today.getDate() / daysInMonth) * 100}%` }}></div>
                </div>
                <div className="text-xs text-white/80 flex items-center justify-between">
                   <span>Remaining Budget:</span>
                   <span className="font-bold">${ghostMode ? '••••' : remainingBudget.toLocaleString()}</span>
                </div>
            </div>
         </div>
      </div>

      {/* SMART NUDGES SECTION */}
      {nudges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nudges.map(nudge => (
            <div key={nudge.id} className="bg-white rounded-2xl p-5 text-slate-800 shadow-sm border border-slate-200 flex items-start justify-between relative overflow-hidden">
               <div className="z-10">
                  <div className="flex items-center space-x-2 mb-2">
                     {nudge.type === 'negotiation' && <Zap className="text-indigo-500" size={18} />}
                     {nudge.type === 'streak' && <Trophy className="text-amber-500" size={18} />}
                     <span className="font-bold text-sm uppercase tracking-wider text-slate-500">{nudge.title}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium mb-3">{nudge.description}</p>
                  <div className="flex items-center space-x-3">
                     <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                        {nudge.actionLabel}
                     </button>
                     {nudge.impact && (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                           {nudge.impact}
                        </span>
                     )}
                  </div>
               </div>
               <button className="text-slate-300 hover:text-slate-500 z-10">
                  <X size={18} />
               </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Net Worth</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${displayMoney(totalBalance)}</h3>
            <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
              <ArrowUpRight size={14} className="mr-1" /> +2.5% vs last month
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Spend</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${displayMoney(monthlySpend)}</h3>
            <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
              <ArrowUpRight size={14} className="mr-1" /> +12% vs average
            </span>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Budget Health</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{Math.round(100 - budgetUtilization)}% Remaining</h3>
            <span className="text-xs text-slate-400 mt-2 block">{daysRemaining} days left in period</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION GUARD */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
              <div>
                  <div className="flex items-center space-x-2 mb-1">
                      <Repeat size={18} className="text-purple-400" />
                      <h3 className="font-bold text-lg">Subscription Guard</h3>
                  </div>
                  <p className="text-slate-400 text-sm">You are spending <span className="text-white font-bold">${displayMoney(monthlySubCost)}/mo</span> on subscriptions.</p>
              </div>
              <div className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {subscriptions.length} Active
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {subscriptions.map(sub => (
                  <div key={sub.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
                              {sub.name[0]}
                          </div>
                          <span className="font-bold text-lg">${ghostMode ? '••' : sub.amount}</span>
                      </div>
                      <p className="font-medium text-sm truncate mb-1">{sub.name}</p>
                      <p className="text-xs text-slate-500 mb-3">Renews {sub.nextDate}</p>
                      {sub.status === 'active' ? (
                          <button 
                              onClick={() => handleCancelSub(sub.id)}
                              className="w-full py-1.5 bg-slate-700 hover:bg-red-900/30 hover:text-red-400 text-slate-300 text-xs font-medium rounded transition-colors">
                              Cancel Sub
                          </button>
                      ) : (
                          <div className="w-full py-1.5 bg-red-900/20 text-red-400 text-xs font-medium rounded text-center flex items-center justify-center">
                              <AlertOctagon size={12} className="mr-1" /> Canceling...
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Spending vs Budget</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.spent > entry.allocated ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
              <Bar dataKey="allocated" name="Budget Limit" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                {tx.type === 'income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{tx.merchant}</p>
                                <p className="text-xs text-slate-500">{tx.category} • {tx.date}</p>
                            </div>
                        </div>
                        <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === 'income' ? '+' : '-'}${displayMoney(Math.abs(tx.amount))}
                        </span>
                    </div>
                ))}
                <button className="w-full py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    View All Transactions
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
