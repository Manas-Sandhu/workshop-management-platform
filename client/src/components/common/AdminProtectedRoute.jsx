import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const {
    isAdminAuthenticated,
    adminAuthLoading,
  } = useAdminAuth();

  const location = useLocation();

  if (adminAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-offwhite">
        <p className="text-sm font-medium text-navy/60">
          Verifying admin access...
        </p>
      </main>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}