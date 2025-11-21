import React from 'react';
import { ForecastItem } from '../types';
import { Calendar, AlertTriangle, Check } from 'lucide-react';

interface ForecastProps {
  items: ForecastItem[];
}

export const Forecast: React.FC<ForecastProps> = ({ items }) => {
  const totalForecast = items.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Upcoming Forecast</h1>
        <p className="text-slate-500">Predicted staple expenditures for the next 30 days.</p>
      </header>

      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-700 rounded-full opacity-50 blur-3xl"></div>
         
         <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-2">Predicted Spend (Recurring + Staples)</p>
            <h2 className="text-5xl font-bold tracking-tight">${totalForecast.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <div className="mt-6 flex items-center space-x-2 text-sm text-indigo-200 bg-indigo-800/50 w-fit px-3 py-1.5 rounded-lg border border-indigo-700">
                <Calendar size={16} />
                <span>Next 30 Days</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Recurring Bills Detected</h3>
              </div>
              <div className="divide-y divide-slate-100">
                  {items.filter(i => i.confidence > 90).map((item, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <Check size={16} strokeWidth={3} />
                              </div>
                              <div>
                                  <p className="font-medium text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">Due on the {item.date}</p>
                              </div>
                          </div>
                          <span className="font-bold text-slate-800">${item.amount.toFixed(2)}</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Variable Staples (Estimates)</h3>
              </div>
              <div className="divide-y divide-slate-100">
                  {items.filter(i => i.confidence <= 90).map((item, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                  <AlertTriangle size={16} />
                              </div>
                              <div>
                                  <p className="font-medium text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">{item.confidence}% Confidence</p>
                              </div>
                          </div>
                          <span className="font-bold text-slate-800">~${item.amount.toFixed(2)}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};