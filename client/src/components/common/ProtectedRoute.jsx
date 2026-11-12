import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  // Wait until we know whether the user has an active session.
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-offwhite">
        <p className="text-sm font-medium text-navy/60">
          Checking your account...
        </p>
      </main>
    );
  }

  // Preserve the requested page and send logged-out users to login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please log in to register for this workshop.",
        }}
      />
    );
  }

  return children;
}