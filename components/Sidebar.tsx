


import React from 'react';
import { LayoutDashboard, Receipt, PieChart, TrendingUp, Settings, Wallet, LogOut, Landmark, FileText, LineChart, Trophy, Sparkles, Users, ShoppingBag, Search } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shop_mode', label: 'Shop Mode', icon: ShoppingBag },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'dream_vault', label: 'Dream Vault', icon: Sparkles },
    { id: 'squad_split', label: 'Squad Split', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'planning', label: 'Retirement & Strategy', icon: LineChart },
    { id: 'wealth', label: 'Wealth & Cards', icon: Landmark },
    { id: 'tax', label: 'Taxes', icon: FileText },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-full border-r border-slate-800">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-xl">
          P
        </div>
        <span className="text-xl font-bold tracking-tight">Pocket Ledger</span>
      </div>

      <div className="px-4 mb-2">
        <button 
            onClick={onOpenSearch}
            className="w-full flex items-center space-x-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
        >
            <Search size={18} />
            <span className="font-medium text-sm">Quick Find...</span>
            <span className="ml-auto text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">⌘K</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl transition-colors mt-1">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};