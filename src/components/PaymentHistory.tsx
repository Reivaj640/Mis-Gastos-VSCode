"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  CalendarDays,
  BarChart3,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Expense,
  Payment,
  Income,
  AppSettings,
} from "@/lib/types";
import {
  formatCurrencySimple,
  getMonthName,
  getCategoryLabel,
  getCategoryColor,
  getLast12Periods,
  paymentsToCSV,
  getAllCategories,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Droplets, Zap, Flame, Wifi, Home, Tag,
  Landmark, Heart, Clapperboard, ShieldCheck,
  GraduationCap, Car, HeartPulse,
} from "lucide-react";

interface PaymentHistoryProps {
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  settings: AppSettings;
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
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PaymentHistory({ expenses, payments, incomes, setPayments, settings }: PaymentHistoryProps) {
  const { toast } = useToast();
  const cs = settings.currencySymbol;
  const customCategories = settings.customCategories;
  const allCategories = useMemo(() => getAllCategories(settings), [settings]);

  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchName, setSearchName] = useState("");

  // Edit dialog state
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editIncomeId, setEditIncomeId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Payment | null>(null);

  const periods = useMemo(() => getLast12Periods(), []);

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (filterPeriod !== "all" && p.period !== filterPeriod) return false;
        if (filterCategory !== "all") {
          const expense = expenses.find((e) => e.id === p.expenseId);
          if (!expense || expense.category !== filterCategory) return false;
        }
        if (searchName) {
          const expense = expenses.find((e) => e.id === p.expenseId);
          if (!expense || !expense.name.toLowerCase().includes(searchName.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, filterPeriod, filterCategory, searchName, expenses]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {};
    filteredPayments.forEach((p) => {
      const expense = expenses.find((e) => e.id === p.expenseId);
      if (!expense) return;
      const cat = expense.category;
      if (!summary[cat]) summary[cat] = { count: 0, total: 0 };
      summary[cat].count++;
      summary[cat].total += p.amount;
    });
    return Object.entries(summary).sort(([, a], [, b]) => b.total - a.total);
  }, [filteredPayments, expenses]);

  const yearComparison = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear().toString();
    const lastYear = (now.getFullYear() - 1).toString();

    const thisYearPayments = payments.filter((p) => p.period.startsWith(thisYear));
    const lastYearPayments = payments.filter((p) => p.period.startsWith(lastYear));

    const thisYearTotal = thisYearPayments.reduce((s, p) => s + p.amount, 0);
    const lastYearTotal = lastYearPayments.reduce((s, p) => s + p.amount, 0);

    const monthlyThisYear: Record<string, number> = {};
    const monthlyLastYear: Record<string, number> = {};

    thisYearPayments.forEach((p) => {
      const month = p.period.split("-")[1];
      monthlyThisYear[month] = (monthlyThisYear[month] || 0) + p.amount;
    });

