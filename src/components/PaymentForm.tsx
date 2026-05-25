"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CalendarDays,
  FileText,
  DollarSign,
  Sparkles,
  Droplets, Zap, Flame, Wifi, Home, Tag,
  Landmark, Heart, Clapperboard, ShieldCheck,
  GraduationCap, Car, HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Expense, Payment, Income, AppSettings } from "@/lib/types";
import {
  formatCurrencySimple,
  getExpenseStatus,
  getCurrentPeriod,
  getCategoryLabel,
  generateId,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  settings: AppSettings;
}

export default function PaymentForm({ expenses, payments, incomes, setPayments, settings }: PaymentFormProps) {
  const { toast } = useToast();
  const currentPeriod = getCurrentPeriod();
  const cs = settings.currencySymbol;

  const [selectedExpenseId, setSelectedExpenseId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState(currentPeriod);
  const [notes, setNotes] = useState("");
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastPayment, setLastPayment] = useState<{ name: string; amount: number } | null>(null);

  const activeIncomes = incomes.filter((i) => i.isActive);

  // Batch payment state
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelections, setBatchSelections] = useState<string[]>([]);
  const [batchStep, setBatchStep] = useState<"select" | "confirm">("select");

  const payableExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!e.isActive) return false;
      const status = getExpenseStatus(e, payments, settings.alertDays, currentPeriod);
      return status !== "paid";
    });
  }, [expenses, payments, settings.alertDays, currentPeriod]);

  const selectedExpense = useMemo(() => {
    return expenses.find((e) => e.id === selectedExpenseId) || null;
  }, [expenses, selectedExpenseId]);

  const handleExpenseSelect = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setSelectedIncomeId("");
    const expense = expenses.find((e) => e.id === expenseId);
    if (expense) {
      setAmount(expense.amount.toString());
    }
  };

  const handleSinglePayment = () => {
    if (!selectedExpenseId || !amount || parseFloat(amount) <= 0) return;

    const newPayment: Payment = {
      id: generateId(),
      expenseId: selectedExpenseId,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate).toISOString(),
      period,
      notes: notes.trim() || undefined,
      payerId: selectedIncomeId || undefined,
    };

    setPayments((prev) => [...prev, newPayment]);

    const expense = expenses.find((e) => e.id === selectedExpenseId);
    setLastPayment({ name: expense?.name || "Gasto", amount: parseFloat(amount) });
    setShowConfirmation(true);

    // Reset form
    setSelectedExpenseId("");
    setSelectedIncomeId("");
    setAmount("");
    setNotes("");
  };

  const toggleBatchSelection = (expenseId: string) => {
    setBatchSelections((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleBatchPayment = () => {
    const newPayments: Payment[] = batchSelections.map((expenseId) => {
      const expense = expenses.find((e) => e.id === expenseId);
      return {
        id: generateId(),
        expenseId,
        amount: expense?.amount || 0,
        paymentDate: new Date().toISOString(),
        period: currentPeriod,
      };
    });

    setPayments((prev) => [...prev, ...newPayments]);

    const totalAmount = newPayments.reduce((sum, p) => sum + p.amount, 0);
    setLastPayment({ name: `${batchSelections.length} gastos`, amount: totalAmount });
    setShowConfirmation(true);

    setBatchSelections([]);
    setBatchStep("select");
    setBatchMode(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registrar Pago</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Registra los pagos de tus gastos mensuales
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!batchMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setBatchMode(false);
            setBatchStep("select");
          }}
        >
          Pago Individual
        </Button>
        <Button
          variant={batchMode ? "default" : "outline"}
          size="sm"
          onClick={() => setBatchMode(true)}
          disabled={payableExpenses.length === 0}
        >
          Pago Múltiple ({payableExpenses.length})
        </Button>
      </div>

      {!batchMode ? (
        /* Single Payment Form */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar gasto</Label>
                <Select value={selectedExpenseId} onValueChange={handleExpenseSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un gasto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {payableExpenses.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay gastos pendientes
                      </SelectItem>
                    ) : (
                      payableExpenses.map((expense) => (
                        <SelectItem key={expense.id} value={expense.id}>
                          <div className="flex items-center gap-2">
                            <span>{expense.name}</span>
                            <span className="text-muted-foreground">
                              ({formatCurrencySimple(expense.amount, cs)})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedExpense && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{selectedExpense.name}</span>
                      <Badge variant="outline">{getCategoryLabel(selectedExpense.category, settings.customCategories)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence el día {selectedExpense.dueDay} de cada mes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        Monto ({cs})
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">
                        <CalendarDays className="h-3 w-3 inline mr-1" />
                        Fecha de pago
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Período (YYYY-MM)</Label>
                    <Input
                      id="period"
                      type="month"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                    />
                  </div>

                  {/* Income selector */}
                  <div className="space-y-2">
                    <Label>Deducir de ingreso</Label>
                    {activeIncomes.length > 0 ? (
                      <Select value={selectedIncomeId} onValueChange={setSelectedIncomeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ingreso..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Sin asignar —</SelectItem>
                          {activeIncomes.map((income) => (
                            <SelectItem key={income.id} value={income.id}>
                              <div className="flex items-center gap-2">
                                <span>{income.name}</span>
                                <span className="text-muted-foreground">
                                  ({formatCurrencySimple(income.amount, cs)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        No hay ingresos registrados. Ve a la seccion Ingresos para agregar.
                      </p>
                    )}
                    {selectedIncomeId && (() => {
                      const selIncome = incomes.find((i) => i.id === selectedIncomeId);
                      if (!selIncome) return null;
                      const currentPeriodPayments = payments.filter(
                        (p) => p.payerId === selIncome.id && p.period === currentPeriod
                      );
                      const charged = currentPeriodPayments.reduce((s, p) => s + p.amount, 0);
                      const remaining = selIncome.amount - charged - parseFloat(amount || "0");
                      return (
                        <p className={`text-xs mt-1 ${remaining < 0 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          Saldo despues de este pago: {formatCurrencySimple(remaining, cs)}
                          {remaining < 0 && " — Excedido"}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      <FileText className="h-3 w-3 inline mr-1" />
                      Notas (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Referencia, numero de recibo..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSinglePayment}
                    disabled={!selectedExpenseId || !amount || parseFloat(amount) <= 0}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Registrar Pago
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Batch Payment */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Selecciona los gastos a pagar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payableExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay gastos pendientes para este mes
                </p>
              ) : (
                <>
                  {payableExpenses.map((expense) => (
                    <label
                      key={expense.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={batchSelections.includes(expense.id)}
                        onCheckedChange={() => toggleBatchSelection(expense.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{expense.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryLabel(expense.category, settings.customCategories)} · Vence día {expense.dueDay}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        {formatCurrencySimple(expense.amount, cs)}
                      </span>
                    </label>
                  ))}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {batchSelections.length} gastos seleccionados
                    </span>
                    <span className="font-bold">
                      {formatCurrencySimple(
                        batchSelections.reduce((sum, id) => {
                          const expense = expenses.find((e) => e.id === id);
                          return sum + (expense?.amount || 0);
                        }, 0),
                        cs
                      )}
                    </span>
                  </div>

                  <Button
                    className="w-full mt-2"
                    onClick={handleBatchPayment}
                    disabled={batchSelections.length === 0}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Pagar {batchSelections.length} gastos
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Success Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmation && lastPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-card rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 12 }}
              >
                <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-1">¡Pago Registrado!</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-muted-foreground">{lastPayment.name}</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencySimple(lastPayment.amount, cs)}
                  </p>
                </div>

                {/* Confetti-like particles */}
                <div className="flex justify-center gap-1 mb-4">
                  {["🎉", "✨", "🎊", "💫", "⭐"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0.5],
                        y: [0, -20 - i * 8],
                        x: [(i - 2) * 12, (i - 2) * 20],
                      }}
                      transition={{
                        delay: 0.4 + i * 0.1,
                        duration: 1.2,
                        repeat: 1,
                      }}
                      className="text-lg"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>

                <Button onClick={() => setShowConfirmation(false)} className="w-full">
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
