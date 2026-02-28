import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { firstName: string; lastName: string; email: string; role: string } | null;
  needsOnboarding: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    needsOnboarding: false,
  });

  const login = async (email: string, _password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    await new Promise((r) => setTimeout(r, 1500));
    setState({
      isAuthenticated: true,
      isLoading: false,
      user: { firstName: "Kate", lastName: "Malone", email, role: "student" },
      needsOnboarding: false,
    });
  };

  const signup = async (data: { firstName: string; lastName: string; email: string; password: string; role: string }) => {
    setState((s) => ({ ...s, isLoading: true }));
    await new Promise((r) => setTimeout(r, 1500));
    setState({
      isAuthenticated: true,
      isLoading: false,
      user: { firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role },
      needsOnboarding: true,
    });
  };

  const logout = () => {
    setState({ isAuthenticated: false, isLoading: false, user: null, needsOnboarding: false });
  };

  const completeOnboarding = () => {
    setState((s) => ({ ...s, needsOnboarding: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
