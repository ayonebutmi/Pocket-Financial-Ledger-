


import { Account, BudgetCategory, CategoryType, ForecastItem, Transaction, SmartCard, TreasuryState, TaxProfile, Nudge, CreditScore, FinancialGoal, Subscription, UserLevel, Challenge, Badge, DreamGoal, SquadBill, UserProfile, RetirementProfile } from './types';

export const USER_PROFILE: UserProfile = {
  name: "Alex",
  hourlyWage: 42.50,
  currencySymbol: "$"
};

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acct_1', name: 'Primary Checking', type: 'checking', balance: 4520.50, institution: 'Chase' },
  { id: 'acct_2', name: 'High Yield Savings', type: 'savings', balance: 12500.00, institution: 'Ally', apy: 4.35 },
  { id: 'acct_3', name: 'Sapphire Reserve', type: 'credit', balance: -1240.30, institution: 'Chase', apr: 24.99 },
  { id: 'acct_4', name: 'Auto Loan', type: 'loan', balance: -14500.00, institution: 'Toyota Financial', apr: 5.9 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', date: '2023-10-25', merchant: 'Whole Foods Market', amount: 142.50, category: 'Groceries', type: 'expense', status: 'posted', source: 'receipt' },
  { id: 'tx_2', date: '2023-10-24', merchant: 'Shell Station', amount: 45.00, category: 'Transport', type: 'expense', status: 'posted', source: 'bank' },
  { id: 'tx_3', date: '2023-10-24', merchant: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', type: 'expense', status: 'posted', source: 'bank' },
  { id: 'tx_4', date: '2023-10-23', merchant: 'Freelance Payment', amount: 2500.00, category: 'Income', type: 'income', status: 'posted', source: 'bank' },
  { id: 'tx_5', date: '2023-10-22', merchant: 'Starbucks', amount: 6.45, category: 'Dining', type: 'expense', status: 'posted', source: 'receipt' },
  { id: 'tx_6', date: '2023-10-20', merchant: 'Apple Store', amount: 1299.00, category: 'Tech', type: 'expense', status: 'posted', source: 'manual' },
];

export const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: 'cat_1', name: 'Groceries', type: CategoryType.ESSENTIAL, allocated: 600, spent: 450, rollover: 25, targetAccount: 'acct_1' },
  { id: 'cat_2', name: 'Rent', type: CategoryType.ESSENTIAL, allocated: 2000, spent: 2000, rollover: 0, targetAccount: 'acct_1' },
  { id: 'cat_3', name: 'Dining Out', type: CategoryType.LIFESTYLE, allocated: 300, spent: 320, rollover: 0, targetAccount: 'acct_3' }, // Over budget
  { id: 'cat_4', name: 'Emergency Fund', type: CategoryType.SAVINGS, allocated: 500, spent: 0, rollover: 1200, targetAccount: 'acct_2' },
  { id: 'cat_5', name: 'Utilities', type: CategoryType.ESSENTIAL, allocated: 200, spent: 145, rollover: 10, targetAccount: 'acct_1' },
];

export const FORECAST_ITEMS: ForecastItem[] = [
  { name: 'Rent Payment', amount: 2000, date: '1st', confidence: 100 },
  { name: 'Netflix', amount: 15.99, date: '24th', confidence: 98 },
  { name: 'Spotify', amount: 9.99, date: '28th', confidence: 98 },
  { name: 'Car Insurance', amount: 120.00, date: '15th', confidence: 100 },
  { name: 'Avg. Groceries', amount: 600.00, date: 'Variable', confidence: 85 },
];

// NEW MOCK DATA

export const INITIAL_CARDS: SmartCard[] = [
  { id: 'card_1', type: 'physical', last4: '4242', status: 'active', enforcementMode: 'strict', linkedBudgets: ['cat_1', 'cat_3'] },
  { id: 'card_2', type: 'virtual', last4: '8812', status: 'active', enforcementMode: 'flexible', linkedBudgets: ['cat_5'] },
];

export const INITIAL_TREASURY: TreasuryState = {
  apy: 4.85,
  totalSwept: 3450.00,
  lifetimeEarnings: 124.50,
  isEnabled: true,
};

export const INITIAL_TAX_PROFILE: TaxProfile = {
  estimatedLiability: 4250.00,
  filingStatus: 'single',
  nextDeadline: 'Jan 15',
  deductionsFound: 14,
  potentialSavings: 840.00
};

export const INITIAL_NUDGES: Nudge[] = [
  { id: 'n_1', type: 'negotiation', title: 'Bill Negotiation Alert', description: 'Your Comcast bill increased by $10 this month. Shall I generate a negotiation script?', actionLabel: 'View Script', impact: 'Save ~$120/yr' },
  { id: 'n_2', type: 'streak', title: 'Savings Streak', description: 'You are under budget in 4 categories for 3 months in a row!', actionLabel: 'View Stats', impact: 'Keep it up!' },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_1', name: 'Netflix', amount: 15.99, cycle: 'monthly', nextDate: 'Oct 24', status: 'active' },
  { id: 'sub_2', name: 'Spotify Premium', amount: 9.99, cycle: 'monthly', nextDate: 'Oct 28', status: 'active' },
  { id: 'sub_3', name: 'Adobe Creative Cloud', amount: 54.99, cycle: 'monthly', nextDate: 'Nov 01', status: 'active' },
  { id: 'sub_4', name: 'Gym Membership', amount: 45.00, cycle: 'monthly', nextDate: 'Nov 05', status: 'active' }
];

