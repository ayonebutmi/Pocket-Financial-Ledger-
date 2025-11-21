
import React, { useState } from 'react';
import { BudgetCategory, Account, CategoryType } from '../types';
import { ArrowRight, AlertCircle, Coins, RefreshCw, PiggyBank, Calendar, ArrowRightLeft, X, Check, LayoutTemplate, Sparkles } from 'lucide-react';

interface BudgetingProps {
  budgets: BudgetCategory[];
  accounts: Account[];
}

// Pre-defined templates
const BUDGET_TEMPLATES: Record<string, { description: string, categories: Omit<BudgetCategory, 'id' | 'spent' | 'rollover' | 'targetAccount'>[] }> = {
  'Bare Bones': {
    description: "Strictly essentials. Good for tough times or debt payoff.",
    categories: [
      { name: 'Rent/Mortgage', type: CategoryType.ESSENTIAL, allocated: 1200 },
      { name: 'Groceries', type: CategoryType.ESSENTIAL, allocated: 300 },
      { name: 'Utilities', type: CategoryType.ESSENTIAL, allocated: 150 },
      { name: 'Transport', type: CategoryType.ESSENTIAL, allocated: 100 },
      { name: 'Emergency Fund', type: CategoryType.SAVINGS, allocated: 50 },
    ]
  },
  'Moderate / Balanced': {
    description: "A healthy mix of needs, wants, and saving goals.",
    categories: [
      { name: 'Rent/Mortgage', type: CategoryType.ESSENTIAL, allocated: 1500 },
      { name: 'Groceries', type: CategoryType.ESSENTIAL, allocated: 500 },
      { name: 'Dining Out', type: CategoryType.LIFESTYLE, allocated: 200 },
      { name: 'Utilities', type: CategoryType.ESSENTIAL, allocated: 200 },
      { name: 'Transport', type: CategoryType.ESSENTIAL, allocated: 150 },
      { name: 'Entertainment', type: CategoryType.LIFESTYLE, allocated: 100 },
      { name: 'General Savings', type: CategoryType.SAVINGS, allocated: 300 },
    ]
  },
  'Aggressive Saver': {
    description: "Minimizes lifestyle costs to maximize wealth building.",
    categories: [
      { name: 'Rent (Shared)', type: CategoryType.ESSENTIAL, allocated: 800 },
      { name: 'Basic Groceries', type: CategoryType.ESSENTIAL, allocated: 250 },
      { name: 'Utilities', type: CategoryType.ESSENTIAL, allocated: 120 },
      { name: 'Investments', type: CategoryType.SAVINGS, allocated: 1500 },
      { name: 'Emergency Fund', type: CategoryType.SAVINGS, allocated: 500 },
      { name: 'Transport', type: CategoryType.ESSENTIAL, allocated: 80 },
    ]
  }
};

