import { create } from 'zustand';
import { Expense, Payment, Income, AppSettings } from '@/lib/types';

interface AppState {
  // Datos
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  settings: AppSettings;
  
  // Estado de carga
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Historial para deshacer/rehacer (1 acción = 1 paso)
  history: AppStateSnapshot[];
  future: AppStateSnapshot[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // Acciones - Expenses
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Acciones - Payments
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  // Acciones - Incomes
  setIncomes: (incomes: Income[]) => void;
  addIncome: (income: Income) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  
  // Acciones - Settings
  setSettings: (settings: AppSettings) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Acciones - Initialization
  initialize: (data: { expenses: Expense[]; payments: Payment[]; incomes: Income[]; settings: AppSettings }) => void;
  reset: () => void;
  
  // Acciones - Undo/Redo
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Acciones - Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface AppStateSnapshot {
  expenses: Expense[];
  payments: Payment[];
  incomes: Income[];
  settings: AppSettings;
}

const MAX_HISTORY_SIZE = 50;

// Función auxiliar para crear snapshot
const createSnapshot = (state: AppState): AppStateSnapshot => ({
  expenses: JSON.parse(JSON.stringify(state.expenses)),
  payments: JSON.parse(JSON.stringify(state.payments)),
  incomes: JSON.parse(JSON.stringify(state.incomes)),
  settings: JSON.parse(JSON.stringify(state.settings)),
});

// Función auxiliar: registra el estado previo a cada acción (1 acción = 1 entrada)
const addToHistory = (state: AppState, snapshot: AppStateSnapshot) => {
  const newHistory = [...state.history, snapshot];

  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory.shift();
  }

  return {
    history: newHistory,
    future: [], // una acción nueva invalida la rama de rehacer
    historyIndex: newHistory.length - 1,
    canUndo: newHistory.length > 0,
    canRedo: false,
  };
};

export const useAppStore = create<AppState>()(
  (set, get) => ({
      // Estado inicial
      expenses: [],
      payments: [],
      incomes: [],
      settings: {
        currencySymbol: '$',
        alertDays: 3,
        customCategories: [],
        periodStartDay: 26,
        currency: 'CRC',
        locale: 'es-CR',
        theme: 'light',
      },
      isLoading: false,
      isInitialized: false,
      error: null,
      history: [],
      future: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      
      // Acciones - Expenses
      setExpenses: (expenses) => {
        const snapshot = createSnapshot(get());
        set({ 
          expenses,
          ...addToHistory(get(), snapshot),
        });
      },
      
      addExpense: (expense) => {
        const snapshot = createSnapshot(get());
        const newExpenses = [...get().expenses, expense];
        set({ 
          expenses: newExpenses,
          ...addToHistory(get(), snapshot),
        });
      },
      
      updateExpense: (id, updates) => {
        const snapshot = createSnapshot(get());
        const newExpenses = get().expenses.map(exp => 
          exp.id === id ? { ...exp, ...updates } : exp
        );
        set({ 
          expenses: newExpenses,
          ...addToHistory(get(), snapshot),
        });
      },
      
      deleteExpense: (id) => {
        const snapshot = createSnapshot(get());
        const newExpenses = get().expenses.filter(exp => exp.id !== id);
        // También eliminar pagos asociados
        const newPayments = get().payments.filter(pay => pay.expenseId !== id);
        set({ 
          expenses: newExpenses,
          payments: newPayments,
          ...addToHistory(get(), snapshot),
        });
      },
      
      // Acciones - Payments
      setPayments: (payments) => {
        const snapshot = createSnapshot(get());
        set({ 
          payments,
          ...addToHistory(get(), snapshot),
        });
      },
      
      addPayment: (payment) => {
        const snapshot = createSnapshot(get());
        const newPayments = [...get().payments, payment];
        set({ 
          payments: newPayments,
          ...addToHistory(get(), snapshot),
        });
      },
      
      updatePayment: (id, updates) => {
        const snapshot = createSnapshot(get());
        const newPayments = get().payments.map(pay => 
          pay.id === id ? { ...pay, ...updates } : pay
        );
        set({ 
          payments: newPayments,
          ...addToHistory(get(), snapshot),
        });
      },
      
      deletePayment: (id) => {
        const snapshot = createSnapshot(get());
        const newPayments = get().payments.filter(pay => pay.id !== id);
        set({ 
          payments: newPayments,
          ...addToHistory(get(), snapshot),
        });
      },
      
      // Acciones - Incomes
      setIncomes: (incomes) => {
        const snapshot = createSnapshot(get());
        set({ 
          incomes,
          ...addToHistory(get(), snapshot),
        });
      },
      
      addIncome: (income) => {
        const snapshot = createSnapshot(get());
        const newIncomes = [...get().incomes, income];
        set({ 
          incomes: newIncomes,
          ...addToHistory(get(), snapshot),
        });
      },
      
      updateIncome: (id, updates) => {
        const snapshot = createSnapshot(get());
        const newIncomes = get().incomes.map(inc => 
          inc.id === id ? { ...inc, ...updates } : inc
        );
        set({ 
          incomes: newIncomes,
          ...addToHistory(get(), snapshot),
        });
      },
      
      deleteIncome: (id) => {
        const snapshot = createSnapshot(get());
        const newIncomes = get().incomes.filter(inc => inc.id !== id);
        set({ 
          incomes: newIncomes,
          ...addToHistory(get(), snapshot),
        });
      },
      
      // Acciones - Settings
      setSettings: (settings) => {
        const snapshot = createSnapshot(get());
        set({ 
          settings,
          ...addToHistory(get(), snapshot),
        });
      },
      
      updateSettings: (updates) => {
        const snapshot = createSnapshot(get());
        const newSettings = { ...get().settings, ...updates };
        set({ 
          settings: newSettings,
          ...addToHistory(get(), snapshot),
        });
      },
      
      // Acciones - Initialization
      initialize: (data) => {
        set({ 
          expenses: data.expenses || [],
          payments: data.payments || [],
          incomes: data.incomes || [],
          settings: data.settings || get().settings,
          isInitialized: true,
          isLoading: false,
          error: null,
          // Carga inicial: no genera historial (no se puede deshacer la carga)
          history: [],
          future: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
        });
      },
      
      reset: () => {
        set({
          expenses: [],
          payments: [],
          incomes: [],
          settings: {
            currencySymbol: '$',
            alertDays: 3,
            customCategories: [],
            periodStartDay: 26,
            currency: 'CRC',
            locale: 'es-CR',
            theme: 'light',
          },
          isInitialized: false,
          isLoading: false,
          error: null,
          history: [],
          future: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
        });
      },
      
      // Acciones - Undo/Redo
      undo: () => {
        const { history, future } = get();
        if (history.length === 0) return;

        const current = createSnapshot(get());
        const previousState = history[history.length - 1];
        set({
          expenses: previousState.expenses,
          payments: previousState.payments,
          incomes: previousState.incomes,
          settings: previousState.settings,
          history: history.slice(0, -1),
          future: [...future, current],
          historyIndex: history.length - 2,
          canUndo: history.length - 1 > 0,
          canRedo: true,
        });
      },

      redo: () => {
        const { history, future } = get();
        if (future.length === 0) return;

        const current = createSnapshot(get());
        const nextState = future[future.length - 1];
        const newHistory = [...history, current];
        set({
          expenses: nextState.expenses,
          payments: nextState.payments,
          incomes: nextState.incomes,
          settings: nextState.settings,
          history: newHistory,
          future: future.slice(0, -1),
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: future.length - 1 > 0,
        });
      },

      clearHistory: () => {
        set({
          history: [],
          future: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
        });
      },
      
      // Acciones - Error handling
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    })
);
