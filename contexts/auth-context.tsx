"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import type { Models } from "appwrite";

export interface User extends Models.User<Models.Preferences> {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if Appwrite session exists (in cookies or localStorage)
function hasAppwriteSession(): boolean {
  if (typeof window === "undefined") return false;

  // Check for session cookie (production)
  if (typeof document !== "undefined") {
    const hasCookie = document.cookie.split(";").some((cookie) => {
      return cookie.trim().startsWith("a_session_");
    });
    if (hasCookie) return true;
  }

  // Check for localStorage fallback (development/localhost)
  if (window.localStorage) {
    const cookieFallback = window.localStorage.getItem("cookieFallback");
    if (cookieFallback) return true;
  }

  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      // Only make API call if session cookie exists
      if (!hasAppwriteSession()) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await account.get();
        setUser(response as User);
      } catch (error: any) {
        // 401 Unauthorized is expected when user is not logged in
        // Don't log this as an error
        if (error?.code !== 401) {
          console.error("Error checking user session:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Create session
      await account.createEmailPasswordSession(email, password);

      // Get user data
      const response = await account.get();
      setUser(response as User);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if session deletion fails, clear local state
      setUser(null);
    } finally {
      // Clear localStorage fallback used in development
      // Appwrite uses 'cookieFallback' key when cookies are not available (e.g., localhost)
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("cookieFallback");
      }
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Create new user account
      await account.create(crypto.randomUUID(), email, password, name);

      // Automatically log them in
      await account.createEmailPasswordSession(email, password);

      // Get user data
      const userData = await account.get();
      setUser(userData as User);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    await account.updatePassword(newPassword, oldPassword);
    // Re-fetch user data to ensure consistency
    const response = await account.get();
    setUser(response as User);
  };

  const updateName = async (name: string) => {
    await account.updateName(name);
    // Re-fetch user data
    const response = await account.get();
    setUser(response as User);
  };

  const deleteAccount = async () => {
    // Note: This requires user to have entered their password recently
    // You may need to implement re-authentication
    await account.deleteIdentity("email");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updatePassword,
        updateName,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
