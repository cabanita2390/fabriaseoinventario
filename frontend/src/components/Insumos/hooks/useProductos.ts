import { useState, useCallback } from 'react';
import { Tipo, ProductoAgrupado } from '../types/InsumosTipe';

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

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/producto');
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
      const filtrados = agrupados.filter(p => p.tipoProducto === tipoProducto);
      setProductosDisponibles(filtrados);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, [tipoActual]);

  return { productosDisponibles, productosOriginales, cargarProductos };
}