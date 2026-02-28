import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Redirect to onboarding if needed (but not if already there)
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
