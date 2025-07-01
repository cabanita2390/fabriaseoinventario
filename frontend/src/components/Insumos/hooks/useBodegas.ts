import { useState, useCallback, useRef } from 'react';
import { useAuthFetch } from '../../ui/useAuthFetch';

export function useBodegas() {
  const [bodegasDisponibles, setBodegasDisponibles] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { authFetch } = useAuthFetch();
  const loaded = useRef(false); // Referencia para controlar si ya se cargó

  const cargarBodegas = useCallback(async (force = false) => {
    if ((!force && loaded.current) || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch('http://localhost:3000/bodega');
      const data = await res.json();
      setBodegasDisponibles(data);
      loaded.current = true;
    } catch (err) {
      console.error("Error cargando bodegas:", err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [authFetch, loading]);

  return { 
    bodegasDisponibles, 
    cargarBodegas,
    loading,
    error,
    reload: () => cargarBodegas(true) // Función para recargar forzadamente
  };
}