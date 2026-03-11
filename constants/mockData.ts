export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface SpendingLimits {
  overall: number;
  food: number;
  transport: number;
  shopping: number;
  health: number;
  entertainment: number;
  other: number;
}

export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'dinuwan@email.com',
  full_name: 'Dinuwan Chathura',
};

export const MOCK_EXPENSES: Expense[] = [
  { id: '1', title: 'Lunch – Rice & Curry',  amount: 620,   category: 'Food',          date: '2026-03-11' },
  { id: '2', title: 'Uber to Fort',          amount: 1200,  category: 'Transport',     date: '2026-03-11' },
  { id: '3', title: 'Sony Headphones',       amount: 14500, category: 'Shopping',      date: '2026-03-10' },
  { id: '4', title: 'Pharmacy',              amount: 1450,  category: 'Health',        date: '2026-03-10' },
  { id: '5', title: 'Netflix',               amount: 1500,  category: 'Entertainment', date: '2026-03-09' },
  { id: '6', title: 'Dinner – Burger King',  amount: 1850,  category: 'Food',          date: '2026-03-09' },
  { id: '7', title: 'Monthly Bus Pass',      amount: 3000,  category: 'Transport',     date: '2026-03-08' },
  { id: '8', title: 'Coffee – Barista',      amount: 680,   category: 'Food',          date: '2026-03-08' },
  { id: '9', title: 'Doctor Visit',          amount: 3500,  category: 'Health',        date: '2026-03-07' },
];

export const MOCK_LIMITS: SpendingLimits = {
  overall:       50000,
  food:          10000,
  transport:     6000,
  shopping:      15000,
  health:        5000,
  entertainment: 3000,
  other:         2000,
};