export const Budgeting: React.FC<BudgetingProps> = ({ budgets: initialBudgets, accounts }) => {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // State for Reconciliation Modal
  const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  
  // Find End-of-Month Surplus candidates
  const surplusBudgets = budgets.filter(b => b.allocated - b.spent > 0);

  // Mock function to simulate "Historical Average"
  const getHistoricalAvg = (amount: number) => Math.round(amount * (0.85 + Math.random() * 0.3));

  const openReconcileModal = (budget: BudgetCategory) => {
    setSelectedBudget(budget);
    // Default target to the first budget that isn't the current one
    const target = budgets.find(b => b.id !== budget.id);
    if (target) setTransferTargetId(target.id);
  };

  const handleReconcile = (action: 'rollover' | 'savings' | 'transfer' | 'carry_debt' | 'cover_savings' | 'cover_transfer') => {
    if (!selectedBudget) return;

    const remaining = selectedBudget.allocated - selectedBudget.spent;
    const absRemaining = Math.abs(remaining);
    const updatedBudgets = [...budgets];
    const currentIdx = updatedBudgets.findIndex(b => b.id === selectedBudget.id);
    
    if (currentIdx === -1) return;

    switch (action) {
        case 'rollover':
            // Move the surplus into the "Rollover" bucket and remove it from "Allocated" (Available)
            // This effectively closes the month for this category, saving the money for next month.
            updatedBudgets[currentIdx].rollover += remaining;
            updatedBudgets[currentIdx].allocated -= remaining; 
            break;
        case 'savings':
        case 'cover_savings':
            const savingsIdx = updatedBudgets.findIndex(b => b.type === CategoryType.SAVINGS);
            if (savingsIdx !== -1) {
                if (action === 'savings') {
                    updatedBudgets[currentIdx].allocated -= remaining;
                    updatedBudgets[savingsIdx].allocated += remaining;
                } else {
                    updatedBudgets[savingsIdx].allocated -= absRemaining;
                    updatedBudgets[currentIdx].allocated += absRemaining;
                }
            }
            break;
        case 'transfer':
        case 'cover_transfer':
            const targetIdx = updatedBudgets.findIndex(b => b.id === transferTargetId);
            if (targetIdx !== -1) {
                 if (action === 'transfer') {
                    updatedBudgets[currentIdx].allocated -= remaining;
                    updatedBudgets[targetIdx].allocated += remaining;
                 } else {
                    updatedBudgets[targetIdx].allocated -= absRemaining;
                    updatedBudgets[currentIdx].allocated += absRemaining;
                 }
            }
            break;
        case 'carry_debt':
            // In reality, reduces next month's budget. We'll mock this by storing it in rollover as negative.
            updatedBudgets[currentIdx].rollover += remaining; // remaining is negative
            break;
    }

    setBudgets(updatedBudgets);
    setSelectedBudget(null);
  };

  const distributeFunds = () => {
      setShowDistributeModal(true);
  };

  const applyTemplate = (templateName: string) => {
    const template = BUDGET_TEMPLATES[templateName];
    if (!template) return;

    // Generate new IDs and map to default account
    const newBudgets: BudgetCategory[] = template.categories.map((item, index) => ({
        id: `new_cat_${Date.now()}_${index}`,
        name: item.name,
        type: item.type,
        allocated: item.allocated,
        spent: 0,
        rollover: 0,
        targetAccount: accounts[0]?.id // Default to first account
    }));

    setBudgets(newBudgets);
    setShowTemplateModal(false);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Envelope Budget</h1>
            <p className="text-slate-500">Zero-based budgeting with automated distribution.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center justify-center space-x-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
                <LayoutTemplate size={18} />
                <span>Templates</span>
            </button>
            <button 
                onClick={distributeFunds}
                className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200">
                <Coins size={18} />
                <span>Auto-Distribute Funds</span>
            </button>
        </div>
      </header>

      {/* End of Month Review Banner (NEW FEATURE) */}
      {surplusBudgets.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                  <div className="p-3 bg-white rounded-full text-indigo-600 shadow-sm">
                      <Calendar size={24} />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-indigo-900">End of Month Review</h3>
                      <p className="text-indigo-600 text-sm">You have <strong className="text-indigo-800">{surplusBudgets.length} envelopes</strong> with money left over. Would you like to roll it over to next month or sweep it into savings?</p>
                  </div>
              </div>
              <button 
                onClick={() => openReconcileModal(surplusBudgets[0])}
                className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                  <Sparkles size={18} />
                  <span>Review Leftovers</span>
              </button>
          </div>
      )}

      {/* Templates Modal */}
      {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Select a Budget Template</h3>
                        <p className="text-slate-500 text-sm">Starting fresh? Choose a setup that matches your financial style.</p>
                      </div>
                      <button onClick={() => setShowTemplateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} />
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(BUDGET_TEMPLATES).map(([name, template]) => (
                          <div key={name} className="flex flex-col border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group bg-white" onClick={() => applyTemplate(name)}>
                              <div className="mb-4">
                                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{name}</h4>
                                  <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                              </div>
                              <div className="flex-1 space-y-2 mb-6">
                                  {template.categories.slice(0, 4).map((cat, i) => (
                                      <div key={i} className="flex justify-between text-sm">
                                          <span className="text-slate-600">{cat.name}</span>
                                          <span className="font-medium text-slate-900">${cat.allocated}</span>
                                      </div>
                                  ))}
                                  {template.categories.length > 4 && (
                                      <div className="text-xs text-slate-400 pt-1">+ {template.categories.length - 4} more categories</div>
                                  )}
                              </div>
                              <button className="w-full py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  Apply Template
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Distribution Modal */}
      {showDistributeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Distributing Funds...</h3>
                      <RefreshCw className="animate-spin text-indigo-600" />
                  </div>
                  <div className="space-y-4">
                      <p className="text-slate-600">Based on your budget settings, we are moving funds to your designated accounts:</p>
                      {budgets.filter(b => b.targetAccount).slice(0,3).map(b => (
                          <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-800">{b.name}</span>
                              <div className="flex items-center space-x-2 text-sm text-slate-500">
                                  <span>Primary</span>
                                  <ArrowRight size={14} />
                                  <span className="text-indigo-600 font-medium">
                                      {accounts.find(a => a.id === b.targetAccount)?.name}
                                  </span>
                              </div>
                              <span className="font-bold text-emerald-600">${b.allocated}</span>
                          </div>
                      ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => setShowDistributeModal(false)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 font-medium">
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Reconciliation Modal */}
      {selectedBudget && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{selectedBudget.name}</span>
                          <h3 className="text-xl font-bold text-slate-900">
                              {selectedBudget.allocated - selectedBudget.spent >= 0 ? 'End of Month / Surplus' : 'Resolve Overspending'}
                          </h3>
                      </div>
                      <button onClick={() => setSelectedBudget(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="mb-6">
                      <p className="text-slate-500 text-sm mb-2">
                          {selectedBudget.allocated - selectedBudget.spent >= 0 
                             ? "You have funds left over. Choose to keep it or sweep it." 
                             : "You've exceeded this budget. How do you want to cover it?"}
                      </p>
                      <div className={`text-3xl font-bold ${selectedBudget.allocated - selectedBudget.spent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${Math.abs(selectedBudget.allocated - selectedBudget.spent).toFixed(2)}
                      </div>
                  </div>

                  <div className="space-y-3">
                      {selectedBudget.allocated - selectedBudget.spent >= 0 ? (
                          // SURPLUS OPTIONS
                          <>
                              <button 
                                  onClick={() => handleReconcile('rollover')}
                                  className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group text-left"
                              >
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                      <Calendar size={20} />
                                  </div>
                                  <div>
                                      <span className="block font-semibold text-slate-900">Keep in Category (Rollover)</span>
                                      <span className="text-xs text-slate-500">Save this amount for next month</span>
                                  </div>
                              </button>

                              <button 
                                  onClick={() => handleReconcile('savings')}
                                  className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left"
                              >
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                      <PiggyBank size={20} />
                                  </div>
                                  <div>
                                      <span className="block font-semibold text-slate-900">Sweep to Savings</span>
                                      <span className="text-xs text-slate-500">Transfer to your savings goal</span>
                                  </div>
                              </button>

                              <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all bg-slate-50">
                                  <div className="flex items-center mb-3">
                                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                                          <ArrowRightLeft size={20} />
                                      </div>
                                      <div>
                                          <span className="block font-semibold text-slate-900">Sweep to Another Category</span>
                                          <span className="text-xs text-slate-500">Move surplus funds to another envelope</span>
                                      </div>
                                  </div>
                                  <div className="flex space-x-2 pl-14">
                                      <select 
                                          value={transferTargetId}
                                          onChange={(e) => setTransferTargetId(e.target.value)}
                                          className="flex-1 text-sm p-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-purple-500"
                                      >
                                          {budgets.filter(b => b.id !== selectedBudget.id).map(b => (
                                              <option key={b.id} value={b.id}>{b.name}</option>
                                          ))}
                                      </select>
                                      <button 
                                          onClick={() => handleReconcile('transfer')}
                                          className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                                      >
                                          Move
                                      </button>
                                  </div>
                              </div>
                          </>
                      ) : (
                          // DEFICIT OPTIONS
                          <>
                             <button 
                                  onClick={() => handleReconcile('carry_debt')}
                                  className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group text-left"
                              >
                                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                      <Calendar size={20} />
                                  </div>
                                  <div>
                                      <span className="block font-semibold text-slate-900">Carry Debt Forward</span>
                                      <span className="text-xs text-slate-500">Deduct from next month's budget</span>
                                  </div>
                              </button>

                              <button 
                                  onClick={() => handleReconcile('cover_savings')}
                                  className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left"
                              >
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                      <PiggyBank size={20} />
                                  </div>
                                  <div>
                                      <span className="block font-semibold text-slate-900">Cover from Savings</span>
                                      <span className="text-xs text-slate-500">Use emergency funds</span>
                                  </div>
                              </button>

                              <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all bg-slate-50">
                                  <div className="flex items-center mb-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                                          <ArrowRightLeft size={20} />
                                      </div>
                                      <div>
                                          <span className="block font-semibold text-slate-900">Cover from Category</span>
                                          <span className="text-xs text-slate-500">Take funds from another envelope</span>
                                      </div>
                                  </div>
                                  <div className="flex space-x-2 pl-14">
                                      <select 
                                          value={transferTargetId}
                                          onChange={(e) => setTransferTargetId(e.target.value)}
                                          className="flex-1 text-sm p-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                          {budgets.filter(b => b.id !== selectedBudget.id).map(b => (
                                              <option key={b.id} value={b.id}>{b.name}</option>
                                          ))}
                                      </select>
                                      <button 
                                          onClick={() => handleReconcile('cover_transfer')}
                                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                      >
                                          Cover
                                      </button>
                                  </div>
                              </div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
                <p className="text-slate-400 font-medium mb-1">Total Monthly Budget</p>
                <h2 className="text-3xl font-bold">${totalBudgeted.toLocaleString()}</h2>
            </div>
            <div className="text-right">
                <p className="text-slate-400 font-medium mb-1">Left to Spend</p>
                <h2 className="text-3xl font-bold text-emerald-400">${(totalBudgeted - totalSpent).toLocaleString()}</h2>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
              ></div>
          </div>
      </div>

      {/* Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const percent = Math.min((budget.spent / budget.allocated) * 100, 100);
          const isOver = budget.spent > budget.allocated;
          const remaining = budget.allocated - budget.spent;

          return (
            <div key={budget.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{budget.name}</h3>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{budget.type}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-sm font-bold ${isOver ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        ${budget.allocated.toLocaleString()}
                    </div>
                </div>

                {/* Historical Context (New Feature) */}
                <div className="mb-3 text-xs text-slate-400 flex items-center">
                    <span>Avg Spend: ${getHistoricalAvg(budget.allocated)}</span>
                    <span className="mx-1">•</span>
                    <span>{budget.targetAccount ? 'Auto-funded' : 'Manual'}</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-slate-500">Spent: <span className="font-semibold text-slate-900">${budget.spent.toLocaleString()}</span></span>
                    <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {remaining < 0 ? `Over by $${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()} left`}
                    </span>
                </div>
                
                {budget.rollover > 0 && (
                     <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-700 flex items-center">
                         <Calendar size={12} className="mr-1.5" />
                         Rollover Stash: ${budget.rollover}
                     </div>
                )}
                
                <div className="flex-1"></div>

                {/* Rollover / Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <div className="text-xs text-slate-500 flex items-center">
                        <span className="mr-1">Source:</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium truncate max-w-[80px]">
                            {accounts.find(a => a.id === budget.targetAccount)?.name || 'Primary'}
                        </span>
                    </div>
                    
                    {remaining > 0 && (
                        <button 
                            onClick={() => openReconcileModal(budget)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            Manage Surplus <ArrowRight size={12} className="ml-1"/>
                        </button>
                    )}
                    {remaining < 0 && (
                         <button 
                            onClick={() => openReconcileModal(budget)}
                            className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                         >
                            Resolve <AlertCircle size={12} className="ml-1"/>
                        </button>
                    )}
                     {remaining === 0 && (
                         <span className="text-xs text-slate-400 flex items-center">
                             <Check size={12} className="mr-1"/> On Track
                         </span>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
