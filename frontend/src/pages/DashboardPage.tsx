import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/Dashboartdpage/Dashboart.css';
import Labelstack from '../components/LabelStack/Labelstack';
import MovimientoList from '../components/Entradalist/EntradaList';
//por el momento funciona con sifras estaticas pero en un futuro sera neceario hacer modifciaiones para que funciones con la bas de datos 
//borrar funcion las const const movimientosHoy = 18; y  const productosStockBajo = 3; cuando ya funcione con los datos de la base de datos
 
function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <h1>Bienvenido</h1>
        <div className="label-div">
          <Labelstack />
        </div>

        <div className='grafico-div'>
          <h1>Gráficas</h1>
        </div>

        <div className='lista-div'>
          <h1>Entrada de productos</h1>
          <MovimientoList />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
