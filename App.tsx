import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budgeting } from './components/Budgeting';
import { Forecast } from './components/Forecast';
import { AIAssistant } from './components/AIAssistant';
import { Wealth } from './components/Wealth';
import { TaxCenter } from './components/TaxCenter';
import { RetirementPlanner } from './components/RetirementPlanner';
import { Challenges } from './components/Challenges'; 
import { DreamVault } from './components/DreamVault'; 
import { SquadSplit } from './components/SquadSplit';
import { ShopMode } from './components/ShopMode';
import { GlobalSearch } from './components/GlobalSearch'; 
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  FORECAST_ITEMS, 
  INITIAL_CARDS, 
  INITIAL_TREASURY, 
  INITIAL_TAX_PROFILE, 
  INITIAL_NUDGES,
  INITIAL_CREDIT_SCORE,
  INITIAL_GOALS,
  INITIAL_USER_LEVEL,
  INITIAL_CHALLENGES,
  INITIAL_BADGES,
  INITIAL_DREAM_GOALS,
  INITIAL_SQUAD_BILLS,
  USER_PROFILE,
  INITIAL_RETIREMENT_PROFILE
} from './constants';
import { Transaction } from './types';
import { Bot, Mic, Search } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [autoStartVoice, setAutoStartVoice] = useState(false); 
  
  // Global State
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [treasury, setTreasury] = useState(INITIAL_TREASURY);

  // Toggle AI Panel
  const toggleAI = () => {
      setIsAIOpen(!isAIOpen);
      if (isAIOpen) setAutoStartVoice(false); // Reset auto-start when closing or toggling manually
  };

  const triggerOmniVoice = () => {
      setIsAIOpen(true);
      setAutoStartVoice(true);
  };

  const handleAddTransaction = (newTx: Transaction) => {
      setTransactions(prev => [newTx, ...prev]);
  };

  // Keyboard Shortcut for Search
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setIsSearchOpen(true);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate Monthly Spend for Retirement Planner
  const monthlySpend = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

  // Main content router
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard accounts={accounts} transactions={transactions} budgets={budgets} nudges={INITIAL_NUDGES} />;
      case 'shop_mode':
        return <ShopMode hourlyWage={USER_PROFILE.hourlyWage} dreamGoal={INITIAL_DREAM_GOALS[0]} />;
      case 'challenges':
        return <Challenges userLevel={INITIAL_USER_LEVEL} challenges={INITIAL_CHALLENGES} badges={INITIAL_BADGES} />;
      case 'dream_vault':
        return <DreamVault goals={INITIAL_DREAM_GOALS} />;
      case 'squad_split':
        return <SquadSplit bills={INITIAL_SQUAD_BILLS} />;
      case 'transactions':
        return <Transactions transactions={transactions} setTransactions={setTransactions} />;
      case 'budget':
        return <Budgeting budgets={budgets} accounts={accounts} />;
      case 'planning': 
        return <RetirementPlanner profile={INITIAL_RETIREMENT_PROFILE} creditScore={INITIAL_CREDIT_SCORE} accounts={accounts} monthlySpend={monthlySpend} />;
      case 'forecast':
        return <Forecast items={FORECAST_ITEMS} />;
      case 'wealth':
        return <Wealth cards={cards} treasury={treasury} />;
      case 'tax':
        return <TaxCenter profile={INITIAL_TAX_PROFILE} />;
      default:
        return <div className="p-10 text-slate-500">Module under development</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSearch={() => setIsSearchOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 flex items-center justify-between px-4 text-white flex-shrink-0">
             <span className="font-bold text-lg">Pocket Ledger</span>
             {/* Mobile Search Trigger */}
             <button onClick={() => setIsSearchOpen(true)} className="p-2 text-white/80 hover:text-white">
                 <Search size={20} />
             </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
             {renderContent()}
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant 
        transactions={transactions}
        budgets={budgets}
        isOpen={isAIOpen}
        toggleOpen={toggleAI}
        onAddTransaction={handleAddTransaction}
        setActiveTab={setActiveTab}
        autoStartListening={autoStartVoice}
      />

      {/* Global Search */}
      <GlobalSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        transactions={transactions}
      />
      
      {/* Floating Action Button (Mobile/Desktop) for AI */}
      <button 
        onClick={triggerOmniVoice}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-300 transition-all z-40 flex items-center justify-center hover:scale-105"
      >
        {isAIOpen ? <Mic size={24} className="animate-pulse" /> : <Bot size={24} />}
      </button>
    </div>
  );
};

export default App;