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
  { id: '9',  title: 'Doctor Visit',              amount: 3500,  category: 'Health',        date: '2026-03-07' },
  // February 2026
  { id: '10', title: 'Groceries – Keells',        amount: 4800,  category: 'Food',          date: '2026-02-28' },
  { id: '11', title: 'Taxi to Airport',            amount: 2800,  category: 'Transport',     date: '2026-02-25' },
  { id: '12', title: 'New Shoes',                  amount: 8500,  category: 'Shopping',      date: '2026-02-22' },
  { id: '13', title: 'Gym Membership',             amount: 3500,  category: 'Health',        date: '2026-02-20' },
  { id: '14', title: 'Spotify',                    amount: 999,   category: 'Entertainment', date: '2026-02-18' },
  { id: '15', title: 'Coffee – Barista',           amount: 720,   category: 'Food',          date: '2026-02-15' },
  { id: '16', title: 'Bus Pass',                   amount: 3000,  category: 'Transport',     date: '2026-02-10' },
  { id: '17', title: 'Dinner – Ministry of Crab', amount: 5200,  category: 'Food',          date: '2026-02-07' },
  { id: '18', title: 'Vitamin Supplements',        amount: 1850,  category: 'Health',        date: '2026-02-03' },
  // January 2026
  { id: '19', title: 'New Year Dinner',            amount: 6800,  category: 'Food',          date: '2026-01-31' },
  { id: '20', title: 'Train to Kandy',             amount: 650,   category: 'Transport',     date: '2026-01-28' },
  { id: '21', title: 'Clothes – Odel',             amount: 12000, category: 'Shopping',      date: '2026-01-25' },
  { id: '22', title: 'Dental Visit',               amount: 4500,  category: 'Health',        date: '2026-01-20' },
  { id: '23', title: 'Movie Tickets',              amount: 1800,  category: 'Entertainment', date: '2026-01-15' },
  { id: '24', title: 'Bakery Breakfast',           amount: 450,   category: 'Food',          date: '2026-01-10' },
  { id: '25', title: 'Grab Ride',                  amount: 980,   category: 'Transport',     date: '2026-01-06' },
  { id: '26', title: 'Headache Tablets',           amount: 320,   category: 'Health',        date: '2026-01-03' },
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
