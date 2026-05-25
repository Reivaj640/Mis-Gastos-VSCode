import { Expense, Payment, Income, AppSettings } from "./types";
import { generateId, getCurrentPeriod } from "./utils";

const now = new Date();

export function createDemoExpenses(): Expense[] {
  return [
    {
      id: generateId(),
      name: "Alquiler Apartamento",
      category: "alquiler",
      amount: 1200000,
      dueDay: 1,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Crédito Bancario",
      category: "bancario",
      amount: 850000,
      dueDay: 5,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Manutención Hijo",
      category: "manutencion",
      amount: 600000,
      dueDay: 10,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Internet Fibra",
      category: "internet",
      amount: 70000,
      dueDay: 8,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Agua Potable",
      category: "agua",
      amount: 45000,
      dueDay: 15,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Energía Eléctrica",
      category: "luz",
      amount: 85000,
      dueDay: 18,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Gas Natural",
      category: "gas",
      amount: 35000,
      dueDay: 12,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Netflix",
      category: "entretenimiento",
      amount: 24900,
      dueDay: 22,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Seguro Salud",
      category: "seguro",
      amount: 180000,
      dueDay: 28,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: generateId(),
      name: "Tarjeta de Crédito",
      category: "bancario",
      amount: 320000,
      dueDay: 25,
      isActive: true,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
  ];
}

export function createDemoPayments(expenses: Expense[]): Payment[] {
  // Solo crea pagos del mes actual para los gastos vencidos
  // Sin historial de meses anteriores - todo empieza desde el mes en curso
  const currentPeriod = getCurrentPeriod();
  const payments: Payment[] = [];

  // Mes actual: pagar solo los gastos cuyo día de vencimiento ya pasó
  const today = now.getDate();
  const expensesToPay = expenses.filter((e) => e.dueDay < today);
  expensesToPay.forEach((expense) => {
    payments.push({
      id: generateId(),
      expenseId: expense.id,
      amount: expense.amount,
      paymentDate: new Date(
        now.getFullYear(),
        now.getMonth(),
        Math.min(expense.dueDay, today)
      ).toISOString(),
      period: currentPeriod,
    });
  });

  return payments;
}

export function createDemoIncomes(): Income[] {
  return [];
}

export const defaultSettings: AppSettings = {
  currencySymbol: "$",
  alertDays: 7,
  customCategories: [],
};
