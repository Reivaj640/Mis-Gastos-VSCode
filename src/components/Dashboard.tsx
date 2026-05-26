"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CheckCircle2,
  Clock,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Home,
  Tag,
  Landmark,
  Heart,
  Clapperboard,
  ShieldCheck,
  GraduationCap,
  Car,
  HeartPulse,
  Coffee,
  CircleCheckBig,
  CircleX,
  CircleAlert,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Expense, Payment, Income, AppSettings, INCOME_COLORS } from "@/lib/types";
import {
  formatCurrencySimple,
  getExpenseStatus,
  getCurrentPeriod,
  getCategoryLabel,
  getCategoryColor,
  getDaysUntilDue,
  formatDaysLabel,
} from "@/lib/utils";

interface DashboardProps {
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  settings: AppSettings;
  onNavigate: (view: "payment" | "history" | "expenses" | "incomes") => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  agua: Droplets,
  luz: Zap,
  gas: Flame,
  internet: Wifi,
  alquiler: Home,
  bancario: Landmark,
  manutencion: Heart,
  entretenimiento: Clapperboard,
  seguro: ShieldCheck,
  educacion: GraduationCap,
  transporte: Car,
  salud: HeartPulse,
  otros: Tag,
  hormiga: Coffee,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

// Collapsible section wrapper
function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
  headerRight,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <button
        className="w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <CardHeader className="pb-3 px-5 pt-5 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {badge}
            </div>
            <div className="flex items-center gap-2">
              {headerRight}
              {open ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="px-5 pb-5 pt-0">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Dashboard({ expenses, payments, incomes, settings, onNavigate }: DashboardProps) {
  const currentPeriod = getCurrentPeriod();

  const stats = useMemo(() => {
    const activeExpenses = expenses.filter((e) => e.isActive);
    const totalMonthly = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

    const currentPayments = payments.filter((p) => p.period === currentPeriod);
    const totalPaid = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = totalMonthly - totalPaid;

    const overdueExpenses = activeExpenses.filter((e) =>
      getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "overdue"
    );
    const pendingExpenses = activeExpenses.filter((e) =>
      getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "pending"
    );
    const paidExpenses = activeExpenses.filter((e) =>
      getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "paid"
    );
    const upcomingExpenses = activeExpenses.filter((e) =>
      getExpenseStatus(e, payments, settings.alertDays, currentPeriod) === "upcoming"
    );

    const completionPercentage = totalMonthly > 0 ? Math.round((totalPaid / totalMonthly) * 100) : 0;

    const recentPayments = [...payments]
      .filter((p) => p.period === currentPeriod)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);

    const allCommitments = activeExpenses
      .map((e) => ({
        expense: e,
        status: getExpenseStatus(e, payments, settings.alertDays, currentPeriod),
        daysUntilDue: getDaysUntilDue(e.dueDay),
      }))
      .sort((a, b) => {
        const order = { overdue: 0, pending: 1, upcoming: 2, paid: 3 };
        const diff = order[a.status] - order[b.status];
        if (diff !== 0) return diff;
        return (a.expense.dueDay ?? 99) - (b.expense.dueDay ?? 99);
      });

    // Income balances
    const activeIncomes = incomes.filter((i) => i.isActive);
    const incomeBalances = activeIncomes.map((income) => {
      const incPayments = currentPayments.filter((p) => p.payerId === income.id);
      const totalCharged = incPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = income.amount - totalCharged;
      const percentage = income.amount > 0 ? Math.round((totalCharged / income.amount) * 100) : 0;
      return { income, totalCharged, remaining, percentage, paymentCount: incPayments.length };
    });

    const totalIncome = activeIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalCharged = incomeBalances.reduce((sum, b) => sum + b.totalCharged, 0);
    const totalIncomeRemaining = totalIncome - totalCharged;

    return {
      totalMonthly,
      totalPaid,
      totalPending,
      overdueCount: overdueExpenses.length,
      pendingCount: pendingExpenses.length,
      paidCount: paidExpenses.length,
      upcomingCount: upcomingExpenses.length,
      completionPercentage,
      recentPayments,
      allCommitments,
      activeCount: activeExpenses.length,
      // Income stats
      incomeBalances,
      totalIncome,
      totalCharged,
      totalIncomeRemaining,
      activeIncomesCount: activeIncomes.length,
    };
  }, [expenses, payments, incomes, settings.alertDays, currentPeriod]);

  const cs = settings.currencySymbol;
  const unpaidCommitments = stats.allCommitments.filter((c) => c.status !== "paid");

  // Only show unpaid commitments by default (collapsed paid ones)
  const unpaidItems = stats.allCommitments.filter((c) => c.status !== "paid");
  const paidItems = stats.allCommitments.filter((c) => c.status === "paid");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight">Resumen</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Vista general de tus compromisos, saldos y gastos del mes
        </p>
      </motion.div>

      {/* Summary Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Mensual</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrencySimple(stats.totalMonthly, cs)}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">{stats.activeCount} compromisos</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Pagado</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrencySimple(stats.totalPaid, cs)}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.paidCount} de {stats.activeCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pendiente</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrencySimple(stats.totalPending, cs)}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingCount + stats.upcomingCount} por pagar
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">Vencidos</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-red-900 dark:text-red-100">
              {stats.overdueCount}
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">
              requieren atención urgente
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Progreso de pagos del mes</span>
              </div>
              <span className="text-2xl font-bold">{stats.completionPercentage}%</span>
            </div>
            <Progress value={stats.completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              <strong>{stats.paidCount}</strong> de <strong>{stats.activeCount}</strong> compromisos cumplidos
              {unpaidCommitments.length > 0 && (
                <> — <strong>{unpaidCommitments.length}</strong> por {formatCurrencySimple(stats.totalPending, cs)}</>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== SIDE-BY-SIDE: Compromisos + Saldos por Responsable ===== */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Compromisos del Mes */}
        <CollapsibleSection
          title="Compromisos del Mes"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          badge={unpaidCommitments.length > 0 ? (
            <Badge variant="destructive" className="text-[10px] h-5">
              {unpaidCommitments.length} pendiente{unpaidCommitments.length !== 1 ? "s" : ""}
            </Badge>
          ) : null}
          defaultOpen={true}
          headerRight={
            stats.completionPercentage < 100 ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={(e) => { e.stopPropagation(); onNavigate("payment"); }}
              >
                Pagar
                <ArrowRight className="h-3 w-3" />
              </Button>
            ) : undefined
          }
        >
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><CircleX className="h-3 w-3 text-red-500" /> Vencido</span>
            <span className="flex items-center gap-1"><CircleAlert className="h-3 w-3 text-amber-500" /> Próximo</span>
            <span className="flex items-center gap-1"><CircleDashed className="h-3 w-3 text-muted-foreground" /> Pendiente</span>
            <span className="flex items-center gap-1"><CircleCheckBig className="h-3 w-3 text-emerald-500" /> Pagado</span>
          </div>

