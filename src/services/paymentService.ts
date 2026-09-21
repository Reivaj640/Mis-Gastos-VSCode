import { Payment, Expense } from '@/types';

/**
 * Servicio centralizado para lógica de negocio de pagos
 */
export const paymentService = {
  /**
   * Valida que un pago tenga estructura correcta
   */
  validatePayment: (payment: Partial<Payment>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!payment.id || typeof payment.id !== 'string') {
      errors.push('ID de pago inválido');
    }
    
    if (!payment.expenseId || typeof payment.expenseId !== 'string') {
      errors.push('ID de gasto inválido');
    }
    
    if (!payment.amount || payment.amount <= 0) {
      errors.push('Monto debe ser mayor a 0');
    }
    
    if (!payment.date || isNaN(new Date(payment.date).getTime())) {
      errors.push('Fecha inválida');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
  
  /**
   * Calcula el total pagado para un gasto específico
   */
  calculateTotalPaid: (expenseId: string, payments: Payment[]): number => {
    return payments
      .filter(p => p.expenseId === expenseId)
      .reduce((sum, p) => sum + p.amount, 0);
  },
  
  /**
   * Obtiene todos los pagos de un gasto
   */
  getPaymentsForExpense: (expenseId: string, payments: Payment[]): Payment[] => {
    return payments.filter(p => p.expenseId === expenseId);
  },
  
  /**
   * Verifica si un pago es el último para un gasto
   */
  isLastPayment: (paymentId: string, expenseId: string, payments: Payment[]): boolean => {
    const expensePayments = paymentService.getPaymentsForExpense(expenseId, payments);
    const lastPayment = expensePayments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    return lastPayment?.id === paymentId;
  },
  
  /**
   * Calcula el monto restante por pagar después de aplicar un pago
   */
  calculateRemainingAmount: (expense: Expense, payments: Payment[], excludePaymentId?: string): number => {
    const relevantPayments = excludePaymentId
      ? payments.filter(p => p.id !== excludePaymentId)
      : payments;
    
    const totalPaid = paymentService.calculateTotalPaid(expense.id, relevantPayments);
    return Math.max(0, expense.amount - totalPaid);
  },
  
  /**
   * Agrupa pagos por mes
   */
  groupPaymentsByMonth: (payments: Payment[], year: number): Record<number, Payment[]> => {
    return payments.reduce((acc, payment) => {
      const date = new Date(payment.date);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(payment);
      }
      return acc;
    }, {} as Record<number, Payment[]>);
  },
  
  /**
   * Obtiene pagos dentro de un rango de fechas
   */
  getPaymentsInRange: (payments: Payment[], startDate: Date, endDate: Date): Payment[] => {
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  },
  
  /**
   * Calcula estadísticas de pagos
   */
  calculateStats: (payments: Payment[], expenses: Expense[]) => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = totalExpenses - totalPaid;
    
    return {
      totalPaid,
      totalExpenses,
      pendingAmount,
      paymentCount: payments.length,
      averagePayment: payments.length > 0 ? totalPaid / payments.length : 0,
    };
  },
};
