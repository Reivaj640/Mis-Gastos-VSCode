import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORIES, AppSettings } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function getAllCategories(settings?: AppSettings) {
  const builtIn = CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));
  const custom = (settings?.customCategories || []).map((name) => ({
    value: `custom_${slugify(name)}`,
    label: name,
    icon: "Tag" as const,
  }));
  return [...builtIn, ...custom];
}

export function formatCurrency(amount: number, currencySymbol: string = "$"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("COP", currencySymbol).trim();
}

export function formatCurrencySimple(amount: number, currencySymbol: string = "$"): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

export function getExpenseStatus(
  expense: { dueDay: number; isActive: boolean },
  payments: { expenseId: string; period: string }[],
  alertDays: number,
  currentPeriod: string
): "paid" | "overdue" | "pending" | "upcoming" {
  if (!expense.isActive) return "upcoming";

  const isPaid = payments.some(
    (p) => p.expenseId === expense.id && p.period === currentPeriod
  );
  if (isPaid) return "paid";

  const now = new Date();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), expense.dueDay);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= alertDays) return "pending";
  return "upcoming";
}

export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthName(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "paid": return "text-emerald-600 dark:text-emerald-400";
    case "overdue": return "text-red-600 dark:text-red-400";
    case "pending": return "text-amber-600 dark:text-amber-400";
    default: return "text-muted-foreground";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "paid": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
    case "overdue": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    case "pending": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
    default: return "bg-muted text-muted-foreground";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "paid": return "Pagado";
    case "overdue": return "Vencido";
    case "pending": return "Próximo";
    default: return "Pendiente";
  }
}

export function getCategoryLabel(category: string, customCategories?: string[]): string {
  const labels: Record<string, string> = {
    agua: "Agua",
    luz: "Energía",
    gas: "Gas",
    internet: "Internet",
    alquiler: "Alquiler",
    bancario: "Bancario",
    manutencion: "Manutención",
    entretenimiento: "Entretenimiento",
    seguro: "Seguro",
    educacion: "Educación",
    transporte: "Transporte",
    salud: "Salud",
    otros: "Otros",
  };
  if (labels[category]) return labels[category];
  if (category.startsWith("custom_") && customCategories) {
    const match = customCategories.find((c) => `custom_${slugify(c)}` === category);
    if (match) return match;
  }
  if (category.startsWith("custom_")) {
    return category.replace("custom_", "").replace(/_/g, " ");
  }
  return category;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "agua": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "luz": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    case "gas": return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
    case "internet": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    case "alquiler": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
    case "bancario": return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400";
    case "manutencion": return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400";
    case "entretenimiento": return "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400";
    case "seguro": return "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400";
    case "educacion": return "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400";
    case "transporte": return "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400";
    case "salud": return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
  }
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getLast12Periods(): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export function paymentsToCSV(payments: any[], expenses: any[], currencySymbol: string): string {
  const header = "Fecha,Gasto,Categoría,Monto,Período,Notas";
  const rows = payments.map((p) => {
    const expense = expenses.find((e) => e.id === p.expenseId);
    const category = expense?.category || "Desconocido";
    const name = expense?.name || "Desconocido";
    const date = new Date(p.paymentDate).toLocaleDateString("es-CO");
    return `${date},"${name}",${category},${p.amount},${p.period},"${p.notes || ""}"`;
  });
  return [header, ...rows].join("\n");
}

export function getDaysUntilDue(dueDay: number): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysLabel(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  return `Vence en ${days} días`;
}
