import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { type Expense, type SpendingLimits, MOCK_LIMITS } from '../constants/mockData';

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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [limits, setLimits]     = useState<SpendingLimits>(MOCK_LIMITS);
  const [loading, setLoading]   = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (!error && data) {
      setExpenses(data.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        note: e.note ?? '',
      })));
    }
  }, [user]);

  const fetchLimits = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('spending_limits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // No limits row yet — upsert to avoid duplicate key if row already exists
      await supabase
        .from('spending_limits')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' });
      return;
    }
    setLimits({
      overall:       Number(data.overall),
      food:          Number(data.food),
      transport:     Number(data.transport),
      shopping:      Number(data.shopping),
      health:        Number(data.health),
      entertainment: Number(data.entertainment),
      other:         Number(data.other),
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchExpenses(), fetchLimits()]).finally(() =>
        setLoading(false)
      );
    } else {
      setExpenses([]);
      setLimits(MOCK_LIMITS);
    }
  }, [user]);

  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('expenses')
      .insert({
        user_id:  user.id,
        title:    data.title,
        amount:   data.amount,
        category: data.category,
        date:     data.date,
        note:     data.note ?? '',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (inserted) {
      setExpenses((prev) => [{
        id:       inserted.id,
        title:    inserted.title,
        amount:   Number(inserted.amount),
        category: inserted.category,
        date:     inserted.date,
        note:     inserted.note ?? '',
      }, ...prev]);
    }
  }, [user]);

  const updateLimit = useCallback(async (field: keyof SpendingLimits, value: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('spending_limits')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    setLimits((prev) => ({ ...prev, [field]: value }));
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchLimits()]);
    setLoading(false);
  }, [fetchExpenses, fetchLimits]);

  return (
    <ExpensesContext.Provider value={{ expenses, limits, loading, addExpense, updateLimit, refresh }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpensesContext);
