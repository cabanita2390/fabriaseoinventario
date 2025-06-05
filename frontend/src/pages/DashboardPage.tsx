import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/Dashboartdpage/Dashboart.css';
import Labelstack from '../components/LabelStack/Labelstack';

function DashboardPage() {
  const movimientosHoy = 18;
  const productosStockBajo = 3;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <h1>Bienvenido</h1>
        <div className="label-div">
          <Labelstack movimientos={movimientosHoy} stockBajo={productosStockBajo} /> 
        </div>

        <div className='grafico-div'>
          <h1>graficas </h1>
        </div>

        <div className='lista-div'>
              <h1>entrada de productos </h1>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
