import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../services/adminAuthService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreAdminSession() {
      try {
        const response = await getCurrentAdmin();

        if (active) {
          setAdmin(response.data.admin);
        }
      } catch {
        if (active) {
          setAdmin(null);
        }
      } finally {
        if (active) {
          setAdminAuthLoading(false);
        }
      }
    }

    restoreAdminSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const response = await loginAdmin(credentials);
    setAdmin(response.data.admin);
    return response.data.admin;
  }

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAdminAuthenticated: Boolean(admin),
        adminAuthLoading,
        loginAdmin: login,
        logoutAdmin: logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    );
  }

  return context;
}