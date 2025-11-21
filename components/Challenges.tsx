
import React, { useState } from 'react';
import { UserLevel, Challenge, Badge } from '../types';
import { Trophy, Zap, Star, Award, Lock, Clock, Target, CheckCircle, Sunrise, Sword, TrendingUp } from 'lucide-react';

interface ChallengesProps {
  userLevel: UserLevel;
  challenges: Challenge[];
  badges: Badge[];
}

const IconMap: Record<string, React.ElementType> = {
  'Sunrise': Sunrise,
  'Sword': Sword,
  'TrendingUp': TrendingUp,
  'Zap': Zap
};

export const Challenges: React.FC<ChallengesProps> = ({ userLevel, challenges, badges }) => {
  const percentToLevel = (userLevel.currentXP / userLevel.nextLevelXP) * 100;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Money Quests</h1>
        <p className="text-slate-500">Complete challenges, earn XP, and level up your financial game.</p>
      </header>

      {/* LEVEL HEADER */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                   <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-inner relative">
                       <Trophy size={40} className="text-yellow-300" />
                       <div className="absolute -bottom-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-200 shadow-sm">
                           Lvl {userLevel.currentLevel}
                       </div>
                   </div>
                   <div>
                       <h2 className="text-3xl font-bold">{userLevel.title}</h2>
                       <p className="text-indigo-200 flex items-center mt-1">
                           <Zap size={16} className="mr-1 text-yellow-300 fill-yellow-300" /> 
                           {userLevel.streakDays} Day Streak!
                       </p>
                   </div>
              </div>

              <div className="w-full md:w-1/2">
                  <div className="flex justify-between text-xs font-bold tracking-wide uppercase mb-2">
                      <span className="text-indigo-200">XP Progress</span>
                      <span className="text-white">{userLevel.currentXP} / {userLevel.nextLevelXP} XP</span>
                  </div>
                  <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="bg-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${percentToLevel}%` }}></div>
                  </div>
                  <p className="text-xs text-right mt-2 text-indigo-200">
                      {userLevel.nextLevelXP - userLevel.currentXP} XP to next level
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ACTIVE CHALLENGES */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Target className="mr-2 text-indigo-600" /> Active Challenges
              </h3>
              
              {challenges.map(challenge => (
                  <div key={challenge.id} className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-all ${challenge.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${challenge.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {challenge.status === 'completed' ? <CheckCircle size={28} /> : <Star size={28} />}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-bold text-slate-900 text-lg">{challenge.title}</h4>
                          <p className="text-slate-500 text-sm mb-3">{challenge.description}</p>
                          
                          {challenge.status === 'active' && (
                             <div className="w-full bg-slate-100 rounded-full h-2.5">
                                 <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min((challenge.progress / challenge.total) * 100, 100)}%` }}
                                 ></div>
                             </div>
                          )}
                          
                          <div className="flex items-center justify-between sm:justify-start gap-4 mt-2 text-xs font-medium text-slate-500">
                              <span className="flex items-center">
                                  {challenge.status === 'active' && <Clock size={14} className="mr-1 text-orange-500" />}
                                  {challenge.status === 'active' ? `Ends in ${challenge.expiresIn}` : 'Completed'}
                              </span>
                              <span>{challenge.progress} / {challenge.total} {challenge.unit}</span>
                          </div>
                      </div>

                      <div className="flex flex-col items-center justify-center min-w-[80px]">
                          <div className="text-indigo-600 font-bold text-xl">+{challenge.rewardXP}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase">XP</div>
                          {challenge.status === 'active' ? (
                              <button className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
                                  Track
                              </button>
                          ) : (
                              <button className="mt-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-default">
                                  Claimed
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>

          {/* BADGE COLLECTION */}
          <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Award className="mr-2 text-orange-500" /> Badge Collection
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                  {badges.map(badge => {
                      const Icon = IconMap[badge.icon] || Award;
                      return (
                          <div key={badge.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${badge.isLocked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.isLocked ? 'bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
                                  {badge.isLocked ? <Lock size={20} /> : <Icon size={24} />}
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm mb-1">{badge.name}</h5>
                              <p className="text-xs text-slate-500 leading-tight mb-2">{badge.description}</p>
                              {!badge.isLocked && (
                                  <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                      Earned {badge.dateEarned}
                                  </span>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>

      </div>
    </div>
  );
};