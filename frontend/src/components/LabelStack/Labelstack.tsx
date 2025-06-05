import React, { useEffect, useState } from 'react';
import '../../styles/Dashboartdpage/Labelstack.css';

function Labelstack() {
  const [movimientos, setMovimientos] = useState<number | null>(null);
  const [stockBajo, setStockBajo] = useState<number | null>(null);

  useEffect(() => {
    // Simulación de petición (en el futuro reemplazar por fetch)
    const timeout = setTimeout(() => {
      setMovimientos(6);    // Aquí simulas que viene null
      setStockBajo(5);         // Este sí tiene valor
    }, );

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="labelstack-container">
      <label className="label-titulo">
        Movimientos de hoy: <span className="datos">{movimientos ?? 0}</span>
      </label>
      <label className="label-stock-bajo">
        Número de productos en stock bajo: <span className="datos">{stockBajo ?? 0}</span>
      </label>
    </div>
  );
}

export default Labelstack;