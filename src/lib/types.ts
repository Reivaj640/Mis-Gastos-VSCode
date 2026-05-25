export interface Expense {
  id: string;
  name: string;
  category: string;
  customCategory?: string;
  amount: number;
  dueDay: number;
  isActive: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  expenseId: string;
  amount: number;
  paymentDate: string;
  period: string;
  notes?: string;
  payerId?: string;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  currencySymbol: string;
  alertDays: number;
  customCategories: string[];
}

export type ViewType = "dashboard" | "expenses" | "payment" | "history" | "incomes" | "settings";

export type ExpenseStatus = "paid" | "pending" | "overdue" | "upcoming";

export const CATEGORIES = [
  { value: "agua", label: "Agua", icon: "Droplets" },
  { value: "luz", label: "Energía", icon: "Zap" },
  { value: "gas", label: "Gas", icon: "Flame" },
  { value: "internet", label: "Internet", icon: "Wifi" },
  { value: "alquiler", label: "Alquiler", icon: "Home" },
  { value: "bancario", label: "Bancario", icon: "Landmark" },
  { value: "manutencion", label: "Manutención", icon: "Heart" },
  { value: "entretenimiento", label: "Entretenimiento", icon: "Clapperboard" },
  { value: "seguro", label: "Seguro", icon: "ShieldCheck" },
  { value: "educacion", label: "Educación", icon: "GraduationCap" },
  { value: "transporte", label: "Transporte", icon: "Car" },
  { value: "salud", label: "Salud", icon: "HeartPulse" },
  { value: "otros", label: "Otros", icon: "Tag" },
] as const;

export const INCOME_COLORS = [
  { value: "blue", label: "Azul", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  { value: "green", label: "Verde", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-700" },
  { value: "purple", label: "Morado", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
  { value: "orange", label: "Naranja", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
  { value: "pink", label: "Rosa", bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-300 dark:border-pink-700" },
  { value: "teal", label: "Teal", bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700" },
  { value: "rose", label: "Rojo", bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700" },
] as const;
