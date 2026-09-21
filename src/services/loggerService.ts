/**
 * Sistema de logging estructurado para la aplicación
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isEnabled = process.env.NEXT_PUBLIC_LOG_LEVEL !== 'none';
  
  /**
   * Crea una entrada de log estructurada
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };
  }
  
  /**
   * Agrega un log al array y lo envía a consola
   */
  private addLog(entry: LogEntry) {
    if (!this.isEnabled) return;
    
    this.logs.push(entry);
    
    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Enviar a consola según el nivel
    this.outputToConsole(entry);
  }
  
  /**
   * Imprime el log en consola con formato apropiado
   */
  private outputToConsole(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const contextPrefix = entry.context ? ` [${entry.context}]` : '';
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix}${contextPrefix} ${entry.message}`, entry.data || '');
        break;
      case 'info':
        console.info(`${prefix}${contextPrefix} ${entry.message}`, entry.data || '');
        break;
      case 'warn':
        console.warn(`${prefix}${contextPrefix} ${entry.message}`, entry.data || '');
        break;
      case 'error':
        console.error(`${prefix}${contextPrefix} ${entry.message}`, entry.error || entry.data || '');
        break;
    }
  }
  
  /**
   * Log de nivel DEBUG
   */
  debug(message: string, context?: string, data?: unknown) {
    this.addLog(this.createEntry('debug', message, context, data));
  }
  
  /**
   * Log de nivel INFO
   */
  info(message: string, context?: string, data?: unknown) {
    this.addLog(this.createEntry('info', message, context, data));
  }
  
  /**
   * Log de nivel WARN
   */
  warn(message: string, context?: string, data?: unknown) {
    this.addLog(this.createEntry('warn', message, context, data));
  }
  
  /**
   * Log de nivel ERROR
   */
  error(message: string, context?: string, errorOrData?: Error | unknown) {
    const entry = this.createEntry(
      'error',
      message,
      context,
      errorOrData instanceof Error ? undefined : errorOrData,
      errorOrData instanceof Error ? errorOrData : undefined
    );
    
    this.addLog(entry);
    
    // En producción, podrías enviar a un servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(entry);
    }
  }
  
  /**
   * Envía errores a servicio de monitoreo (placeholder)
   */
  private sendToMonitoring(entry: LogEntry) {
    // TODO: Implementar envío a Sentry, LogRocket, o similar
    // Ejemplo: Sentry.captureException(entry.error, { tags: { context: entry.context } });
  }
  
  /**
   * Obtiene todos los logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Obtiene logs filtrados por nivel
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * Obtiene logs filtrados por contexto
   */
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }
  
  /**
   * Limpia todos los logs
   */
  clear() {
    this.logs = [];
  }
  
  /**
   * Exporta logs a JSON
   */
  exportToJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }
  
  /**
   * Descarga logs como archivo
   */
  downloadLogs(filename = 'app-logs.json') {
    const json = this.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Instancia singleton
export const logger = new LoggerService();

// Funciones convenience para importación directa
export const log = {
  debug: (message: string, context?: string, data?: unknown) => 
    logger.debug(message, context, data),
  info: (message: string, context?: string, data?: unknown) => 
    logger.info(message, context, data),
  warn: (message: string, context?: string, data?: unknown) => 
    logger.warn(message, context, data),
  error: (message: string, context?: string, errorOrData?: Error | unknown) => 
    logger.error(message, context, errorOrData),
};
