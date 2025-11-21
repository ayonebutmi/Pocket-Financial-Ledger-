


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
import { Bot, Mic } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [autoStartVoice, setAutoStartVoice] = useState(false); // Trigger voice on open
  
  // Global State
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [treasury, setTreasury] = useState(INITIAL_TREASURY);

  // Toggle AI Panel
  const toggleAI = () => {
      setIsAIOpen(!isAIOpen);
      setAutoStartVoice(false); // Reset auto-start when toggling manually
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
        <div className="md:hidden h-16 bg-slate-900 flex items-center justify-between px-4 text-white">
             <span className="font-bold text-lg">Pocket Ledger</span>
             {/* Mobile Search Trigger */}
             <button onClick={() => setIsSearchOpen(true)} className="p-2 text-white/80 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d