
import React, { useState } from 'react';
import { SquadBill } from '../types';
import { Users, ScanLine, Share2, Check, Copy, DollarSign, QrCode, X, ExternalLink, Smartphone } from 'lucide-react';

interface SquadSplitProps {
  bills: SquadBill[];
}

export const SquadSplit: React.FC<SquadSplitProps> = ({ bills: initialBills }) => {
  const [bills, setBills] = useState(initialBills);
  const [showShareModal, setShowShareModal] = useState<string | null>(null); // Holds ID of bill to share

  const activeBill = bills.find(b => b.id === showShareModal);

  const copyLink = () => {
      alert("Payment link copied to clipboard! https://pocketledger.app/pay/x9d8s7");
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Squad Split</h1>
          <p className="text-slate-500">Snap receipts, tag friends, and get paid back instantly.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-indigo-200">
            <ScanLine size={18} />
            <span>Scan New Receipt</span>
        </button>
      </header>

      {/* PAYMENT LINK / QR MODAL */}
      {showShareModal && activeBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">Collect Payments</h3>
                        <p className="text-slate-400 text-sm">For {activeBill.title} (${activeBill.totalAmount})</p>
                    </div>
                    <button onClick={() => setShowShareModal(null)} className="text-slate-400 hover:text-white bg-white/10 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm mb-6">
                        {/* Simulated QR Code */}
                        <div className="w-48 h-48 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                             <QrCode size={140} className="text-white opacity-90" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-xl font-bold text-indigo-600">P</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-lg mb-1">Scan to Pay</h4>
                    <p className="text-slate-500 text-sm mb-6 max-w-[240px]">Friends don't need the app. This code opens a web payment page.</p>

                    <div className="w-full space-y-3">
                         <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                             <span className="flex-1 text-left px-3 text-sm text-slate-500 font-mono truncate">pocketledger.app/pay/x9...</span>
                             <button onClick={copyLink} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:text-indigo-600 shadow-sm transition-colors">
                                 Copy Link
                             </button>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center space-x-2 py-2.5 bg-[#008CFF]/10 text-[#008CFF] rounded-xl font-bold text-sm hover:bg-[#008CFF]/20 transition-colors">
                                <Smartphone size={16} />
                                <span>Venmo</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 py-2.5 bg-[#00D64F]/10 text-[#00D64F] rounded-xl font-bold text-sm hover:bg-[#00D64F]/20 transition-colors">
                                <DollarSign size={16} />
                                <span>CashApp</span>
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ACTIVE BILLS */}
          {bills.map(bill => (
              <div key={bill.id} className="bg-white rounded-3xl p-0 shadow-xl border border-slate-100 overflow-hidden">
                  {/* Receipt Visual Header */}
                  <div className="bg-slate-50 p-6 border-b border-dashed border-slate-300 relative">
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="text-xl font-bold text-slate-900">{bill.title}</h3>
                              <p className="text-slate-500 text-sm">{bill.location} • {bill.date}</p>
                          </div>
                          <div className="bg-white px-3 py-1 rounded border border-slate-200 text-lg font-mono font-bold text-slate-800 shadow-sm">
                              ${bill.totalAmount.toFixed(2)}
                          </div>
                      </div>
                      
                      {/* Zig Zag bottom border decoration */}
                      <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-50" style={{
                          background: 'linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 10px'
                      }}></div>
                  </div>

                  <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-800 flex items-center">
                              <Users size={18} className="mr-2 text-indigo-600" /> Split Breakdown
                          </h4>
                          <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                              {bill.members.filter(m => m.status === 'paid').length}/{bill.members.length} Paid
                          </span>
                      </div>

                      <div className="space-y-3 mb-6">
                          {bill.members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                  <div className="flex items-center space-x-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member.name === 'You' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                          {member.name === 'You' ? 'ME' : member.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                                          {member.status === 'paid' ? (
                                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide flex items-center">
                                                  <Check size={10} className="mr-0.5" /> Paid
                                              </p>
                                          ) : (
                                              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide">Pending</p>
                                          )}
                                      </div>
                                  </div>
                                  <div className="font-mono font-medium text-slate-700">
                                      ${member.owedAmount.toFixed(2)}
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="flex space-x-3">
                          <button 
                            onClick={() => setShowShareModal(bill.id)}
                            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                          >
                              <QrCode size={16} className="mr-2" /> Share Payment Link
                          </button>
                          <button className="px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
                              <Share2 size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          ))}

          {/* START NEW SPLIT */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
               <div className="relative z-10">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                       <DollarSign size={32} className="text-white" />
                   </div>
                   <h3 className="text-2xl font-bold mb-2">Start a New Split</h3>
                   <p className="text-indigo-100 mb-8 max-w-xs mx-auto">Manual entry or photo scan. We handle the math, tax, and tip distribution.</p>
                   <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                       Create New Bill
                   </button>
               </div>
          </div>
      </div>
    </div>
  );
};
