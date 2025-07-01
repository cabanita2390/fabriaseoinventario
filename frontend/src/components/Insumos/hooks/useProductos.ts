import { useState, useCallback, useRef, useEffect } from 'react';
import { Tipo, ProductoAgrupado } from '../types/InsumosTipe';
import { useAuthFetch } from '../../ui/useAuthFetch';

const extraerTipoProducto = (texto: string): string => {
  const lower = texto.toLowerCase();
  if (lower.includes("materia prima")) return "MATERIA_PRIMA";
  if (lower.includes("envase")) return "MATERIAL_DE_ENVASE";
  if (lower.includes("etiqueta")) return "ETIQUETAS";
  return "";
};

export function useProductos(tipoActual: Tipo) {
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoAgrupado[]>([]);
  const [productosOriginales, setProductosOriginales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { authFetch } = useAuthFetch();
  const lastTipo = useRef<Tipo | null>(null);

  const cargarProductos = useCallback(async (force = false) => {
    // Evitar recargas innecesarias
    if (!force && lastTipo.current === tipoActual && productosDisponibles.length > 0) return;
    
    try {
      setLoading(true);
      setError(null);
      lastTipo.current = tipoActual;

      const res = await authFetch('http://localhost:3000/producto');
      const data = await res.json();
      setProductosOriginales(data);

      const agrupados: ProductoAgrupado[] = [];
      for (const producto of data) {
        const existente = agrupados.find(p => p.nombre === producto.nombre);
        if (existente) {
          if (!existente.presentaciones.some(pr => pr.id === producto.presentacion.id)) {
            existente.presentaciones.push(producto.presentacion);
          }
        } else {
          agrupados.push({
            ...producto,
            presentaciones: [producto.presentacion],
          });
        }
      }

      const tipoProducto = extraerTipoProducto(tipoActual);
      const filtrados = tipoProducto 
        ? agrupados.filter(p => p.tipoProducto === tipoProducto)
        : agrupados;
      
      setProductosDisponibles(filtrados);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError(err instanceof Error ? err : new Error('Error al cargar productos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tipoActual, authFetch, productosDisponibles.length]);

  return { 
    productosDisponibles, 
    productosOriginales, 
    cargarProductos,
    loading,
    error,
    reload: () => cargarProductos(true)
  };
}