"use client";

import { AlertTriangle, Clock, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expense, Payment, AppSettings } from "@/lib/types";
import {
  getExpenseStatus,
  formatCurrencySimple,
  getCurrentPeriod,
  formatDaysLabel,
  getDaysUntilDue,
  getCategoryLabel,
  getCategoryColor,
} from "@/lib/utils";
import {
  Droplets, Zap, Flame, Wifi, Home, Tag,
  Landmark, Heart, Clapperboard, ShieldCheck,
  GraduationCap, Car, HeartPulse, Coffee,
} from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  expenses: Expense[];
  payments: Payment[];
  settings: AppSettings;
  onNavigateToPayment?: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  agua: Droplets, luz: Zap, gas: Flame, internet: Wifi,
  alquiler: Home, bancario: Landmark, manutencion: Heart,
  entretenimiento: Clapperboard, seguro: ShieldCheck,
  educacion: GraduationCap, transporte: Car, salud: HeartPulse,
  otros: Tag,
  hormiga: Coffee,
};

export default function AlertBanner({ expenses, payments, settings, onNavigateToPayment }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const currentPeriod = getCurrentPeriod();

  const activeExpenses = expenses.filter((e) => e.isActive);
  const unpaidExpenses = activeExpenses.filter(
    (e) => getExpenseStatus(e, payments, settings.alertDays, currentPeriod) !== "paid"
  );
  const overdue = activeExpenses.filter(
    (e) => getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "overdue"
  );
  const pending = activeExpenses.filter(
    (e) => getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "pending"
  );
  const paidCount = activeExpenses.length - unpaidExpenses.length;

  const totalRemaining = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (dismissed || unpaidExpenses.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-2"
      >
        {/* Main summary banner */}
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${
          overdue.length > 0
            ? "border-red-200 bg-gradient-to-r from-red-50 to-amber-50 dark:border-red-800/50 dark:from-red-950/30 dark:to-amber-950/20"
            : "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-yellow-950/20"
        }`}>
          <div className="shrink-0 mt-0.5">
            {overdue.length > 0 ? (
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">
              {overdue.length > 0
                ? `Tienes ${overdue.length} compromiso${overdue.length > 1 ? "s" : ""} vencido${overdue.length > 1 ? "s" : ""}`
                : `${unpaidExpenses.length} compromiso${unpaidExpenses.length > 1 ? "s" : ""} pendiente${unpaidExpenses.length > 1 ? "s" : ""} de pago`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {paidCount} de {activeExpenses.length} cumplidos · Monto restante: <strong>{formatCurrencySimple(totalRemaining, settings.currencySymbol)}</strong>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {overdue.map((e) => {
                const Icon = categoryIcons[e.category] || Tag;
                return (
                  <Badge key={e.id} variant="outline" className="text-[11px] gap-1 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-900/40 px-2">
                    <Icon className="h-3 w-3" />
                    {e.name}
                    <span className="font-semibold">{formatCurrencySimple(e.amount, settings.currencySymbol)}</span>
                  </Badge>
                );
              })}
              {pending.slice(0, 3).map((e) => {
                const Icon = categoryIcons[e.category] || Tag;
                return (
                  <Badge key={e.id} variant="outline" className="text-[11px] gap-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2">
                    <Icon className="h-3 w-3" />
                    {e.name}
                    <span className="text-amber-600/70">{e.dueDay != null ? `día ${e.dueDay}` : "eventual"}</span>
                  </Badge>
                );
              })}
              {unpaidExpenses.length > 4 && (
                <Badge variant="outline" className="text-[11px] text-muted-foreground">
                  +{unpaidExpenses.length - 4} más
                </Badge>
              )}
            </div>
            {onNavigateToPayment && (
              <Button
                size="sm"
                className="mt-3 h-8 text-xs gap-1"
                onClick={onNavigateToPayment}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Registrar Pagos
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0" onClick={() => setDismissed(true)} aria-label="Cerrar alerta">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
