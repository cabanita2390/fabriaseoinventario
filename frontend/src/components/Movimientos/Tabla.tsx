import React from 'react'
import'../../styles/Movimientos/movimientos.css';
function Tabla() {
  return (
    <div>
            <table className="tabla-inventario">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Presentación</th>
                        <th>UM</th>
                        <th>Proveedor</th>
                        <th>Inventario</th>
                        <th>Modificar/eliminar </th>
                        
                    </tr>
                </thead>
            <tbody>
              {/* Fila de ejemplo */}
                    <tr>
                        <td>1</td>
                        <td>Producto A</td>
                        <td>Insumo</td>
                        <td>Activo</td>
                        <td>Caja</td>
                        <td>Unidad</td>
                        <td>Proveedor X</td>
                        <td>25</td>
                        <td>
                        <div className="acciones">
                        <button className="btn-icono modificar" title="Modificar">✏️</button>
                        <button className="btn-icono eliminar" title="Eliminar">🗑️</button>
                        </div>
                        </td>

                    </tr>
            </tbody>
        </table>
        </div>
  )
}

export default Tabla
