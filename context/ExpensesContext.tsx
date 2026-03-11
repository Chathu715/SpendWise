import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { MOCK_EXPENSES, MOCK_LIMITS, type Expense, type SpendingLimits } from '../constants/mockData';

interface ExpensesContextValue {
  expenses: Expense[];
  limits: SpendingLimits;
  loading: boolean;
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  updateLimit: (field: keyof SpendingLimits, value: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue>({
  expenses: [],
  limits: MOCK_LIMITS,
  loading: false,
  addExpense: async () => {},
  updateLimit: async () => {},
  refresh: async () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [limits, setLimits] = useState<SpendingLimits>(MOCK_LIMITS);
  const [loading, setLoading] = useState(false);

  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    // Mock add — replace with supabase insert
    await new Promise((r) => setTimeout(r, 800));
    const newExpense: Expense = { ...data, id: Date.now().toString() };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);

  const updateLimit = useCallback(async (field: keyof SpendingLimits, value: number) => {
    // Mock update — replace with supabase upsert
    await new Promise((r) => setTimeout(r, 600));
    setLimits((prev) => ({ ...prev, [field]: value }));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
  }, []);

  return (
    <ExpensesContext.Provider value={{ expenses, limits, loading, addExpense, updateLimit, refresh }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpensesContext);
