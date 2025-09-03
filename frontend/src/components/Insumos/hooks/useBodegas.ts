import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthFetch } from '../../ui/useAuthFetch';

// Constantes configurables
const DEFAULT_RETRIES = 2;
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface Bodega {
  id: number;
  nombre: string;
}

interface UseBodegasOptions {
  maxRetries?: number;
  cacheDuration?: number;
  autoLoad?: boolean;
}

export function useBodegas(options: UseBodegasOptions = {}) {
  const {
    maxRetries = DEFAULT_RETRIES,
    cacheDuration = DEFAULT_CACHE_DURATION,
    autoLoad = true
  } = options;
  
  const [permissionDenied, setPermissionDenied] = useState(false); 
  const [bodegasDisponibles, setBodegasDisponibles] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { authFetch } = useAuthFetch();
  
  // Controles de estado
  const loaded = useRef(false);
  const retryCount = useRef(0);
  const cacheExpiry = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const cargarBodegas = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Condiciones para no cargar
    if ((!force && loaded.current && now < cacheExpiry.current)) return;
    if (loading) return;
    if (retryCount.current >= maxRetries && !force) return;
    if (permissionDenied && !force) return;

    // Cancelar solicitud anterior solo si existe y está pendiente
    if (abortController.current && !abortController.current.signal.aborted) {
      abortController.current.abort("Reemplazado por nueva solicitud");
    }
    
    abortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const res = await authFetch('https://fabriaseo-inventario-backend.onrender.com/bodega', {
        signal: abortController.current.signal
      });
      
      // Manejo de errores HTTP
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setPermissionDenied(true);
          throw new Error('No tienes permisos para acceder a las bodegas');
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setBodegasDisponibles(data);
      
      // Resetear estados de éxito
      loaded.current = true;
      retryCount.current = 0;
      cacheExpiry.current = now + cacheDuration;
      setPermissionDenied(false);
      
    } catch (err: any) {
      // Ignorar errores de aborto
      if (err.name === 'AbortError') {
        return;
      }
      
      const errorObj = err instanceof Error ? err : new Error('Error desconocido');
      setError(errorObj);
      
      // Incrementar contador solo para errores no de autorización
      if (!errorObj.message.includes('No tienes permisos')) {
        retryCount.current += 1;
      } else {
        // Marcar como cargado para errores de permisos
        loaded.current = true;
      }
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  }, [authFetch, maxRetries, cacheDuration, permissionDenied, loading]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Carga automática optimizada
  useEffect(() => {
    if (autoLoad && !loaded.current && !loading) {
      const timer = setTimeout(() => {
        if (!loaded.current && !loading) {
          cargarBodegas();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoLoad, cargarBodegas, loading]);

  return { 
    bodegasDisponibles, 
    cargarBodegas,
    loading,
    error,
    reload: () => cargarBodegas(true),
    hasPermission: !permissionDenied,
    permissionDenied,
    retryCount: retryCount.current
  };
}