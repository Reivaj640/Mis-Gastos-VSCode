"use client";

import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  History,
  Settings,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Wallet,
  Coffee,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn, formatCurrencySimple, formatDaysLabel, getDaysUntilDue } from "@/lib/utils";
import { ViewType, Expense, Payment, Income, AppSettings } from "@/lib/types";
import { getExpenseStatus, getCurrentPeriod } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { APP_VERSION } from "@/lib/version";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  expenses: Expense[];
  payments: Payment[];
  settings: AppSettings;
}

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "expenses", label: "Gastos", icon: Receipt },
  { id: "incomes", label: "Ingresos", icon: Wallet },
  { id: "payment", label: "Registrar Pago", icon: CreditCard },
  { id: "history", label: "Historial", icon: History },
  { id: "settings", label: "Configuración", icon: Settings },
];

export default function Sidebar({ activeView, onViewChange, expenses, payments, settings }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const currentPeriod = getCurrentPeriod();
  const activeExpenses = expenses.filter((e) => e.isActive);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;
  const themeLabel = theme === "dark" ? "Oscuro" : theme === "light" ? "Claro" : "Sistema";

  const overdueCount = activeExpenses.filter((e) =>
    getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "overdue"
  ).length;

  const pendingCount = activeExpenses.filter((e) =>
    getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "pending"
  ).length;

  const unpaidCount = activeExpenses.filter((e) =>
    getExpenseStatus(e, payments, settings.alertDays, currentPeriod) !== "paid"
  ).length;
  const paidCount = activeExpenses.length - unpaidCount;
  const totalRemaining = activeExpenses
    .filter((e) => getExpenseStatus(e, payments, settings.alertDays, currentPeriod) !== "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0 h-screen shadow-sm">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            💰 Mis Gastos
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Control de gastos mensuales</p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">v{APP_VERSION}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-blue-600 dark:text-blue-400")} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "dashboard" && (overdueCount > 0 || pendingCount > 0) && (
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-[20px] text-[10px] px-1.5"
                  >
                    {overdueCount + pendingCount}
                  </Badge>
                )}
                {item.id === "payment" && unpaidCount > 0 && (
                  <Badge
                    variant={overdueCount > 0 ? "destructive" : "secondary"}
                    className="h-5 min-w-[20px] text-[10px] px-1.5"
                  >
                    {unpaidCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3 mt-auto bg-muted/30">
          {unpaidCount > 0 && (
            <div className={cn(
              "rounded-lg p-3 border",
              overdueCount > 0
                ? "bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/30 dark:to-amber-950/20 border-red-200/60 dark:border-red-800/40"
                : "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200/60 dark:border-amber-800/40"
            )}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Compromisos pendientes
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {unpaidCount} restante{unpaidCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrencySimple(totalRemaining, settings.currencySymbol)} por pagar
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-center text-muted-foreground"
            onClick={cycleTheme}
          >
            <ThemeIcon className="h-4 w-4" />
            <span>Tema: {themeLabel}</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 relative",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.id === "dashboard" && (overdueCount > 0 || pendingCount > 0) && (
                    <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                      {overdueCount + pendingCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
