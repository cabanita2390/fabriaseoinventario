import React, { useEffect, useState } from 'react';
import '../../../styles/Dashboartdpage/Labelstack.css';
import { useAuthFetch , ApiError } from '../../ui/useAuthFetch';

function Labelstack() {
  const [movimientos, setMovimientos] = useState<number | null>(null);
  const [stockBajo, setStockBajo] = useState<number | null>(null);
  const { authFetch } = useAuthFetch(); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch('http://localhost:3000/dashboard'); // o desde el backend real
        const data = await res.json();

        // Suponiendo que el JSON tiene las propiedades así:
        // { "totalMovimientosHoy": 10, "productosBajoStock": [8] }

        setMovimientos(data.totalMovimientosHoy ?? 0);
        setStockBajo(data.productosBajoStock?.length ?? 0);
      } catch (error) {
        console.error("Error al cargar los datos del mock:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="labelstack-container">
      <label className="label-Movimientos">
        Movimientos de hoy: <span className="datos">{movimientos ?? 0}</span>
      </label>
      <label className="label-stock-bajo">
        Productos en stock bajo: <span className="datos">{stockBajo ?? 0}</span>
      </label>
    </div>
  );
}

export default Labelstack;