          {stats.allCommitments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No tienes compromisos registrados este mes.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {/* Unpaid commitments */}
              {unpaidItems.map((commitment) => {
                const { expense, status } = commitment;
                const Icon = categoryIcons[expense.category] || Tag;
                const isOverdue = status === "overdue";
                const isPending = status === "pending";

                return (
                  <div
                    key={expense.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                      isOverdue
                        ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50"
                        : isPending
                          ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                      {isOverdue ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : isPending ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {getCategoryLabel(expense.category, settings.customCategories)} · {expense.dueDay != null ? `Día ${expense.dueDay}` : "Gasto eventual"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrencySimple(expense.amount, cs)}</p>
                      <p className={`text-[10px] font-medium ${status === "overdue" ? "text-red-500" : status === "pending" ? "text-amber-600" : "text-muted-foreground"}`}>
                        {formatDaysLabel(commitment.daysUntilDue)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Collapsible: Paid commitments */}
              {paidItems.length > 0 && (
                <CollapsiblePaidSection items={paidItems} expenses={expenses} cs={cs} customCategories={settings.customCategories} />
              )}
            </div>
          )}
        </CollapsibleSection>

        {/* RIGHT: Saldos por Responsable */}
        <CollapsibleSection
          title="Saldos por Responsable"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          defaultOpen={stats.incomeBalances.length > 0}
          headerRight={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={(e) => { e.stopPropagation(); onNavigate("incomes"); }}
            >
              Gestionar
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          {stats.incomeBalances.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No hay ingresos registrados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Agrega fuentes de ingreso para ver saldos
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1"
                onClick={() => onNavigate("incomes")}
              >
                Agregar Ingreso
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Global summary mini */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-2">
                  <p className="text-[10px] text-muted-foreground">Ingresos</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencySimple(stats.totalIncome, cs)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2">
                  <p className="text-[10px] text-muted-foreground">Cargado</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrencySimple(stats.totalCharged, cs)}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${stats.totalIncomeRemaining >= 0 ? "bg-blue-50 dark:bg-blue-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                  <p className="text-[10px] text-muted-foreground">Saldo</p>
                  <p className={`text-sm font-bold ${stats.totalIncomeRemaining >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-600"}`}>
                    {formatCurrencySimple(stats.totalIncomeRemaining, cs)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Per-person balances */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {stats.incomeBalances.map(({ income, totalCharged, remaining, percentage, paymentCount }) => {
                  const colorInfo = INCOME_COLORS.find((c) => c.value === income.color) || INCOME_COLORS[0];
                  const isOver = remaining < 0;

                  return (
                    <div key={income.id} className="rounded-xl border border-border/50 p-3 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full ${colorInfo.bg} flex items-center justify-center shrink-0`}>
                          <span className={`text-xs font-bold ${colorInfo.text}`}>
                            {income.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{income.name}</p>
                          {income.description && (
                            <p className="text-[10px] text-muted-foreground truncate">{income.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${isOver ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {formatCurrencySimple(remaining, cs)}
                          </p>
                        </div>
                      </div>

                      {/* Detail row */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Ingreso</p>
                          <p className="text-xs font-semibold">{formatCurrencySimple(income.amount, cs)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Cargado</p>
                          <p className="text-xs font-semibold text-red-500">
                            {formatCurrencySimple(totalCharged, cs)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Pagos</p>
                          <p className="text-xs font-semibold">{paymentCount}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {income.amount > 0 && (
                        <div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className={`h-1.5 ${percentage > 90 ? "[&>div]:bg-red-500" : percentage > 70 ? "[&>div]:bg-amber-500" : ""}`}
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {percentage}% asignado
                            {isOver && <span className="text-red-500 ml-1">— Excedido</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CollapsibleSection>
      </motion.div>

      {/* Summary footer for unpaid */}
      {unpaidCommitments.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Te faltan {unpaidCommitments.length} compromiso{unpaidCommitments.length !== 1 ? "s" : ""} por cumplir
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                    Restante: <strong>{formatCurrencySimple(stats.totalPending, cs)}</strong>
                    {stats.overdueCount > 0 && (
                      <span className="text-red-600 dark:text-red-400 ml-2">
                        · {stats.overdueCount} vencido{stats.overdueCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onNavigate("payment")}
                  className="shrink-0 gap-1"
                >
                  Ir a pagar
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ===== Pagos Recientes (collapsible, default closed) ===== */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          title="Pagos Realizados"
          icon={
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Pagos Realizados Este Mes
            </CardTitle>
          }
          defaultOpen={false}
          headerRight={
            stats.recentPayments.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => { e.stopPropagation(); onNavigate("history"); }}
              >
                Ver historial
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ) : undefined
          }
        >
          {stats.recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no has registrado pagos este mes
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentPayments.map((payment) => {
                const expense = expenses.find((e) => e.id === payment.expenseId);
                const Icon = expense ? (categoryIcons[expense.category] || Tag) : Tag;
                const payer = payment.payerId ? incomes.find((i) => i.id === payment.payerId) : null;

                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense?.name || "Desconocido"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense ? getCategoryLabel(expense.category, settings.customCategories) : ""} · {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                        {payer && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            · {payer.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatCurrencySimple(payment.amount, cs)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>
      </motion.div>
    </motion.div>
  );
}

// Sub-component for collapsible paid items
function CollapsiblePaidSection({
  items,
  expenses,
  cs,
  customCategories,
}: {
  items: Array<{ expense: any; status: string; daysUntilDue: number }>;
  expenses: any[];
  cs: string;
  customCategories?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {items.length} pago{items.length !== 1 ? "s" : ""} realizado{items.length !== 1 ? "s" : ""}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pb-1">
              {items.map((commitment) => {
                const { expense } = commitment;
                const Icon = categoryIcons[expense.category] || Tag;

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10"
                  >
                    <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${getCategoryColor(expense.category)} opacity-50`}>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate line-through text-muted-foreground">
                  {expense.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {getCategoryLabel(expense.category, customCategories)} · {expense.dueDay != null ? `Día ${expense.dueDay}` : "Gasto eventual"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground line-through shrink-0">
                      {formatCurrencySimple(expense.amount, cs)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
