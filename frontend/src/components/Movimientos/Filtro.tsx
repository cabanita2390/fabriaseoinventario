import React from 'react'
import'../../styles/Movimientos/movimientos.css';
function Filtro() {
  return (
    <div>
         <div className="exportbotton">
            <button>exportar</button>
        </div>

        <div className="filtrofechas">
            <label htmlFor="fecha-inicio">Fecha de inicio:</label>
            <input type="date" id="fecha-inicio" name="fecha-inicio" />

            <label htmlFor="fecha-fin">Fecha fin:</label>
            <input type="date" id="fecha-fin" name="fecha-fin" />

            <button type="button">Buscar</button>
      </div>
    </div>
    
  )
}

export default Filtro
