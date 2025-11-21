
import React, { useState } from 'react';
import { RetirementProfile, CreditScore, Account } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, Home, Target, AlertTriangle, CheckCircle, Briefcase, ShieldCheck, Info, Calculator, CloudRain, Sun, DollarSign, Percent, Lock } from 'lucide-react';

interface RetirementPlannerProps {
  profile: RetirementProfile;
  creditScore: CreditScore;
  accounts: Account[];
  monthlySpend: number;
}

export const RetirementPlanner: React.FC<RetirementPlannerProps> = ({ profile: initialProfile, creditScore, accounts, monthlySpend }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<'retirement' | 'tax_shield' | 'real_estate' | 'debt'>('retirement');
  
  // Lifestyle & Market Settings
  const [lifestylePercent, setLifestylePercent] = useState(100); 
  const [includeSS, setIncludeSS] = useState(true); 
  const [marketCondition, setMarketCondition] = useState<'average' | 'bear'>('average');

  // Debt vs Invest Simulator State
  const [simExtraCash, setSimExtraCash] = useState(500);
  const [simInvestRate, setSimInvestRate] = useState(7);

  // --- RETIREMENT CALCS (Freedom Number) ---
  const calculateNestEgg = () => {
      const yearsToGrow = profile.retirementAge - profile.currentAge;
      
      // Annual Spend adjusted for lifestyle
      const annualSpend = monthlySpend * 12 * (lifestylePercent / 100);
      
      // Social Security Adjustment (Avg ~$22k/yr if eligible)
      const ssBenefit = includeSS ? 22000 : 0;
      const netAnnualSpend = Math.max(0, annualSpend - ssBenefit);
      
      // Inflation Adjustment
      const inflation = 0.03;
      const futureAnnualSpend = netAnnualSpend * Math.pow(1 + inflation, yearsToGrow);
      
      // Freedom Number Rule: 25x Annual Spend (4% Rule)
      const targetNestEgg = futureAnnualSpend * 25;

      // Projection Logic
      const data = [];
      let balance = profile.currentSavings;
      const annualContrib = (profile.monthlyContribution * 12) + (profile.annualIncome * (profile.employerMatch / 100));
      
      const getRate = (yearIndex: number) => {
          // Bear market sequence risk simulation
          if (marketCondition === 'average') return 0.07;
          if (yearIndex < 3) return -0.05; // Recession start
          if (yearIndex < 5) return 0.02;  // Recovery
          return 0.08; // Bull run
      };

      for (let i = 0; i <= yearsToGrow; i++) {
          const age = profile.currentAge + i;
          data.push({
              age,
              balance: Math.round(balance),
              target: Math.round(targetNestEgg), // Simplified static target line
              contributions: Math.round(profile.currentSavings + (annualContrib * i))
          });
          balance = (balance + annualContrib) * (1 + getRate(i));
      }

      return { targetNestEgg, futureAnnualSpend, data, ssBenefit };
  };

  const { targetNestEgg, futureAnnualSpend, data, ssBenefit } = calculateNestEgg();
  const progress = Math.min((profile.currentSavings / targetNestEgg) * 100, 100);

  // --- DEBT SIMULATOR ---
  const generateDebtVsInvestData = () => {
      const chartData = [];
      let debtWealth = 0; // Money saved (positive value)
      let investWealth = 0;
      
      // Assumptions
      const debtAPR = 0.24; // Typical Credit Card
      const capitalGainsTax = 0.15;
      const effectiveInvestRate = (simInvestRate / 100) * (1 - capitalGainsTax); // After-tax return
      
      for(let year = 0; year <= 5; year++) {
          chartData.push({
              year: `Year ${year}`,
              payDebt: Math.round(debtWealth),
              invest: Math.round(investWealth)
          });
          
          const annualContrib = simExtraCash * 12;
          
          // Compound Interest Formula for Future Value of a Series
          // Debt: Guaranteed return equal to APR (risk-free)
          debtWealth = (debtWealth + annualContrib) * (1 + debtAPR);
          
          // Invest: Variable return with tax drag
          investWealth = (investWealth + annualContrib) * (1 + effectiveInvestRate);
      }
      return chartData;
  };

  const debtSimData = generateDebtVsInvestData();
  const debtAdvantage = debtSimData[5].payDebt - debtSimData[5].invest;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Retirement & Strategy</h1>
          <p className="text-slate-500">Long-term wealth forecasting and optimization.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {[
                { id: 'retirement', label: 'Retirement', icon: Target },
                { id: 'debt', label: 'Debt vs Invest', icon: Calculator },
                { id: 'tax_shield', label: 'Tax Shield', icon: ShieldCheck },
                { id: 'real_estate', label: 'Real Estate', icon: Home },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
      </header>

      {/* ================= RETIREMENT TAB ================= */}
      {activeTab === 'retirement' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              {/* HERO CARD */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl -mr-20 -mt-20"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                          <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-500/50 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
                              <TrendingUp size={14} />
                              <span>Freedom Number</span>
                          </div>
                          <h2 className="text-5xl font-bold mb-2">${(targetNestEgg / 1000000).toFixed(2)}M</h2>
                          <p className="text-slate-400 mb-6">Target Nest Egg needed to sustain your lifestyle.</p>
                          
                          <div className="flex space-x-6">
                              <div>
                                  <p className="text-xs text-slate-500 font-bold uppercase">Current</p>
                                  <p className="text-xl font-bold">${profile.currentSavings.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 font-bold uppercase">Progress</p>
                                  <p className="text-xl font-bold text-emerald-400">{progress.toFixed(1)}%</p>
                              </div>
                              {includeSS && (
                                  <div>
                                      <p className="text-xs text-slate-500 font-bold uppercase">Soc. Security</p>
                                      <p className="text-xl font-bold text-indigo-300">Included</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                          <h3 className="font-bold text-white mb-4 flex items-center">
                              <Calculator className="mr-2 text-indigo-400" size={18} /> 
                              Variables
                          </h3>
                          
                          <div className="space-y-4">
                              <div>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="text-slate-300">Lifestyle Cost</span>
                                      <span className="font-bold">{lifestylePercent}% of current</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="50" max="150" 
                                    value={lifestylePercent} 
                                    onChange={(e) => setLifestylePercent(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                  />
                              </div>

                              <div className="flex items-center justify-between py-2 border-t border-white/10">
                                  <div className="flex items-center space-x-2">
                                      <Briefcase size={16} className="text-slate-400" />
                                      <span className="text-sm text-slate-300">Include Social Security</span>
                                  </div>
                                  <button 
                                    onClick={() => setIncludeSS(!includeSS)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeSS ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeSS ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                              </div>

                              <div className="flex items-center justify-between py-2 border-t border-white/10">
                                  <div className="flex items-center space-x-2">
                                      {marketCondition === 'bear' ? <CloudRain size={16} className="text-slate-400" /> : <Sun size={16} className="text-slate-400" />}
                                      <span className="text-sm text-slate-300">Market Outlook</span>
                                  </div>
                                  <div className="flex bg-slate-800 rounded-lg p-1">
                                      <button 
                                        onClick={() => setMarketCondition('average')}
                                        className={`px-2 py-1 rounded text-xs font-bold ${marketCondition === 'average' ? 'bg-white text-slate-900' : 'text-slate-400'}`}
                                      >
                                          Avg
                                      </button>
                                      <button 
                                        onClick={() => setMarketCondition('bear')}
                                        className={`px-2 py-1 rounded text-xs font-bold ${marketCondition === 'bear' ? 'bg-white text-slate-900' : 'text-slate-400'}`}
                                      >
                                          Bear
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* CHART */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px]">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Wealth Trajectory</h3>
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis dataKey="age" tick={{fill: '#94a3b8'}} />
                          <YAxis tick={{fill: '#94a3b8'}} tickFormatter={(val) => `$${val/1000}k`} />
                          <Tooltip 
                              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBal)" name="Projected Wealth" strokeWidth={3} />
                          <Area type="monotone" dataKey="contributions" stroke="#cbd5e1" fill="none" strokeDasharray="5 5" name="Total Contributed" />
                          <ReferenceLine y={targetNestEgg} label="Freedom Number" stroke="red" strokeDasharray="3 3" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* ================= DEBT VS INVEST TAB ================= */}
      {activeTab === 'debt' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                              <Info size={18} className="mr-2 text-indigo-600" /> Simulator
                          </h3>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Monthly Extra Cash</label>
                                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3">
                                      <DollarSign size={16} className="text-slate-400" />
                                      <input 
                                        type="number" 
                                        value={simExtraCash} 
                                        onChange={(e) => setSimExtraCash(parseInt(e.target.value))}
                                        className="w-full bg-transparent py-3 outline-none font-bold text-slate-900"
                                      />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Expected Market Return</label>
                                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3">
                                      <Percent size={16} className="text-slate-400" />
                                      <input 
                                        type="number" 
                                        value={simInvestRate} 
                                        onChange={(e) => setSimInvestRate(parseFloat(e.target.value))}
                                        className="w-full bg-transparent py-3 outline-none font-bold text-slate-900"
                                      />
                                  </div>
                              </div>
                              
                              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                  <div className="flex items-center space-x-2 text-orange-700 mb-1">
                                      <AlertTriangle size={14} />
                                      <span className="text-xs font-bold">Assumptions</span>
                                  </div>
                                  <ul className="text-xs text-orange-800/80 space-y-1 list-disc pl-4">
                                      <li>Avg Credit Card APR: 24%</li>
                                      <li>Capital Gains Tax: 15%</li>
                                      <li>Risk: Debt payoff is guaranteed.</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] relative">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">5-Year Wealth Trajectory</h3>
                          <p className="text-sm text-slate-500 mb-6">Comparing the future value of applying ${simExtraCash}/mo to debt vs. investing.</p>
                          
                          <ResponsiveContainer width="100%" height="85%">
                              <AreaChart data={debtSimData}>
                                  <defs>
                                      <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis dataKey="year" tick={{fontSize: 12}} />
                                  <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                                  <Tooltip 
                                      contentStyle={{borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                  />
                                  <Legend />
                                  <Area type="monotone" dataKey="payDebt" name="Pay Debt Strategy (24% Guaranteed)" stroke="#10b981" fill="url(#colorDebt)" strokeWidth={3} />
                                  <Area type="monotone" dataKey="invest" name={`Invest Strategy (${simInvestRate}% Variable)`} stroke="#6366f1" fill="url(#colorInvest)" strokeWidth={3} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      
                      {/* Recommendation Banner */}
                      <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${debtAdvantage > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                          <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${debtAdvantage > 0 ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-200 text-indigo-700'}`}>
                                  {debtAdvantage > 0 ? <CheckCircle size={20} /> : <TrendingUp size={20} />}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900">
                                      {debtAdvantage > 0 ? "Aggressive Debt Payoff Wins" : "Investing Wins"}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                      {debtAdvantage > 0 
                                        ? `You save an extra $${debtAdvantage.toLocaleString()} over 5 years by killing debt first.` 
                                        : `Investing yields $${Math.abs(debtAdvantage).toLocaleString()} more (assuming market holds).`}
                                  </p>
                              </div>
                          </div>
                          <div className="text-right hidden sm:block">
                              <span className="text-xs font-bold text-slate-400 uppercase">Net Difference</span>
                              <p className={`text-xl font-bold ${debtAdvantage > 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                  ${Math.abs(debtAdvantage).toLocaleString()}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ================= OTHER TABS (Placeholder with 2024 Badges) ================= */}
      {(activeTab === 'tax_shield' || activeTab === 'real_estate') && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <ShieldCheck size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Module Coming Soon</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                  The {activeTab === 'tax_shield' ? 'Tax Shield Optimization' : 'Real Estate Planner'} module is being updated with the latest IRS guidelines.
              </p>
              
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  <CheckCircle size={14} />
                  <span>Tax Year 2024 Compliant</span>
              </div>
          </div>
      )}
    </div>
  );
};
