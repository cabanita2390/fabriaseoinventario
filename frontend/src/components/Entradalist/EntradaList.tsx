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
    // Simulación de datos (más adelante se reemplazará por datos de la BD)
    const datosMock: Movimiento[] = [
      { fecha: '2025-06-01', tipo: 'Entrada', producto: 'Producto A', cantidad: 20 },
      { fecha: '2025-06-02', tipo: 'Salida', producto: 'Producto B', cantidad: 5 },
      { fecha: '2025-06-03', tipo: 'Entrada', producto: 'Producto C', cantidad: 15 },
      { fecha: '2025-06-03', tipo: 'Salida', producto: 'Producto A', cantidad: 3 },
      { fecha: '2025-06-04', tipo: 'Entrada', producto: 'Producto D', cantidad: 50 },
    ];

    if (datosMock.length === 0) {
      setHayError(true);
    } else {
      setMovimientos(datosMock);
      setHayError(false);
    }
  }, []);

  return (
    <div className="movimiento-list">
      <h2>Movimientos recientes</h2>
      {hayError ? (
        <p>Error</p>
      ) : (
          <ul>
  {movimientos.map((mov, index) => (
    <li key={index} className={`movimiento-item ${mov.tipo.toLowerCase()}`}>
      <span>
        <strong>{mov.fecha}</strong> | {mov.tipo}: <strong>{mov.producto}</strong> | Cantidad: <strong>{mov.cantidad}</strong>
      </span>
    </li>
  ))}
</ul>
      )}
    </div>
  );
}

export default MovimientoList;