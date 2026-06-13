import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import api from '../lib/api';
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  language: string;
  avatar?: string;
  avatar_decoration?: string;
}
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    email: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('snakes_token');
    if (token) {
      api
        .get('/auth/verify')
        .then((res) => {
          if (res.data.valid) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('snakes_token');
            localStorage.removeItem('snakes_user');
          }
        })
        .catch(() => {
          localStorage.removeItem('snakes_token');
          localStorage.removeItem('snakes_user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', {
      username,
      password,
    });
    localStorage.setItem('snakes_token', res.data.token);
    localStorage.setItem('snakes_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (
    username: string,
    password: string,
    email: string,
  ) => {
    const res = await api.post('/auth/register', {
      username,
      password,
      email,
    });
    localStorage.setItem('snakes_token', res.data.token);
    localStorage.setItem('snakes_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('snakes_token');
    localStorage.removeItem('snakes_user');
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    if (user) {
      const updated = { ...user, ...data };
      localStorage.setItem('snakes_user', JSON.stringify(updated));
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {' '}
      {children}{' '}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
