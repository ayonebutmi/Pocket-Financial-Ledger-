
import React, { useState } from 'react';
import { DreamGoal } from '../types';
import { ScanLine, BarChart2, ShoppingCart, Search, Loader2, X, Tag, TrendingDown, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

interface ShopModeProps {
  hourlyWage: number;
  dreamGoal: DreamGoal;
}

export const ShopMode: React.FC<ShopModeProps> = ({ hourlyWage, dreamGoal }) => {
  const [mode, setMode] = useState<'scan' | 'deals'>('scan');
  
  // Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // MOCK SCAN
  const handleScan = () => {
      setIsScanning(true);
      setTimeout(() => {
          setIsScanning(false);
          setScanResult({
              name: "Sony WH-1000XM5 Headphones",
              currentPrice: 348.00,
              historicalLow: 298.00,
              averagePrice: 348.00,
              priceTrend: 'high', // high, low, fair
              competitors: [
                  { name: 'Amazon', price: 348.00, shipping: 'Free', logo: 'A' },
                  { name: 'Best Buy', price: 349.99, shipping: 'Pickup', logo: 'B' },
                  { name: 'Walmart', price: 329.00, shipping: '+$5.99', logo: 'W' }
              ],
              coupons: [
                  { code: 'SONY20', discount: '5% Off', successRate: '85%' },
                  { code: 'FREESHIP', discount: 'Free Shipping', successRate: '92%' }
              ]
          });
      }, 2000);
  };

  const resetScan = () => {
      setScanResult(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shop Mode</h1>
          <p className="text-slate-500">Deal intelligence and coupon hunting.</p>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex space-x-1">
            <button 
                onClick={() => setMode('scan')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${mode === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <ScanLine size={16} className="mr-2" /> Scan Item
            </button>
            <button 
                onClick={() => setMode('deals')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${mode === 'deals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Tag size={16} className="mr-2" /> My Coupons
            </button>
        </div>
      </header>

      {/* ================= SCANNER MODE ================= */}
      {mode === 'scan' && (
          <div className="max-w-2xl mx-auto">
              {!scanResult ? (
                  <div className="bg-slate-900 rounded-3xl aspect-[3/4] sm:aspect-[4/3] relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                      {/* Camera UI Overlay */}
                      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
                      
                      <div className="relative z-10 w-64 h-64 border-2 border-white/30 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg"></div>
                          
                          {isScanning ? (
                              <div className="flex flex-col items-center animate-pulse">
                                  <Search className="text-white mb-2" size={32} />
                                  <span className="text-white font-bold tracking-widest">ANALYZING...</span>
                              </div>
                          ) : (
                              <div className="text-center">
                                  <ScanLine size={32} className="text-white mx-auto mb-2" />
                                  <span className="text-white/80 text-sm font-medium">Scan Price Tag</span>
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform z-20 flex items-center space-x-2"
                      >
                          {isScanning ? <><Loader2 className="animate-spin" size={18} /> <span>Searching Deals...</span></> : <span>Simulate Scan</span>}
                      </button>
                  </div>
              ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-300">
                      {/* Result Header */}
                      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 relative">
                          <button onClick={resetScan} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400">
                              <X size={20} />
                          </button>
                          
                          <div className="mb-6">
                             <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">Identified</span>
                             <h2 className="text-2xl font-bold text-slate-900 mt-2">{scanResult.name}</h2>
                             <p className="text-4xl font-bold text-slate-900 mt-2">${scanResult.currentPrice.toFixed(2)}</p>
                          </div>

                          {/* Price History Analysis */}
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-bold text-slate-800 flex items-center">
                                      <BarChart2 size={18} className="mr-2 text-indigo-600" /> Price Intelligence
                                  </h3>
                                  {scanResult.priceTrend === 'high' ? (
                                      <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded">Price is High</span>
                                  ) : (
                                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Great Price</span>
                                  )}
                              </div>
                              
                              <div className="flex space-x-4 text-sm">
                                  <div className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
                                      <p className="text-slate-500 text-xs mb-1">Historical Low</p>
                                      <p className="font-bold text-emerald-600">${scanResult.historicalLow}</p>
                                  </div>
                                  <div className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
                                      <p className="text-slate-500 text-xs mb-1">Average</p>
                                      <p className="font-bold text-slate-700">${scanResult.averagePrice}</p>
                                  </div>
                              </div>
                              
                              {scanResult.priceTrend === 'high' && (
                                  <div className="mt-4 flex items-start space-x-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-lg">
                                      <TrendingUp size={14} className="mt-0.5 flex-shrink-0" />
                                      <p><strong>Wait to buy.</strong> This item frequently drops to ${scanResult.historicalLow} (Save ${(scanResult.currentPrice - scanResult.historicalLow).toFixed(2)}). Add to Dream Vault to track price drops.</p>
                                  </div>
                              )}
                          </div>

                          {/* Competitor Comparison */}
                          <div className="mb-6">
                             <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                                 <ExternalLink size={18} className="mr-2 text-indigo-600" /> Competitor Prices
                             </h3>
                             <div className="space-y-2">
                                 {scanResult.competitors.map((comp: any, idx: number) => (
                                     <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                                         <div className="flex items-center space-x-3">
                                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                                 {comp.logo}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-slate-900">{comp.name}</p>
                                                 <p className="text-xs text-slate-500">{comp.shipping}</p>
                                             </div>
                                         </div>
                                         <span className={`font-bold ${comp.price < scanResult.currentPrice ? 'text-emerald-600' : 'text-slate-900'}`}>
                                             ${comp.price}
                                         </span>
                                     </div>
                                 ))}
                             </div>
                          </div>

                          {/* Coupon Hunter */}
                          <div>
                              <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                                  <Tag size={18} className="mr-2 text-indigo-600" /> Found Coupons
                              </h3>
                              <div className="space-y-2">
                                  {scanResult.coupons.map((coupon: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between p-3 border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl">
                                          <div>
                                              <p className="font-mono font-bold text-indigo-700">{coupon.code}</p>
                                              <p className="text-xs text-indigo-500">{coupon.discount}</p>
                                          </div>
                                          <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                              Apply
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}
      
      {/* ================= DEALS MODE (Placeholder) ================= */}
      {mode === 'deals' && (
          <div className="text-center py-20 text-slate-400">
              <Tag size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-slate-600">Saved Coupons</h3>
              <p>Your clipped coupons will appear here.</p>
          </div>
      )}
    </div>
  );
};
