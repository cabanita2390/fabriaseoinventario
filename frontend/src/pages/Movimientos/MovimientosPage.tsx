import React from "react";
import Home from "../../components/Home";
import "../../styles/Movimientos/movimientos.css";
import Filtro from "../../components/Movimientos/Filtro";
import Tabla from "../../components/Movimientos/Tabla";

function MovimientosPage() {
  return (
    <div>
      <Home>
          <Filtro />
        
          <Tabla />

      </Home>
    </div>
  );
}

export default MovimientosPage;