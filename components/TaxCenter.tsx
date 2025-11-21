
import React, { useState } from 'react';
import { TaxProfile, TaxStrategy } from '../types';
import { CheckCircle, AlertCircle, Download, Calculator, Search, Zap, Sun, Baby, ArrowRight, Globe, RefreshCw, TrendingUp, ShieldAlert, ArrowUpRight, Info } from 'lucide-react';
import { getTaxStrategies } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface TaxCenterProps {
  profile: TaxProfile;
}

export const TaxCenter: React.FC<TaxCenterProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'horizon'>('current');
  const [isScanning, setIsScanning] = useState(false);
  const [impactIncome, setImpactIncome] = useState(85000); // Default for impact calculator

  const [strategies, setStrategies] = useState<TaxStrategy[]>([
      {
          id: 'static_1',
          title: 'Roth Conversion Window',
          description: 'Tax rates are historically low until 2025. Converting Traditional IRA to Roth now locks in current rates before they likely rise in 2026.',
          impact: 'High',
          yearTarget: 2026
      },
      {
          id: 'static_2',
          title: 'Estate Tax "Use It or Lose It"',
          description: 'The lifetime estate tax exemption is set to be cut in half in 2026. Consider gifting strategies now.',
          impact: 'High',
          yearTarget: 2026
      }
  ]);

  const potentialCredits = [
      { 
          name: 'Clean Vehicle Credit', 
          amount: 7500, 
          icon: Zap,
          color: 'text-emerald-500', 
          bg: 'bg-emerald-100',
          description: 'For new EVs purchased in 2024. Income limits apply.'
      },
      { 
          name: 'Residential Energy Credit', 
          amount: 1200, 
          icon: Sun,
          color: 'text-orange-500', 
          bg: 'bg-orange-100',
          description: '30% of cost for solar, windows, or heat pumps.'
      },
      { 
          name: 'Child Tax Credit', 
          amount: 2000, 
          icon: Baby,
          color: 'text-blue-500', 
          bg: 'bg-blue-100',
          description: 'Per eligible child under age 17.'
      }
  ];

  const handleScanStrategies = async () => {
      setIsScanning(true);
      const newStrategies = await getTaxStrategies();
      if (newStrategies && newStrategies.length > 0) {
          setStrategies(newStrategies);
      }
      setIsScanning(false);
  };

  // --- 2026 IMPACT CALCULATOR ---
  const calculateSunsetImpact = (income: number) => {
      // Simplified estimations for single filer
      
      // 2025 (Current)
      const stdDed2025 = 14600;
      const taxable2025 = Math.max(0, income - stdDed2025);
      let tax2025 = 0;
      // 2024-2025 Brackets (Simplified)
      if (taxable2025 > 100525) tax2025 += (taxable2025 - 100525) * 0.24 + 17835;
      else if (taxable2025 > 47150) tax2025 += (taxable2025 - 47150) * 0.22 + 6093;
      else if (taxable2025 > 11600) tax2025 += (taxable2025 - 11600) * 0.12 + 1160;
      else tax2025 += taxable2025 * 0.10;

      // 2026 (Projected Reversion)
      // Reverting Std Ded + Personal Exemptions
      const stdDed2026 = 8300; // Est inflation adj
      const persExempt2026 = 5050; // Est inflation adj
      const taxable2026 = Math.max(0, income - stdDed2026 - persExempt2026);
      let tax2026 = 0;
      // Pre-TCJA Brackets Reversion (Simplified Est)
      if (taxable2026 > 100000) tax2026 += (taxable2026 - 100000) * 0.28 + 20000; // approx
      else if (taxable2026 > 44000) tax2026 += (taxable2026 - 44000) * 0.25 + 6000;
      else if (taxable2026 > 11000) tax2026 += (taxable2026 - 11000) * 0.15 + 1100;
      else tax2026 += taxable2026 * 0.10;

      return { tax2025, tax2026, delta: tax2026 - tax2025 };
  };

  const impactData = calculateSunsetImpact(impactIncome);

  // Comparison Chart Data
  const chartData = [
      { name: '2025 (Now)', tax: Math.round(impactData.tax2025) },
      { name: '2026 (Projected)', tax: Math.round(impactData.tax2026) }
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tax Center</h1>
          <p className="text-slate-500">Autonomous filing and 2026 Horizon Planning.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
                Current Year
            </button>
            <button 
                onClick={() => setActiveTab('horizon')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'horizon' ? 'bg-purple-100 text-purple-800 shadow-sm' : 'text-slate-500'}`}
            >
                <TrendingUp size={14} className="mr-1" /> 2026 Horizon
            </button>
        </div>
      </header>

      {activeTab === 'current' ? (
        <>
            {/* MAIN STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-blue-500/50 rounded-lg px-2 py-1 text-[10px] font-bold flex items-center border border-blue-400/30">
                        <CheckCircle size={10} className="mr-1" /> Tax Year 2024
                    </div>
                    <p className="text-blue-200 font-medium text-sm mb-1">Estimated Liability (YTD)</p>
                    <h2 className="text-4xl font-bold mb-4">${profile.estimatedLiability.toLocaleString()}</h2>
                    <div className="flex items-center text-xs text-blue-200 bg-blue-700/50 rounded-lg p-2">
                        <AlertCircle size={16} className="mr-2" />
                        Next Quarterly Payment: {profile.nextDeadline}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-500 font-medium text-sm">Detected Deductions</span>
                        <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                            <Search size={20} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">{profile.deductionsFound}</h2>
                    <p className="text-sm text-slate-500 mt-1">AI found business expenses</p>
                    <div className="mt-4 text-sm font-bold text-emerald-600">
                        +${profile.potentialSavings.toLocaleString()} potential savings
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-500 font-medium text-sm">Filing Readiness</span>
                        <div className="bg-orange-100 text-orange-700 p-2 rounded-full">
                            <Calculator size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                        <div className="bg-orange-500 h-3 rounded-full w-[85%]"></div>
                    </div>
                    <p className="text-sm text-slate-500">
                        <strong className="text-slate-900">85% Ready.</strong> Just need to categorize 4 transactions.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DEDUCTION LIST */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">AI-Detected Deductions (Review Needed)</h3>
                        <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { merchant: 'Apple Store', amount: 1299.00, category: 'Equipment', confidence: 'High' },
                            { merchant: 'Shell Station', amount: 45.00, category: 'Travel', confidence: 'Medium' },
                            { merchant: 'WeWork', amount: 350.00, category: 'Office Rent', confidence: 'High' }
                        ].map((item, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                        {item.merchant[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{item.merchant}</p>
                                        <p className="text-xs text-slate-500">Categorized as {item.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-medium border border-emerald-100">
                                        {item.confidence} Confidence
                                    </span>
                                    <span className="font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                                    <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                                        <CheckCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CREDIT HUNTER */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center space-x-2 mb-6">
                        <Search size={20} className="text-emerald-400" />
                        <h3 className="font-bold text-lg">Tax Credit Hunter</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Potential credits based on your spending profile (2024 Rules).</p>
                    
                    <div className="space-y-4">
                        {potentialCredits.map((credit, i) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-1.5 rounded-lg ${credit.bg} ${credit.color}`}>
                                            <credit.icon size={14} />
                                        </div>
                                        <span className="font-bold text-sm">{credit.name}</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold text-sm">+${credit.amount}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-tight pl-9">{credit.description}</p>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-sm transition-colors">
                        Check Eligibility
                    </button>
                </div>
            </div>
        </>
      ) : (
        // ================= 2026 HORIZON TAB =================
        <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
            {/* SUNSET HEADER */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl -mr-20 -mt-20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                            <ShieldAlert size={14} className="text-orange-300" />
                            <span>Legislative Alert: TCJA Sunset</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">The 2026 Tax Cliff</h2>
                        <p className="text-purple-100 max-w-lg leading-relaxed">
                            The Tax Cuts and Jobs Act expires Dec 31, 2025. Without Congressional action, standard deductions halve and tax rates rise significantly.
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm min-w-[320px]">
                        <h4 className="font-bold border-b border-white/10 pb-2 mb-3 text-sm uppercase tracking-wide text-purple-200">Impact Preview</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-xs">Standard Deduction (Single)</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-emerald-300 font-bold">$14,600</span>
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <span className="text-orange-300 font-bold">$8,300*</span>
                                </div>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-xs">Salt Cap</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-orange-300 font-bold">$10k Limit</span>
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <span className="text-emerald-300 font-bold">Unlimited</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 pt-2 italic border-t border-white/10">*Estimated reversion level adjusted for inflation.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMPACT CALCULATOR (NEW) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <Calculator className="mr-2 text-indigo-600" /> Personal Impact Calculator
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Projected 2026 Income</label>
                            <input 
                                type="range" 
                                min="30000" 
                                max="250000" 
                                step="5000" 
                                value={impactIncome} 
                                onChange={(e) => setImpactIncome(parseInt(e.target.value))}
                                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="mt-2 text-center font-bold text-2xl text-indigo-700">${impactIncome.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                            This calculator simulates your tax burden under current 2025 brackets vs. the projected 2026 reversion brackets.
                        </div>
                        
                        {/* Delta Highlight */}
                        <div className={`p-4 rounded-xl text-center ${impactData.delta > 0 ? 'bg-orange-50 border border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                             <div className="text-xs font-bold uppercase mb-1">Projected Change</div>
                             <div className="text-2xl font-bold">{impactData.delta > 0 ? '+' : ''}${Math.round(impactData.delta).toLocaleString()}</div>
                             <div className="text-xs opacity-75 mt-1">{impactData.delta > 0 ? 'Increase in Tax' : 'Decrease in Tax'}</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        formatter={(val: number) => [`$${val.toLocaleString()}`, 'Est. Tax']}
                                    />
                                    <Bar dataKey="tax" radius={[0, 4, 4, 0]} barSize={40}>
                                        <Cell fill="#10b981" /> {/* 2025 Green */}
                                        <Cell fill="#f97316" /> {/* 2026 Orange */}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-slate-400 mt-2">
                            Comparison of estimated federal income tax liability.
                        </div>
                    </div>
                </div>
            </div>

            {/* TAX BRACKET COMPARISON */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-indigo-600" /> Tax Bracket Reversion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-700">Current Law (2024-2025)</h4>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Lower Rates</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { rate: '10%', range: '$0 - $11,600' },
                                { rate: '12%', range: '$11,601 - $47,150' },
                                { rate: '22%', range: '$47,151 - $100,525' },
                                { rate: '24%', range: '$100,526 - $191,950' },
                            ].map((b, i) => (
                                <div key={i} className="flex justify-between p-2 bg-slate-50 rounded-lg text-sm">
                                    <span className="text-slate-500">{b.range}</span>
                                    <span className="font-bold text-emerald-600">{b.rate}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-bl-xl">PROJECTED</div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-700">Projected 2026 Reversion</h4>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Higher Rates</span>
                        </div>
                        <div className="space-y-2">
                             {[
                                { rate: '10%', range: 'No Change' },
                                { rate: '15%', range: 'Was 12% (+3%)', highlight: true },
                                { rate: '25%', range: 'Was 22% (+3%)', highlight: true },
                                { rate: '28%', range: 'Was 24% (+4%)', highlight: true },
                            ].map((b, i) => (
                                <div key={i} className={`flex justify-between p-2 rounded-lg text-sm ${b.highlight ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50'}`}>
                                    <span className="text-slate-500">{b.range}</span>
                                    <span className={`font-bold ${b.highlight ? 'text-orange-600' : 'text-slate-600'}`}>{b.rate}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* STRATEGIES SECTION */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <Globe className="mr-2 text-indigo-600" /> AI Grounded Strategies
                    </h3>
                    <button 
                        onClick={handleScanStrategies}
                        disabled={isScanning}
                        className="bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center shadow-sm"
                    >
                        {isScanning ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Search className="mr-2" size={16} />}
                        {isScanning ? 'Scanning Legislation...' : 'Scan for Updates'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strategies.map(strategy => (
                        <div key={strategy.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            {strategy.impact === 'High' && (
                                <div className="absolute top-0 right-0 bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-xl border-b border-l border-orange-100">
                                    HIGH IMPACT
                                </div>
                            )}
                            <h4 className="font-bold text-slate-900 text-lg mb-2 pr-8">{strategy.title}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                {strategy.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target: {strategy.yearTarget}</span>
                                <button className="text-indigo-600 text-sm font-bold flex items-center hover:underline">
                                    View Plan <ArrowRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* RESOURCES (Common Footer) */}
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-slate-900 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">IRS Form 1040</h3>
                    <p className="text-slate-500 text-sm">Draft generated for 2024 Tax Year</p>
                </div>
                <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600">
                    <Download size={24} />
                </button>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-slate-900 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Schedule C</h3>
                    <p className="text-slate-500 text-sm">Profit & Loss from Business</p>
                </div>
                <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600">
                    <Download size={24} />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
