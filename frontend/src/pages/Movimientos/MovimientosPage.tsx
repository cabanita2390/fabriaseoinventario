import React from "react";
import Home from "../../components/Home";
import "../../styles/Movimientos/movimientos.css";
import Tabla from "../../components/Movimientos/Tabla";


function MovimientosPage() {
  return (
    <div>
      <Home>
        
          <Tabla />

      </Home>
    </div>
  );
}

export default MovimientosPage;