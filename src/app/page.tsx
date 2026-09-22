"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Expense, Payment, Income, AppSettings, ViewType } from "@/lib/types";
import { createDemoExpenses, createDemoPayments, createDemoIncomes, defaultSettings } from "@/lib/demo-data";
import { getCurrentPeriod } from "@/lib/utils";

import Sidebar from "@/components/Sidebar";
import AlertBanner from "@/components/AlertBanner";
import Dashboard from "@/components/Dashboard";
import ExpensesManager from "@/components/ExpensesManager";
import PaymentForm from "@/components/PaymentForm";
import PaymentHistory from "@/components/PaymentHistory";
import IncomeManager from "@/components/IncomeManager";
import Settings from "@/components/Settings";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { toast } = useToast();

  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  const [payments, setPayments] = useLocalStorage<Payment[]>("payments", []);
  const [incomes, setIncomes] = useLocalStorage<Income[]>("incomes", []);
  const [settings, setSettings] = useLocalStorage<AppSettings>("appSettings", defaultSettings);

  // Robust initialization: reads localStorage directly, avoids race conditions
  useEffect(() => {
    if (isInitialized) return;

    let safetyTimer: NodeJS.Timeout | null = null;
    let initComplete = false;

    const completeInitialization = () => {
      if (initComplete) return;
      initComplete = true;
      setIsInitialized(true);
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };

    // Safety timeout: force initialization after 3 seconds (increased for slow devices)
    safetyTimer = setTimeout(() => {
      console.warn("Initialization timeout - forcing initialization");
      completeInitialization();
    }, 3000);

    try {
      // Read localStorage directly (bypass hook state which may not be hydrated yet)
      const rawExpenses = localStorage.getItem("expenses");
      const rawPayments = localStorage.getItem("payments");
      const rawIncomes = localStorage.getItem("incomes");

      const hasExpenses = rawExpenses && rawExpenses !== "[]";
      const hasPayments = rawPayments && rawPayments !== "[]";

      // Only create demo data if truly first visit (no data at all)
      if (!hasExpenses && !hasPayments) {
        const demoExpenses = createDemoExpenses();
        const demoPayments = createDemoPayments(demoExpenses);
        const demoIncomes = createDemoIncomes();
        localStorage.setItem("expenses", JSON.stringify(demoExpenses));
        localStorage.setItem("payments", JSON.stringify(demoPayments));
        localStorage.setItem("incomes", JSON.stringify(demoIncomes));
        setExpenses(demoExpenses);
        setPayments(demoPayments);
        setIncomes(demoIncomes);
      }

      // Ensure incomes key exists even if old version didn't have it
      if (!rawIncomes) {
        const demoIncomes = createDemoIncomes();
        localStorage.setItem("incomes", JSON.stringify(demoIncomes));
        setIncomes(demoIncomes);
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setInitError("Error al cargar datos. Intenta recargar la página.");
    }

    // Mark as initialized when complete
    completeInitialization();

    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount
  }, []);

  // Show overdue toast on mount
  const hasShownToast = useMemo(() => {
    const shown = typeof window !== "undefined" ? sessionStorage.getItem("overdueToastShown") : "false";
    return shown === "true";
  }, []);

  useEffect(() => {
    if (!isInitialized || hasShownToast) return;

    const currentPeriod = getCurrentPeriod();
    const now = new Date();

const overdueCount = expenses
            .filter((e) => e.isActive)
            .filter((e) => {
              if (e.dueDay == null) return false;
              const dueDate = new Date(now.getFullYear(), now.getMonth(), e.dueDay);
              const isPaid = payments.some(
                (p) => p.expenseId === e.id && p.period === currentPeriod
              );
              return !isPaid && dueDate < now;
            }).length;

    if (overdueCount > 0) {
      toast({
        title: "Tienes gastos vencidos",
        description: `${overdueCount} gasto${overdueCount > 1 ? "s" : ""} necesita${overdueCount > 1 ? "n" : ""} tu atencion`,
        variant: "destructive",
      });
      sessionStorage.setItem("overdueToastShown", "true");
    }
  }, [isInitialized, expenses, payments, hasShownToast, toast]);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            expenses={expenses}
            payments={payments}
            incomes={incomes}
            settings={settings}
            onNavigate={handleViewChange}
          />
        );
      case "expenses":
        return (
          <ExpensesManager
            expenses={expenses}
            setExpenses={setExpenses}
            payments={payments}
            settings={settings}
          />
        );
      case "incomes":
        return (
          <IncomeManager
            incomes={incomes}
            setIncomes={setIncomes}
            payments={payments}
            currencySymbol={settings.currencySymbol}
          />
        );
      case "payment":
        return (
          <PaymentForm
            expenses={expenses}
            payments={payments}
            incomes={incomes}
            setPayments={setPayments}
            settings={settings}
          />
        );
      case "history":
        return (
          <PaymentHistory
            expenses={expenses}
            payments={payments}
            incomes={incomes}
            setPayments={setPayments}
            settings={settings}
          />
        );
      case "settings":
        return (
          <Settings
            settings={settings}
            setSettings={setSettings}
            expenses={expenses}
            payments={payments}
            incomes={incomes}
            setExpenses={setExpenses}
            setPayments={setPayments}
            setIncomes={setIncomes}
          />
        );
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <Wallet className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Cargando Mis Gastos</h2>
            <p className="text-sm text-muted-foreground">Preparando tu información financiera...</p>
          </div>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <p className="text-red-500 font-medium">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="h-full flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <Sidebar
            activeView={activeView}
            onViewChange={handleViewChange}
            expenses={expenses}
            payments={payments}
            settings={settings}
          />

          <main className="flex-1 min-w-0 h-screen overflow-y-auto">
            <div className="w-full p-4 md:p-6 lg:p-8 xl:p-10 pb-24 lg:pb-8">
              <AlertBanner
                expenses={expenses}
                payments={payments}
                settings={settings}
                onNavigateToPayment={() => handleViewChange("payment")}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
      </div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
