/**
 * Utilidades de seguridad para prevenir XSS y otros ataques
 */

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS
 * @param text - Texto a escapar
 * @returns Texto seguro para renderizar en HTML
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitiza un string eliminando tags HTML y escapando caracteres especiales
 * @param input - Input a sanitizar
 * @returns String sanitizado
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Eliminar tags HTML
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // Escapar caracteres especiales
  return escapeHtml(withoutTags);
}

/**
 * Valida que un string no contenga scripts maliciosos
 * @param input - Input a validar
 * @returns true si es seguro, false si contiene patrones peligrosos
 */
export function isSafeInput(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Patrones peligrosos comunes
  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick=, onerror=, etc.
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Escapa comillas para uso en CSV
 * @param text - Texto a escapar
 * @returns Texto con comillas escapadas
 */
export function escapeCSV(text: string): string {
  if (typeof text !== 'string') {
    return '""';
  }
  
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    // Escapar comillas dobles reemplazándolas con dos comillas dobles
    return `"${text.replace(/"/g, '""')}"`;
  }
  
  return text;
}

/**
 * Genera un hash simple para validación de integridad de datos
 * @param data - Datos a hashear
 * @returns Hash en base64
 */
export function generateDataHash(data: string): string {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Valida la integridad de datos usando hash
 * @param data - Datos a validar
 * @param expectedHash - Hash esperado
 * @returns true si los datos son íntegros
 */
export function validateDataIntegrity(data: string, expectedHash: string): boolean {
  const currentHash = generateDataHash(data);
  return currentHash === expectedHash;
}
