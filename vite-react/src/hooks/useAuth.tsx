import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  presets: Record<string, any> | null;
  tokenData: any | null;
}

interface AuthContextType extends AuthState {
  setAuth: (token: string, presets: Record<string, any>, tokenData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    accessToken: sessionStorage.getItem('humanity_access_token'),
    isAuthenticated: !!sessionStorage.getItem('humanity_access_token'),
    presets: JSON.parse(sessionStorage.getItem('humanity_presets') || 'null'),
    tokenData: JSON.parse(sessionStorage.getItem('humanity_token_data') || 'null'),
  });

  const setAuth = (token: string, presets: Record<string, any>, tokenData: any) => {
    sessionStorage.setItem('humanity_access_token', token);
    sessionStorage.setItem('humanity_presets', JSON.stringify(presets));
    sessionStorage.setItem('humanity_token_data', JSON.stringify(tokenData));
    setAuthState({ accessToken: token, isAuthenticated: true, presets, tokenData });
  };

  const logout = () => {
    sessionStorage.removeItem('humanity_access_token');
    sessionStorage.removeItem('humanity_presets');
    sessionStorage.removeItem('humanity_token_data');
    setAuthState({ accessToken: null, isAuthenticated: false, presets: null, tokenData: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