    lastYearPayments.forEach((p) => {
      const month = p.period.split("-")[1];
      monthlyLastYear[month] = (monthlyLastYear[month] || 0) + p.amount;
    });

    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];

    return {
      thisYearTotal,
      lastYearTotal,
      change: lastYearTotal > 0 ? ((thisYearTotal - lastYearTotal) / lastYearTotal * 100) : 0,
      months: monthNames.map((name, i) => {
        const m = String(i + 1).padStart(2, "0");
        return {
          name,
          thisYear: monthlyThisYear[m] || 0,
          lastYear: monthlyLastYear[m] || 0,
        };
      }).slice(0, now.getMonth() + 1),
    };
  }, [payments]);

  const handleExportCSV = () => {
    const csv = paymentsToCSV(filteredPayments, expenses, cs);
    navigator.clipboard.writeText(csv).then(() => {
      toast({
        title: "Copiado al portapapeles",
        description: `${filteredPayments.length} pagos exportados como CSV`,
      });
    });
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditDate(payment.paymentDate.split("T")[0]);
    setEditPeriod(payment.period);
    setEditNotes(payment.notes || "");
    setEditIncomeId(payment.payerId || "");
  };

  const handleSaveEdit = () => {
    if (!editingPayment) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === editingPayment.id
          ? {
              ...p,
              amount,
              paymentDate: new Date(editDate).toISOString(),
              period: editPeriod,
              notes: editNotes.trim() || undefined,
              payerId: editIncomeId || undefined,
            }
          : p
      )
    );

    toast({
      title: "Pago actualizado",
      description: "Los datos del pago se han actualizado correctamente",
    });

    setEditingPayment(null);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPayments((prev) => prev.filter((p) => p.id !== payment.id));
    setDeleteConfirm(null);
    toast({
      title: "Pago eliminado",
      description: "El pago ha sido eliminado del historial",
    });
  };

  const getIncomeName = (payerId: string | undefined) => {
    if (!payerId) return null;
    const income = incomes.find((i) => i.id === payerId);
    return income?.name || null;
  };

  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const maxCategoryTotal = categorySummary.length > 0 ? categorySummary[0][1].total : 1;
  const activeIncomes = incomes.filter((i) => i.isActive);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Historial</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {payments.length} pagos registrados en total
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Comparación
          </TabsTrigger>
        </TabsList>

        {/* LIST TAB */}
        <TabsContent value="list" className="mt-4 space-y-4">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-44">
                <CalendarDays className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {getMonthName(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total mostrado: {filteredPayments.length} pagos
                </span>
                <span className="text-xl font-bold">
                  {formatCurrencySimple(totalFiltered, cs)}
                </span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
            {filteredPayments.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No se encontraron pagos</p>
                </CardContent>
              </Card>
            ) : (
              filteredPayments.map((payment) => {
                const expense = expenses.find((e) => e.id === payment.expenseId);
                const Icon = expense ? (categoryIcons[expense.category] || Tag) : Tag;
                const incomeName = getIncomeName(payment.payerId);
                return (
                  <motion.div key={payment.id} variants={itemVariants}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${expense ? getCategoryColor(expense.category) : "bg-muted"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {expense?.name || "Desconocido"}
                              </p>
                              {incomeName && (
                                <Badge variant="outline" className="text-[10px] gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shrink-0">
                                  <Wallet className="h-2.5 w-2.5" />
                                  {incomeName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
{expense ? getCategoryLabel(expense.category, customCategories) : ""}
                      {payment.notes ? ` · ${payment.notes}` : ""}
                              {" · "} {getMonthName(payment.period)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                {formatCurrencySimple(payment.amount, cs)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                                onClick={() => openEditDialog(payment)}
                                title="Editar pago"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => setDeleteConfirm(payment)}
                                title="Eliminar pago"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </TabsContent>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resumen por Categoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySummary.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No hay datos para mostrar
                  </p>
                ) : (
                  categorySummary.map(([category, data]) => {
                    const pct = (data.total / maxCategoryTotal) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {getCategoryLabel(category, customCategories)}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {data.count} pago{data.count !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrencySimple(data.total, cs)}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* COMPARISON TAB */}
        <TabsContent value="comparison" className="mt-4 space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Comparación Anual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Año anterior</p>
                    <p className="text-lg font-bold">
                      {formatCurrencySimple(yearComparison.lastYearTotal, cs)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Este año</p>
                    <p className="text-lg font-bold">
                      {formatCurrencySimple(yearComparison.thisYearTotal, cs)}
                    </p>
                  </div>
                </div>

                {yearComparison.lastYearTotal > 0 && (
                  <div className="rounded-lg p-3 bg-muted/50">
                    <p className="text-sm">
                      <span className="font-medium">Cambio:</span>{" "}
                      <span className={yearComparison.change >= 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                        {yearComparison.change >= 0 ? "+" : ""}
                        {yearComparison.change.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Comparación mensual</p>
                  {yearComparison.months.map((month) => {
                    const maxVal = Math.max(month.thisYear, month.lastYear, 1);
                    return (
                      <div key={month.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium w-8">{month.name}</span>
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">
                              {formatCurrencySimple(month.lastYear, cs)}
                            </span>
                            <span className="font-medium">
                              {formatCurrencySimple(month.thisYear, cs)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 h-4">
                          <div
                            className="bg-muted rounded-sm flex items-end"
                            style={{ width: `${(month.lastYear / maxVal) * 50}%`, minWidth: month.lastYear > 0 ? 4 : 0, height: "100%" }}
                          />
                          <div
                            className="bg-blue-500 rounded-sm flex items-end"
                            style={{ width: `${(month.thisYear / maxVal) * 50}%`, minWidth: month.thisYear > 0 ? 4 : 0, height: "100%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* EDIT PAYMENT DIALOG */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pago</DialogTitle>
          </DialogHeader>
          {editingPayment && (() => {
            const expense = expenses.find((e) => e.id === editingPayment.expenseId);
            return (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">{expense?.name || "Desconocido"}</p>
                  {expense && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getCategoryLabel(expense.category, customCategories)} · Vence día {expense.dueDay}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Monto ({cs})</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Fecha de pago</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-period">Período (YYYY-MM)</Label>
                    <Input
                      id="edit-period"
                      type="month"
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deducir de ingreso (opcional)</Label>
                  {activeIncomes.length > 0 ? (
                    <Select value={editIncomeId} onValueChange={setEditIncomeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ninguno" />
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
                      No hay ingresos registrados. Ve a la sección Ingresos para agregar.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notas (opcional)</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Referencia, número de recibo..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingPayment(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editAmount || parseFloat(editAmount) <= 0 || !editDate || !editPeriod}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Pago</DialogTitle>
          </DialogHeader>
          {deleteConfirm && (() => {
            const expense = expenses.find((e) => e.id === deleteConfirm.expenseId);
            return (
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de que deseas eliminar el pago de <strong>{expense?.name || "desconocido"}</strong> por{" "}
                <strong>{formatCurrencySimple(deleteConfirm.amount, cs)}</strong>?
                Esta acción no se puede deshacer.
              </p>
            );
          })()}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDeletePayment(deleteConfirm)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
