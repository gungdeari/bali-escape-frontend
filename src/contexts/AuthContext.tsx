// Global auth state for the entire app.
// Wraps all components via AuthProvider in App.tsx.
//
// On every page load, verifyToken() runs:
//   1. checks localStorage for a token
//   2. if found, calls GET /auth/user to verify it's still valid
//   3. sets user state including roles
//   4. isAdmin is derived from user.roles
//
// login() returns the user object directly so Login.tsx
// can read the role immediately without localStorage or async state issues.
//
// Components access auth state via useAuth() hook.

import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import API from "../api/axios";

// ── Types ─────────────────────────────────────────────────────

type Role = {
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  // roles comes from Spatie permission package
  // optional because some API responses might not include it
  roles?: Role[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  // login returns User so the caller can immediately read the role
  // without waiting for React state to update (state updates are async)
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
};

// ── Context ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ── Helper ────────────────────────────────────────────────────

// checks if a user object has the admin role
// reads roles[].name — works regardless of extra fields in the response
function checkIsAdmin(user: User | null): boolean {
  if (!user?.roles) return false;
  return user.roles.some(role => role.name === "admin");
}

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // derive isAdmin from user state
  // recalculates automatically whenever user changes
  const isAdmin = checkIsAdmin(user);

  // ── verify token on every page load ───────────────────────
  // called once when the app mounts
  // confirms the stored token is still valid by calling /auth/user
  // if valid   → sets user state (keeps user logged in after refresh)
  // if 401     → clears token (forces re-login)
  // if network error → keeps token (don't log out on server hiccup)
  useEffect(() => {
    async function verifyToken() {
      const storedToken = localStorage.getItem("token");

      // no token stored → definitely not logged in
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // axios interceptor attaches Bearer token automatically
        const res = await API.get("/auth/user");
        const userData = res.data.data;

        // update both state and localStorage so they stay in sync
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

      } catch (error: any) {
        // 401 = token definitively invalid or expired → force logout
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
        // any other error (network, 500) → keep token
        // user stays logged in, specific pages handle their own errors
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, []); // empty array — runs once on mount only

  // ── login ──────────────────────────────────────────────────
  // calls POST /auth/login
  // saves token + user to localStorage AND React state
  // returns the user object so Login.tsx can check the role immediately
  // without waiting for React state to update (state is async)
  const login = async (data: {
    email: string;
    password: string;
  }): Promise<User> => {
    const res = await authService.login(data);
    const { token, user } = res.data.data;

    // save to localStorage first — Login.tsx reads from here
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // update React state — triggers re-render across the app
    setToken(token);
    setUser(user);

    // return user directly — caller doesn't have to wait for state
    return user;
  };

  // ── register ───────────────────────────────────────────────
  // calls POST /auth/register
  // does NOT log the user in — redirects to login page instead
  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> => {
    await authService.register(data);
  };

  // ── logout ─────────────────────────────────────────────────
  // calls POST /auth/logout to revoke the token server-side
  // always clears local state in finally block
  // so the user is logged out even if the API call fails
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      // clear everything
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  // ── loading screen ─────────────────────────────────────────
  // shown while verifyToken() runs on page load
  // prevents a flash where the wrong UI briefly shows
  // e.g. showing "Login" button for a moment before realising
  // the user is already authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-5 h-5 border-2 border-[#17A2B8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      isAdmin,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── useAuth hook ───────────────────────────────────────────────
// the only way components should access auth state
// usage: const { user, isAuthenticated, isAdmin, logout } = useAuth()
export const useAuth = () => useContext(AuthContext);