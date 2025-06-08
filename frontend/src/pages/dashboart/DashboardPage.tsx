import React from 'react';
import '../../styles/home.css';
import Labelstack from '../../components/LabelStack/Labelstack';
import MovimientoList from '../../components/Entradalist/EntradaList';
import Home from '../../components/Home'; 
import Gstockbajo from '../../components/graficas/Gstockbajo'
type Props = {};

function DashboardPage({}: Props) {
  return (
    <div>
      <Home >
        <div className="label-div">
        <Labelstack />
      </div>

      <div className="grafico-div">
        <h1>Gráficas</h1>
           <Gstockbajo/>
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
