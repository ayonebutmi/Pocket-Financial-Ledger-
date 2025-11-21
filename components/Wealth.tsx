import React, { useState } from 'react';
import { SmartCard, TreasuryState } from '../types';
import { CreditCard, TrendingUp, Lock, Unlock, ShieldCheck, Wallet, ArrowRightLeft, Info } from 'lucide-react';

interface WealthProps {
  cards: SmartCard[];
  treasury: TreasuryState;
}

export const Wealth: React.FC<WealthProps> = ({ cards: initialCards, treasury: initialTreasury }) => {
  const [cards, setCards] = useState(initialCards);
  const [treasury, setTreasury] = useState(initialTreasury);

  const toggleCardStatus = (id: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, status: card.status === 'active' ? 'frozen' : 'active' } : card
    ));
  };

  const toggleSweep = () => {
    setTreasury(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Wealth & Controls</h1>
        <p className="text-slate-500">Manage your high-yield treasury and automated debit cards.</p>
      </header>

      {/* TREASURY SECTION */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
             <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <TrendingUp size={20} />
                <span className="font-bold tracking-wide uppercase text-sm">Pocket Treasury</span>
             </div>
             <h2 className="text-5xl font-bold mb-4">{treasury.apy}% <span className="text-2xl text-slate-400 font-normal">APY</span></h2>
             <p className="text-slate-400 max-w-md">
                Funds sitting in your envelopes (like Rent) are automatically swept into a money market fund until you need them.
             </p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl backdrop-blur-sm border border-slate-700 min-w-[250px]">
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-300 font-medium">Currently Swept</span>
                <Wallet className="text-emerald-400" size={20} />
             </div>
             <div className="text-3xl font-bold mb-2">${treasury.totalSwept.toLocaleString()}</div>
             <div className="text-xs text-emerald-400 flex items-center">
                <ShieldCheck size={12} className="mr-1" /> FDIC Insured up to $2M
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium">Auto-Sweep</span>
                <button 
                    onClick={toggleSweep}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${treasury.isEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${treasury.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* CARDS SECTION */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <CreditCard className="mr-2 text-indigo-600" /> Smart Debit Cards
        </h3>
        <p className="text-slate-500 mb-6 text-sm">
            Cards that check your budget envelopes in real-time. If you don't have funds in "Groceries", the card declines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map(card => (
                <div key={card.id} className={`rounded-2xl p-6 border transition-all ${card.status === 'frozen' ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-8">
                        <div className={`w-12 h-8 rounded bg-gradient-to-br ${card.type === 'physical' ? 'from-slate-700 to-slate-900' : 'from-indigo-500 to-purple-600'} shadow-sm`}></div>
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${card.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {card.status}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Card Number</div>
                        <div className="text-xl font-mono font-medium text-slate-800">•••• •••• •••• {card.last4}</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Type</span>
                            <span className="font-medium capitalize text-slate-900">{card.type} Card</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center">
                                Enforcement <Info size={12} className="ml-1 text-slate-400" />
                            </span>
                            <span className={`font-medium capitalize ${card.enforcementMode === 'strict' ? 'text-red-600' : 'text-indigo-600'}`}>
                                {card.enforcementMode}
                            </span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Linked Budgets</span>
                            <div className="flex space-x-1">
                                {card.linkedBudgets.map(b => (
                                    <span key={b} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                                        {b.replace('cat_', 'Budget ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex space-x-3">
                        <button 
                            onClick={() => toggleCardStatus(card.id)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${card.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                            {card.status === 'active' ? <><Lock size={16}/> <span>Freeze</span></> : <><Unlock size={16}/> <span>Unfreeze</span></>}
                        </button>
                        <button className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200">
                            Settings
                        </button>
                    </div>
                </div>
            ))}
            
            {/* Add Card Placeholder */}
            <button className="rounded-2xl p-6 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <CreditCard size={24} />
                </div>
                <span className="font-medium">Issue New Card</span>
                <span className="text-xs mt-1 opacity-70">Physical or Virtual</span>
            </button>
        </div>
      </div>
    </div>
  );
};