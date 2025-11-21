


export enum CategoryType {
  INCOME = 'Income',
  ESSENTIAL = 'Essential',
  LIFESTYLE = 'Lifestyle',
  SAVINGS = 'Savings',
  UNCATEGORIZED = 'Uncategorized'
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: 'posted' | 'pending';
  source: 'bank' | 'receipt' | 'manual';
  receiptUrl?: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  allocated: number;
  spent: number;
  rollover: number; // Amount carried over from previous month
  targetAccount?: string; // Account ID to auto-distribute to
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  balance: number;
  institution: string;
  apy?: number; // For savings/investments
  apr?: number; // For credit/loans
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  sources?: GroundingSource[];
}

export interface VoiceCommandResponse {
  type: 'NAVIGATION' | 'TRANSACTION' | 'CHAT';
  destination?: string; // For NAVIGATION
  transactionData?: Partial<Transaction>; // For TRANSACTION
  responseText?: string; // For CHAT or Confirmation
}

export interface ForecastItem {
  name: string;
  amount: number;
  date: string; // Day of month
  confidence: number; // 0-100%
}

// ADVANCED FEATURES

export interface SmartCard {
  id: string;
  type: 'virtual' | 'physical';
  last4: string;
  status: 'active' | 'frozen';
  enforcementMode: 'strict' | 'flexible'; // Strict declines if budget exceeded
  linkedBudgets: string[]; // IDs of budgets this card pulls from
}

export interface TreasuryState {
  apy: number;
  totalSwept: number; // Amount currently in high-yield
  lifetimeEarnings: number;
  isEnabled: boolean;
}

export interface TaxProfile {
  estimatedLiability: number;
  filingStatus: 'single' | 'joint' | 'business';
  nextDeadline: string;
  deductionsFound: number; // Count of auto-detected deductions
  potentialSavings: number; // Dollar amount
}

export interface TaxStrategy {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  yearTarget: number; // e.g. 2026
  sources?: GroundingSource[];
}

export interface Nudge {
  id: string;
  type: 'negotiation' | 'streak' | 'optimization';
  title: string;
  description: string;
  actionLabel: string;
  impact?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: 'monthly' | 'yearly';
  nextDate: string;
  status: 'active' | 'canceling';
  logo?: string;
}

// FINANCIAL PLANNING TYPES

export interface CreditScore {
  currentScore: number;
  provider: 'FICO' | 'VantageScore';
  lastUpdated: string;
  history: { month: string; score: number }[];
  factors: {
    name: string;
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    impact: 'High' | 'Medium' | 'Low';
    details: string;
  }[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  type: 'debt_payoff' | 'purchase' | 'investing';
}

export interface RetirementProfile {
  currentAge: number;
  retirementAge: number;
  annualIncome: number;
  currentSavings: number;
  monthlyContribution: number;
  employerMatch: number; // percentage
  filingStatus: 'single' | 'married';
}

// GAMIFICATION TYPES

export interface Badge {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  dateEarned?: string;
  isLocked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  progress: number;
  total: number;
  unit: string;
  expiresIn: string; // e.g., "12 hours"
  status: 'active' | 'completed' | 'failed';
}

export interface UserLevel {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  streakDays: number;
  title: string; // e.g. "Budget Novice", "Savings Master"
}

// NEW PSYCHOLOGY FEATURES

export interface UserProfile {
  name: string;
  hourlyWage: number; // Used for Time-Cost perspective
  currencySymbol: string;
}

// IMPULSE VAULT
export interface VaultItem {
  id: string;
  name: string;
  amount: number;
  dateAdded: string;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'purchased' | 'abandoned';
  image: string;
}

// DREAM VAULT (REPLACES OLD VAULT)
export interface DreamGoalSuggestion {
  type: 'flight' | 'hotel' | 'activity' | 'dining';
  title: string;
  price: number;
  description: string;
  dealBadge?: string; // e.g. "20% Off"
}

export interface DreamGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  imageUrl: string; // For the "Reveal" mechanic
  category: 'Travel' | 'Luxury' | 'Tech' | 'Auto' | 'Home';
  
  // New Smart Features
  currentMarketPrice?: number; // If price drops below targetAmount
  priceDropDetected?: boolean;
  suggestions?: DreamGoalSuggestion[]; // AI Recommendations
  
  // Detailed Plans
  tripDetails?: {
    destination: string;
    durationDays: number;
    travelStyle: 'budget' | 'moderate' | 'luxury';
  };
  
  homeDetails?: {
    listingPrice: number;
    downPaymentPercent: number;
    estimatedMonthlyMortgage: number;
    estimatedTax: number;
    estimatedInsurance: number;
  };

  carDetails?: {
    fullPrice: number;
    loanTerm: number;
    interestRate: number;
    totalInterestCost: number;
    potentialSavings: number;
  };
}

// SQUAD SPLIT
export interface SquadMember {
  id: string;
  name: string;
  avatar?: string; // Initials or url
  owedAmount: number;
  status: 'paid' | 'pending';
}

export interface SquadBill {
  id: string;
  title: string;
  totalAmount: number;
  date: string;
  location: string;
  members: SquadMember[];
  receiptImage?: string;
}