
import '../../styles/Dashboartdpage/Labelstack.css';

interface LabelstackProps {
  movimientos: number;
  stockBajo: number;
}

function Labelstack({ movimientos, stockBajo }: LabelstackProps) {
  return (
    <div className="labelstack-container">
      <label className="label-titulo">
        Movimientos de hoy: <span className="datos">{movimientos}</span>
      </label>
      <label className="label-stock-bajo">
        Numero de productos en stock bajo: <span className="datos">{stockBajo}</span>
      </label>
    </div>
  );
}

export default Labelstack;