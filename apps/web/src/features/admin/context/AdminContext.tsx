"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthApi, getStoredToken, getStoredUser, clearSession, type AuthUser } from "../../../lib/api";
import { Locale } from "@aifoundry/shared";

type NavTab = "overview" | "shops" | "corridors" | "d02" | "disputes" | "finops" | "audit" | "cms" | "crm" | "admins";

interface AdminContextState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  activeNav: NavTab;
  setActiveNav: (nav: NavTab) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (u: AuthUser | null) => void;
  authChecked: boolean;
  handleAdminLogout: () => void;
  isEn: boolean;
  isDark: boolean;
}

const AdminContext = createContext<AdminContextState | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavTab>("overview");
  
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const cachedUser = getStoredUser();
    if (cachedUser) {
      setCurrentUser(cachedUser);
    }
    const token = getStoredToken();
    if (token) {
      AuthApi.getMe()
        .then((user) => {
          if (user) {
            setCurrentUser(user);
          }
        })
        .catch(() => {
          clearSession();
          setCurrentUser(null);
        })
        .finally(() => {
          setAuthChecked(true);
        });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleAdminLogout = () => {
    AuthApi.logout();
    setCurrentUser(null);
  };

  const isDark = theme === "dark";
  const isEn = locale === "en";

  return (
    <AdminContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        activeNav,
        setActiveNav,
        currentUser,
        setCurrentUser,
        authChecked,
        handleAdminLogout,
        isEn,
        isDark
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
