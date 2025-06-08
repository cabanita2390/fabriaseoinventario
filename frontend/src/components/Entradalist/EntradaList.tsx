import React, { useEffect, useState } from 'react';
import '../../styles/Dashboartdpage/MovimientoList.css';

interface Movimiento {
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  producto: string;
  cantidad: number;
}

function MovimientoList() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
  const obtenerMovimientos = async () => {
    try {
      const response = await fetch('/mock.json'); // ✅ así accede correctamente
      const data = await response.json();

      if (!data.ultimosMovimientos || data.ultimosMovimientos.length === 0) {
        setHayError(true);
        return;
      }

      const movimientosTransformados: Movimiento[] = data.ultimosMovimientos.map((mov: any) => ({
        fecha: mov.fechaMovimiento.split('T')[0],
        tipo: mov.tipo === 'INGRESO' ? 'Entrada' : 'Salida',
        producto: mov.producto.nombre,
        cantidad: mov.cantidad,
      }));

      setMovimientos(movimientosTransformados);
      setHayError(false);
    } catch (error) {
      console.error('Error al cargar mock.json:', error);
      setHayError(true);
    }
  };

  obtenerMovimientos();
}, []);

  return (
    <div className="movimiento-list">
      <h2>Movimientos recientes</h2>
      {hayError ? (
        <p>Error al cargar los movimientos.</p>
      ) : (
        <ul>
          {movimientos.map((mov, index) => (
            <li key={index} className={`movimiento-item ${mov.tipo.toLowerCase()}`}>
              <span>
                <strong>{mov.fecha}</strong> | {mov.tipo}:{' '}
                <strong>{mov.producto}</strong> | Cantidad:{' '}
                <strong>{mov.cantidad}</strong>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MovimientoList;