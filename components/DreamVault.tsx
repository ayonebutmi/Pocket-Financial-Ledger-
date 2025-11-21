


import React, { useState } from 'react';
import { DreamGoal } from '../types';
import { Sparkles, Plus, Calendar, MapPin, Utensils, Ticket, Plane, CheckCircle, TrendingDown, ArrowRight, Loader2, Home, Car, Calculator, DollarSign, Percent, Shield, AlertTriangle, TrendingUp, Clock, Target, Info, X } from 'lucide-react';

interface DreamVaultProps {
  goals: DreamGoal[];
}

type WizardType = 'TRIP' | 'HOME' | 'CAR' | null;

export const DreamVault: React.FC<DreamVaultProps> = ({ goals: initialGoals }) => {
  const [goals, setGoals] = useState<DreamGoal[]>(initialGoals);
  const [depositAmount, setDepositAmount] = useState<Record<string, string>>({});
  
  // Wizard State
  const [wizardType, setWizardType] = useState<WizardType>(null);
  const [wizardStep, setWizardStep] = useState<'details' | 'calculating' | 'result'>('details');
  
  // Trip State
  const [newTrip, setNewTrip] = useState({ destination: '', duration: 5, style: 'moderate' });
  
  // Home State
  const [homeDetails, setHomeDetails] = useState({ price: 450000, downPaymentPercent: 20, monthlyContribution: 2000 });
  const [homeLoan, setHomeLoan] = useState({ rate: 7.2, term: 30, taxRate: 1.25, insurance: 1500 });

  // Car State
  const [carDetails, setCarDetails] = useState({ price: 35000, tradeIn: 5000, monthlyContribution: 800 });
  const [carLoan, setCarLoan] = useState({ rate: 8.5, term: 60, extraPayment: 0 });

  const handleDeposit = (id: string) => {
    const amount = parseFloat(depositAmount[id]);
    if (isNaN(amount) || amount <= 0) return;

    setGoals(prev => prev.map(g => {
        if (g.id === id) {
            return { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) };
        }
        return g;
    }));
    setDepositAmount(prev => ({ ...prev, [id]: '' }));
  };

  const closeWizard = () => {
      setWizardType(null);
      setWizardStep('details');
      // Reset loan calculation defaults
      setCarLoan(prev => ({ ...prev, extraPayment: 0 }));
  };

  const calculateDateFromDuration = (months: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // --- CALCULATION HELPERS ---

  const calculateMortgage = (principal: number) => {
    if (principal <= 0) return 0;
    // Handle 0% interest or missing input
    if (!homeLoan.rate || homeLoan.rate <= 0) {
        if (homeLoan.term <= 0) return 0;
        return principal / (homeLoan.term * 12);
    }

    const r = homeLoan.rate / 100 / 12;
    const n = homeLoan.term * 12;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const calculateCarLoan = (principal: number, extraMonthly: number = 0) => {
     if (principal <= 0) return { minPayment: 0, totalInterest: 0, months: 0, totalCost: 0, actualMonths: 0 };
     
     let minPayment = 0;
     const n = carLoan.term;

     // Handle 0% Interest
     if (!carLoan.rate || carLoan.rate <= 0) {
         minPayment = principal / n;
         const actualPayment = minPayment + extraMonthly;
         const actualMonths = Math.ceil(principal / actualPayment);
         return { 
             minPayment, 
             totalInterest: 0, 
             months: n, 
             actualMonths, 
             totalCost: principal 
         };
     }
     
     const r = carLoan.rate / 100 / 12;
     minPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
     
     let balance = principal;
     let totalInterest = 0;
     let actualMonths = 0;
     const actualPayment = minPayment + extraMonthly;

     // Amortization Loop
     while (balance > 0.01 && actualMonths < 1200) { 
         const interest = balance * r;
         const principalPayment = actualPayment - interest;
         
         // If principal payment is effectively zero or negative (payment covers only interest), break to avoid infinite loop
         if (principalPayment <= 0) break; 
         
         totalInterest += interest;
         balance -= principalPayment;
         actualMonths++;
     }
     
     return { minPayment, totalInterest, actualMonths, totalCost: principal + totalInterest };
  };

  // --- CREATE GOALS ---

  const createTripGoal = () => {
      setWizardStep('calculating');
      setTimeout(() => {
          const estimatedCost = newTrip.style === 'luxury' ? 5000 : newTrip.style === 'moderate' ? 2500 : 1200;
          const newGoal: DreamGoal = {
              id: `dg_${Date.now()}`,
              name: `Trip to ${newTrip.destination}`,
              targetAmount: estimatedCost,
              savedAmount: 0,
              deadline: calculateDateFromDuration(6),
              category: 'Travel',
              imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
              tripDetails: {
                  destination: newTrip.destination,
                  durationDays: newTrip.duration,
                  travelStyle: newTrip.style as any
              },
              suggestions: [
                  { type: 'flight', title: 'Low Fare Calendar', price: 400, description: 'Best rates found in mid-October.' },
                  { type: 'hotel', title: 'City Center Boutique', price: 120, description: 'Great location, free breakfast.' }
              ]
          };
          setGoals([...goals, newGoal]);
          closeWizard();
      }, 2000);
  };

  const createHomeGoal = () => {
      const downPayment = homeDetails.price * (homeDetails.downPaymentPercent / 100);
      const closingCosts = homeDetails.price * 0.03; 
      const totalTarget = downPayment + closingCosts;
      const monthsToGoal = homeDetails.monthlyContribution > 0 ? Math.ceil(totalTarget / homeDetails.monthlyContribution) : 0;

      // Calculate persisted details
      const loanPrincipal = Math.max(0, homeDetails.price - downPayment);
      const monthlyPI = calculateMortgage(loanPrincipal);
      const monthlyTax = (homeDetails.price * (homeLoan.taxRate / 100)) / 12;
      const monthlyIns = homeLoan.insurance / 12;

      const newGoal: DreamGoal = {
          id: `dg_home_${Date.now()}`,
          name: 'New Home Fund',
          targetAmount: totalTarget,
          savedAmount: 0,
          deadline: calculateDateFromDuration(monthsToGoal),
          category: 'Home',
          imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop',
          suggestions: [
              { type: 'activity', title: 'First Time Homebuyer Grant', price: 0, description: 'Check eligibility for state assistance.' }
          ],
          homeDetails: {
              listingPrice: homeDetails.price,
              downPaymentPercent: homeDetails.downPaymentPercent,
              estimatedMonthlyMortgage: monthlyPI,
              estimatedTax: monthlyTax,
              estimatedInsurance: monthlyIns
          }
      };
      setGoals([...goals, newGoal]);
      closeWizard();
  };

  const createCarGoal = () => {
      const totalTarget = Math.max(0, carDetails.price - carDetails.tradeIn);
      const monthsToGoal = carDetails.monthlyContribution > 0 ? Math.ceil(totalTarget / carDetails.monthlyContribution) : 0;

      // Persist calculations
      const standard = calculateCarLoan(totalTarget, 0);
      const accelerated = calculateCarLoan(totalTarget, carLoan.extraPayment);
      const potentialSavings = standard.totalInterest - accelerated.totalInterest;

      const newGoal: DreamGoal = {
          id: `dg_car_${Date.now()}`,
          name: 'New Car Fund',
          targetAmount: totalTarget,
          savedAmount: 0,
          deadline: calculateDateFromDuration(monthsToGoal),
          category: 'Auto',
          imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop',
          carDetails: {
              fullPrice: carDetails.price,
              loanTerm: carLoan.term,
              interestRate: carLoan.rate,
              totalInterestCost: standard.totalInterest,
              potentialSavings: potentialSavings
          }
      };
      setGoals([...goals, newGoal]);
      closeWizard();
  };

  // --- RENDERERS ---

  const renderWizardContent = () => {
      if (wizardStep === 'calculating') {
          return (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Crunching Numbers...</h3>
                <p className="text-slate-500">Building your personalized savings roadmap.</p>
            </div>
          );
      }

      if (wizardType === 'TRIP') {
          return (
              <>
                <div className="mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        <Plane size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Plan a Trip</h2>
                    <p className="text-slate-500">AI estimates flight, hotel, and daily costs.</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Where to?</label>
                        <input type="text" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} placeholder="e.g. Tokyo, Japan" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Duration</label>
                            <select value={newTrip.duration} onChange={e => setNewTrip({...newTrip, duration: parseInt(e.target.value) || 3})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none">
                                <option value={3}>3 Days</option>
                                <option value={5}>5 Days</option>
                                <option value={7}>7 Days</option>
                                <option value={14}>14 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Style</label>
                            <select value={newTrip.style} onChange={e => setNewTrip({...newTrip, style: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none">
                                <option value="budget">Budget</option>
                                <option value="moderate">Moderate</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3 mt-8">
                    <button onClick={closeWizard} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={createTripGoal} className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Estimate Cost</button>
                </div>
              </>
          );
      }

      if (wizardType === 'HOME') {
          // Savings Calculation
          const downPayment = homeDetails.price * (homeDetails.downPaymentPercent / 100);
          const closingCosts = homeDetails.price * 0.03;
          const totalNeeded = downPayment + closingCosts;
          const months = homeDetails.monthlyContribution > 0 ? Math.ceil(totalNeeded / homeDetails.monthlyContribution) : 999;
          const years = (months / 12).toFixed(1);

          // Mortgage Calculation
          const loanPrincipal = Math.max(0, homeDetails.price - downPayment);
          const monthlyPI = calculateMortgage(loanPrincipal);
          const monthlyTax = (homeDetails.price * (homeLoan.taxRate / 100)) / 12;
          const monthlyIns = homeLoan.insurance / 12;
          const totalMonthlyPITI = monthlyPI + monthlyTax + monthlyIns;

          return (
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                 <div className="mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                        <Home size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Home Buying Calculator</h2>
                    <p className="text-slate-500">Plan your savings and estimate monthly costs.</p>
                </div>
                
                <div className="space-y-6">
                    {/* SECTION 1: SAVINGS */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                            <Target className="mr-2 text-emerald-600" size={16} /> Savings Phase
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Home Price</label>
                                <input type="number" value={homeDetails.price} onChange={e => setHomeDetails({...homeDetails, price: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Down Payment %</label>
                                <select value={homeDetails.downPaymentPercent} onChange={e => setHomeDetails({...homeDetails, downPaymentPercent: parseInt(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                                    <option value={3.5}>3.5% (FHA)</option>
                                    <option value={5}>5%</option>
                                    <option value={10}>10%</option>
                                    <option value={20}>20%</option>
                                </select>
                             </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                             <span>Down Payment: <strong>${downPayment.toLocaleString()}</strong></span>
                             <span>Closing (~3%): <strong>${closingCosts.toLocaleString()}</strong></span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                             <div>
                                 <span className="text-xs text-slate-500 block">Cash to Close (Target)</span>
                                 <span className="text-lg font-bold text-emerald-700">${totalNeeded.toLocaleString()}</span>
                             </div>
                             <div className="text-right">
                                 <span className="text-xs text-slate-500 block">Timeline (@${homeDetails.monthlyContribution}/mo)</span>
                                 <span className="text-sm font-bold text-slate-700">{months >= 999 ? '∞' : years} Years</span>
                             </div>
                        </div>
                    </div>

                    {/* SECTION 2: MONTHLY COST */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                            <Calendar className="mr-2 text-indigo-600" size={16} /> Monthly Ownership Cost
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Interest Rate (%)</label>
                                <input type="number" value={homeLoan.rate} onChange={e => setHomeLoan({...homeLoan, rate: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Loan Term (Years)</label>
                                <select value={homeLoan.term} onChange={e => setHomeLoan({...homeLoan, term: parseInt(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                                    <option value={15}>15 Years</option>
                                    <option value={30}>30 Years</option>
                                </select>
                             </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Mortgage (Principal & Interest)</span>
                                <span className="font-medium">${Math.round(monthlyPI).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                                <span className="flex items-center">Property Tax (~{homeLoan.taxRate}%) <AlertTriangle size={10} className="ml-1 text-orange-400" /></span>
                                <span className="font-medium">${Math.round(monthlyTax).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Home Insurance (Est.)</span>
                                <span className="font-medium">${Math.round(monthlyIns).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200">
                            <div>
                                <span className="text-xs text-indigo-200 block font-medium">Estimated Monthly Payment</span>
                                <span className="text-2xl font-bold">${Math.round(totalMonthlyPITI).toLocaleString()}</span>
                            </div>
                            <div className="text-right text-xs text-indigo-200">
                                Includes Taxes<br/>& Insurance
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-100">
                    <button onClick={closeWizard} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={createHomeGoal} className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Start Saving Fund</button>
                </div>
              </div>
          );
      }

      if (wizardType === 'CAR') {
          const loanAmount = Math.max(0, carDetails.price - carDetails.tradeIn);
          // Calculate Standard
          const standard = calculateCarLoan(loanAmount, 0);
          
          // Calculate Accelerated
          const accelerated = calculateCarLoan(loanAmount, carLoan.extraPayment);

          const interestSaved = standard.totalInterest - accelerated.totalInterest;
          const timeSaved = standard.actualMonths - accelerated.actualMonths;

          return (
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                <div className="mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <Car size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Car Loan Reality Check</h2>
                    <p className="text-slate-500">See the true cost of buying a car with a loan.</p>
                </div>

                <div className="space-y-6">
                    {/* INPUTS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle Price</label>
                            <input type="number" value={carDetails.price} onChange={e => setCarDetails({...carDetails, price: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Trade-In / Down</label>
                            <input type="number" value={carDetails.tradeIn} onChange={e => setCarDetails({...carDetails, tradeIn: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg font-bold text-emerald-600" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Interest Rate (APR)</label>
                            <div className="relative">
                                <input type="number" value={carLoan.rate} onChange={e => setCarLoan({...carLoan, rate: parseFloat(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Loan Term</label>
                            <select value={carLoan.term} onChange={e => setCarLoan({...carLoan, term: parseInt(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                                <option value={36}>36 Months</option>
                                <option value={48}>48 Months</option>
                                <option value={60}>60 Months</option>
                                <option value={72}>72 Months</option>
                                <option value={84}>84 Months</option>
                            </select>
                        </div>
                    </div>

                    {/* REALITY CARD */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                         <div className="relative z-10 grid grid-cols-2 gap-4 mb-4 border-b border-slate-700 pb-4">
                             <div>
                                 <span className="text-xs text-slate-400 block">Loan Amount</span>
                                 <span className="text-xl font-bold">${loanAmount.toLocaleString()}</span>
                             </div>
                             <div className="text-right">
                                 <span className="text-xs text-slate-400 block">Monthly Payment</span>
                                 <span className="text-xl font-bold text-blue-400">${Math.round(standard.minPayment).toLocaleString()}</span>
                             </div>
                         </div>
                         
                         <div className="relative z-10">
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-slate-400">Total Interest Paid:</span>
                                 <span className="font-bold text-orange-400">${Math.round(standard.totalInterest).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-400">Total Cost of Car:</span>
                                 <span className="font-bold">${Math.round(standard.totalCost).toLocaleString()}</span>
                             </div>
                         </div>
                    </div>

                    {/* EXTRA PAYMENT SIMULATOR */}
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold text-emerald-900 flex items-center text-sm">
                                 <TrendingUp size={16} className="mr-2" /> Power Payer Effect
                             </h4>
                             <span className="bg-white text-emerald-700 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                 Pay Extra
                             </span>
                        </div>
                        
                        <div className="mb-4">
                             <label className="block text-xs font-bold text-emerald-800 mb-2">Extra Monthly Payment: <span className="text-lg ml-1">${carLoan.extraPayment}</span></label>
                             <input 
                                type="range" 
                                min="0" 
                                max="500" 
                                step="10" 
                                value={carLoan.extraPayment} 
                                onChange={(e) => setCarLoan({...carLoan, extraPayment: parseInt(e.target.value)})}
                                className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                             />
                        </div>

                        {carLoan.extraPayment > 0 ? (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                                    <span className="text-xs text-slate-500 block mb-1">Interest Saved</span>
                                    <span className="text-lg font-bold text-emerald-600">${Math.round(interestSaved).toLocaleString()}</span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm text-center">
                                    <span className="text-xs text-slate-500 block mb-1">Time Saved</span>
                                    <span className="text-lg font-bold text-emerald-600">{timeSaved} Mos</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-emerald-700 text-center italic">Move the slider to see how much you can save.</p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3 mt-8">
                    <button onClick={closeWizard} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={createCarGoal} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Create Savings Goal</button>
                </div>
              </div>
          );
      }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dream Vault</h1>
        <p className="text-slate-500">Visualize goals with smart price tracking and AI planning.</p>
      </header>

      {/* WIZARD MODAL */}
      {wizardType && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
                  <button onClick={closeWizard} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={20} />
                  </button>
                  {renderWizardContent()}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {goals.map(goal => {
            const effectiveTarget = (goal.currentMarketPrice && goal.currentMarketPrice < goal.targetAmount) 
                ? goal.currentMarketPrice 
                : goal.targetAmount;
            const percentage = Math.min(goal.savedAmount / effectiveTarget, 1);
            const percentageDisplay = Math.round(percentage * 100);
            const blurAmount = 20 * (1 - percentage);
            const priceDropAmount = goal.currentMarketPrice && goal.currentMarketPrice < goal.targetAmount 
                ? goal.targetAmount - goal.currentMarketPrice 
                : 0;
            
            return (
                <div key={goal.id} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden group">
                    
                    {/* VISUAL TRACKER HEADER */}
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 bg-slate-900 group">
                        <img 
                            src={goal.imageUrl} 
                            alt={goal.name} 
                            className="w-full h-full object-cover transition-all duration-1000"
                            style={{ filter: `blur(${blurAmount}px)` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                            {goal.category}
                                        </div>
                                        {priceDropAmount > 0 && (
                                            <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center animate-pulse">
                                                <TrendingDown size={12} className="mr-1" /> Price Drop!
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white shadow-sm">{goal.name}</h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-white">{percentageDisplay}%</div>
                                    <div className="text-slate-300 text-xs uppercase tracking-wider">Revealed</div>
                                </div>
                            </div>
                        </div>
                        {percentage === 1 && (
                            <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center animate-in fade-in zoom-in">
                                <div className="text-center text-white">
                                    <CheckCircle size={64} className="mx-auto mb-2" />
                                    <h3 className="text-2xl font-bold">Goal Unlocked!</h3>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONTROLS */}
                    <div className="flex items-center justify-between mb-4">
                         <div>
                             <p className="text-slate-500 text-xs uppercase font-bold tracking-wide mb-1">Current Savings</p>
                             <p className="text-2xl font-bold text-slate-900">
                                 ${goal.savedAmount.toLocaleString()} <span className="text-slate-400 text-lg font-normal">/ ${effectiveTarget.toLocaleString()}</span>
                             </p>
                         </div>
                         <div className="text-right">
                             <p className="text-slate-500 text-xs uppercase font-bold tracking-wide mb-1">Target Date</p>
                             <div className="flex items-center text-slate-700 font-medium">
                                 <Calendar size={16} className="mr-1 text-indigo-500" />
                                 {goal.deadline}
                             </div>
                         </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full relative" style={{ width: `${percentageDisplay}%` }}></div>
                    </div>

                    {/* --- PERSISTED HOME DETAILS --- */}
                    {goal.homeDetails && (
                        <div className="mb-6 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-emerald-900 text-sm flex items-center">
                                    <Home size={14} className="mr-2" /> Monthly Ownership
                                </h4>
                                <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm">Est. PITI</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Mortgage: <span className="font-bold text-slate-700">${Math.round(goal.homeDetails.estimatedMonthlyMortgage).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Taxes & Ins: <span className="font-bold text-slate-700">${Math.round(goal.homeDetails.estimatedTax + goal.homeDetails.estimatedInsurance).toLocaleString()}</span>
                                </div>
                                <div className="text-sm font-bold text-emerald-700">
                                    ${Math.round(goal.homeDetails.estimatedMonthlyMortgage + goal.homeDetails.estimatedTax + goal.homeDetails.estimatedInsurance).toLocaleString()}/mo
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PERSISTED CAR DETAILS --- */}
                    {goal.carDetails && (
                        <div className="mb-6 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-blue-900 text-sm flex items-center">
                                    <Car size={14} className="mr-2" /> Loan Reality
                                </h4>
                                <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm">{goal.carDetails.loanTerm} Mos @ {goal.carDetails.interestRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                 <div>
                                     <span className="text-slate-500 block">Total Interest:</span>
                                     <span className="font-bold text-orange-600">${Math.round(goal.carDetails.totalInterestCost).toLocaleString()}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-slate-500 block">Potential Savings:</span>
                                     <span className="font-bold text-emerald-600">${Math.round(goal.carDetails.potentialSavings || 0).toLocaleString()}</span>
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* SMART SUGGESTIONS */}
                    {goal.suggestions && goal.suggestions.length > 0 && (
                        <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center mb-3">
                                <Sparkles size={14} className="text-indigo-600 mr-2" />
                                <span className="text-xs font-bold text-slate-500 uppercase">Smart Suggestions</span>
                            </div>
                            <div className="space-y-2">
                                {goal.suggestions.map((sug, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                {sug.type === 'flight' && <Plane size={14} />}
                                                {sug.type === 'hotel' && <Home size={14} />}
                                                {sug.type === 'activity' && <Ticket size={14} />}
                                                {sug.type === 'dining' && <Utensils size={14} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{sug.title}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{sug.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-xs font-bold text-slate-900">${sug.price}</p>
                                            {sug.dealBadge && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{sug.dealBadge}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="mt-auto pt-6 border-t border-slate-100">
                        {percentage < 1 ? (
                            <div className="flex space-x-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        value={depositAmount[goal.id] || ''}
                                        onChange={(e) => setDepositAmount(prev => ({...prev, [goal.id]: e.target.value}))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 outline-none focus:border-indigo-500 transition-colors font-medium"
                                    />
                                </div>
                                <button onClick={() => handleDeposit(goal.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center shadow-lg shadow-indigo-200">
                                    <Sparkles size={18} className="mr-2" /> Contribute
                                </button>
                            </div>
                        ) : (
                            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200">
                                Withdraw Funds & Purchase
                            </button>
                        )}
                    </div>
                </div>
            );
        })}

        {/* NEW GOAL CARDS */}
        <div className="flex flex-col gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
                 <button onClick={() => setWizardType('TRIP')} className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 rounded-3xl p-6 flex flex-col items-center justify-center text-indigo-700 transition-all text-center group">
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <Plane size={24} />
                     </div>
                     <span className="font-bold text-sm">Plan a Trip</span>
                 </button>
                 <button onClick={() => setWizardType('HOME')} className="bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded-3xl p-6 flex flex-col items-center justify-center text-emerald-700 transition-all text-center group">
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <Home size={24} />
                     </div>
                     <span className="font-bold text-sm">Buy a Home</span>
                 </button>
                 <button onClick={() => setWizardType('CAR')} className="bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-3xl p-6 flex flex-col items-center justify-center text-blue-700 transition-all text-center group">
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <Car size={24} />
                     </div>
                     <span className="font-bold text-sm">Buy a Car</span>
                 </button>
                 <button className="bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-600 transition-all text-center group">
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <Plus size={24} />
                     </div>
                     <span className="font-bold text-sm">Custom Goal</span>
                 </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400">
                <Calculator size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium max-w-xs text-center">Select a wizard above to have AI calculate your timeline, total interest, and savings targets automatically.</p>
            </div>
        </div>
      </div>
    </div>
  );
};