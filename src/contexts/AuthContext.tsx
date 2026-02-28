import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Profile | null;
  needsOnboarding: boolean;
  supabaseUser: User | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: "",
    role: data.role,
    onboardingCompleted: data.onboarding_completed,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    needsOnboarding: false,
    supabaseUser: null,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const profile = await fetchProfile(session.user.id);
            setState({
              isAuthenticated: true,
              isLoading: false,
              user: profile
                ? { ...profile, email: session.user.email ?? "" }
                : { firstName: "", lastName: "", email: session.user.email ?? "", role: "student", onboardingCompleted: false },
              needsOnboarding: profile ? !profile.onboardingCompleted : true,
              supabaseUser: session.user,
            });
          }, 0);
        } else {
          setState({ isAuthenticated: false, isLoading: false, user: null, needsOnboarding: false, supabaseUser: null });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: profile
            ? { ...profile, email: session.user.email ?? "" }
            : { firstName: "", lastName: "", email: session.user.email ?? "", role: "student", onboardingCompleted: false },
          needsOnboarding: profile ? !profile.onboardingCompleted : true,
          supabaseUser: session.user,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const signup = async (data: { firstName: string; lastName: string; email: string; password: string; role: string }) => {
    setState((s) => ({ ...s, isLoading: true }));
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
        },
      },
    });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState({ isAuthenticated: false, isLoading: false, user: null, needsOnboarding: false, supabaseUser: null });
  };

  const completeOnboarding = async () => {
    if (state.supabaseUser) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", state.supabaseUser.id);
    }
    setState((s) => ({ ...s, needsOnboarding: false, user: s.user ? { ...s.user, onboardingCompleted: true } : s.user }));
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
