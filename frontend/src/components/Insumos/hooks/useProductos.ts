import { useState, useCallback, useRef, useEffect } from 'react';
import { Tipo, ProductoAgrupado } from '../types/InsumosTipe';
import { useAuthFetch } from '../../ui/useAuthFetch';

const DEFAULT_RETRIES = 2;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();
  
  const loaded = useRef(false);
  const retryCount = useRef(0);
  const cacheExpiry = useRef(0);
  const lastTipo = useRef<Tipo | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const cargarProductos = useCallback(async (force = false) => {
  const now = Date.now();
  
  // Resetear estado cuando cambia el tipo
  if (lastTipo.current !== null && lastTipo.current !== tipoActual) {
    setProductosDisponibles([]);
    setProductosOriginales([]);
    loaded.current = false;
    retryCount.current = 0;
    cacheExpiry.current = 0; // Invalidamos la caché para forzar recarga
  }

  // Condiciones para no cargar
  if ((!force && loaded.current && now < cacheExpiry.current) || loading) return;
  if (!force && lastTipo.current === tipoActual && productosDisponibles.length > 0) return;
  if (retryCount.current >= DEFAULT_RETRIES && !force) return;
  
  // Cancelar solicitud anterior si existe
  if (abortController.current) {
    abortController.current.abort();
  }
  
  abortController.current = new AbortController();

  try {
    setLoading(true);
    setError(null);
    lastTipo.current = tipoActual;

    const res = await authFetch('http://localhost:3000/producto', {
      signal: abortController.current.signal
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('No tienes permisos para acceder a los productos');
      }
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    setProductosOriginales(data);

    const productosMap = new Map<string, ProductoAgrupado>();

    for (const producto of data) {
      if (!productosMap.has(producto.nombre)) {
        productosMap.set(producto.nombre, {
          ...producto,
          presentaciones: [producto.presentacion]
        });
      } else {
        const existente = productosMap.get(producto.nombre)!;
        if (!existente.presentaciones.some(p => p.id === producto.presentacion.id)) {
          existente.presentaciones.push(producto.presentacion);
        }
      }
    }

    const agrupados = Array.from(productosMap.values());
    const tipoProducto = extraerTipoProducto(tipoActual);
    const filtrados = tipoProducto 
      ? agrupados.filter(p => p.tipoProducto === tipoProducto)
      : agrupados;
    
    setProductosDisponibles(filtrados);
    
    loaded.current = true;
    retryCount.current = 0;
    cacheExpiry.current = now + CACHE_DURATION;
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    
    console.error("Error cargando productos:", err);
    
    const errorMessage = err instanceof Error ? 
      (err.message.includes('No tienes permisos') ? 
        'No tienes permisos para acceder a los productos' : 
        'Error al cargar los productos') : 
      'Error desconocido al cargar productos';
    
    setError(errorMessage);
    
    if (!errorMessage.includes('No tienes permisos')) {
      retryCount.current += 1;
    } else {
      loaded.current = true;
    }
  } finally {
    setLoading(false);
    abortController.current = null;
  }
}, [tipoActual, authFetch, productosDisponibles.length, loading]);

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return { 
    productosDisponibles, 
    productosOriginales, 
    cargarProductos,
    loading,
    error,
    reload: () => cargarProductos(true),
    hasPermission: !error?.includes('No tienes permisos')
  };
}