// PLANNING DATA

export const INITIAL_CREDIT_SCORE: CreditScore = {
  currentScore: 742,
  provider: 'FICO',
  lastUpdated: '2 days ago',
  history: [
    { month: 'May', score: 710 },
    { month: 'Jun', score: 715 },
    { month: 'Jul', score: 722 },
    { month: 'Aug', score: 728 },
    { month: 'Sep', score: 735 },
    { month: 'Oct', score: 742 },
  ],
  factors: [
    { name: 'Payment History', status: 'Excellent', impact: 'High', details: '100% on-time payments' },
    { name: 'Credit Utilization', status: 'Good', impact: 'High', details: '28% utilization (Recommended < 30%)' },
    { name: 'Credit Age', status: 'Fair', impact: 'Medium', details: 'Average age 4.2 years' },
    { name: 'Total Accounts', status: 'Good', impact: 'Low', details: '8 accounts open' },
  ]
};

export const INITIAL_GOALS: FinancialGoal[] = [
  { id: 'g_1', name: 'Pay off Credit Card', targetAmount: 1240.30, currentAmount: 0, type: 'debt_payoff', deadline: '2024-03-01' },
  { id: 'g_2', name: 'Down Payment for House', targetAmount: 50000, currentAmount: 12500, type: 'purchase', deadline: '2026-01-01' }
];

export const INITIAL_RETIREMENT_PROFILE: RetirementProfile = {
  currentAge: 32,
  retirementAge: 65,
  annualIncome: 85000,
  currentSavings: 28500,
  monthlyContribution: 400,
  employerMatch: 3,
  filingStatus: 'single'
};

// GAMIFICATION DATA

export const INITIAL_USER_LEVEL: UserLevel = {
  currentLevel: 5,
  currentXP: 2450,
  nextLevelXP: 3000,
  streakDays: 14,
  title: "Savvy Saver"
};

export const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'c_1', title: 'Zero-Spend Tuesday', description: 'Spend $0 on Lifestyle categories today.', rewardXP: 100, progress: 0, total: 1, unit: 'days', expiresIn: '8 hrs', status: 'active' },
  { id: 'c_2', title: 'The Coffee Breaker', description: 'Make coffee at home 5 times this week.', rewardXP: 250, progress: 3, total: 5, unit: 'times', expiresIn: '2 days', status: 'active' },
  { id: 'c_3', title: 'Debt Destroyer', description: 'Pay an extra $50 towards your highest APR card.', rewardXP: 500, progress: 50, total: 50, unit: '$', expiresIn: '14 days', status: 'completed' },
];

export const INITIAL_BADGES: Badge[] = [
  { id: 'b_1', name: 'Early Bird', icon: 'Sunrise', description: 'Checked finances before 8 AM.', dateEarned: '2023-09-12', isLocked: false },
  { id: 'b_2', name: 'Budget Ninja', icon: 'Sword', description: 'Stayed under budget for 3 consecutive months.', dateEarned: '2023-10-01', isLocked: false },
  { id: 'b_3', name: 'The Investor', icon: 'TrendingUp', description: 'Contributed $1000 to investments.', dateEarned: undefined, isLocked: true },
  { id: 'b_4', name: 'Maxed Out', icon: 'Zap', description: 'Max out your Roth IRA for the year.', dateEarned: undefined, isLocked: true },
];

// DREAM VAULT DATA

export const INITIAL_DREAM_GOALS: DreamGoal[] = [
  {
    id: 'dg_1',
    name: 'Paris Vacation',
    targetAmount: 3200,
    savedAmount: 1200, // 40% saved
    deadline: '2024-06-01',
    category: 'Travel',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop',
    tripDetails: {
        destination: 'Paris, France',
        durationDays: 7,
        travelStyle: 'moderate'
    },
    suggestions: [
        { type: 'flight', title: 'Norse Atlantic Airways Deal', price: 450, description: 'Direct flight from JFK, limited time offer.', dealBadge: '30% Off' },
        { type: 'dining', title: 'Le Bouillon Chartier', price: 25, description: 'Historic budget-friendly dining experience.', dealBadge: 'Top Value' },
        { type: 'activity', title: 'Louvre Museum Night Pass', price: 17, description: 'Cheaper entry on Friday nights.' }
    ]
  },
  {
    id: 'dg_2',
    name: 'Leica Q3 Camera',
    targetAmount: 6000,
    currentMarketPrice: 5850, // Price Drop!
    priceDropDetected: true,
    savedAmount: 300, // 5% saved
    deadline: '2024-02-14',
    category: 'Tech',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop' 
  }
];

// SQUAD SPLIT DATA

export const INITIAL_SQUAD_BILLS: SquadBill[] = [
  {
    id: 'sb_1',
    title: 'Sushi Night',
    totalAmount: 142.50,
    date: 'Last Night',
    location: 'Nobu',
    members: [
      { id: 'm_1', name: 'You', owedAmount: 35.60, status: 'paid' },
      { id: 'm_2', name: 'Sarah', owedAmount: 42.00, status: 'pending' },
      { id: 'm_3', name: 'Mike', owedAmount: 30.00, status: 'pending' },
      { id: 'm_4', name: 'Jessica', owedAmount: 34.90, status: 'pending' },
    ]
  }
];