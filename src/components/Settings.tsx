"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Bell,
  Trash2,
  Download,
  Upload,
  Plus,
  X,
  Tag,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppSettings, Expense, Payment, Income } from "@/lib/types";
import { defaultSettings } from "@/lib/demo-data";
import { useToast } from "@/hooks/use-toast";
import UpdateManager from "@/components/UpdateManager";

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  setExpenses: (expenses: Expense[]) => void;
  setPayments: (payments: Payment[]) => void;
  setIncomes: (incomes: Income[]) => void;
}

export default function Settings({
  settings,
  setSettings,
  expenses,
  payments,
  incomes,
  setExpenses,
  setPayments,
  setIncomes,
}: SettingsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currency, setCurrency] = useState(settings.currencySymbol);
  const [alertDays, setAlertDays] = useState(settings.alertDays.toString());
  const [newCategory, setNewCategory] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleSaveCurrency = () => {
    setSettings((prev) => ({ ...prev, currencySymbol: currency }));
    toast({ title: "Símbolo de moneda actualizado" });
  };

  const handleSaveAlertDays = () => {
    const days = parseInt(alertDays);
    if (isNaN(days) || days < 1 || days > 31) return;
    setSettings((prev) => ({ ...prev, alertDays: days }));
    toast({ title: "Días de alerta actualizados" });
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, trimmed],
    }));
    setNewCategory("");
    toast({ title: "Categoría agregada" });
  };

  const handleRemoveCategory = (cat: string) => {
    setSettings((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c !== cat),
    }));
    toast({ title: "Categoría eliminada" });
  };

  const handleClearData = () => {
    setExpenses([]);
    setPayments([]);
    setSettings(defaultSettings);
    setClearDialogOpen(false);
    toast({ title: "Todos los datos han sido eliminados" });
  };

  const handleExportBackup = () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      expenses,
      payments,
      incomes,
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Respaldo descargado" });
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.expenses && data.payments) {
          setExpenses(data.expenses);
          setPayments(data.payments);
          if (data.settings) setSettings(data.settings);
          if (data.incomes) setIncomes(data.incomes);
          toast({ title: "Datos restaurados correctamente" });
        } else {
          toast({ title: "Error", description: "Formato de archivo inválido", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "No se pudo leer el archivo", variant: "destructive" });
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light" as const, label: "Claro", icon: Sun, desc: "Fondo blanco con texto oscuro" },
    { value: "dark" as const, label: "Oscuro", icon: Moon, desc: "Fondo oscuro con texto claro" },
    { value: "system" as const, label: "Sistema", icon: Monitor, desc: "Se adapta a la configuración de tu dispositivo" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Personaliza tu aplicación de gastos
        </p>
      </motion.div>

      {/* Theme */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                      isActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"
                    )}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Currency */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Moneda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="$"
                className="w-24"
                maxLength={3}
              />
              <Button onClick={handleSaveCurrency} size="sm" disabled={currency === settings.currencySymbol}>
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ejemplos: $, €, £, ₡, MX$, AR$
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Days */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Días de Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                value={alertDays}
                onChange={(e) => setAlertDays(e.target.value)}
                min="1"
                max="31"
                className="w-24"
              />
              <Button onClick={handleSaveAlertDays} size="sm" disabled={parseInt(alertDays) === settings.alertDays}>
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se mostrarán alertas cuando un gasto venga dentro de este número de días
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Categories */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categorías Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
              />
              <Button onClick={handleAddCategory} size="sm" disabled={!newCategory.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {settings.customCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.customCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Agrega categorías personalizadas para tus gastos especiales
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* In-App Update */}
      <motion.div variants={itemVariants}>
        <UpdateManager />
      </motion.div>

      <Separator />

      {/* Data Management */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Gestión de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={handleExportBackup}
              >
                <Download className="h-4 w-4" />
                Exportar Respaldo (JSON)
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Importar Respaldo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </div>

            <Separator />

            <div>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setClearDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Todos los Datos
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Esta acción eliminará todos los gastos y pagos de forma permanente.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clear Data Confirmation */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Eliminar Todos los Datos
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro? Esta acción eliminará permanentemente todos los gastos, pagos y configuraciones.
            </p>
            <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>{expenses.length}</strong> gastos y <strong>{payments.length}</strong> pagos serán eliminados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Sí, eliminar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
