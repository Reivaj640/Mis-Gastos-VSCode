"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Home,
  Tag,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Receipt,
  Landmark,
  Heart,
  Clapperboard,
  ShieldCheck,
  GraduationCap,
  Car,
  HeartPulse,
  Coffee,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Expense, Payment, AppSettings } from "@/lib/types";
import {
  formatCurrencySimple,
  getExpenseStatus,
  getCurrentPeriod,
  getStatusBgColor,
  getStatusLabel,
  getCategoryLabel,
  getCategoryColor,
  generateId,
  getAllCategories,
} from "@/lib/utils";

interface ExpensesManagerProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  payments: Payment[];
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
  hormiga: Coffee,
};

export default function ExpensesManager({ expenses, setExpenses, payments, settings }: ExpensesManagerProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categories = useMemo(() => getAllCategories(settings), [settings]);
  const customCategories = settings.customCategories;

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(categories[0]?.value || "agua");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDay, setFormDueDay] = useState("");

  const currentPeriod = getCurrentPeriod();
  const cs = settings.currencySymbol;

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== "all" && e.category !== filterCategory) return false;
        return true;
      })
      .sort((a, b) => (a.dueDay ?? 99) - (b.dueDay ?? 99));
  }, [expenses, search, filterCategory]);

  const openCreateDialog = () => {
    setEditingExpense(null);
    setFormName("");
    setFormCategory(categories[0]?.value || "agua");
    setFormCustomCategory("");
    setFormAmount("");
    setFormDueDay("");
    setDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormName(expense.name);
    setFormCategory(expense.category);
    setFormCustomCategory(expense.customCategory || "");
    setFormAmount(expense.amount.toString());
    setFormDueDay(expense.dueDay != null ? expense.dueDay.toString() : "");
    setDialogOpen(true);
  };

const handleSave = () => {
  const name = formName.trim();
  const amount = parseFloat(formAmount);
  const isHormiga = formCategory === "hormiga";
  const dueDay = isHormiga ? undefined : parseInt(formDueDay);

  if (!name || isNaN(amount) || amount <= 0) return;
  if (!isHormiga && (isNaN(dueDay!) || dueDay! < 1 || dueDay! > 31)) return;

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? {
                ...e,
                name,
                category: formCategory,
                customCategory: formCategory === "otros" ? formCustomCategory.trim() || undefined : undefined,
        amount,
        dueDay: dueDay as number | undefined,
      }
: e
        )
      );
    } else {
      const newExpense: Expense = {
        id: generateId(),
        name,
        category: formCategory,
        customCategory: formCategory === "otros" ? formCustomCategory.trim() || undefined : undefined,
    amount,
    dueDay: dueDay as number | undefined,
    isActive: true,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [...prev, newExpense]);
    }

    setDialogOpen(false);
  };

  const toggleActive = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, isActive: !e.isActive } : e))
    );
  };

  const handleDelete = () => {
    if (expenseToDelete) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {expenses.filter((e) => e.isActive).length} gastos activos de {expenses.length} totales
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Gasto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gasto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        <AnimatePresence>
          {filteredExpenses.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No se encontraron gastos</p>
              </CardContent>
            </Card>
          ) : (
            filteredExpenses.map((expense) => {
              const Icon = categoryIcons[expense.category] || Tag;
              const status = getExpenseStatus(expense, payments, settings.alertDays, currentPeriod);

              return (
                <motion.div
                  key={expense.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card
                    className={`border-none shadow-sm transition-all duration-200 ${
                      !expense.isActive ? "opacity-50" : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{expense.name}</p>
                            {!expense.isActive && (
                              <Badge variant="outline" className="text-[10px]">Inactivo</Badge>
                            )}
                          </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getCategoryLabel(expense.category, customCategories)}
                            {expense.customCategory ? ` · ${expense.customCategory}` : ""}
{expense.dueDay != null ? ` · Vence día ${expense.dueDay}` : " · Gasto eventual"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] hidden sm:inline-flex ${getStatusBgColor(status)}`}
                          >
                            {getStatusLabel(status)}
                          </Badge>
                          <span className="font-semibold text-sm whitespace-nowrap">
                            {formatCurrencySimple(expense.amount, cs)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={() => openEditDialog(expense)}
                            title="Editar gasto"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleActive(expense.id)}>
                                {expense.isActive ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                onClick={() => {
                                  setExpenseToDelete(expense);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del gasto</Label>
              <Input
                id="name"
                placeholder="Ej: Servicio de Agua"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formCategory === "otros" && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Subcategoría</Label>
                <Input
                  id="customCategory"
                  placeholder="Ej: Entretenimiento"
                  value={formCustomCategory}
                  onChange={(e) => setFormCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto ({cs})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Día de vencimiento</Label>
<Input
id="dueDay"
type="number"
disabled={formCategory === "hormiga"}
                  placeholder="1-31"
                  min="1"
                  max="31"
                  value={formDueDay}
                  onChange={(e) => setFormDueDay(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formAmount || parseFloat(formAmount) <= 0 || (formCategory !== "hormiga" && !formDueDay)}
            >
              {editingExpense ? "Guardar Cambios" : "Crear Gasto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Gasto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que deseas eliminar &quot;{expenseToDelete?.name}&quot;? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
