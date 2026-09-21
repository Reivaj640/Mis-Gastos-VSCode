import { Expense, Payment } from '@/types';

/**
 * Servicio centralizado para lógica de negocio de gastos
 */
export const expenseService = {
  /**
   * Calcula el estado de un gasto basado en sus pagos
   */
  getStatus: (
    expense: Expense,
    payments: Payment[],
    alertDays: number,
    periodStartDay: number
  ): 'paid' | 'pending' | 'overdue' | 'alert' => {
    const expensePayments = payments.filter(p => p.expenseId === expense.id);
    const totalPaid = expensePayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid >= expense.amount) {
      return 'paid';
    }
    
    const now = new Date();
    const currentPeriod = expenseService.getCurrentPeriod(now, periodStartDay);
    const dueDate = expenseService.getDueDate(expense.dueDay, currentPeriod.start);
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      return 'overdue';
    }
    
    if (daysUntilDue <= alertDays) {
      return 'alert';
    }
    
    return 'pending';
  },
  
  /**
   * Calcula la fecha de vencimiento para un día específico en el período actual
   */
  getDueDate: (dueDay: number, periodStart: Date): Date => {
    const year = periodStart.getFullYear();
    const month = periodStart.getMonth();
    
    // Validar y ajustar el día según los días del mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedDay = Math.min(dueDay, daysInMonth);
    
    const dueDate = new Date(year, month, adjustedDay);
    
    // Si el día ajustado ya pasó en este mes, usar el siguiente mes
    const now = new Date();
    if (dueDate < now && Math.abs(dueDate.getTime() - now.getTime()) > 24 * 60 * 60 * 1000) {
      return new Date(year, month + 1, adjustedDay);
    }
    
    return dueDate;
  },
  
  /**
   * Obtiene el período actual basado en el día de inicio
   */
  getCurrentPeriod: (date: Date = new Date(), periodStartDay: number) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    let startMonth = month;
    let startYear = year;
    
    if (day < periodStartDay) {
      startMonth = month - 1;
      if (startMonth < 0) {
        startMonth = 11;
        startYear = year - 1;
      }
    }
    
    const start = new Date(startYear, startMonth, periodStartDay);
    const end = new Date(startYear, startMonth + 1, periodStartDay - 1);
    
    return { start, end };
  },
  
  /**
   * Valida que un día sea válido (1-31)
   */
  validateDueDay: (day: number): boolean => {
    return Number.isInteger(day) && day >= 1 && day <= 31;
  },
  
  /**
   * Ajusta el día de vencimiento según los días del mes
   */
  adjustDueDayForMonth: (dueDay: number, year: number, month: number): number => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Math.min(dueDay, daysInMonth);
  },
  
  /**
   * Calcula el monto pendiente de un gasto
   */
  calculatePendingAmount: (expense: Expense, payments: Payment[]): number => {
    const expensePayments = payments.filter(p => p.expenseId === expense.id);
    const totalPaid = expensePayments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, expense.amount - totalPaid);
  },
  
  /**
   * Verifica si un gasto está completamente pagado
   */
  isFullyPaid: (expense: Expense, payments: Payment[]): boolean => {
    const pendingAmount = expenseService.calculatePendingAmount(expense, payments);
    return pendingAmount === 0;
  },
  
  /**
   * Obtiene todos los gastos vencidos
   */
  getOverdueExpenses: (expenses: Expense[], payments: Payment[], periodStartDay: number): Expense[] => {
    return expenses.filter(expense => {
      const status = expenseService.getStatus(expense, payments, 0, periodStartDay);
      return status === 'overdue';
    });
  },
  
  /**
   * Obtiene todos los gastos en estado de alerta
   */
  getAlertExpenses: (expenses: Expense[], payments: Payment[], alertDays: number, periodStartDay: number): Expense[] => {
    return expenses.filter(expense => {
      const status = expenseService.getStatus(expense, payments, alertDays, periodStartDay);
      return status === 'alert';
    });
  },
};
