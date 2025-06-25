import { useState, useCallback } from 'react';

export function useBodegas() {
  const [bodegasDisponibles, setBodegasDisponibles] = useState<{ id: number; nombre: string }[]>([]);

  const cargarBodegas = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/bodega');
      const data = await res.json();
      setBodegasDisponibles(data);
    } catch (err) {
      console.error("Error cargando bodegas:", err);
    }
  }, []);

  return { bodegasDisponibles, cargarBodegas };
}