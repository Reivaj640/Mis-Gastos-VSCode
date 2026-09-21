"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateDataHash, validateDataIntegrity } from "@/lib/security";

interface EncryptedData<T> {
  data: string; // Datos encriptados en base64
  hash: string; // Hash para validación de integridad
  iv: string;   // Vector de inicialización
}

/**
 * Genera una clave de encriptación basada en el origen del documento
 * Esto previene que scripts de otros dominios accedan a los datos
 */
function getEncryptionKey(): CryptoKey | null {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(window.location.origin + '__mis_gastos_key_v1');
    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    ).then(key => key).catch(() => null);
  } catch {
    return null;
  }
}

/**
 * Encripta datos usando Web Crypto API (AES-GCM)
 */
async function encryptData<T>(data: T): Promise<EncryptedData<T> | null> {
  try {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Clave derivada (en producción debería usar una contraseña del usuario)
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode('mis-gastos-secret-key-v1-' + window.location.origin),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('mis-gastos-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(jsonString)
    );
    
    const hash = generateDataHash(jsonString);
    
    return {
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      hash,
      iv: btoa(String.fromCharCode(...iv))
    };
  } catch (error) {
    console.error('Error encriptando datos:', error);
    return null;
  }
}

/**
 * Desencripta datos usando Web Crypto API
 */
async function decryptData<T>(encrypted: EncryptedData<T>): Promise<T | null> {
  try {
    const decoder = new TextDecoder();
    const iv = new Uint8Array(atob(encrypted.iv).split('').map(c => c.charCodeAt(0)));
    const encryptedData = new Uint8Array(atob(encrypted.data).split('').map(c => c.charCodeAt(0)));
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('mis-gastos-secret-key-v1-' + window.location.origin),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('mis-gastos-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    const jsonString = decoder.decode(decrypted);
    
    // Validar integridad
    if (!validateDataIntegrity(jsonString, encrypted.hash)) {
      console.error('Integridad de datos fallida - posible corrupción o manipulación');
      return null;
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    return null;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isHydrated = useRef(false);
  const isEncrypting = useRef(false);

  useEffect(() => {
    if (isHydrated.current) return;
    isHydrated.current = true;
    
    const loadData = async () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          // Intentar desencriptar (nuevo formato)
          try {
            const encrypted = JSON.parse(item) as EncryptedData<T>;
            if (encrypted.data && encrypted.hash && encrypted.iv) {
              const decrypted = await decryptData<T>(encrypted);
              if (decrypted !== null) {
                setStoredValue(decrypted);
                return;
              }
            }
          } catch {
            // Si falla la desencriptación, intentar formato antiguo (sin encriptar)
            // Esto permite migración gradual
          }
          
          // Formato antiguo (backward compatibility)
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    };
    
    loadData();
  }, [key]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    if (isEncrypting.current) return;
    isEncrypting.current = true;
    
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        
        // Encriptar datos antes de guardar
        if (typeof window !== 'undefined' && window.crypto) {
          encryptData<T>(valueToStore).then(encrypted => {
            if (encrypted) {
              window.localStorage.setItem(key, JSON.stringify(encrypted));
            } else {
              // Fallback a formato sin encriptar si falla
              window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
          }).catch(() => {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          });
        } else {
          // Fallback para navegadores sin crypto
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    } finally {
      isEncrypting.current = false;
    }
  }, [key]);

  return [storedValue, setValue];
}
