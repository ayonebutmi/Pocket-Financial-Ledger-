
import React from 'react';
import { CreditScore, Account, FinancialGoal } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { ShieldCheck, AlertTriangle, TrendingUp, Award, Target, ChevronRight, Rocket } from 'lucide-react';

interface FinancialHealthProps {
  creditScore: CreditScore;
  accounts: Account[];
  goals: FinancialGoal[];
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({ creditScore, accounts, goals }) => {
  const debts = accounts.filter(a => (a.type === 'credit' || a.type === 'loan') && a.balance < 0);
  const totalDebt = debts.reduce((acc, curr) => acc + Math.abs(curr.balance), 0);

  // Helper to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-emerald-500';
    if (score >= 740) return 'text-indigo-500';
    if (score >= 670) return 'text-blue-500';
    if (score >= 580) return 'text-orange-500';
    return 'text-red-500';
  };

  // Generate Wealth Projection Data (Mock Compound Interest)
  const generateProjectionData = () => {
    const data = [];
    let currentWealth = accounts.reduce((acc, curr) => acc + (curr.balance > 0 ? curr.balance : 0), 0);
    const monthlyContribution = 500; // Mock average savings
    const rate = 0.07; // 7% annual return

    for (let year = 0; year <= 30; year += 5) {
        data.push({
            year: `Year ${year}`,
            wealth: Math.round(currentWealth),
            contributionOnly: Math.round(accounts.reduce((acc, curr) => acc + (curr.balance > 0 ? curr.balance : 0), 0) + (monthlyContribution * 12 * year))
        });
        // Compound for next 5 years
        for(let i=0; i<5; i++) {
            currentWealth = (currentWealth + (monthlyContribution * 12)) * (1 + rate);
        }
    }
    return data;
  };

  const projectionData = generateProjectionData();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Financial Strategy</h1>
        <p className="text-slate-500">Monitor your FICO® score, debt strategy, and future wealth.</p>
      </header>

      {/* FUTURE WEALTH PROJECTOR */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                  <div className="flex items-center space-x-2 text-indigo-300 mb-2">
                      <Rocket size={20} />
                      <span className="font-bold uppercase tracking-wider text-sm">Future You</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4">
                      ${(projectionData[projectionData.length - 1].wealth / 1000000).toFixed(2)} Million
                  </h2>
                  <p className="text-indigo-200 text-sm mb-6">
                      If you invest <strong>$500/mo</strong> starting today, your net worth will grow exponentially over 30 years.
                  </p>
                  <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-medium transition-colors w-full lg:w-auto">
                      Adjust Contribution
                  </button>
              </div>
              <div className="lg:col-span-2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                          <defs>
                              <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="year" stroke="#a5b4fc" tick={{fill: '#c7d2fe'}} />
                          <YAxis hide />
                          <Tooltip 
                              contentStyle={{backgroundColor: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#fff'}}
                              itemStyle={{color: '#c7d2fe'}}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                          />
                          <Area type="monotone" dataKey="wealth" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorWealth)" />
                          <Line type="monotone" dataKey="contributionOnly" stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREDIT SCORE CARD */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden lg:col-span-2 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
             <div className="flex items-center space-x-2 mb-2">
                <ShieldCheck className="text-slate-400" size={20} />
                <span className="font-bold text-slate-500 uppercase text-sm tracking-wide">{creditScore.provider} Score 8</span>
             </div>
             <div className="relative w-48 h-48 mx-auto md:mx-0 mb-6 md:mb-0 flex items-center justify-center">
                {/* CSS-only Guage Placeholder */}
                <div className={`w-full h-full rounded-full border-8 border-slate-100 relative flex items-center justify-center`}>
                    <div className={`absolute inset-0 rounded-full border-8 border-transparent border-t-indigo-500 border-r-indigo-500 rotate-45`}></div>
                    <div className="text-center">
                        <h2 className={`text-5xl font-bold ${getScoreColor(creditScore.currentScore)}`}>{creditScore.currentScore}</h2>
                        <p className="text-slate-400 font-medium">Very Good</p>
                    </div>
                </div>
             </div>
             <div className="mt-4 flex items-center space-x-2 text-sm text-slate-500">
                <TrendingUp size={16} className="text-emerald-500" />
                <span>Up 14 points since last month</span>
             </div>
          </div>

          <div className="flex-[2] flex flex-col justify-center">
             <h3 className="font-bold text-slate-800 mb-4">Score History (6 Months)</h3>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={creditScore.history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} hide />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* SCORE FACTORS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Impact Factors</h3>
            <div className="space-y-4">
                {creditScore.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                         <div className={`mt-1 w-2 h-2 rounded-full ${factor.status === 'Excellent' || factor.status === 'Good' ? 'bg-emerald-500' : factor.status === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                         <div>
                             <div className="flex justify-between w-full">
                                <p className="font-bold text-slate-900 text-sm">{factor.name}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${factor.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{factor.status}</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-1">{factor.details}</p>
                         </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                View Full Credit Report
            </button>
        </div>
      </div>

      {/* DEBT STRATEGY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1">Debt Strategy</h3>
                <p className="text-slate-400 text-sm mb-6">AI Recommended: Avalanche Method (Highest Interest First)</p>

                <div className="space-y-4">
                    {debts.map(debt => (
                        <div key={debt.id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="font-bold">{debt.name}</p>
                                <p className="text-xs text-slate-400">{debt.institution} • {debt.apr}% APR</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">${Math.abs(debt.balance).toLocaleString()}</p>
                                <p className="text-xs text-red-400"> Payoff Priority</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-start space-x-3">
                    <Award className="text-indigo-400 flex-shrink-0" size={20} />
                    <p className="text-sm text-indigo-200">
                        <strong className="text-white">Pro Tip:</strong> If you increase your monthly payment by $100 towards the <strong>{debts.find(d => d.apr && d.apr > 20)?.name || 'Credit Card'}</strong>, you will save roughly $240 in interest this year.
                    </p>
                </div>
            </div>
         </div>

         {/* GOALS */}
         <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Financial Goals</h3>
                <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors">
                    <ChevronRight />
                </button>
             </div>

             <div className="space-y-6">
                 {goals.map(goal => {
                     const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                     return (
                         <div key={goal.id}>
                             <div className="flex justify-between items-end mb-2">
                                 <div className="flex items-center space-x-3">
                                     <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                         <Target size={18} />
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-900">{goal.name}</p>
                                         <p className="text-xs text-slate-500">Target: {goal.deadline}</p>
                                     </div>
                                 </div>
                                 <span className="font-bold text-slate-900">${goal.currentAmount.toLocaleString()} <span className="text-slate-400 text-sm font-normal">/ ${goal.targetAmount.toLocaleString()}</span></span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                 <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                             </div>
                         </div>
                     )
                 })}
                 
                 <button className="w-full border border-dashed border-slate-300 rounded-xl p-4 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium">
                     + Add New Goal
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};
