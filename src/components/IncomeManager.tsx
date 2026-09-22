"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Income, Payment, INCOME_COLORS } from "@/lib/types";
import { formatCurrencySimple, getCurrentPeriod, generateId } from "@/lib/utils";

interface IncomeManagerProps {
  incomes: Income[];
  setIncomes: (incomes: Income[] | ((prev: Income[]) => Income[])) => void;
  payments: Payment[];
  currencySymbol: string;
}

function getColorClasses(color: string) {
  const found = INCOME_COLORS.find((c) => c.value === color);
  return found || INCOME_COLORS[0];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function IncomeManager({ incomes, setIncomes, payments, currencySymbol }: IncomeManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("blue");

  const currentPeriod = getCurrentPeriod();
  const cs = currencySymbol;

  const activeIncomes = useMemo(() => incomes.filter((i) => i.isActive), [incomes]);

  const incomeBalances = useMemo(() => {
    return activeIncomes.map((income) => {
      const currentPayments = payments.filter(
        (p) => p.payerId === income.id && p.period === currentPeriod
      );
      const totalCharged = currentPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = income.amount - totalCharged;
      const percentage = income.amount > 0 ? Math.round((totalCharged / income.amount) * 100) : 0;

      return {
        income,
        totalCharged,
        remaining,
        percentage,
        paymentCount: currentPayments.length,
      };
    });
  }, [activeIncomes, payments, currentPeriod]);

  const totalIncome = activeIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalCharged = incomeBalances.reduce((sum, b) => sum + b.totalCharged, 0);
  const totalRemaining = totalIncome - totalCharged;

  const openCreateDialog = () => {
    setEditingIncome(null);
    setFormName("");
    setFormAmount("");
    setFormDescription("");
    setFormColor("blue");
    setDialogOpen(true);
  };

  const openEditDialog = (income: Income) => {
    setEditingIncome(income);
    setFormName(income.name);
    setFormAmount(income.amount.toString());
    setFormDescription(income.description || "");
    setFormColor(income.color);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const name = formName.trim();
    const amount = parseFloat(formAmount);
    if (!name || isNaN(amount) || amount <= 0) return;

    if (editingIncome) {
      setIncomes((prev) =>
        prev.map((i) =>
          i.id === editingIncome.id
            ? { ...i, name, amount, description: formDescription.trim() || undefined, color: formColor }
            : i
        )
      );
    } else {
      const newIncome: Income = {
        id: generateId(),
        name,
        amount,
        description: formDescription.trim() || undefined,
        color: formColor,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setIncomes((prev) => [...prev, newIncome]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (incomeId: string) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === incomeId ? { ...i, isActive: !i.isActive } : i))
    );
  };

  const handleDelete = () => {
    if (incomeToDelete) {
      setIncomes((prev) => prev.filter((i) => i.id !== incomeToDelete.id));
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ingresos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Administra los ingresos y responsable de cada uno
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Ingreso
        </Button>
      </motion.div>

      {/* Global Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Resumen General del Mes</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencySimple(totalIncome, cs)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gastos Asignados</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrencySimple(totalCharged, cs)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo Disponible</p>
                <p className={`text-lg font-bold ${totalRemaining >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-600"}`}>
                  {formatCurrencySimple(totalRemaining, cs)}
                </p>
              </div>
            </div>
            {totalIncome > 0 && (
              <div className="mt-3">
                <Progress value={Math.min((totalCharged / totalIncome) * 100, 100)} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {Math.round((totalCharged / totalIncome) * 100)}% del ingreso total asignado a gastos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Income Balances */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Saldos por Responsable</span>
        </div>
        <AnimatePresence>
          {incomeBalances.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay ingresos registrados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agrega tus fuentes de ingreso para controlar los saldos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {incomeBalances.map(({ income, totalCharged, remaining, percentage, paymentCount }) => {
                const colors = getColorClasses(income.color);
                const isOverBudget = remaining < 0;

                return (
                  <motion.div key={income.id} variants={itemVariants} layout exit={{ opacity: 0, x: -100 }}>
                    <Card className={`border-none shadow-sm ${!income.isActive ? "opacity-50" : "hover:shadow-md"} transition-all duration-200`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-sm font-bold ${colors.text}`}>{income.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{income.name}</p>
                              {!income.isActive && <Badge variant="outline" className="text-[10px]">Inactivo</Badge>}
                            </div>
                            {income.description && <p className="text-xs text-muted-foreground truncate">{income.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => openEditDialog(income)} title="Editar ingreso" aria-label={`Editar ingreso ${income.name}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Más opciones"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleActive(income.id)}>
                                  {income.isActive ? (<><ToggleLeft className="h-4 w-4 mr-2" />Desactivar</>) : (<><ToggleRight className="h-4 w-4 mr-2" />Activar</>)}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => { setIncomeToDelete(income); setDeleteDialogOpen(true); }}>
                                  <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className={`rounded-lg ${colors.bg} p-2.5`}>
                            <div className="flex items-center gap-1 mb-0.5"><TrendingUp className={`h-3 w-3 ${colors.text}`} /><span className="text-[10px] text-muted-foreground">Ingreso</span></div>
                            <p className={`text-sm font-bold ${colors.text}`}>{formatCurrencySimple(income.amount, cs)}</p>
                          </div>
                          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5">
                            <div className="flex items-center gap-1 mb-0.5"><TrendingDown className="h-3 w-3 text-red-500" /><span className="text-[10px] text-muted-foreground">Cargado</span></div>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrencySimple(totalCharged, cs)}</p>
                            <p className="text-[10px] text-muted-foreground">{paymentCount} pago{paymentCount !== 1 ? "s" : ""}</p>
                          </div>
                          <div className={`rounded-lg p-2.5 ${isOverBudget ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20"}`}>
                            <div className="flex items-center gap-1 mb-0.5"><Wallet className={`h-3 w-3 ${isOverBudget ? "text-red-500" : "text-emerald-500"}`} /><span className="text-[10px] text-muted-foreground">Saldo</span></div>
                            <p className={`text-sm font-bold ${isOverBudget ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>{formatCurrencySimple(remaining, cs)}</p>
                          </div>
                        </div>

                        {income.amount > 0 && (
                          <div className="mt-3">
                            <Progress value={Math.min(percentage, 100)} className={`h-1.5 ${percentage > 90 ? "[&>div]:bg-red-500" : percentage > 70 ? "[&>div]:bg-amber-500" : ""}`} />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {percentage}% del ingreso asignado a gastos este mes
                              {isOverBudget && <span className="text-red-500 ml-1">— Sobrepasado por {formatCurrencySimple(Math.abs(remaining), cs)}</span>}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIncome ? "Editar Ingreso" : "Nuevo Ingreso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inc-name">Nombre del responsable</Label>
              <Input id="inc-name" placeholder="Ej: Javier, Laura, Negocio..." value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-amount">Monto mensual ({cs})</Label>
              <Input id="inc-amount" type="number" placeholder="0" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inc-desc">Descripción (opcional)</Label>
              <Input id="inc-desc" placeholder="Ej: Salario principal, Freelance..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Color de identificación</Label>
              <div className="flex flex-wrap gap-2">
                {INCOME_COLORS.map((color) => {
                  const isSelected = formColor === color.value;
                  return (
                    <button key={color.value} type="button" onClick={() => setFormColor(color.value)} className={`h-8 w-8 rounded-full ${color.bg} ${isSelected ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400" : "hover:opacity-80"} transition-all`} title={color.label} />
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formAmount || parseFloat(formAmount) <= 0}>{editingIncome ? "Guardar Cambios" : "Crear Ingreso"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Eliminar Ingreso</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas eliminar el ingreso de &quot;{incomeToDelete?.name}&quot;? Los pagos ya registrados con este responsable no se eliminarán.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
