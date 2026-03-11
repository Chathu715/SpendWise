import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { MOCK_USER } from '../constants/mockData';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextValue {
  user: User | null;
  session: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate session check — will be replaced with real Supabase auth
  useEffect(() => {
    const timer = setTimeout(() => {
      // Start with no session so splash → login flow works
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, _password: string) => {
    // Mock sign-in — replace with supabase.auth.signInWithPassword
    await new Promise((r) => setTimeout(r, 1200));
    setUser({ ...MOCK_USER, email });
  };

  const signUp = async (email: string, _password: string, fullName: string) => {
    // Mock sign-up — replace with supabase.auth.signUp + profiles insert
    await new Promise((r) => setTimeout(r, 1200));
    setUser({ id: 'mock-user-new', email, full_name: fullName });
  };

  const signOut = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session: !!user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
