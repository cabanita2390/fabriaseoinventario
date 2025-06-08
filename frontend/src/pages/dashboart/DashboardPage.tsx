import React from 'react';
import '../../styles/home.css';
import Labelstack from '../../components/dashboart/LabelStack/Labelstack';
import MovimientoList from '../../components/dashboart/Entradalist/EntradaList';
import Home from '../../components/Home'; 
import Gstockbajo from '../../components/dashboart/graficas/Gstockbajo';

function DashboardPage() {
  return (
    <div>
      <Home>
        <div className="label-div">
          <Labelstack />
        </div>

        <div className="grafico-div">
          <h1>Gráficas</h1>
          <Gstockbajo />
        </div>

        <div className="lista-div">
          <h1>Entrada de productos</h1>
          <MovimientoList />
        </div> 
      </Home>
    </div>
  );
}

export default DashboardPage;