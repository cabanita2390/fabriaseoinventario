import React, { useEffect, useState } from 'react';
import '../../../styles/Dashboartdpage/Labelstack.css';

function Labelstack() {
  const [movimientos, setMovimientos] = useState<number | null>(null);
  const [stockBajo, setStockBajo] = useState<number | null>(null);

  useEffect(() => {
    // Función para generar número aleatorio entero entre min y max (incluidos)
    const randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    // Simulación "petición" para movimientos (cada 2 segundos, rango 0-15)
    const movimientosInterval = setInterval(() => {
      const nuevoValor = randomInt(0, 15);
      setMovimientos(nuevoValor);
      console.log("Movimientos actualizados:", nuevoValor);
    }, 2000);

    // Simulación "petición" para stock bajo (cada 3 segundos, rango 0-10)
    const stockBajoInterval = setInterval(() => {
      const nuevoValor = randomInt(0, 10);
      setStockBajo(nuevoValor);
      console.log("Stock bajo actualizado:", nuevoValor);
    }, 3000);

    return () => {
      clearInterval(movimientosInterval);
      clearInterval(stockBajoInterval);
    };
  }, []);

  return (
    <div className="labelstack-container">
      <label className="label-Movimientos">
        Movimientos de hoy: <span className="datos">{movimientos ?? 0}</span>
      </label>
      <label className="label-stock-bajo">
        productos en stock bajo: <span className="datos">{stockBajo ?? 0}</span>
      </label>
    </div>
  );
}

export default Labelstack;