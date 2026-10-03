"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Undo2, Redo2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAppStore } from "@/store/useAppStore";
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

  const [expensesLS, setExpensesLS, expensesReady] = useLocalStorage<Expense[]>("expenses", []);
  const [paymentsLS, setPaymentsLS, paymentsReady] = useLocalStorage<Payment[]>("payments", []);
  const [incomesLS, setIncomesLS, incomesReady] = useLocalStorage<Income[]>("incomes", []);
  const [settingsLS, setSettingsLS, settingsReady] = useLocalStorage<AppSettings>("appSettings", defaultSettings);

  // ── Puente con el store (pendiente #6) ──────────────────────────────
  // El store mantiene los datos en memoria + historial de deshacer/rehacer;
  // useLocalStorage sigue siendo el ÚNICO destino de escritura (mismas
  // claves, mismo formato encriptado de siempre).
  const sReady = useAppStore((s) => s.isInitialized);
  const sExpenses = useAppStore((s) => s.expenses);
  const sPayments = useAppStore((s) => s.payments);
  const sIncomes = useAppStore((s) => s.incomes);
  const sSettings = useAppStore((s) => s.settings);
  const canUndo = useAppStore((s) => s.canUndo);
  const canRedo = useAppStore((s) => s.canRedo);

  const lastPersisted = useRef<{
    expenses: Expense[];
    payments: Payment[];
    incomes: Income[];
    settings: AppSettings;
  } | null>(null);

  // 1) Hidratación: cuando las 4 claves terminaron de desencriptar
  useEffect(() => {
    if (useAppStore.getState().isInitialized) return;
    if (!expensesReady || !paymentsReady || !incomesReady || !settingsReady) return;
    useAppStore.getState().initialize({
      expenses: expensesLS,
      payments: paymentsLS,
      incomes: incomesLS,
      settings: settingsLS,
    });
    lastPersisted.current = {
      expenses: expensesLS,
      payments: paymentsLS,
      incomes: incomesLS,
      settings: settingsLS,
    };
  }, [expensesReady, paymentsReady, incomesReady, settingsReady, expensesLS, paymentsLS, incomesLS, settingsLS]);

  // 2) Persistencia: store → encriptado, solo lo que realmente cambió
  //    (comparación por CONTENIDO: deshacer/rehacer restaura copias, y una
  //    copia con el mismo contenido no debe reescribir la clave cifrada)
  useEffect(() => {
    const lp = lastPersisted.current;
    if (!lp || !useAppStore.getState().isInitialized) return;
    const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    if (!igual(lp.expenses, sExpenses)) {
      lp.expenses = sExpenses;
      setExpensesLS(sExpenses);
    }
    if (!igual(lp.payments, sPayments)) {
      lp.payments = sPayments;
      setPaymentsLS(sPayments);
    }
    if (!igual(lp.incomes, sIncomes)) {
      lp.incomes = sIncomes;
      setIncomesLS(sIncomes);
    }
    if (!igual(lp.settings, sSettings)) {
      lp.settings = sSettings;
      setSettingsLS(sSettings);
    }
  }, [sExpenses, sPayments, sIncomes, sSettings, setExpensesLS, setPaymentsLS, setIncomesLS, setSettingsLS]);

  // 3) Escrituras de las vistas → acciones del store (quedan en el historial)
  const setExpenses = useCallback(
    (v: Expense[] | ((val: Expense[]) => Expense[])) => {
      const s = useAppStore.getState();
      s.setExpenses(typeof v === "function" ? v(s.expenses) : v);
    },
    []
  );
  const setPayments = useCallback(
    (v: Payment[] | ((val: Payment[]) => Payment[])) => {
      const s = useAppStore.getState();
      s.setPayments(typeof v === "function" ? v(s.payments) : v);
    },
    []
  );
  const setIncomes = useCallback(
    (v: Income[] | ((val: Income[]) => Income[])) => {
      const s = useAppStore.getState();
      s.setIncomes(typeof v === "function" ? v(s.incomes) : v);
    },
    []
  );
  const setSettings = useCallback(
    (v: AppSettings | ((val: AppSettings) => AppSettings)) => {
      const s = useAppStore.getState();
      s.setSettings(typeof v === "function" ? v(s.settings) : v);
    },
    []
  );

  // Deshacer/rehacer con teclado: 1 pulsación = 1 paso
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return; // no robar el Ctrl+Z dentro de campos de texto
      }
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        useAppStore.getState().undo();
      } else if (k === "y" || (k === "z" && e.shiftKey)) {
        e.preventDefault();
        useAppStore.getState().redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fuente de lectura: store tras la carga; antes, las claves (mismo dato)
  const expenses = sReady ? sExpenses : expensesLS;
  const payments = sReady ? sPayments : paymentsLS;
  const incomes = sReady ? sIncomes : incomesLS;
  const settings = sReady ? sSettings : settingsLS;

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
        setExpensesLS(demoExpenses);
        setPaymentsLS(demoPayments);
        setIncomesLS(demoIncomes);
      }

      // Ensure incomes key exists even if old version didn't have it
      if (!rawIncomes) {
        const demoIncomes = createDemoIncomes();
        localStorage.setItem("incomes", JSON.stringify(demoIncomes));
        setIncomesLS(demoIncomes);
      }
    } catch (err) {
      console.error("Initialization error:", err);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Inicialización única de arranque: el error solo se establece una vez al montar; no puede generar cascadas de render.
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
            <div className="w-full p-4 md:p-6 lg:p-8 xl:p-10 pb-24 md:pb-24 lg:pb-8 xl:pb-10">
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

            {(canUndo || canRedo) && (
              <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 flex gap-2">
                <button
                  type="button"
                  onClick={() => useAppStore.getState().undo()}
                  disabled={!canUndo}
                  title="Deshacer (Ctrl+Z)"
                  aria-label="Deshacer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg backdrop-blur transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Undo2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => useAppStore.getState().redo()}
                  disabled={!canRedo}
                  title="Rehacer (Ctrl+Y)"
                  aria-label="Rehacer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg backdrop-blur transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Redo2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </main>
      </div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
