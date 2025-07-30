
import Home from '../../components/Home'
import Tabla from '../../components/Inventario/Tabla'
import "../../styles/inventario/Inventario.css";
function InventarioPage() {
  return (
    <div>
        <Home>
          <div className="contenedor-tabla">
            
            <Tabla/>
          </div>
         
        </Home>
    </div>
  )
}

export default InventarioPage
